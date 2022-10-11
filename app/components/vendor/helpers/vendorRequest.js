const { xml2json } = require('xml-js')
const sampleResponse = require('./mock')
const {
  log,
  thirdPartyCall,
  vendorServiceCall
} = require('../../../../utils').logs
const { parse: parseURL } = require('url')
const { join } = require('path')
const { readFileSync } = require('fs')
let request = require('request')
const TIMEOUT_3PP = Number(process.env.API_TIMEOUT_3PP)

const { getTransactionId } = require('../../../../utils').global

const {
  findErrMsg
} = require('../../customError/customError.controller').helpers
let serverDownMsg = async req => {
  let msgData = await findErrMsg(
    Number(process.env.CUSTOM_MESSAGE_CAT),
    'overwhelming_message',
    req
  )
  return msgData.msg
}

const responseCode = require('../../../../utils/constants/httpStatusCode')

let opts = void 0
function makeOpts(options, apiName, category, reqData, req) {

  if (!category || !options || !apiName)
    throw new Error('Invalid Category Or Options Or API name')

  if (typeof category != 'string') throw new TypeError('Invalid Category')

  category = category.toLowerCase()

  if (category == 'fmsservice') {
    category = 'crm'
  } else if (category == 'uexclusive') {
    category = 'cdd'
  }

  let baseUrl = process.env.VENDOR_SERVICE_URL
  switch (category) {
    case 'soa':
      baseUrl = process.env.VENDOR_SERVICE_SOA_URL
      break
    case 'hexa':
      baseUrl = process.env.VENDOR_SERVICE_HEXA_URL
      break
    case 'zte':
      baseUrl = process.env.VENDOR_SERVICE_ZTE_URL
      break
  }

  options.headers = {
    "Content-Type": "application/x-www-form-urlencoded"
  }

  let otherRequestData = {
    requestId: req.processingInfo.requestId,
    requestPath: req.path,
    requestParam: reqData
  }
  opts = {
    uri: `${baseUrl}/v1/vendor/${category}`,
    method: 'POST',
    body: { options, apiName, category, otherRequestData },
    timeout: Number(process.env.VENDOR_TIMEOUT),
    json: true
  }

  return opts
}

function makeMgateOpts(options, apiName, category, reqData, req) {

  if (!category || !options || !apiName)
    throw new Error('Invalid Category Or Options Or API name')

  if (typeof category != 'string') throw new TypeError('Invalid Category')

  category = category.toLowerCase()

  let baseUrl = process.env.VENDOR_SERVICE_URL

  let otherRequestData = {
    requestId: null,
    requestPath: '/mGate/api', //This path is just for reference purpose
    requestParam: reqData
  }
  opts = {
    uri: `${baseUrl}/v1/vendor/${category}`,
    method: 'POST',
    body: { options, apiName, category, otherRequestData },
    timeout: Number(process.env.VENDOR_TIMEOUT),
    json: true
  }
  console.log("OPTS",JSON.stringify(opts))
  return opts
}


// if (process.env.SAMPLE_RESPONSE == 'true') {
//   console.log('Stube replace')
//   request = (options, cb) => {
//     console.log('---------------')
//     // return cb(null, '', {"statusCode":200,"message":"Success","error":null,"data":{"respError": "Test" ,"respStatus":false,"body":"{\"status\":1,\"orderno\":\"T15887479521012345\",\"signature\":\"MGqbBlFzi3LRQ5Il8gAvUUtuhEA=\"}","isStubData":false}})
//     // return cb(null, '', {"statusCode":200,"message":"Success","error":null,"data":{"respError": "Test" ,"respStatus":false,"body":"{\"status\":1,\"orderno\":\"T15887479521012345\",\"signature\":\"MGqbBlFzi3LRQ5Il8gAvUUtuhEA=\"}","isStubData":false}})
//   }
// } else {
//   console.log('Real time')
// }

// HANDLING TIMEOUT SCENARIOS
// const serverDownMsg =
//   'So Sorry, we didn’t expect the overwhelming crowd. To ensure we deliver you a good experience, please come back in a short while. Thank You for your continuous support!'
const timeoutError = ['ETIMEDOUT', 'ESOCKETTIMEDOUT', 'ESOCKETTIMEDOUT']
const errStatusCode = { timeout: 408, badrequest: 400 }

// CERTIFICATE FOR PUBLIC CONNECTION
let certificate = join(
  __dirname,
  '../../../../certificates',
  process.env.CERTIFICATE
)
certificate = readFileSync(certificate)

const isVPNenabled = process.env.VPN_STATUS
const vendorServices = process.env.VENDOR_SERVICES.split(',')

