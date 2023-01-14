const express = require("express");
const router = express.Router();
const connectEnsureLogin = require("connect-ensure-login");

const electionController = require("../controllers/electionController");

// Create Election Page
router.get(
  "/new",
  connectEnsureLogin.ensureLoggedIn(),
  electionController.createElectionPage
);

// Create Election
router.post(
  "/",
  connectEnsureLogin.ensureLoggedIn(),
  electionController.createElection
);

// Get All Elections page
router.get(
  "/",
  connectEnsureLogin.ensureLoggedIn(),
  electionController.getElections
);

// Get Single Election
router.get(
  "/:id",
  connectEnsureLogin.ensureLoggedIn(),
  electionController.getSingleElection
);

// Create Question Page
router.get(
  "/:electionId/questions/new",
  connectEnsureLogin.ensureLoggedIn(),
  electionController.createQuestionPage
);

// Create Question
router.post(
  "/:electionId/questions",
  connectEnsureLogin.ensureLoggedIn(),
  electionController.createQuestion
);

// Get Single Question
router.get(
  "/:electionId/questions/:questionId",
  connectEnsureLogin.ensureLoggedIn(),
  electionController.getSingleQuestion
);

// Edit Question Page
router.get(
  "/:electionId/questions/:questionId/edit",
  connectEnsureLogin.ensureLoggedIn(),
  electionController.editQuestionPage
);

// Edit Question
router.post(
  "/:electionId/questions/:questionId",
  connectEnsureLogin.ensureLoggedIn(),
  electionController.editQuestion
);

// Delete Question
router.delete(
  "/:electionId/questions/:questionId",
  connectEnsureLogin.ensureLoggedIn(),
  electionController.deleteQuestion
);

// Create Option Page
router.get(
  "/:electionId/questions/:questionId/options/new",
  connectEnsureLogin.ensureLoggedIn(),
  electionController.createOptionPage
);

// Create Option
router.post(
  "/:electionId/questions/:questionId/options",
  connectEnsureLogin.ensureLoggedIn(),
  electionController.createOption
);

// Edit Option Page
router.get(
  "/:electionId/questions/:questionId/options/:optionId/edit",
  connectEnsureLogin.ensureLoggedIn(),
  electionController.editOptionPage
);

// Edit Option
router.post(
  "/:electionId/questions/:questionId/options/:optionId",
  connectEnsureLogin.ensureLoggedIn(),
  electionController.editOption
);

// Delete Option
router.delete(
  "/:electionId/questions/:questionId/options/:optionId",
  connectEnsureLogin.ensureLoggedIn(),
  electionController.deleteOption
);

module.exports = router;
