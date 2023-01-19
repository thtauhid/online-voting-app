exports.checkAdmin = (req, res, next) => {
  const { user } = req;

  // eslint-disable-next-line no-prototype-builtins
  if (user.hasOwnProperty("voterId")) return res.redirect("/404");
  return next();
};

exports.checkVoter = (req, res, next) => {
  const { user } = req;
  // eslint-disable-next-line no-prototype-builtins
  if (user.hasOwnProperty("voterId")) return next();
  return res.redirect("/404");
};