module.exports = {
  getBaseURL: (categoryName = '') => {
    //  BASE CASE
    if (!categoryName) return false

    let baseURL = process.env.PUBLIC_BASE_URL
    let service = void 0
    categoryName = categoryName.toLowerCase()
    service = vendorServices.find(service => service == categoryName)

    if (!service) return false

    baseURL = baseURL + service
    return baseURL
  },

  prepareOptions: (
    { options: reqOptions = {} },
    option = null,
    apiName,
    categoryName
  ) => {
    let options = void 0
    let timeout = Number(process.env.API_TIMEOUT_3PP)
    let getBaseURL = module.exports.getBaseURL(categoryName)

    reqOptions = option || reqOptions

    timeout = process.env.SAMPLE_RESPONSE === `true` ? 1 : timeout
    let sampleResponseVendor = []
    if (
      process.env.SAMPLE_RESPONSE_VENDOR &&
      process.env.SAMPLE_RESPONSE_VENDOR !== 'false'
    ) {
      sampleResponseVendor = process.env.SAMPLE_RESPONSE_VENDOR.split(',')
      // If sample response enabled for specific 3PP Vendor
      if (
        sampleResponseVendor.length > 0 &&
        sampleResponseVendor.includes(categoryName)
      )
        timeout = 1
    }

    options = {
      ...reqOptions,
      headers: reqOptions.headers || {},
      timeout
    }

    // CHANGE HOSTNAME AND INCLUDE CERTIFICATE
    if (isVPNenabled == 'false' && getBaseURL) {
      let { path: pathURL } = parseURL(options.url || options.uri)
      let URL = getBaseURL + pathURL

      delete options.url
      options = {
        ...options,
        url: URL,
        cert: certificate
      }
    }

    return options
  },

  clientErrResp: async (responseErr = {}, resStatusCode, req) => {
    let statusCode = void 0

    if (responseErr && !responseErr.code) responseErr.code = ''

    statusCode =
      timeoutError.indexOf(responseErr.code) > -1
        ? errStatusCode['timeout']
        : errStatusCode['badrequest']

    if (resStatusCode) statusCode = resStatusCode

    return {
      status: false,
      msg: await serverDownMsg(req),
      statusCode
    }
  },

  executeVendorAPI(options, apiName, categoryName, reqData, req) {
    return new Promise(async (resolve, reject) => {
      try {
        console.log("Category  Name ", categoryName)
        if(categoryName=='maybank'){
          console.log("Maybank")
          options = makeMgateOpts(options, apiName, categoryName, reqData, req)
        }else{
          options = makeOpts(options, apiName, categoryName, reqData, req)
        }
        request(options, function (error, response, body) {
          // console.log(JSON.stringify(error), 'service_error')
          // console.log(JSON.stringify(options), 'service_options')
          // console.log(JSON.stringify(body), 'service_response')
          if (error) {
            console.log("Response Error From 3pp",error)
            return resolve({
              respStatus: false,
              respError: error,
              statusCode: responseCode.HTTP_SERVICE_UNAVAILABLE
            })
          } else {
            return resolve(body.data)
          }
        })
      } catch (error) {
        console.log("ERROR",error)
        log(`UNEXPECTED_ERROR, ${error}`)
        return reject({
          respStatus: false,
          msg: await serverDownMsg(req)
        })
      }
    })
  },

  parseXMLtoJSON: async xml => {
    let json = void 0

    try {
      json = xml2json(xml, {
        compact: true,
        spaces: 4
      })

      json = JSON.parse(json)

      return json
    } catch (err) {
      console.log('catch xml parse -->', err)

      throw new Error(err)
    }
  },

  getReqParamsBlc: async (reqData, apiName) => {
    let reqParams = [],
      endpoint = ``,
      queryString = ``,
      url = ``,
      port = ``
    let commonParams = [
      {
        name: `MSGID`,
        value: getTransactionId() // process.env.BLC_MSGID
      },
      {
        name: `USR`,
        value: process.env.BLC_USR
      },
      {
        name: `PWD`,
        value: process.env.BLC_PWD
      },
      {
        name: `SEQNO`,
        value: reqData.sessionId
      }
    ]

    // Dynamic Params
    switch (apiName) {
      case `get_subr_base_info`:
        endpoint = `ussd/root/get_subr_base_info`
        port = process.env.BLC_BASE_PORT
        reqParams = [
          {
            name: `CHANNEL`,
            value: process.env.BLC_CHANNEL
          },
          {
            name: `MSISDN`,
            value: reqData.msisdn
          }
        ]
        break
    }
    reqParams = [...commonParams, ...reqParams]

    queryString = reqParams.map(x => `${x.name}=${x.value}`).join('&')
    url = `${process.env.BLC_BASE_URL}:${port}/${endpoint}?${queryString}`

    return url
  },

  logResponse: async (logData, respError = null) => {
    // LOG NOC ERROR LOG
    respError ? thirdPartyCall(logData, respError) : thirdPartyCall(logData)
  }
}
