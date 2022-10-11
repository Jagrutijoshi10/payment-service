const hapiJwt = require("@hapi/basic");
async function register(server, options) {
  await server.register(hapiJwt);
  server.auth.strategy("simple", "basic", {
    validate: async function(req, username, password, h) {
      if (username == "umliveswagger" && password == "qWjFIL6MBw") {
        return {
          isValid: true,
          credentials: {}
        };
      }
      return false;
    }
  });
}

const authPlugin = {
  plugin: { register, name: "simple" }
};

module.exports = authPlugin;
