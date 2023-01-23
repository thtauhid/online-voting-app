const { v4: uuidv4 } = require("uuid");

exports.randomElectionUrl = () => {
  return uuidv4();
};
