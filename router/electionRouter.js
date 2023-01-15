const express = require("express");
const router = express.Router();

const electionController = require("../controllers/electionController");

// Create Election Page
router.get("/new", electionController.createElectionPage);

// Create Election
router.post("/", electionController.createElection);

// Get All Elections page
router.get("/", electionController.getElections);

// Get Single Election
router.get("/:id", electionController.getSingleElection);

// Create Question Page
router.get("/:electionId/questions/new", electionController.createQuestionPage);

// Create Question
router.post("/:electionId/questions", electionController.createQuestion);

// Get Single Question
router.get(
  "/:electionId/questions/:questionId",
  electionController.getSingleQuestion
);

// Edit Question Page
router.get(
  "/:electionId/questions/:questionId/edit",
  electionController.editQuestionPage
);

// Edit Question
router.post(
  "/:electionId/questions/:questionId",
  electionController.editQuestion
);

// Delete Question
router.delete(
  "/:electionId/questions/:questionId",
  electionController.deleteQuestion
);

// Create Option Page
router.get(
  "/:electionId/questions/:questionId/options/new",
  electionController.createOptionPage
);

// Create Option
router.post(
  "/:electionId/questions/:questionId/options",
  electionController.createOption
);

// Edit Option Page
router.get(
  "/:electionId/questions/:questionId/options/:optionId/edit",
  electionController.editOptionPage
);

// Edit Option
router.post(
  "/:electionId/questions/:questionId/options/:optionId",
  electionController.editOption
);

// Delete Option
router.delete(
  "/:electionId/questions/:questionId/options/:optionId",
  electionController.deleteOption
);

// Add Voter Page
router.get("/:electionId/voters/new", electionController.addVoterPage);

// Add Voter
router.post("/:electionId/voters", electionController.addVoter);

module.exports = router;
