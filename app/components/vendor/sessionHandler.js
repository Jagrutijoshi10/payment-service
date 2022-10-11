const request = require("request-promise");
const { unauthorized, badImplementation } = require("@hapi/boom");

module.exports = {
  isPostpaid: async (req, h) => {
    if (req.user.user_account_type == 2) req.user.isPostpaid = true;
    return req;
  },

  verifyUser: async (req, h) => {
    if (req.user.isPostpaid) return req;

    let value;
    const OPTIONS = {
      uri: process.env.APP_SESSION_HANDLER_URL,
      method: "GET",
      headers: {
        Authorization: req.headers.authorization
      }
    };

    try {
      value = await request(OPTIONS);
    } catch (e) {
      try {
        message = JSON.parse(e.error) || { message: "Something went wrong!" };
      } catch (err) {
        return req;
      }
      if (
        e.statusCode == 401 &&
        req.route.path.includes(["payment"]) &&
        req.user.isPostpaid
      ) {
        return req;
      } else if (e.statusCode == 401 && !req.user.isPostpaid) {
        return unauthorized(message.message);
      } else if (
        e.statusCode >= 408 &&
        e.statusCode < 500 &&
        e.statusCode != 401
      ) {
        return badRequest(message.message);
      }
    }
    return req;
  }
};
