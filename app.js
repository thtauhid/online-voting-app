const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const path = require("path");
const csrf = require("tiny-csrf");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const localStrategy = require("passport-local");
const session = require("express-session");
const connectEnsureLogin = require("connect-ensure-login");
const flash = require("connect-flash");
const bcrypt = require("bcrypt");
const saltRounds = 10;

const { User, Election, Question, Option } = require("./models");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser("super secret"));
app.use(csrf("spuer_secret_for_voting_app_9380", ["POST", "PUT", "DELETE"]));
app.use(
  session({
    secret: "Iamthinkingofagreatsecrettoputhere",
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

passport.use(
  new localStrategy(
    { usernameField: "email", passwordField: "password" },
    async (username, password, done) => {
      await User.findOne({
        where: {
          email: username,
        },
      })
        .then(async (user) => {
          if (user) {
            const result = await bcrypt.compare(password, user.password);
            if (result) return done(null, user);
          }
          return done(null, false, { message: "Invalid Credentials" });
        })
        .catch((err) => {
          console.log({ err });
          return err;
        });
    }
  )
);

passport.serializeUser((user, done) => {
  console.log("Serializing user: ", user.id);
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  await User.findByPk(id)
    .then((user) => {
      done(null, user);
    })
    .catch((err) => {
      done(err, null);
    });
});

app.use((req, res, next) => {
  res.locals.messages = req.flash();
  next();
});

app.get("/", (req, res) => {
  res.render("index", {
    title: "Home",
  });
});

app.get("/signup", async (req, res) => {
  res.render("signup", {
    title: "Sign Up",
    csrfToken: req.csrfToken(),
  });
});

app.post("/user", async (req, res) => {
  const { name, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  await User.create({
    name,
    email,
    password: hashedPassword,
  })
    .then((user) => {
      req.login(user, (err) => {
        if (err) console.log(err);
        return res.redirect("/elections");
      });
    })
    .catch((err) => {
      console.log(err);
      req.flash("error", "Signup Failed.");
      res.redirect("/signup");
    });
});

app.get("/login", async (req, res) => {
  res.render("login", {
    title: "Login",
    csrfToken: req.csrfToken(),
  });
});

app.post(
  "/session",
  passport.authenticate("local", {
    successRedirect: "/elections",
    failureRedirect: "/login",
    failureFlash: true,
  })
);

app.get("/logout", async (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    return res.redirect("/login");
  });
});

app.get(
  "/elections/new",
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
    res.render("elections/new", {
      title: "Create New Election",
      csrfToken: req.csrfToken(),
    });
  }
);

app.get("/elections", connectEnsureLogin.ensureLoggedIn(), async (req, res) => {
  Election.findAll({
    where: {
      adminId: req.user.id,
    },
  })
    .then((elections) => {
      res.render("elections/index", {
        title: "My Elections",
        elections,
      });
    })
    .catch((error) => {
      req.flash("error", error.message);
      res.redirect("/");
    });
});

app.post(
  "/elections",
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
    const { title } = req.body;
    Election.create({
      title,
      adminId: req.user.id,
    })
      .then((election) => {
        res.redirect(`/elections/${election.id}`);
      })
      .catch((error) => {
        console.log(error);
        req.flash(
          "error",
          "Unable to create new election. Minimum 5 character required."
        );
        res.redirect("/elections/new");
      });
  }
);

app.get(
  "/elections/:id",
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
    const { id } = req.params;
    const questions = await Question.findAll({
      where: {
        electionId: id,
      },
    });
    Election.findByPk(id)
      .then((election) => {
        res.render("elections/single", {
          title: election.title,
          election,
          questions,
        });
      })
      .catch((error) => {
        req.flash("error", error.message);
        res.redirect("/admin");
      });
  }
);

app.get(
  "/elections/:electionId/questions/new",
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
    res.render("questions/new", {
      title: "Create New Question",
      csrfToken: req.csrfToken(),
      electionId: req.params.electionId,
    });
  }
);

app.post(
  "/elections/:electionId/questions",
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
    // Get election id from params
    const { title, description } = req.body;
    const { electionId } = req.params;

    Question.create({
      title,
      description,
      electionId,
    })
      .then((question) => {
        res.redirect(`/elections/${electionId}/questions/${question.id}`);
      })
      .catch((error) => {
        console.log(error);
        req.flash(
          "error",
          "Unable to create question. Title has to be of minimum 5 character."
        );
        res.redirect(`/elections/${electionId}/questions/new`);
      });
  }
);

app.get(
  "/elections/:electionId/questions/:questionId",
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
    const { questionId } = req.params;
    const question = await Question.findByPk(questionId);
    const options = await Option.findAll({
      where: {
        questionId,
      },
    });
    res.render("questions/single", {
      title: question.title,
      question,
      options,
    });
  }
);

app.post(
  "/elections/:electionId/questions/:questionId/options",
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
    const { title } = req.body;
    const { electionId } = req.params;
    const { questionId } = req.params;
    await Option.create({
      title,
      questionId,
    })
      .then((option) => {
        console.log({ option });
        res.redirect(`/elections/${electionId}/questions/${questionId}`);
      })
      .catch((error) => {
        console.log(error);
        req.flash(
          "error",
          "Unable to create option. Minimum 1 character required."
        );
        res.redirect(
          `/elections/${electionId}/questions/${questionId}/options/new`
        );
      });
  }
);

app.get(
  "/elections/:electionId/questions/:questionId/options/new",
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
    res.render("options/new", {
      title: "Add New Option",
      csrfToken: req.csrfToken(),
      electionId: req.params.electionId,
      questionId: req.params.questionId,
    });
  }
);

module.exports = app;
