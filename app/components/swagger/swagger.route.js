const { handlers } = require("./swagger.controller");

const routes = [
  {
    method: "GET",
    path: "/{path}",
    config: {
      auth: "simple",
      plugins: {
        hapiAclAuth: {
          secure: false
        }
      }
    },
    handler: handlers.getSwagger
  }
];

module.exports = {
  plugin: {
    register(server) {
      server.dependency("@hapi/basic");
      server.route(routes);
    },
    name: "swagger-routes"
  },
  routes: {
    prefix: "/swagger"
  }
};
