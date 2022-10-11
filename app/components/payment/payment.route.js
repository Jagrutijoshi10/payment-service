const { handlers } = require("./payment.controller");
const validator = require("./payment.validators");
const sessionHandler = require("../vendor/sessionHandler");

const routes = [
  {
    method: "GET",
    path: "/v1/payment",
    config: {
      auth: "jwt",
      description: "Initiate Payment request",
      tags: ["api", "Payment"],
      pre: [
        {
          method: sessionHandler.isPostpaid
        },
        {
          method: sessionHandler.verifyUser
        }
      ],
      plugins: {
        hapiAclAuth: {
          secure: false
        }
      }
    },
    handler: handlers.start
  },
  {
    method: "POST",
    path: "/v1/payment/appResponse",
    config: {
      auth: false,
      description: "Get payment response from payment service",
      tags: ["api", "Payment"],
      plugins: {
        hapiAclAuth: {
          secure: false
        }
      }
    },
    handler: handlers.appResponseV2
  },
  {
    method: "GET",
    path: "/v1/prepaid-topup",
    config: {
      auth: "jwt",
      description: "Initiate Payment request",
      tags: ["api", "Payment"],
      pre: [
        {
          method: sessionHandler.isPostpaid
        },
        {
          method: sessionHandler.verifyUser
        }
      ],
      plugins: {
        hapiAclAuth: {
          secure: false
        }
      }
    },
    handler: handlers.start
  },
  {
    method: "POST",
    path: "/v1/prepaid-topup/appResponse",
    config: {
      auth: false,
      description: "Get prepaid topup response from payment service",
      tags: ["api", "topup"],
      plugins: {
        hapiAclAuth: {
          secure: false
        }
      }
    },
    handler: handlers.appResponseV2
  },
  {
    method: "POST",
    path: "/v1/prepaid-topup/cancelOrder",
    config: {
      auth: "jwt",
      description: "Get prepaid topup response from payment service",
      tags: ["api", "topup"],
      plugins: {
        hapiAclAuth: {
          secure: false
        }
      }
    },
    handler: handlers.cancelOrder
  },
  {
    method: "POST",
    path: "/v1/payment/cancelOrder",
    config: {
      auth: "jwt",
      description: "Get prepaid topup response from payment service",
      tags: ["api", "Payment"],
      plugins: {
        hapiAclAuth: {
          secure: false
        }
      }
    },
    handler: handlers.cancelOrder
  },
  {
    method: "GET",
    path: "/v1.1/payment",
    config: {
      auth: "jwt",
      description: "Initiate Payment request",
      tags: ["api", "Payment"],
      pre: [
        {
          method: sessionHandler.isPostpaid
        },
        {
          method: sessionHandler.verifyUser
        }
      ],
      plugins: {
        hapiAclAuth: {
          secure: false
        }
      }
    },
    handler: handlers.start
  },
  {
    method: "GET",
    path: "/v1.1/prepaid-topup",
    config: {
      auth: "jwt",
      description: "Initiate Payment request",
      tags: ["api", "Payment"],
      pre: [
        {
          method: sessionHandler.isPostpaid
        },
        {
          method: sessionHandler.verifyUser
        }
      ],
      plugins: {
        hapiAclAuth: {
          secure: false
        }
      }
    },
    handler: handlers.start
  },

];

module.exports = {
  plugin: {
    register(server) {
      server.dependency("hapi-auth-jwt2");
      server.dependency("hapi-swagger");
      server.route(routes);
    },
    name: "payment"
  },
  // routes: {
  //   prefix: "/v1"
  // }
};
