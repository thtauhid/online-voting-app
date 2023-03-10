const { Election, Question, Option, Voter, Response } = require("../models");
const utils = require("../utils");

// Create Election Page
exports.createElectionPage = async (req, res) => {
  res.render("elections/new", {
    title: "Create New Election",
    csrfToken: req.csrfToken(),
  });
};

// Create Election
exports.createElection = async (req, res) => {
  try {
    const election = await Election.createElection(
      req.body.title,
      req.user.id,
      utils.randomElectionUrl()
    );

    res.redirect(`/elections/${election.id}`);
  } catch (error) {
    req.flash("error", error.message);
    res.redirect("/elections/new");
  }
};

// Get All Elections page
exports.getElections = async (req, res) => {
  try {
    const elections = await Election.getElectionsByAdminId(req.user.id);
    res.render("elections/index", {
      title: "My Elections",
      user: req.user,
      elections,
    });
  } catch (error) {
    console.log(error);
    req.flash("error", error.message);
    res.redirect("/");
  }
};

// Get Single Election
exports.getSingleElection = async (req, res) => {
  try {
    const { electionId } = req.params;
    const election = await Election.getElectionById(electionId);
    //todo: get numbers of questions and voters also
    // const questions = await Question.getQuestionsByElectionId(electionId);
    // const voters = await Voter.getVotersByElectionId(electionId);

    console.log(election);
    res.render("elections/single", {
      title: election.title,
      election,
      // questions,
      // voters,
      csrfToken: req.csrfToken(),
    });
  } catch (error) {
    req.flash("error", error.message);
    res.redirect("/elections");
  }
};

// Change Election URL
exports.changeElectionUrl = async (req, res) => {
  const { electionId } = req.params;

  try {
    const { electionUrl: url } = req.body;

    await Election.changeElectionUrl(electionId, url);
    return res.redirect(`/elections/${electionId}`);
  } catch (error) {
    console.log(error);
    req.flash("error", error.message);
    return res.redirect(`/elections/${electionId}`);
  }
};

// Preview election
exports.previewElection = async (req, res) => {
  const { electionId } = req.params;
  const election = await Election.getFullElectionById(electionId);

  res.render("preview", {
    title: election.title,
    election,
    csrfToken: req.csrfToken(),
  });
};

// Launch Election
exports.launchElection = async (req, res) => {
  try {
    const { electionId } = req.params;
    // TODO: Check if user is owner of election

    // Check if election has atleast 1 question
    const questionCount = await Question.getCountByElectionId(electionId);
    if (questionCount < 1) {
      req.flash("error", "Election must have atleast 1 question");
      return res.status(400).json({
        success: false,
      });
    }

    // Check if each question has atleast 2 options
    const questions = await Question.getQuestionsByElectionId(electionId);
    console.log({ questions });
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      const optionCount = await Option.getCountByQuestionId(question.id);
      if (optionCount < 2) {
        req.flash(
          "error",
          `Question "${question.title}" must have atleast 2 options`
        );
        return res.status(400).json({
          success: false,
        });
      }
    }

    await Election.launchElection(electionId);

    return res.json({
      success: true,
    });
  } catch (error) {
    req.flash("error", error.message);

    return res.status(400).json({
      success: false,
    });
  }
};

// Helper function to check if question has atleast 2 options

// End Election
exports.endElection = async (req, res) => {
  try {
    const { electionId } = req.params;
    // todo: Check if user is owner of election

    await Election.endElection(electionId);
    return res.json({
      success: true,
    });
  } catch (error) {
    return res.json({
      success: false,
    });
  }
};

// Create Question Page
exports.createQuestionPage = async (req, res) => {
  res.render("questions/new", {
    title: "Create New Question",
    csrfToken: req.csrfToken(),
    electionId: req.params.electionId,
  });
};

// Questions page
exports.questionsPage = async (req, res) => {
  const { electionId } = req.params;
  const questions = await Question.getQuestionsByElectionId(electionId);
  const election = await Election.getElectionById(electionId);

  res.render("questions/index", {
    title: "Questions", //todo: send electio title w/ title
    questions,
    election,
    csrfToken: req.csrfToken(),
  });
};

