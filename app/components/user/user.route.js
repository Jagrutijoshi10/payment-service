const { handlers, helpers } = require("./user.controller");
const validator = require("./user.validators");

const routes = [];

module.exports = {
  plugin: {
    register(server) {
      server.dependency("hapi-auth-jwt2");
      server.dependency("hapi-swagger");
      server.route(routes);
    },
    name: "user-routes"
  },
  routes: {
    prefix: "/v1/user"
  }
};
