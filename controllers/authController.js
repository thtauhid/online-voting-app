const { User } = require("../models");

// Sign Up Page
exports.signUpPage = async (req, res) => {
  res.render("signup", {
    title: "Sign Up",
    csrfToken: req.csrfToken(),
  });
};

// Sign Up (Create new user & create session)
exports.signUp = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const user = await User.createUser(name, email, password);
    req.login(user, (error) => {
      if (error) console.log(error);
      return res.redirect("/elections");
    });
  } catch (error) {
    req.flash("error", "Signup Failed.");
    res.redirect("/signup");
  }
};

// Login Page
exports.loginPage = async (req, res) => {
  res.render("login", {
    title: "Login",
    csrfToken: req.csrfToken(),
  });
};

// Logout (Destroy session)
exports.logout = async (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    return res.redirect("/login");
  });
};
