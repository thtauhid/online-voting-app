exports.checkAdmin = (req, res, next) => {
  const { user } = req;

  if (user._options.attributes.includes("voterId")) return res.redirect("/404");
  return next();
};

exports.checkVoter = (req, res, next) => {
  const { user } = req;

  if (user._options.attributes.includes("voterId")) return next();
  return res.redirect("/404");
};
