const { Election, Question, Option } = require("../models");

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
    const election = await Election.createElection(req.body.title, req.user.id);

    res.redirect(`/elections/${election.id}`);
  } catch (error) {
    req.flash(
      "error",
      "Unable to create new election. Minimum 5 character required."
    );
    res.redirect("/elections/new");
  }
};

// Get All Elections page
exports.getElections = async (req, res) => {
  try {
    const election = await Election.getElectionsByAdminId(req.user.id);
    res.render("elections/index", {
      title: "My Elections",
      user: req.user,
      election,
    });
  } catch (error) {
    req.flash("error", error.message);
    res.redirect("/");
  }
};

// Get Single Election
exports.getSingleElection = async (req, res) => {
  try {
    const election = await Election.getElectionById(req.params.id);
    const questions = await Question.getQuestionsByElectionId(req.params.id);

    res.render("elections/single", {
      title: election.title,
      election,
      questions,
    });
  } catch (error) {
    req.flash("error", error.message);
    res.redirect("/admin");
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

// Create Question
exports.createQuestion = async (req, res) => {
  const { title, description } = req.body;
  const { electionId } = req.params;

  try {
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
  const { questionId } = req.params;
  const question = await Question.findByPk(questionId);
  const options = await Option.findAll({
    where: {
      questionId,
    },
  });
  res.render("questions/single", {
    title: question.title,
    question,
    options,
  });
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
    await Option.createOption(title, questionId);
    res.redirect(`/elections/${electionId}/questions/${questionId}`);
  } catch (error) {
    req.flash(
      "error",
      "Unable to create option. Minimum 1 character required."
    );
    res.redirect(
      `/elections/${electionId}/questions/${questionId}/options/new`
    );
  }
};
