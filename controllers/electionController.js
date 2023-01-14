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
    const election = await Election.getElectionById(req.params.id);
    const questions = await Question.getQuestionsByElectionId(req.params.id);

    res.render("elections/single", {
      title: election.title,
      election,
      questions,
      csrfToken: req.csrfToken(),
    });
  } catch (error) {
    req.flash("error", error.message);
    res.redirect("/elections");
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
  const { questionId, electionId } = req.params;
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
  res.render("questions/edit", {
    title: "Edit Question: " + question.title,
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
    await Question.updateQuestion(userId, questionId, title, description);
    res.redirect(`/elections/${electionId}`);
  } catch (error) {
    req.flash("error", error.message);
    res.redirect(`/elections/${electionId}/questions/${questionId}/edit`);
  }
};

// Delete Question
exports.deleteQuestion = async (req, res) => {
  const { questionId } = req.params;
  const { id: userId } = req.user;
  console.log({ userId, questionId });

  try {
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

// Edit Option Page
exports.editOptionPage = async (req, res) => {
  const { optionId } = req.params;
  const { electionId } = req.params;
  const { questionId } = req.params;
  const option = await Option.getOptionById(optionId);
  res.render("options/edit", {
    title: "Edit Option: " + option.title,
    option,
    electionId,
    questionId,
    csrfToken: req.csrfToken(),
  });
};

// Edit Option
exports.editOption = async (req, res) => {
  const { title } = req.body;
  const { electionId, questionId, optionId } = req.params;
  const { id: userId } = req.user;

  try {
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
