const { badImplementation } = require("@hapi/boom");
const path = require("path");
const { contentType } = require("mime-types");

function authController() {
  /* Controller helper functions */
  const helpers = {};

  /* Route hanlders */
  const handlers = {
    async getSwagger(req, h) {
      try {
        if (req.params.path == "documentation") {
          req.params.path = "index.html";
        }

        let file = path.join(
          __dirname,
          `../../../static/swaggerUI/${req.params.path}`
        );
        let data = require("fs").readFileSync(file, "utf8");
        // create response
        const response = h.response(data);
        // mime type
        response.type(contentType(path.extname(file)));
        // for basic auth prompt
        response.header("WWW-Authenticate", "Basic");
        return response;
      } catch (e) {
        console.log(e);
        return badImplementation("Something went wrong!");
      }
    }
  };

  return {
    helpers: Object.freeze(helpers),
    handlers: Object.freeze(handlers)
  };
}

module.exports = authController();