// Create Question
exports.createQuestion = async (req, res) => {
  const { title, description } = req.body;
  const { electionId } = req.params;

  try {
    // Check if election is launched
    const election = await Election.getElectionById(electionId);
    if (election.status != "created") {
      req.flash("error", "Election is already launched/completed");
      return res.redirect(`/elections/${electionId}/questions`);
    }

    const question = await Question.createQuestion(
      title,
      description,
      electionId
    );

    res.redirect(`/elections/${electionId}/questions/${question.id}`);
  } catch (error) {
    req.flash(
      "error",
      "Unable to create question. Title has to be of minimum 5 character."
    );
    res.redirect(`/elections/${electionId}/questions/new`);
  }
};

// Get Single Question
exports.getSingleQuestion = async (req, res) => {
  const { questionId, electionId } = req.params;
  const question = await Question.findByPk(questionId);
  const election = await Election.getElectionById(electionId);
  const options = await Option.findAll({
    where: {
      questionId,
    },
  });

  res.render("questions/single", {
    title: question.title,
    election,
    question,
    options,
    questionId,
    electionId,
    csrfToken: req.csrfToken(),
  });
};

// Edit Question Page
exports.editQuestionPage = async (req, res) => {
  const { questionId } = req.params;
  const { electionId } = req.params;
  const question = await Question.getQuestionById(questionId);
  const election = await Election.getElectionById(electionId);
  res.render("questions/edit", {
    title: "Edit Question: " + question.title,
    election,
    question,
    electionId,
    csrfToken: req.csrfToken(),
  });
};

// Edit Question
exports.editQuestion = async (req, res) => {
  const { title, description } = req.body;
  const { questionId, electionId } = req.params;
  const { id: userId } = req.user;

  try {
    // Ensure election is not launched/completed
    const election = await Election.getElectionById(electionId);
    if (election.status !== "created") {
      req.flash("error", "Election has already been launched/completed");
      res.redirect(`/elections/${electionId}/questions`);
    }

    await Question.updateQuestion(userId, questionId, title, description);
    res.redirect(`/elections/${electionId}/questions`);
  } catch (error) {
    req.flash("error", error.message);
    res.redirect(`/elections/${electionId}/questions/${questionId}/edit`);
  }
};

// Delete Question
exports.deleteQuestion = async (req, res) => {
  const { electionId, questionId } = req.params;
  const { id: userId } = req.user;

  try {
    // ensure there is atleast 1 question in the ballot
    const questionCount = await Question.getCountByElectionId(electionId);
    if (questionCount < 2) {
      req.flash("error", "Election must have atleast 1 question");
      return res.status(400).json({
        success: false,
      });
    }

    // First delete all options associated with the question
    // If all associated options are not deleted, then the question cannot be deleted
    await await Option.deleteAllOptionsByQuestionId(questionId);

    // Then delete the question
    await Question.deleteQuestion(userId, questionId);
    return res.json({ success: true });
  } catch (error) {
    return res.json({ success: false, error: error.message });
  }
};

// Create Option Page
exports.createOptionPage = async (req, res) => {
  res.render("options/new", {
    title: "Add New Option",
    csrfToken: req.csrfToken(),
    electionId: req.params.electionId,
    questionId: req.params.questionId,
  });
};

// Create Option
exports.createOption = async (req, res) => {
  const { title } = req.body;
  const { electionId } = req.params;
  const { questionId } = req.params;

  try {
    // Check if election is launched
    const election = await Election.getElectionById(electionId);
    if (election.status != "created") {
      req.flash("error", "Election is already launched/completed");
      return res.redirect(`/elections/${electionId}/questions`);
    }

    await Option.createOption(title, questionId);
    res.redirect(`/elections/${electionId}/questions/${questionId}`);
  } catch (error) {
    req.flash(
      "error",
      "Unable to create option. Minimum 1 character required."
    );
    res.redirect(`/elections/${electionId}/questions/${questionId}`);
  }
};

