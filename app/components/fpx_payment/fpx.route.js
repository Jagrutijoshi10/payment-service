const { handlers } = require("./fpx.controller");
const validator = require("./payment.validators");
const sessionHandler = require("../vendor/sessionHandler");

const routes = [
  {
    method: "GET",
    path: "/fpx/banklist",
    config: {
      auth: "jwt",
      description: "FPX bank list",
      tags: ["api", "FPXPayment"],
      plugins: {
        hapiAclAuth: {
          secure: false
        }
      }
    },
    handler: handlers.bankList
  },
  {
    method: "GET",
    path: "/hexafpxbankList",
    config: {
      auth: false,
      description: "Get Bank list from HEXA",
      tags: ["api", "Payment"],
      plugins: {
        hapiAclAuth: {
          secure: false
        }
      }
    },
    handler: handlers.hexafpxbankList
  },
  {
    method: "GET",
    path: "/fpx",
    config: {
      auth: "jwt",
      description: "FPX bank list",
      tags: ["api", "FPXPayment"],
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
    handler: handlers.fpxPaymentStart
  },
  {
    method: "POST",
    path: "/directfpx",
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
    handler: handlers.directfpx
  },
  {
    method: "POST",
    path: "/indirectfpx",
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
    handler: handlers.indirectfpx
  }

];

module.exports = {
  plugin: {
    register(server) {
      server.dependency("hapi-auth-jwt2");
      server.dependency("hapi-swagger");
      server.route(routes);
    },
    name: "fpx"
  },
  routes: {
    prefix: "/v1/payment"
  }
};
