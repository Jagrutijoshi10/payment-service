const { handlers, helpers } = require("./auth.controller");
const validator = require("./auth.validators");

const routes = [];

module.exports = {
  plugin: {
    register(server) {
      server.dependency("hapi-auth-jwt2");
      server.dependency("hapi-swagger");
      server.route(routes);
    },
    name: "auth-routes"
  },
  routes: {
    prefix: "/v1/auth"
  }
};
