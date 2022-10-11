const chalk = require("chalk");
const winston = require("winston");
const CryptoJS = require("crypto-js");
const { getTransactionId } = require('./globalFunctions');
// Imports the Google Cloud client library for Winston
const transport = require("@google-cloud/logging-winston");
let logger = null;

function logs() {
  /* logger singleton  */
  (function _initLogger() {
    return (() => {
      if (logger) return logger;
      const loggingWinston = new transport.LoggingWinston({
        labels: {
          "k8s-pod/run": process.env.CONTAINER_NAME,
          "k8s-pod/pod-template-hash": process.env.POD_HASH
        },
        resource: {
          labels: {
            project_id: process.env.PROJECT_ID,
            container_name: process.env.CONTAINER_NAME,
            namespace_name: "default",
            location: process.env.LOCATION,
            pod_name: process.env.POD_NAME,
            cluster_name: process.env.CLUSTER_NAME
          },
          type: "k8s_container"
        }
      });
      logger = winston.createLogger({
        transports: [new winston.transports.Console(), loggingWinston]
      });
      return logger;
    })();
  })();

  const methods = {
    print: type => (...msg) =>
      process.env.NODE_ENV !== "production"
        ? console.log(
          ...msg.map(x => (typeof x === "object" ? x : chalk[type](x)))
        )
        : undefined, // undefined,
    log: (...msg) => methods.print("green")(...msg),
    info: (...msg) => methods.print("blue")(...msg),
    error: (...msg) => methods.print("red")(...msg),
    pretty: (...msg) =>
      methods.print("blue")(...msg.map(x => JSON.stringify(x, null, 2))),
    apiCall: server => {
      try {
        server.events.on("response", request => {
          try{
          let logEventType =
          !!request.response && !!request.response.statusCode
            ? request.response.statusCode
            : 200

          if (request.route.path.indexOf("swagger") > -1) {
            return;
          }
          let logType = "info";

          if (request.path === "/v1/payment/health-check") return;
          if (request.path === "/v1/prepaid-topup/health-check") return;

          switch (true) {
            case logEventType >= 500:
              logType = "error";
              break;
            case logEventType >= 400:
              logType = "warn";
              break;
            default:
              break;
          }

          // Api Response Decryption
          let decryptResponse = data => {
            try {
              if (typeof data == "object") {
                return data;
              }
              let bytes = CryptoJS.AES.decrypt(data, process.env.ENCRYPT_KEY);
              let decrypted = bytes.toString(CryptoJS.enc.Utf8);
              return {
                ...JSON.parse(decrypted)
              };
            } catch (err) {
              console.log(JSON.stringify(err), "API_DECRYPTED_ERROR");
              return data;
            }
          };

          let contLength = null
          if (!!request.response && !!request.response.headers) {
            contLength = request.response.headers['content-length']
          }

          let decryptData =
            request.response.source != undefined
              ? request.response.source
              : (request.response.source = {})

          logger[logType]("API_CALL", {
            httpRequest: {
              status: logEventType,
              requestUrl: request.path,
              requestReceivedTime: request.info.received,
              responseTime: request.info.completed - request.info.received,
              requestId: request.processingInfo.requestId,
              latency: {
                seconds:
                  (request.info.completed - request.info.received) / 1000,
                nano: Math.round(
                  (request.info.completed - request.info.received) * 1000 * 1000
                )
              },
              requestMethod: request.method.toUpperCase(),
              responseSize: contLength,
              user: request.user,
              timestamp: Date.now(),
              origin:
                request.headers['x-forwarded-for'] ||
                request.info.remoteAddress,
              path: request.path,
              userAgent: request.headers["user-agent"],
              remoteIp:
                request.headers["x-forwarded-for"] || request.info.remoteAddress
            },
            user: request.user,
            timestamp: Date.now(),
            origin:
              request.headers["x-forwarded-for"] || request.info.remoteAddress,
            path: request.path,
            userAgent: request.headers["user-agent"],
            deviceBuildNum: request.headers["x-build-num"],
            deviceOs: request.headers["x-device-os"],
            deviceName: request.headers['x-device-name'],
            deviceId: request.headers['x-device-id'],
            uniqueDeviceId: request.headers['x-unique-device-id'],
            statusCode: logEventType,
            method: request.method.toUpperCase(),
            requestData: {
              params: request.params ? JSON.stringify(request.params) : '',
              payload: request.payload ? JSON.stringify(request.payload) : '',
              query: request.query ? JSON.stringify(request.query) : ''
            },
            responseData: decryptData ? JSON.stringify(decryptResponse(decryptData)) : ''
          });
        } catch(err) { }
        });
      } catch (e) { }
    },

    thirdPartyCall: (data, error = null) => {
      try {
        let logType = error ? "error" : "info";
        let message = error ? "3PP_ERROR" : "3PP_CALL";
        let payload = {
          timestamp: Date.now(),
          ...data
        };

        if (error) {
          payload.error = error
          if (error == "3PP_SERVICE_ERROR") {
            message = "3PP_SERVICE_ERROR";
          }
        };

        // Custom 
        if ([429, 503].indexOf(payload.statusCode) > -1) {
          message = '3PP_QUEUE_ERROR'
        } else {
          delete payload.statusCode
        }

        logger[logType](message, payload);
      } catch (e) { }
    },
    apiRequest: server => {
      // Add the request Trace
      server.ext("onRequest", (request, h) => {
        try {
          request.processingInfo = {
            requestId: getTransactionId()
          };
          // logger["info"]("API_REQUEST", {
          //   requestTime: request.info.received,
          //   requestUrl: request.path,
          //   requestId: request.processingInfo.requestId,
          //   requestMethod: request.method.toUpperCase()
          // });
          return h.continue;
        } catch (err) {
          console.error("NOC_LOG_ERROR", err);
          return h.continue;
        }
      });
    }
  };

  return Object.freeze(methods);
}

module.exports = logs();
