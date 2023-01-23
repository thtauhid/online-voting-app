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
router.get("/:electionId", electionController.getSingleElection);

// Change Election URL
router.post("/:electionId/url", electionController.changeElectionUrl);

// Preview Election
router.get("/:electionId/preview", electionController.previewElection);

// Launch Election
router.put("/:electionId/launch", electionController.launchElection);

// End Election
router.put("/:electionId/end", electionController.endElection);

// Create Question Page
router.get("/:electionId/questions/new", electionController.createQuestionPage);

// Questions Page
router.get("/:electionId/questions", electionController.questionsPage);

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

// Voters Page
router.get("/:electionId/voters", electionController.votersPage);

// Add Voter Page
router.get("/:electionId/voters/new", electionController.addVoterPage);

// Add Voter
router.post("/:electionId/voters", electionController.addVoter);

// Delete Voter
router.delete("/:electionId/voters/:id", electionController.deleteVoter);

module.exports = router;
