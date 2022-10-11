const { join } = require("path");
const queryParse = require("query-string").parse;
/**
 * Global Config
 */
 const { argv } = require('process');

 let Environment = 'staging';
 if (argv.indexOf('.env.prod') > 1) {
   Environment = 'production'
 } else {
   require('dotenv').config({ path: join(__dirname, `${argv[2]}`) });
   if (argv[4] &&argv[4] === "prepaid-topup") {
    process.stdout.write("Set the env for prepaid topup")
    process.env.PORT = 2040
    process.env.maybank_response_url  =  process.env.prepaid_maybank_response_url
    // process.env.maybank_response_url = "https://mobilestg2.u.com.my/app-topup-mgt/v1/prepaid-topup/appResponse"
  }
 }
// if (process.argv[2] != ".env.prod") {
//   require("dotenv").config({
//     path: join(__dirname, `${process.argv[2]}`)
//   });
let setEnv = async function () {
  try {
    let dotenv = require("dotenv");
    let CryptoJS = require("crypto-js");
    var request = require("request-promise");
    let envServiceUrl = 'http://10.86.6.21/env?fileName=payment'

    if (argv[4] === "prepaid-topup") {
      process.stdout.write("Set the env for prepaid topup")
      envServiceUrl = 'http://10.86.6.21/env?fileName=prepaid-topup'
    }

    let envData = await request(envServiceUrl);
    let bytes = CryptoJS.AES.decrypt(
      envData,
      "DRNouR0MbItGAxC8wPoiUWYeCedstNH2S"
    );
    envData = bytes.toString(CryptoJS.enc.Utf8);
    envData = dotenv.parse(JSON.parse(envData).data);
    for (let key in envData) {
      process.env[key] = envData[key];
    }
  } catch (err) {
    console.log(JSON.stringify(err), "ENV_API_DECRYPTED_ERROR");
    process.exit(1);
  }
};

