const { Election, Voter } = require("../models/index");

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
    res.render("vote", {
      title: "Voting page",
      csrfToken: req.csrfToken(),
    });
  } catch (error) {
    console.log(error);
    req.flash("error", error.message);
    res.redirect("/404");
  }
};
