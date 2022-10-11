const routes = [];

module.exports = {
  plugin: {
    register(server) {
      server.dependency("hapi-auth-jwt2");
      server.dependency("hapi-swagger");
      server.route(routes);
    },
    name: "vendor-routes"
  },
  routes: {
    prefix: "/v1/vendor"
  }
};
