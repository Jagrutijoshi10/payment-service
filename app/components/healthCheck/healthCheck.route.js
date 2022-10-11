const { handlers } = require("./healthCheck.controller");

const routes = [
  {
    method: "GET",
    path: "/payment/health-check",
    config: {
      auth: false,
      description: "Monitoring api to check the application running status",
      tags: ["api", "Health Check"]
    },
    handler: handlers.healthCheckDetails
  },
  {
    method: "GET",
    path: "/prepaid-topup/health-check",
    config: {
      auth: false,
      description: "Monitoring api to check the application running status",
      tags: ["api", "Health Check"]
    },
    handler: handlers.healthCheckDetails
  }
];

module.exports = {
  plugin: {
    register(server) {
      server.dependency("hapi-auth-jwt2");
      server.dependency("hapi-swagger");
      server.route(routes);
    },
    name: "health-routes"
  },
  routes: {
    prefix: "/v1"
  }
};
