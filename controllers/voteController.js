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
    const voter = await Voter.getVoterById(req.user.voterId);

    console.log({ voter });

    res.render("vote", {
      title: election.title,
      election,
      voter,
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
  const { electionUrl } = req.params;

  // Get options
  let { body: options } = req;
  // Remove csrf token from options
  delete options._csrf;

  // Map them properly
  options = Object.entries(options);

  // Check if election is active
  const election = await Election.getElectionById(electionId);
  if (election.status !== "launched") {
    req.flash("error", "Election is not active");
    return res.redirect(`/e/${electionUrl}`);
  }

  // todo: check if voter answered all questions
  // todo: Check if voter is eligible to vote

  try {
    // Change voter status to true
    await Voter.updateVoterStatus(voterId, true);

    // Add responses
    await Response.addResponses(voterId, electionId, options);

    req.flash("success", "Your vote has been recorded!");
    return res.render("voted", {
      title: "Vote Recorded",
      election,
    });
  } catch (error) {
    console.log(error);
    req.flash("error", error.message);
    return res.redirect(`/e/${electionUrl}`);
  }
};
