const express = require("express");
const router = express.Router();
const connectEnsureLogin = require("connect-ensure-login");

const electionController = require("../controllers/electionController");

// Create Election Page
router.get(
  "/elections/new",
  connectEnsureLogin.ensureLoggedIn(),
  electionController.createElectionPage
);

// Create Election
router.post(
  "/elections",
  connectEnsureLogin.ensureLoggedIn(),
  electionController.createElection
);

// Get All Elections page
router.get(
  "/elections",
  connectEnsureLogin.ensureLoggedIn(),
  electionController.getElections
);

// Get Single Election
router.get(
  "/elections/:id",
  connectEnsureLogin.ensureLoggedIn(),
  electionController.getSingleElection
);

// Create Question Page
router.get(
  "/elections/:electionId/questions/new",
  connectEnsureLogin.ensureLoggedIn(),
  electionController.createQuestionPage
);

// Create Question
router.post(
  "/elections/:electionId/questions",
  connectEnsureLogin.ensureLoggedIn(),
  electionController.createQuestion
);

// Get Single Question
router.get(
  "/elections/:electionId/questions/:questionId",
  connectEnsureLogin.ensureLoggedIn(),
  electionController.getSingleQuestion
);

// Create Option Page
router.get(
  "/elections/:electionId/questions/:questionId/options/new",
  connectEnsureLogin.ensureLoggedIn(),
  electionController.createOptionPage
);

// Create Option
router.post(
  "/elections/:electionId/questions/:questionId/options",
  connectEnsureLogin.ensureLoggedIn(),
  electionController.createOption
);

module.exports = router;
