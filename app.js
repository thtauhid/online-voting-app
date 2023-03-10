const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const path = require("path");
const csrf = require("tiny-csrf");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const localStrategy = require("passport-local");
const session = require("express-session");
const flash = require("connect-flash");
const bcrypt = require("bcrypt");
const connectEnsureLogin = require("connect-ensure-login");

const authRouter = require("./router/authRouter");
const electionRouter = require("./router/electionRouter");
// const voteRouter = require("./router/voteRouter");

const { User, Voter } = require("./models");
const { checkAdmin, checkVoter } = require("./middlewares");
const voteController = require("./controllers/voteController");
const miscController = require("./controllers/miscController");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
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

// passport strategy for admin
passport.use(
  "admin",
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

// passport strategy for voter
passport.use(
  "voter",
  new localStrategy(
    {
      usernameField: "voterId",
      passwordField: "password",
      passReqToCallback: true,
    },
    async (req, username, password, done) => {
      await Voter.findOne({
        where: {
          // need to check if voterId matches with electionId
          voterId: username,
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
  console.log("Serializing user: ", user);
  done(null, user);
});

passport.deserializeUser(async (user, done) => {
  // eslint-disable-next-line no-prototype-builtins
  if (user.hasOwnProperty("voterId")) {
    // User is voter. Deserialize voter
    await Voter.findByPk(user.id)
      .then((user) => {
        done(null, user);
      })
      .catch((err) => {
        done(err, null);
      });
  } else {
    // User is admin. Deserialize admin
    await User.findByPk(user.id)
      .then((user) => {
        done(null, user);
      })
      .catch((err) => {
        done(err, null);
      });
  }
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

app.use("/auth", authRouter);

app.use(
  "/elections",
  connectEnsureLogin.ensureLoggedIn("/auth/login"),
  checkAdmin,
  electionRouter
);

// Root route (used to redirect users to their respective election pages)
app.get(
  "/e",
  connectEnsureLogin.ensureLoggedIn("/e/login"),
  voteController.root
);

// Voter Login
app.get("/e/login", voteController.loginPage);

// Voter Login (Create new voter & create session)
app.post(
  "/e/session",
  passport.authenticate("voter", {
    successRedirect: "/e",
    failureRedirect: "/e/login",
    failureFlash: true,
  })
);

// Voting Page
app.get(
  "/e/:electionId",
  connectEnsureLogin.ensureLoggedIn("/e/login"),
  checkVoter,
  voteController.votePage
);

// Add Response
app.post("/e/:electionUrl", voteController.addResponses);

app.get("/404", miscController.notFound);

module.exports = app;
