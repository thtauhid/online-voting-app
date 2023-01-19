exports.root = async (req, res) => {
  res.redirect("/e/1");
};

exports.loginPage = async (req, res) => {
  res.render("voterLogin", {
    title: "Voter Login",
    csrfToken: req.csrfToken(),
  });
};

exports.votePage = async (req, res) => {
  res.render("vote.ejs", {
    title: "Voting page",
    csrfToken: req.csrfToken(),
  });
};
