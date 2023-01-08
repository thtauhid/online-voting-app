const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const path = require("path");
const csrf = require("tiny-csrf");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const localStrategy = require("passport-local");
const session = require("express-session");
const bcrypt = require("bcrypt");
const saltRounds = 10;

const { User } = require("./models");

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

app.get("/", (req, res) => {
  res.send("Hello World!");
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
      res.send(user);
    })
    .catch((err) => {
      res.send(err);
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
    successRedirect: "/admin",
    failureRedirect: "/login",
    // failureFlash: true,
  })
);

app.get("/admin", (req, res) => {
  res.render("admin");
});

module.exports = app;
