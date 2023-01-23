const { Election, Voter, Response } = require("../models/index");

exports.root = async (req, res) => {
  // If user is logged in, redirect to their respective election page

  const { user } = req;
  console.log({ user });
  try {
    if (user) {
      Election.getElectionById(user.electionId).then((election) => {
        return res.redirect(`/e/${election.url}`);
      });
    }
  } catch (error) {
    console.log(error);
    req.flash("error", error.message);
    res.redirect("/404");
  }
};

exports.loginPage = async (req, res) => {
  res.render("voterLogin", {
    title: "Voter Login",
    csrfToken: req.csrfToken(),
  });
};

exports.votePage = async (req, res) => {
  try {
    await Voter.verifyVoterAndElection(req.user.voterId, req.user.electionId);
    const election = await Election.getFullElectionById(req.user.electionId);
    console.log({ election });

    res.render("vote", {
      title: election.title,
      election,
      csrfToken: req.csrfToken(),
    });
  } catch (error) {
    console.log(error);
    req.flash("error", error.message);
    res.redirect("/404");
  }
};

// Add Response
exports.addResponses = async (req, res) => {
  const { electionId, voterId } = req.user;

  // Get options
  let { body: options } = req;
  // Remove csrf token from options
  delete options._csrf;

  // Map them properly
  options = Object.entries(options);
  // todo: Check if election is active
  // todo: check if voter answered all questions
  // todo: Check if voter is eligible to vote
  // todo: Check if voter has already voted
  // Add response
  try {
    await Response.addResponses(voterId, electionId, options);
    req.flash("success", "Your vote has been recorded!");
    res.redirect("/e");
  } catch (error) {
    console.log(error);
    req.flash("error", error.message);
    res.redirect("/e");
  }
};
