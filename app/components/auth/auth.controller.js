/** Custom Functions */
const { UserSession } = require("../user/models");
const { Blacklist, ForceLogout } = require("../../../models");
const customErrorHelper = require("../customError/customError.helpers");
const moment = require("moment");

function authController() {
  /* Controller helper functions */
  const helpers = {
    /* Verifying JWT Token */
    verifyToken: async decoded => {
      try {
        let isBlacklisted = await Blacklist.query().findOne({
          msisdn: decoded.msisdn
        });

        if (isBlacklisted) {
          // You have been blacklisted
          let categorydId = 18;
          let errorMessage = await customErrorHelper.getErrorMessage(
            categorydId
          );
          let blackListMsg = errorMessage["blacklisted_user"];
          let msg =
            !!blackListMsg && !!blackListMsg.prompt_message
              ? blackListMsg.prompt_message
              : blackListUserMessage;
          return {
            isValid: false,
            errorMessage: msg
          };
        }

        let userData = await UserSession.query()
          .eager(
            "[user_detail(selectUserFields), user_vendor_session(selectVendorFields)]",
            {
              selectUserFields: builder => {
                builder.select("name", "id", "user_account_type","rp_code","sn_code");
              },
              selectVendorFields: builder => {
                builder.select("type", "session_id", "updated_at");
              }
            }
          )
          .where({
            id: decoded.sessionId,
            msisdn: decoded.msisdn,
            session_status: 1
          })
          .first();
        if (!userData) {
          return {
            isValid: false
          };
        }

        // Force Logout
        let currentTime = moment().format("YYYY-MM-DD HH:mm:ss.SSS");
        let forceLogout = await ForceLogout.query()
          .where({
            status: 1
          })
          .where("start_time", "<=", currentTime)
          .where("end_time", ">=", currentTime)
          .select("message")
          .first();

        if (forceLogout) {
          return {
            isValid: false,
            errorMessage: forceLogout.message
              ? forceLogout.message.replace(/[\n\r]/g, "")
              : "Service unavailable"
          };
        }

        /* Add Custom Fields */
        let vendorSessions = {};
        for (let elem of userData.user_vendor_session) {
          // Hexa
          if (elem.type == 1) {
            vendorSessions.hexaSessionId = elem.session_id;
            vendorSessions.hexaUpdatedAt = elem.updated_at;
          }
        }
        decoded.name = userData.user_detail.name;
        decoded.user_account_type = userData.user_detail.user_account_type;
        decoded.vendorSessions = vendorSessions;
        decoded.rpCode = userData.user_detail.rp_code;
        decoded.snCode = userData.user_detail.sn_code;
        return {
          userData: decoded,
          isValid: true
        };
      } catch (err) {
        console.log(err);
      }
    }
  };

  /* Route hanlders */
  const handlers = {};

  return {
    helpers: Object.freeze(helpers),
    handlers: Object.freeze(handlers)
  };
}

module.exports = authController();
