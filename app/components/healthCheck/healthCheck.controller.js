const { error } = require("../../../utils").logs;
const { success } = require("../../../utils").response;
const { badImplementation } = require("@hapi/boom");

function healthCheck() {
  /* Route hanlders */
  const handlers = {
    async healthCheckDetails(req, h) {
      try {
        return success(h, "Health Check Success", { status: true });
      } catch (e) {
        error(e);
        return badImplementation("Something went wrong");
      }
    }
  };

  return {
    handlers: Object.freeze(handlers)
  };
}

module.exports = healthCheck();
