// const express = require("express");
// const passport = require("passport");
// const router = express.Router();

// const voteController = require("../controllers/voteController");

// // Root route (used to redirect users to their respective election pages)
// router.get("/", voteController.root);

// // Voter Login
// router.get("/login", voteController.loginPage);

// // Voter Login (Create new voter & create session)
// router.post(
//   "/session",
//   passport.authenticate("voter", {
//     successRedirect: "/e/",
//     failureRedirect: "/e/login",
//     failureFlash: true,
//   })
// );

// // Voting Page
// router.get("/:electionId", voteController.votePage);

// module.exports = router;
