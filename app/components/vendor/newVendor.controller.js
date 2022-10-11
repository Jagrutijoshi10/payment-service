const { log } = require('../../../utils').logs
const { vendorRequest } = require('./helpers/index')
const responseCode = require('../../../utils/constants/httpStatusCode')

const {
  findErrMsg
} = require('../../components/customError/customError.controller').helpers
let serverDownMsg = async req => {
  let msgData = await findErrMsg(
    Number(process.env.CUSTOM_MESSAGE_CAT),
    'overwhelming_message',
    req
  )
  return msgData.msg
}
// var serverDownMsg =
// 'So Sorry, we didn’t expect the overwhelming crowd. To ensure we deliver you a good experience, please come back in a short while. Thank You for your continuous support!'

/** Other Components */
const { helpers: customErrHelpers } = require('../customError').contoller

function vendorController() {
  /* Controller helper functions */
  const helpers = {
    /*
     * SOA API FETCH
     */
    apiFetch: async (reqData, apiName, categoryName, req) => {

      categoryName = 'HEXA'
      if(reqData.isMGate == true ){
        categoryName = "MGate"
      }
      let options,
        otherError,
        responseTime,
        logData,
        startTime = Date.now(),
        stringify = JSON.stringify
      try {
        // OPTIONS
        options = vendorRequest.prepareOptions(
          reqData,
          null,
          apiName,
          categoryName
        )

        // NETWORK CALL
        let {
          respStatus,
          body = null,
          respError = null,
          isStubData = false,
          statusCode = null
        } = await vendorRequest.executeVendorAPI(
          options,
          apiName,
          categoryName,
          reqData,
          req
        )
        responseTime = Date.now() - startTime

        // NOC LOG
        logData = {
          apiName,
          requestPayload: options.body || '',
          responsePayload: body,
          msisdn: reqData.msisdn,
          url: options.url,
          category: categoryName,
          startTime,
          responseTime,
          isStubData,
          statusCode,
          requestId: req.processingInfo.requestId,
          requestPath: req.path
        }

        // HTTP ERROR
        if (!respStatus && respError) {
          otherError = await vendorRequest.clientErrResp(respError, statusCode, req)

          // log(
          //   `3PP Error || ${respError['message']} || ${apiName} || ${
          //     reqData.msisdn
          //   } || ${options.url} || ${responseTime} || ${stringify(options)}`
          // )

          // // LOG NOC ERROR LOG
          // vendorRequest.logResponse(logData, respError['message'])

          return otherError
        } else {
          // Payment responses are stringified json. no need to parse
          // try {
          //   // XML to JSON
          //   body = await vendorRequest.parseXMLtoJSON(body)
          // } catch (e) {
          //   log(
          //     `3PP Error || Service Error || ${apiName} || ${
          //       reqData.msisdn
          //     } || ${options.url} || ${responseTime} || ${stringify(options)}`
          //   )

          //   // LOG NOC ERROR LOG
          //   vendorRequest.logResponse(logData, `3PP_SERVICE_ERROR`)

          //   return {
          //     status: false,
          //     msg: serverDownMsg,
          //     statusCode: responseCode.HTTP_UNPROCESSABLE_ENTITY
          //   }
          // }
        }

        // SUCCESS
        // log(
        //   `3pp Call || ${reqData.msisdn} || ${categoryName} || ${apiName} || ${
        //     options.url
        //   } || ${responseTime} || ${stringify(options)}`
        // )

        // // LOG NOC LOG
        // vendorRequest.logResponse(logData)

        // CUSTOM ERROR MESSAGE HANDLING
        // let customMessage = await customErrHelpers.fetchMessage({
        //   categoryName: categoryName,
        //   apiName: apiName,
        //   response: body
        // })

        return {
          status: true, // customMessage.status
          // msg: customMessage.msg,
          data: body,
          statusCode: 200
          // customMessage.status ? 200 : responseCode.HTTP_BAD_REQUEST
        }
      } catch (e) {
        return {
          status: false,
          msg: await serverDownMsg(req),
          statusCode: responseCode.HTTP_INTERNAL_SERVER_ERROR
        }
      }
    },
    mGateAPIFetch: async (reqData, apiName, categoryName, req) => {
      let options,
        otherError,
        responseTime,
        logData,
        startTime = Date.now(),
        stringify = JSON.stringify
      try {
        // OPTIONS
        options = vendorRequest.prepareOptions(
          reqData,
          null,
          apiName,
          categoryName
        )

        // console.log("Prepare Options",options)


        // NETWORK CALL
        let {
          respStatus,
          body = null,
          respError = null,
          isStubData = false,
          statusCode = null
        } = await vendorRequest.executeVendorAPI(
          options,
          apiName,
          categoryName,
          reqData,
          req
        )
        responseTime = Date.now() - startTime

        console.log("Rsponse",body , respStatus , respError , statusCode)

        // NOC LOG
        logData = {
          apiName,
          requestPayload: options.body || '',
          responsePayload: body,
          msisdn: reqData.msisdn,
          url: options.url,
          category: categoryName,
          startTime,
          responseTime,
          isStubData,
          statusCode,
          requestId: null ,
          requestPath: null
        }

        // HTTP ERROR
        if (!respStatus && respError) {
          otherError = await vendorRequest.clientErrResp(respError, statusCode, req)

          // log(
          //   `3PP Error || ${respError['message']} || ${apiName} || ${
          //     reqData.msisdn
          //   } || ${options.url} || ${responseTime} || ${stringify(options)}`
          // )

          // // LOG NOC ERROR LOG
          // vendorRequest.logResponse(logData, respError['message'])

          return otherError
        } else {
          // Payment responses are stringified json. no need to parse
          // try {
          //   // XML to JSON
          //   body = await vendorRequest.parseXMLtoJSON(body)
          // } catch (e) {
          //   log(
          //     `3PP Error || Service Error || ${apiName} || ${
          //       reqData.msisdn
          //     } || ${options.url} || ${responseTime} || ${stringify(options)}`
          //   )

          //   // LOG NOC ERROR LOG
          //   vendorRequest.logResponse(logData, `3PP_SERVICE_ERROR`)

          //   return {
          //     status: false,
          //     msg: serverDownMsg,
          //     statusCode: responseCode.HTTP_UNPROCESSABLE_ENTITY
          //   }
          // }
        }

        // SUCCESS
        // log(
        //   `3pp Call || ${reqData.msisdn} || ${categoryName} || ${apiName} || ${
        //     options.url
        //   } || ${responseTime} || ${stringify(options)}`
        // )

        // // LOG NOC LOG
        // vendorRequest.logResponse(logData)

        // CUSTOM ERROR MESSAGE HANDLING
        // let customMessage = await customErrHelpers.fetchMessage({
        //   categoryName: categoryName,
        //   apiName: apiName,
        //   response: body
        // })

        return {
          status: true, // customMessage.status
          // msg: customMessage.msg,
          data: body,
          statusCode: 200
          // customMessage.status ? 200 : responseCode.HTTP_BAD_REQUEST
        }
      } catch (e) {
        console.log("e",e)
        return {
          status: false,
          msg: await serverDownMsg(req),
          statusCode: responseCode.HTTP_INTERNAL_SERVER_ERROR
        }
      }
    }
  }

  /* Route hanlders */
  const handlers = {}

  return {
    helpers: Object.freeze(helpers),
    handlers: Object.freeze(handlers)
  }
}

module.exports = vendorController()
