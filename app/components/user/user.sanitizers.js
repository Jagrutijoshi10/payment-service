const { pick } = require("ramda");

function userSanitizers() {
  const sanitizers = {
    genTokenPayload: userData => {
      return pick(["id", "email", "name", "user_type"])(userData);
    }
  };

  return Object.freeze(sanitizers);
}

module.exports = userSanitizers();
