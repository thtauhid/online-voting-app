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

// Handling misredirection to /login page
app.get("/login", (req, res) => {
  res.redirect("/auth/login");
});

app.use("/auth", authRouter);
app.use("/elections", connectEnsureLogin.ensureLoggedIn(), electionRouter);

module.exports = app;
