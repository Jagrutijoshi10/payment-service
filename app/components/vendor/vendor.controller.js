const { log, thirdPartyCall } = require("../../../utils").logs
let request = require("request")


let TIMEOUT_3PP = Number(process.env.API_TIMEOUT_3PP)
let serverDownMsg =
  "So Sorry, we didn’t expect the overwhelming crowd. To ensure we deliver you a good experience, please come back in a short while. Thank You for your continuous support!"

// Disable Request Function
if (process.env.SAMPLE_RESPONSE == "true") {
  request = (options, cb) => {
    return cb(null, "", {})
  }
}

function vendorController() {
  /* Controller helper functions */
  const helpers = {
    /**
     * Payment Api Fetch
     */
    apiFetch: async (reqData, apiName, categoryName) => {
      let options = reqData.options

      if (process.env.SAMPLE_RESPONSE === "true") {
        options.timeout = 1
      } else {
        options.timeout = TIMEOUT_3PP
      }

      // Fetch API
      let resData = await new Promise(function (resolve, reject) {
        var start = new Date();
        request(options, async function (error, response, body) {
          // Testing Datas
          if (process.env.SAMPLE_RESPONSE === "true") {
            error = null

            if (apiName == `addOrder`) {
              body = {
                status: 1,
                orderno: "T15663758587643",
                signature: "CnzTGPazMECCGuj/YQrXis/BYQk="
              };
              // body = { "status": 0, "ErrorCode": "PP0003", "ErrorCategory": "Authentication Error", "ErrorMessage": "Access Denied. Signature is invalid (2)" }
            }
            if (apiName == `checkSignature`) {
              body = 1;
            }
            if (apiName == `updateOrder`) {
              body = {
                status: 1,
                orderno: "T15616164491758",
                signature: "ld+/uIoTVueUwzoXUdBrj/bXTuQ="
              };
            }
          }
          /* Error Return */
          if (error || !body) {
            // thirdPartyCall(
            //   {
            //     apiName,
            //     requestPayload: options.body || "",
            //     responsePayload: body,
            //     msisdn: reqData.msisdn,
            //     url: options.url,
            //     category: "HEXA"
            //   },
            //   error
            // );

            // log(
            //   `3PP Error || ${error} || ${apiName} || ${reqData.msisdn} || ${
            //     options.url
            //   }`
            // );
            return resolve({
              status: false,
              msg: serverDownMsg
            });
          }

          let responseTime = new Date() - start;
          // thirdPartyCall({
          //   apiName,
          //   requestPayload: options.body || "",
          //   responsePayload: body,
          //   msisdn: reqData.msisdn,
          //   url: options.url,
          //   responseTime,
          //   category: "HEXA"
          // });

          let returnData = {
            status: true,
            data: body
          };

          return resolve(returnData);
        });
      });

      return resData;
    }
  };

  /* Route hanlders */
  const handlers = {};

  return {
    helpers: Object.freeze(helpers),
    handlers: Object.freeze(handlers)
  };
}

module.exports = vendorController();