const startServer = async function () {
  if (Environment == 'production') {
    await setEnv()
  }
  console.log(`SAMPLE_RESPONSE - ${process.env.SAMPLE_RESPONSE}`);
  const { log, error, apiCall, apiRequest } = require("./utils").logs;
  const {
    getObjValue,
    dataEncryption,
    dataDecryption
  } = require("./utils").global;
  const Glue = require("@hapi/glue");
  const serverConfig = require("./config");
  const { unsupportedMediaType } = require("@hapi/boom");
  const {
    findErrMsg
  } = require("./app/components/customError/customError.controller").helpers;

  try {
    const options = {
      relativeTo: __dirname
    };
    const manifest = await serverConfig.manifest();
    const server = await Glue.compose(manifest, options);

    console.log(process.env.PORT)
    console.log(process.env.maybank_response_url)
  
    await server.start();

    apiCall(server);
    apiRequest(server);
    // console.log = () => { }

    const secureApi = {
      encryptRes: () => {
        server.ext("onPreResponse", async (req, h) => {
          req.user = req.user || {}
          req.user.langId = req.headers['lang-id'] || 1
          if (req.route.path.indexOf("/swagger") > -1) {
            return h.continue;
          }
          if (req.route.path.indexOf("payment/hexafpxbankList") > -1) {
            return h.continue;
          }
          if (req.route.path.indexOf("payment/directfpx") > -1) {
            return h.continue;
          }
          if (req.route.path.includes(["documentation", "swaggerui"]))
            return h.continue;
          let currentResponse = req.response || {};
          let responseData = {
            data: null,
            statusCode: 200
          };

          // Check redirect exists
          if (getObjValue(currentResponse, ["headers", "location"])) {
            return h.redirect(currentResponse.headers.location);
          }

          // Check Error
          if (currentResponse.isBoom == true) {
            responseData.data = getObjValue(currentResponse, [
              "output",
              "payload"
            ]);
            responseData.statusCode = getObjValue(currentResponse, [
              "output",
              "statusCode"
            ]);
          }
          // Check Success
          else {
            responseData.data = currentResponse.source;
            responseData.statusCode = currentResponse.statusCode;
          }
          // Response Encryption
          if (responseData.data) {
            // Custom Error Message for Internal Server Error
            if (responseData.statusCode == 500) {
              let errData = await findErrMsg(
                Number(process.env.CUSTOM_MESSAGE_CAT),
                "internal_error",
                req
              );
              responseData.data.error = errData.msg;
              responseData.data.message = errData.msg;
            }

            if (responseData.statusCode === 401) {
              let errData = await findErrMsg(
                Number(process.env.CUSTOM_MESSAGE_CAT),
                'invalid_credentials',
                req
              )
              if (responseData.data.attributes && responseData.data.attributes.error) {
                responseData.data.attributes.error = errData.msg
              }
              responseData.data.error = errData.msg
              responseData.data.message = errData.msg
            }
            responseData.data = dataEncryption(responseData.data);
          }

          return h.response(responseData.data).code(responseData.statusCode);
        });
      },
      decryptReq: () => {
        // Request Decryption
        server.ext("onPostAuth", (req, h) => {
          req.user = req.user || {}
          req.user.langId = req.headers['lang-id'] || 1
          // Skip encryption for Paym ent Response
          let reqPath = getObjValue(req, ["url", "pathname"], "");
          //Maybank
          if (reqPath && reqPath.indexOf("payment/appResponse") > -1) {
            return h.continue;
          }
          if (reqPath && reqPath.indexOf("prepaid-topup/appResponse") > -1) {
            return h.continue;
          }
          //FPX
          if (reqPath && reqPath.indexOf("payment/indirectfpx") > -1) {
            return h.continue;
          }
          if (reqPath && reqPath.indexOf("payment/directfpx") > -1) {
            return h.continue;
          }
          if (reqPath && reqPath.indexOf("payment/hexafpxbankList") > -1) {
            return h.continue;
          }

          if (req.payload) {
            if (typeof req.payload !== "string") {
              return unsupportedMediaType("Invalid Input");
            }
            req.payload = dataDecryption(req.payload);
            if (!req.payload) {
              return unsupportedMediaType("Invalid Input");
            }
          }
          if (req.query && req.query.request) {
            req.query = dataDecryption(req.query.request, "string");
            if (!req.query) {
              return unsupportedMediaType("Invalid Input");
            } else {
              req.query = queryParse(req.query); // url string to json conversion
            }
          }
          return h.continue;
        });
      }
    };
    if (process.env.REQ_DECRYPTION == "true") {
      console.log("REQ_DECRYPTION");
      secureApi.decryptReq();
    }
    if (process.env.RES_ENCRYPTION == "true") {
      console.log("RES_ENCRYPTION");
      secureApi.encryptRes();
    }
    // Handling Internal Server Error
    if (process.env.RES_ENCRYPTION != "true") {
      server.ext("onPreResponse", async (req, h) => {
        req.user = req.user || {}
        req.user.langId = req.headers['lang-id'] || 1
        if (req.route.path.includes(["documentation", "swaggerui"]))
          return h.continue;

        if (req.route.path.indexOf("swagger") > -1) {
          return h.continue;
        }

        let currentResponse = req.response || {};
        let responseData = {
          data: null,
          statusCode: 200
        };
        // Check Error
        if (currentResponse.isBoom == true) {
          responseData.data = getObjValue(currentResponse, [
            "output",
            "payload"
          ]);
          responseData.statusCode = getObjValue(currentResponse, [
            "output",
            "statusCode"
          ]);
        }
        // Check Success
        else {
          responseData.data = currentResponse.source;
          responseData.statusCode = currentResponse.statusCode;
        }
        // Custom Error Message for Internal Server Error
        if (responseData.statusCode == 500) {
          let errData = await findErrMsg(
            Number(process.env.CUSTOM_MESSAGE_CAT),
            "internal_error",
            req
          );
          responseData.data.error = errData.msg;
          responseData.data.message = errData.msg;
        }

        if (responseData.statusCode === 401) {
          let errData = await findErrMsg(
            Number(process.env.CUSTOM_MESSAGE_CAT),
            'invalid_credentials',
            req
          )
          if (responseData.data.attributes && responseData.data.attributes.error) {
            responseData.data.attributes.error = errData.msg
          }
          responseData.data.error = errData.msg
          responseData.data.message = errData.msg
        }
        return h.response(responseData.data).code(responseData.statusCode);
      });
    }
    process.stdout.write(process.env.PORT)
    process.stdout.write(process.env.maybank_response_url)
    process.stdout.write(argv[4])
    log(`Server listening on ${server.info.uri}`);
  } catch (err) {
    error(err);
    process.exit(1);
  }
};

startServer();

///console.log((()))