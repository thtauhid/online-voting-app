const express = require("express");
const router = express.Router();
const passport = require("passport");

const authController = require("../controllers/authController");

// Sign Up Page
router.get("/signup", authController.signUpPage);

// Sign Up (Create new user & create session)
router.post("/user", authController.signUp);

// Login Page
router.get("/login", authController.loginPage);

// Login (Authenticate user & create session)
router.post(
  "/session",
  passport.authenticate("local", {
    successRedirect: "/elections",
    failureRedirect: "/login",
    failureFlash: true,
  })
);

// Logout (Destroy session)
router.get("/logout", authController.logout);

module.exports = router;
