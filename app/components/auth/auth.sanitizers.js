const { pick } = require("ramda");

function authSanitizers() {
  const sanitizers = {
    genTokenPayload: userData => {
      return pick(["id", "email", "name", "user_type"])(userData);
    }
  };

  return Object.freeze(sanitizers);
}

module.exports = authSanitizers();