// Edit Option Page
exports.editOptionPage = async (req, res) => {
  const { optionId } = req.params;
  const { electionId } = req.params;
  const { questionId } = req.params;
  const option = await Option.getOptionById(optionId);
  const question = await Question.getQuestionById(questionId);
  res.render("options/edit", {
    title: "Edit Option: " + option.title,
    option,
    electionId,
    questionId,
    question,
    csrfToken: req.csrfToken(),
  });
};

// Edit Option
exports.editOption = async (req, res) => {
  const { title } = req.body;
  const { electionId, questionId, optionId } = req.params;
  const { id: userId } = req.user;

  try {
    // Check if election is launched
    const election = await Election.getElectionById(electionId);
    if (election.status != "created") {
      req.flash("error", "Election is already launched/completed");
      return res.redirect(`/elections/${electionId}/questions`);
    }

    await Option.updateOption(userId, optionId, title);
    res.redirect(`/elections/${electionId}/questions/${questionId}`);
  } catch (error) {
    req.flash("error", error.message);
    res.redirect(
      `/elections/${electionId}/questions/${questionId}/options/${optionId}/edit`
    );
  }
};

// Delete Option
exports.deleteOption = async (req, res) => {
  const { optionId } = req.params;
  const { id: userId } = req.user;

  try {
    await Option.deleteOption(userId, optionId);
    return res.json({ success: true });
  } catch (error) {
    console.log(error);
    return res.json({ success: false });
  }
};

// Voters Page
exports.votersPage = async (req, res) => {
  const { electionId } = req.params;
  const voters = await Voter.findAll({
    where: {
      electionId,
    },
  });
  const election = await Election.findByPk(electionId);
  res.render("voters/index", {
    title: "Voters",
    voters,
    election,
    electionId,
    csrfToken: req.csrfToken(),
  });
};

// Add Voter Page
exports.addVoterPage = async (req, res) => {
  res.render("voters/new", {
    title: "Add New Voter",
    csrfToken: req.csrfToken(),
    electionId: req.params.electionId,
  });
};

// Add Voter
exports.addVoter = async (req, res) => {
  const { electionId } = req.params;
  const { voterId, password } = req.body;

  // Check if user has entered voterid
  if (voterId == 0) {
    req.flash("error", "Please enter voter id");
    return res.redirect(`/elections/${electionId}/voters`);
  }

  // Check if password is empty
  if (password.length == 0) {
    req.flash("error", "Please enter password");
    return res.redirect(`/elections/${electionId}/voters`);
  }

  // Append the election id infront of the voter id
  const updatedVoterId = electionId + "_" + voterId;

  try {
    await Voter.addVoter(updatedVoterId, password, electionId);
    req.flash("success", "Voter added successfully.");
    return res.redirect(`/elections/${electionId}/voters`);
  } catch (error) {
    req.flash("error", error.message);
    return res.redirect(`/elections/${electionId}/voters`);
  }
};

// Delete Voter
exports.deleteVoter = async (req, res) => {
  const { id: voterId } = req.params; // the 'id' is typed as 'voterId' for consistency
  const { id: adminId } = req.user;

  try {
    await Voter.deleteVoter(adminId, voterId);
    return res.json({ success: true });
  } catch (error) {
    return res.json({ success: false });
  }
};

// Stats Page
exports.statsPage = async (req, res) => {
  const { electionId } = req.params;
  const election = await Election.getFullElectionById(electionId);

  // Get the total number of voters
  const votes = await Voter.getVoterNumbersByElectionId(electionId);

  let questions = election.questions;

  for (let question of questions) {
    // Get the total number of votes for each question
    const questionVotes = await Response.getCountByQuestionId(question.id);

    // Get the total number of votes for each option
    for (let option of question.options) {
      const optionVotes = await Response.getCountByOptionId(option.id);
      option.votes = optionVotes;
    }

    question.votes = questionVotes;
  }

  console.log({ questions });

  res.render("elections/stats", {
    title: "Stats",
    election,
    questions,
    votes,
    electionId,
    csrfToken: req.csrfToken(),
  });
};
