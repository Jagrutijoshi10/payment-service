const { error } = require("../../../utils").logs;
const { success } = require("../../../utils").response;
const { getTxnId } = require("../../../utils").global;
const {
  PaymentCardDetails,
  paymentDetails,
  topupDetails,
  maybankTokenDetails
} = require("./models");
const {
  badImplementation,
  badRequest,
  preconditionFailed
} = require("@hapi/boom");
const CryptoJS = require("crypto");
const vendorHelpers = require("./../vendor/newVendor.controller").helpers;
const cancelOrderHelpers = require("./helpers/cancelOrder")
const moment = require("moment");
const response = require("../../../utils/response");
const { findErrMsg } = require("./../customError/customError.controller").helpers;
const fs = require('fs');

// setTimeout(() => {
// //   // creditController().handlers.start({
// //   //   query: {"amount":"50.00","customercode":"88471580","email":"","method":"2","name":"KADFLAT","type":"3"},
// //   //   user:{
// //   //     iat: 1662956123,
// //   //     langId: "1",
// //   //     msisdn: "601128968056",
// //   //     name: null,
// //   //     rpCode: "206916",
// //   //     sessionId: 101906,
// //   //     snCode: "1233",
// //   //     transactionId: "1662958919790-63411",
// //   //     userId: 3875,
// //   //     user_account_type: 1,
// //   //     vendorSessions: {}
// //   //   }
// //   //   }, '')
// // creditController().helpers.mGatePaymentWindow('post',process.env.MGATE_PAYMENT_WINDOW_URL,'eyJtZXJjaGFudFRyeFJlZiI6IlQ0MDY3NTIwMzY3MDU0Mzc2NkFNIiwiYW1vdW50Ijp7ImN1cnJlbmN5Q29kZSI6Ik1ZUiIsInZhbHVlIjoxMDAwLCJkZWNpbWFsIjoiMiJ9LCJicm93c2VySW5mbyI6eyJhY2NlcHRIZWFkZXIiOiJ0ZXh0L2h0bWwsYXBwbGljYXRpb24veGh0bWwreG1sIiwiY29sb3JEZXB0aCI6IjI0IiwiaXNKYXZhRW5hYmxlZCI6ImZhbHNlIiwiaXNKYXZhU2NyaXB0RW5hYmxlZCI6InRydWUiLCJsYW5ndWFnZSI6ImVuLVVTIiwic2NyZWVuSGVpZ2h0IjoiNzY4Iiwic2NyZWVuV2lkdGgiOiIxMzY2IiwidGltZVpvbmVPZmZzZXQiOiItNDgwIiwidXNlckFnZW50IjoiTW96aWxsYS81LjAgKFdpbmRvd3MgTlQgMTAuMDsgV2luNjQ7IHg2NCkgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgQ2hyb21lLzk5LjAuNDg0NC41MSBTYWZhcmkvNTM3LjM2IiwiY2hhbm5lbCI6IjAyIiwiZ3BzQ29vcmRpbmF0ZSI6IiJ9LCJpc0F1dG9DYXB0dXJlIjpmYWxzZSwicmV0dXJuVVJMIjoidW5kZWZpbmVkIiwidHJ4U2lnbmF0dXJlIjoiMzhkZTQ2OTFiYWIwOWU3NzZlZGI2NTRiNjAzNDZmYzZkZjczZmE4MGUwYjU5YWZhMzE3OTZjY2QzNTU0NWRkZDZmZThlYjcyM2FhZTA3M2UzNDgwYmQ5MzM0YTRlNTQ0ZWQyMDI3MTRkNTJkZjEyNTJhMDdkYTAzMDg4M2NjNTIifQ')
//     // creditController().helpers.paymentResultV2({
//     //   "merchantTrxRef": "T52557297547230595AM",
//     //   "mgateTrxRef": "MDI3MDA3NzAxNTE5MjAyMi0wOS0xM1QwMTowODo1MS4xMzYwMDAwMDk=",
//     //   "trxSignature": "94416d1a477b661da9e1bfaf74fda94c1213fcbececfff6217139b8630cd284e7e0041eeaa1a6ff8f66890221c526fbbe2661014cfea679f0ca700e58720e48d",
//     //   "dateTime": "2022-09-13T01:09:02.863+0800",
//     //   "instalmentDuration": "0",
//     //   "responseCode": {
//     //     "respCode": "PYV1070",
//     //     "respDesc": "User Submit Inactive/Blocked Card Number",
//     //     "hostRespCode": null,
//     //     "hostRespDesc": null
//     //     }
//     // });
//     creditController().handlers.getMgateKey()

//   // creditController().helpers.generateHtmlFormMaybankv2('post',process.env.MGATE_PAYMENT_WINDOW_URL,'eyJtZXJjaGFudFRyeFJlZiI6IlQ0MDY3NTIwMzY3MDU0Mzc2NkFNIiwiYW1vdW50Ijp7ImN1cnJlbmN5Q29kZSI6Ik1ZUiIsInZhbHVlIjoxMDAwLCJkZWNpbWFsIjoiMiJ9LCJicm93c2VySW5mbyI6eyJhY2NlcHRIZWFkZXIiOiJ0ZXh0L2h0bWwsYXBwbGljYXRpb24veGh0bWwreG1sIiwiY29sb3JEZXB0aCI6IjI0IiwiaXNKYXZhRW5hYmxlZCI6ImZhbHNlIiwiaXNKYXZhU2NyaXB0RW5hYmxlZCI6InRydWUiLCJsYW5ndWFnZSI6ImVuLVVTIiwic2NyZWVuSGVpZ2h0IjoiNzY4Iiwic2NyZWVuV2lkdGgiOiIxMzY2IiwidGltZVpvbmVPZmZzZXQiOiItNDgwIiwidXNlckFnZW50IjoiTW96aWxsYS81LjAgKFdpbmRvd3MgTlQgMTAuMDsgV2luNjQ7IHg2NCkgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgQ2hyb21lLzk5LjAuNDg0NC41MSBTYWZhcmkvNTM3LjM2IiwiY2hhbm5lbCI6IjAyIiwiZ3BzQ29vcmRpbmF0ZSI6IiJ9LCJpc0F1dG9DYXB0dXJlIjpmYWxzZSwicmV0dXJuVVJMIjoidW5kZWZpbmVkIiwidHJ4U2lnbmF0dXJlIjoiMzhkZTQ2OTFiYWIwOWU3NzZlZGI2NTRiNjAzNDZmYzZkZjczZmE4MGUwYjU5YWZhMzE3OTZjY2QzNTU0NWRkZDZmZThlYjcyM2FhZTA3M2UzNDgwYmQ5MzM0YTRlNTQ0ZWQyMDI3MTRkNTJkZjEyNTJhMDdkYTAzMDg4M2NjNTIifQ')
// }, 6000);

function creditController() {
  /* Controller helper functions */
  const helpers = {
    async payment(data, req) {
      try {
        let paymentHost = "";
        switch (data.method) {
          case "1":
            propKey = "visa";
            break;
          case "2":
            propKey = "amex";
            break;
          case "3":
            propKey = "unionpay";
            break;
          case "4":
            propKey = "master";
            break;
          case "5":
            propKey = "ewallet";
        }

        let result = await PaymentCardDetails.query()
          .select(["bank"])
          .findOne({
            host: "PAYMENT_HOST",
            card_key: propKey
          });

        data.payment_host = paymentHost =
          result.bank == "MBB" ? "MAYBANK" : "FINEXUS";
        let orderData = await helpers.addOrderAndGetOrderNo(data, req);
        let requestTime = moment(req.info.received).format('YYYY/MM/DD HH:mm:ss.SSS');

        let payment_method = data.type == 3 ? "Prepaid Topup" : "Postpaid Paybill";
        let method = data.method == 1 ? "Visa/Master" : "Amex";
        let responseTime = moment().format('YYYY/MM/DD HH:mm:ss.SSS');
        let duration = moment.utc(moment(responseTime, "DD/MM/YYYY HH:mm:ss.SSS").diff(moment(requestTime, "DD/MM/YYYY HH:mm:ss.SSS"))).format("HH:mm:ss.SSS")


        let inserttop = {
          msisdn: data.msisdn,
          denomination: data.amount,
          method: method,
          payment_method: payment_method,
          orderno: orderData.data.orderno,
          payment_type: method,
          rp_code: req.user.rpCode,
          sn_code: req.user.snCode,
          subscriber_type: req.user.user_account_type,
          request_time: requestTime,
          response_time: responseTime,
          duration: moment.duration(duration).asMilliseconds(),
          transaction_id: await getTxnId(),
          // reason: orderData.status ? 'Captured' : 'Cancelled',
          // payment_status: orderData.status ? '1' : '2'
          reason: 'Cancelled',
          payment_status: '2',
          status: '2',
        };

        // IF 3pp FAILS
        if (!orderData.status) {
          inserttopup = await topupDetails.query().insert(inserttop);
          return orderData;
        }

        if (orderData.data.status == 0) {
          inserttopup = await topupDetails.query().insert(inserttop);
          return orderData;
        }

        // Parsing Json
        if (orderData.data && typeof orderData.data == "string") {
          orderData.data = JSON.parse(orderData.data);
        }

        let html;
        let resultConfig = await helpers.getConfig(data.type, data.method);

        let signatureParams = {
          merchant_id: resultConfig.merchant_id,
          merchant_code: resultConfig.merchant_key,
          orderNo: orderData.data.orderno,
          amount: data.amount
        };

        let txn_signature = await helpers.generateSignature(signatureParams);
        updatePaymentDetails = await paymentDetails
          .query()
          .update({
            orderno: orderData.data.orderno,
            signature_txn: txn_signature
          })
          .where({
            request_id: data.requestId,
            signature: data.signature
          });

        inserttopup = await topupDetails.query().insert(inserttop);
        let resp = {}
        switch (paymentHost) {
          case "MAYBANK":
            let maybankParams = {
              MERCHANT_ACC_NO: resultConfig.merchant_id,
              MERCHANT_TRANID: orderData.data.orderno,
              AMOUNT: data.amount,
              TRANSACTION_TYPE: 3,
              TXN_SIGNATURE: txn_signature,
              RESPONSE_TYPE: "HTTP",
              RETURN_URL: resultConfig.response_url,
              TXN_DESC: await helpers.getTxnDesc(data.type),
              CUSTOMER_ID: data.msisdn
            };
            if (req.route.path.includes(["v1.1"])) {
              resp['html'] = await helpers.generateHtmlForm(
                process.env.maybank_url,
                "post",
                maybankParams
              );
              resp['orderId'] = orderData.data.orderno;
            } else {
              resp = await helpers.generateHtmlForm(
                process.env.maybank_url,
                "post",
                maybankParams
              );
            }
            break;
          default:
            return "Unknown payment host: " + paymentHost;
        }
        return resp;
      } catch (err) {
        console.log(err)
      }

    },

    async generateHtmlForm(url, method, maybankParams) {
      let html = `<!DOCTYPE HTML PUBLIC \"-//W3C//DTD HTML 4.01 Transitional//EN\" \"http://www.w3.org/TR/html4/loose.dtd\" enctype="application/x-www-form-urlencoded"><html><body><form name='paymentForm' method='${method}' action='${url}'>`;
      for (let param in maybankParams) {
        if (maybankParams[param] == null) maybankParams[param] = "";
        html += `<input type='hidden' name='${param}' value='${maybankParams[param]}'/>`;
      }
      html += `</form><script>document.paymentForm.submit();</script></body></html>`;

      let data = {
        status: true,
        data: html
      };
      return data;
    },

    async generateSignature(signatureParam) {
      let valueToHash =
        signatureParam.merchant_code +
        signatureParam.merchant_id +
        signatureParam.orderNo +
        signatureParam.amount;

      let signature = CryptoJS.createHash("sha512")
        .update(valueToHash)
        .digest("hex");

      return signature;
    },

    async getConfig(type, method) {
      switch (type) {
        case "1": // postpaid paybill
          switch (method) {
            case "1":
            case "4": // VISA / MasterCard
              config = {
                response_url: process.env.maybank_response_url,
                merchant_id: process.env.maybank_merchant_id_paybill_cc,
                merchant_key: process.env.maybank_merchant_key_paybill_cc
              };

              return config;
            case "2": // AMEX
              config = {
                response_url: process.env.maybank_response_url,
                merchant_id: process.env.maybank_merchant_id_paybill_amex,
                merchant_key: process.env.maybank_merchant_key_paybill_amex
              };

              return config;
            default:
              return "Unknown method: " + method;
          }
        case "3": // prepaid topup
          switch (method) {
            case "1":
            case "4": // VISA / MasterCard
              config = {
                response_url: process.env.maybank_response_url,
                merchant_id: process.env.maybank_merchant_id_topup_cc,
                merchant_key: process.env.maybank_merchant_key_topup_cc
              };

              return config;
            case "2": // AMEX
              config = {
                response_url: process.env.maybank_response_url,
                merchant_id: process.env.maybank_merchant_id_topup_amex,
                merchant_key: process.env.maybank_merchant_key_topup_amex
              };

              return config;
            default:
              return "Unknown method: " + method;
          }
        default:
          return "Unknown type " + type;
      }
    },

    async getTxnDesc(type) {
      let transactionDesc;

      switch (type) {
        case "1":
          transactionDesc = "U Mobile Bill Payment";
          break;
        case "3":
          transactionDesc = "U Mobile Topup Payment";
          break;
        default:
          transactionDesc = "Unknown type " + type;
      }

      return transactionDesc;
    },

    async addOrderAndGetOrderNo(data, req) {
      // PROCESS REQUEST ID
      let url = process.env.url_paybill_add_order;
      requestId = "Req" + Math.floor(100000000 + Math.random()* 900000000);
      data.code = process.env.merchant_code;
      data.requestId = requestId;

      // SIGNATURE
      let signatureToHash =
        requestId + process.env.merchant_code + process.env.merchant_key;
      let shasum = CryptoJS.createHash("sha256");
      shasum.update(signatureToHash, "utf8");
      let signature = shasum.digest("base64");
      data.signature = signature;
      data.mercRefNo = data.txnID;
      data.platform = 2;
      data.gst = 0;
      data.actamount = data.amount;

      let txnID = data.txnID;
      req.user.transactionId = data.txnID;
      delete data.txnID;

      // ADD ORDER 3PP CALL
      let result = await helpers.invokePost(url, data, "addOrder", req);

      let requestTime = moment(req.info.received).format('YYYY/MM/DD HH:mm:ss.SSS');
      let responseTime = moment().format('YYYY/MM/DD HH:mm:ss.SSS');
      let duration = moment.utc(moment(responseTime, "DD/MM/YYYY HH:mm:ss.SSS").diff(moment(requestTime, "DD/MM/YYYY HH:mm:ss.SSS"))).format("HH:mm:ss.SSS")
      // ENTRY INTO DB
      payment_method = data.type == 3 ? "Prepaid Topup" : "Postpaid Paybill";
      method = data.method == 1 ? "Visa/Master" : "Amex";


      let insertParams = {
        txn_id: req.user.transactionId,
        type: data.type,
        amount: data.amount,
        method: data.method,
        userId: data.msisdn,
        payment_host: data.payment_host,
        paybill_code: data.code,
        request_id: data.requestId,
        signature: data.signature,
        request_time: requestTime,
        response_time: responseTime,
        duration: moment.duration(duration).asMilliseconds(),
        rp_code: req.user.rpCode,
        payment_type: method,
        subscriber_type: req.user.user_account_type,
        // reason: result.status ? 'Captured' : 'Cancelled',
        // payment_status: result.status ? '1' : '2',
        // status: result.status ? 1 : 2
        reason: 'Cancelled',
        payment_status: '2',
        status: 2
      };
      insertResult = await paymentDetails.query().insert(insertParams);

      if (typeof result.data == "string") result.data = JSON.parse(result.data);
      return result;
    },

    async invokePost(url, data, requestType, req) {
      const encodeGetParams = data =>
        Object.entries(data)
          .map(kv => kv.map(encodeURIComponent).join("="))
          .join("&");

      let options = {
        uri: url,
        body: encodeGetParams(data),
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        method: "POST"
      };

      return vendorHelpers.apiFetch(
        {
          options: options,
          transactionId: req.user.transactionId,
          msisdn: data.msisdn || req.user.msisdn,
          data: {
            ...data,
            msisdn: data.msisdn || req.user.msisdn,
            transactionId: req.user.transactionId
          }
        },
        requestType,
        "PaymentServices",
        req
      );
    },

    async generateCheckSignParams(data) {

      let requestId = "Req" + Math.floor(100000000 + Math.random() * 900000000);
      data.code = process.env.merchant_code;
      data.requestId = requestId;
      data.signature = CryptoJS.createHash("sha256")
        .update(
          requestId + process.env.merchant_code + process.env.merchant_key
        )
        .digest("base64");
      data.payload = data
      return data;
    },    

    async checkSignature(paymentHost, params, txnID, req) {
      switch (paymentHost) {
        case "FINEXUS":
          auditType = "HXPAYBILL_CHECK_SIGN_FNX";
          url = process.env.url_paybill_check_fnx_sign;
          break;
        case "MAYBANK":
          auditType = "HXPAYBILL_CC_CHECK_SIGN";
          url = process.env.url_paybill_check_sign;
          break;
        default:
          return "Unknown payment host: " + paymentHost;
      }

      let result = await helpers.invokePost(url, params, "checkSignature", req);

      return (result.status && typeof result.data == 'string' && result.data === "1") ? true : false;

      // return result.status ? true : false;
    },

    async generateUpdateOrderParams(params) {
      let orderNo = params.MERCHANT_TRANID;
      if (orderNo == null || orderNo == "")
        return {
          status: false,
          msg: "MERCHANT_TRANID from maybank response is null or empty"
        };

      if (params.RESPONSE_CODE == null || params.RESPONSE_CODE == "")
        return {
          status: false,
          msg: "RESPONSE_CODE from maybank response is null or empty"
        };

      return {
        code: process.env.merchant_code,
        orderno: orderNo,
        signature: CryptoJS.createHash("sha256")
          .update(
            orderNo +
            process.env.merchant_code +
            process.env.merchant_key +
            params.RESPONSE_CODE
          )
          .digest("base64"),
        transactionid: params.TRANSACTION_ID,
        bankcode: params.AUTH_ID,
        status: params.TXN_STATUS,
        rescode: params.RESPONSE_CODE,
        resdesc: params.RESPONSE_DESC,
        datecreate: params.TRAN_DATE,
        pgId: "MBB"
      };
    },

    async updateOrder(params, txnID, req) {
      url = process.env.url_paybill_update_order;
      merchantCode = process.env.merchant_code;
      merchantKey = process.env.merchant_key;
      orderNo = params.orderno;

      let postParams = [];
      for (let paramData in params) {
        postParams[paramData] = params[paramData];
      }

      let response = await helpers.invokePost(
        url,
        postParams,
        "updateOrder",
        req
      );
      
      console.log("Update Order Response",response)

      if (!response.status) return response;
      if (!response.data.orderno == orderNo) return false;

      let generatedSign = CryptoJS.createHash("sha256")
        .update(orderNo + merchantCode + merchantKey + response.status)
        .digest("base64");

      return !response.data.signature == generatedSign ? false : true;
    },

    async paymentResult(maybankResponse) {
      if (maybankResponse.RESPONSE_CODE == 0) {
        /**
         * 
         * N-Pending/Not authorized
          A-Authorized
          C-Captured
          S-Sales Completed
          V-Void
          E-Error/Exception Occurred
          F-Not Approved
          BL-Blacklisted
          B-Blocked
         * 
         * 
         * 
         */
        
        switch (maybankResponse.TXN_STATUS) {
          case "A":
          case "C":
          case "E":
          case "F":
          case "N":
            status = "SUCCESS";
            break;
          default:
            status = "FAILED_BANK";
            break;
        }
      } else {
        status = "FAILED";
      }

      orderNo = maybankResponse.MERCHANT_TRANID;
      bankTrxId = maybankResponse.TRANSACTION_ID;
      let responseData = {
        status: status,
        amount: null,
        orderNo: orderNo,
        bankTrxId: bankTrxId
      };
      return responseData;
    },

    /**
     * New Helpers for Maybank Version 2
     */

    //Payment Portal Check Signature API Request formation 
    async generateCheckSignParamsV2(data) {
      let requestId = "Req" + Math.floor(100000000 + Math.random() * 900000000);
      
      let signature = CryptoJS.createHash("sha256")
        .update(
          requestId + process.env.merchant_code + process.env.merchant_key
        )
        .digest("base64");
      let checkSignParams = {
        code:process.env.merchant_code,
        requestId:requestId,
        signature:signature,
        payload:data //Entire Maybank Response with Base64Encoded format
      }
      return checkSignParams;
    },

    //Payment Result from Maybank Validation
    async paymentResultV2(maybankResponse) {
      /**
       * {
            "merchantTrxRef": "T55449863688879575AM",
            "mgateTrxRef": "MDI3MDA3NzAxNTE5MjAyMi0wOS0xM1QwMToyNzo0Mi4zOTQwMDAwMTA=",
            "trxSignature": "2ff0ad1ff19801dbec47f010dbf09435c46a65608a558d07b719a741091c4e47fe76cb786d90948a35f316a17c7728a3b38f1f84f92a0ac420e5cda9c3f4293f",
            "dateTime": "2022-09-13T01:27:48.137+0800",
            "instalmentDuration": "0",
            "responseCode": {
              "respCode": "PYV1070",
              "respDesc": "User Submit Inactive/Blocked Card Number",
              "hostRespCode": null,
              "hostRespDesc": null
            }
          }
       * 
       */

      let status;
      if (maybankResponse.responseCode.respCode == "PYW0000" && maybankResponse.responseCode.hostRespCode == "00") {
        status = "SUCCESS"
      } else {
        status = "FAILED";
      }

      let responseData = {
        status: status,
        amount: null,
        orderNo: maybankResponse.merchantTrxRef, //Order Number generated by Payment Portal
        bankTrxId: maybankResponse.mgateTrxRef || '-', //Transaction Reference Number generated by Maybank
        hostRespCode:maybankResponse.responseCode.hostRespCode,
        hostRespDesc:maybankResponse.responseCode.hostRespDesc,
        respCode:maybankResponse.responseCode.respCode
      };
      return responseData;
    },

    //Payment Portal update Order API Request formation 
    async generateUpdateOrderParamsV2(params) {
      console.log("Update Parma", params)
      console.log("TYPE",typeof params)
      let orderNo = params.merchantTrxRef;
      if (orderNo == null || orderNo == "")
        return {
          status: false,
          msg: "MERCHANT_TRX_REF from maybank response is null or empty"
        };

      if (params.responseCode.respCode == null || params.responseCode.respCode == "")
        return {
          status: false,
          msg: "RESPONSE_CODE from maybank response is null or empty"
        };

      let signatureParam = params.responseCode.respCode //Failure Signature Param

      /**
       * Maybank Response Parameter hostRespDesc is an optional parameter
       * Below condition will execute when the hostRespDesc parameter is received from Maybank
       * 
       * To Identify a Success Payment : params.responseCode.respCode == "PYW0000" && params.responseCode.hostRespCode == "00"
       * To Identify a Failed Payment  : Any response code other than above 
       * 
       * A Payment will be considered as Failed Payment even if respCode = "PYW0000" and hostRespCode is not received
       */
      if(params.responseCode.respCode == "PYW0000" && params.responseCode.hostRespCode == "00"){
        signatureParam = params.responseCode.hostRespCode //Success Signature Param
      }
      return {
        code: process.env.merchant_code,
        orderno: orderNo,
        signature: CryptoJS.createHash("sha256")
          .update(orderNo+process.env.merchant_code+process.env.merchant_key+signatureParam)
          .digest("base64"),
        transactionid: params.mgateTrxRef || '',
        bankcode: params.authID || '',
        status: params.responseCode.respCode == "PYW0000" && params.responseCode.hostRespCode == "00" ? "C" : "F",
        rescode: signatureParam,
        resdesc: params.responseCode.respCode == "PYW0000" && params.responseCode.hostRespCode == "00" ? params.responseCode.hostRespDesc : params.responseCode.respDesc,
        datecreate: params.dateTime || ''
      };
    },

    //
    async generateMgateSignature(method , mGateURl , headers, payload){
      
            /**
              Steps to generate Signature
              1 - Construct Base String
              2 - Sign Base String with RSA Private Key
              3 - Encode result with Base64 encoding
              
              Step to Form Base String
                1. HTTP Verb (Method) [POST]
                2. Full URL-Encoded [https%3A%2F%2Fstaging.api.maybank.com%2Fapi%2Foauth2%2Fv4%2Fclientcred%2Ftoken]
                3. Signed Headers parameter name & value (concatenated by equal sign (‘=’)) X-MB-Timestamp=1647421918786;
                4. Payload: a normalized payload (take entire payload from HTTP Body & convert into a single string, either encrypted payload or plain text) [{"grant_type":"client_credentials","scope":"mgate","client_id":"b97013fd70814d99836f40da6644aa74","client_secret":"abc123"} 
                   And use semicolon (‘;’) as delimiter between base string components.
              
              SAMPLE BASE SIGN FORMAT FOR GET TOKEN API
                POST;
                https%3A%2F%2Fstaging.api.maybank.com%2Fapi%2Foauth2%2Fv4%2Fclientcred%2Ftoken;
                X-MB-Timestamp=1647421918786;
                {"grant_type":"client_credentials","scope":"mgate","client_id":"b97013fd70814d99836f40da6644aa74","client_secret":"abc123"}
                
              SAMPLE BASE SIGN FORMAT FOR GET KEY API
                https%3A%2F%2Fstaging.api.maybank.com%2Fapi%2Fmy%2Fretail%2Fpayment%2Fv1%2Fmgate%2Fgetkey;
                X-MB-Client-Id=b97013fd70814d99836f40da6644aa74;
                Authorization=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyAiaXNzIjoiaHR0cHM6Ly9hcGkubWF5YmFuay5jb20iLCAic3ViIjoiL21nYXRlIiwgImF1ZCI6ImI5NzAxM2ZkNzA4MTRkOTk4MzZmNDBkYTY2NDRhYTc0IiwgImV4cCI6MTY0Nzc5NDcyMSwgIm5iZiI6MTY0Nzc5MTEyMSwgImlhdCI6MTY0Nzc5MTEyMSwgImp0aSI6IkFBSWdZamszTURFelptUTNNRGd4TkdRNU9UZ3pObVkwTUdSaE5qWTBOR0ZoTnpTalBIZU1KNTFFd1ZtRzZQYm9PUDJzNjdjaUx2MEVmU3RjekxIcWs4cUZwZGg2dGpnR1ZYb0dncVFSU01zRDk3a3hQZWF5TzFlRFZCbjNXT29zWTltVG9DZ1M3VE5hZ3ZPdFctd0twOHFybnNfYmZTTVdySzNrUW1HZjNLc05GY2ciIH0.JEo58nITta05QA9BEh4jlYqC1ynDZfjhZ20_6RXQnckhBSnJ-t9thDrqOJNxglI7JP5XEoj8Sh7cPbHDpc-z2o5PeZDZ9GI7lv3igme-aWdNqoQfLSif899ijat5xsYaws-zCfDmMi_bSW84_aLByhcL2ySxf6Wv1J1k9CApz7JCoL8vx-wT4GIEOhNHaB7yYhKWJ-MqihBLq5j23xaX1F-Fm4B8FSd9OOtE7gkGsEFiX1t52uZyGNvn5vB01n0yz891_av2kbyDurkpyrFwPR3Wc-3AQFe_Aj0JLkFDGNHAYpdFl8MLEfVXsD6hrfH7IoSsQANf9E_Gv0P43mhcJA;
                X-MB-Timestamp=1647791121418;
                {"merchantAccID":"DEVMY123456"}
        
          */
          let fileKeyName = (process.env.NODE_ENV == 'production') ? '/helpers/PROD_MGATE_RSA_PRIVATE.key' : '/helpers/STAGING_MGATE_RSA_PRIVATE.key';
          const key = fs.readFileSync(__dirname + fileKeyName);
          let baseString = `${method};${encodeURIComponent(mGateURl)};${headers};${JSON.stringify(payload)}`;
          const signer = CryptoJS.createSign('RSA-SHA256');
          signer.update(baseString);
          const signedString = signer.sign(key,"base64");
          return signedString
    },

    //Trigger Mgate API (Only getToken and getKey API)
    async invokeMgateAPI(req, apiName , category , method , mGateURl , requestHeaders, requestPayload){
      let options = {
        url: mGateURl,
        body: requestPayload,
        headers: requestHeaders,
        method: method
      };

      return vendorHelpers.mGateAPIFetch(
        {
          options: options,
          msisdn: null,
        },
        apiName,
        category,
        req
      );
    },

    //Form Payment Window HTML
    async mGatePaymentWindow(data , res)  {
      /**
       * Form the JSON Request Data
       * Encode the JSON Request Data into Base 64 string
       * Form the HTML POST format
       * Redirect and Render the Payment Screen using the HTML
       * Payment Window Screen will load and User can perform payment
       * 
       * Type defines the user type. For postpaid we send 1, others 3 

          type = postpaid ? '1' : '3'

          Method signifies the type of payment method chosen

          1 means Maybank 
          2 means AMEX
          3 means Online payment method (FPX)
       * 
       */
      //This Credential Configuration is to get the Maybank Merchant ID's , Secret Key , Encryption Key based on Payment Medhod and Type
      let credentialConfiguration = await helpers.getMaybankConfig(data.type, data.method)
      let requestData = {
        merchantAccID: credentialConfiguration.merchant_id,
        merchantTrxRef: data.merchantTrxRef, //Order Number from Add Order Response
        amount: {
          currencyCode: "MYR", //MYR
          value: data.amountValue * 100, //From Mobile we will receive in Decimal , But in Maybank API request we need to send it as integer format , So * by 100
          decimal: "2" //Decimal default value set to 2
        },
        shopperInfo:{
          name:data.name,
          ip:data.ipAddress
        },
        //The Below BrowserInfo values will have hardcoded values
        browserInfo: {
          acceptHeader: "text/html,application/xhtml+xml",
          colorDepth: "24",
          isJavaEnabled: "false",
          isJavaScriptEnabled: "true",
          language: "en-US",
          screenHeight: "768",
          screenWidth: "1366",
          timeZoneOffset: "-480",
          userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.51 Safari/537.36",
          channel: "02",
          gpsCoordinate: ""
        },
        isAutoCapture: true, //This value is default set to True , Based on Confirmation from UM team
        returnURL: credentialConfiguration.response_url,
        trxDesc:await helpers.getTxnDesc(data.type),
        trxSignature: ''//secretKey + merchantAccID + amount.currencyCode + amount.value + merchantTrxRef
      }
      
      requestData.trxSignature = CryptoJS.createHash('sha512').update(`${credentialConfiguration.merchant_secret_key}${credentialConfiguration.merchant_id}${requestData.amount.currencyCode}${requestData.amount.value}${requestData.merchantTrxRef}`).digest('hex')
      return {
        encodedString: Buffer.from(JSON.stringify(requestData)).toString('base64'),
        trxSignature : requestData.trxSignature
      } 

    },

    //Get Maybank Credentials based on Type and Method
    async getMaybankConfig(type, method) {
      switch (type) {
        case "1": // Postpaid Paybill
          switch (method) {
            case "1":
            case "4": // VISA / MasterCard
              config = {
                response_url: process.env.maybank_response_url,
                merchant_id: process.env.PAYBILL_VISA_MASTER_MERCHANT_ACCOUNT_ID,
                merchant_secret_key: process.env.PAYBILL_VISA_MASTER_MAYBANK_SECRET_KEY
              };

              return config;
            case "2": // AMEX
              config = {
                response_url: process.env.maybank_response_url,
                merchant_id: process.env.PAYBILL_AMEX_MERCHANT_ACCOUNT_ID,
                merchant_secret_key: process.env.PAYBILL_AMEX_MAYBANK_SECRET_KEY
              };

              return config;
            default:
              return "Unknown method: " + method;
          }
        case "3": // Prepaid Topup
          switch (method) {
            case "1":
            case "4": // VISA / MasterCard
              config = {
                response_url: process.env.prepaid_maybank_response_url,
                merchant_id: process.env.TOPUP_VISA_MASTER_MERCHANT_ACCOUNT_ID,
                merchant_secret_key: process.env.TOPUP_VISA_MASTER_MAYBANK_SECRET_KEY
              };

              return config;
            case "2": // AMEX
              config = {
                response_url: process.env.prepaid_maybank_response_url,
                merchant_id: process.env.TOPUP_AMEX_MERCHANT_ACCOUNT_ID,
                merchant_secret_key: process.env.TOPUP_AMEX_MAYBANK_SECRET_KEY

              };

              return config;
            default:
              return "Unknown method: " + method;
          }
        default:
          return "Unknown type " + type;
      }
    },


    //HTML Form Post for Maybank Latest Version 
    async generateHtmlFormMaybankv2(method , url ,encodedString){
     let html =  `<!DOCTYPE html PUBLIC \"-//W3C//DTD HTML 4.01 Transitional//EN\" \"http://www.w3.org/TR/html4/loose.dtd\" enctype=\"application/x-www-form-urlencoded\"><html><body><form name='paymentForm' method='${method}'action='${url}'><input type='hidden' name='payload' value='${encodedString}'/></form><script>document.paymentForm.submit();</script></body></html>`

     /**
      * X-MB-Signed-Headers - X-MB-Client-Id;Authorization;X-MB-Timestamp
      * X-MB-Signature-Alg  - RSA-SHA256
      * X-MB-Client-Id - 
      * Authorization - Token
      * X-MB-Timestamp - 
      * X-MB-Signature-Value - 
      * X-MB-E2E-Id
      * X-MB-ENV - u
      * 
      */
      let data = {
        status: true,
        data: html
      };
      return data;
    },

    //Payment Function for Maybank Latest Version
    async paymentv2(data, req) {
      try {
        let paymentHost = "";
        switch (data.method) {
          case "1":
            propKey = "visa";
            break;
          case "2":
            propKey = "amex";
            break;
          case "3":
            propKey = "unionpay";
            break;
          case "4":
            propKey = "master";
            break;
          case "5":
            propKey = "ewallet";
        }

        let result = await PaymentCardDetails.query()
          .select(["bank"])
          .findOne({
            host: "PAYMENT_HOST",
            card_key: propKey
          });

        data.payment_host = paymentHost =
          result.bank == "MBB" ? "MAYBANK" : "FINEXUS";
        let orderData = await helpers.addOrderAndGetOrderNo(data, req);
        console.log("OrderData",orderData)
        let requestTime = moment(req.info.received).format('YYYY/MM/DD HH:mm:ss.SSS'); //

        let payment_method = data.type == 3 ? "Prepaid Topup" : "Postpaid Paybill";
        let method = data.method == 1 ? "Visa/Master" : "Amex";
        let responseTime = moment().format('YYYY/MM/DD HH:mm:ss.SSS');
        let duration = moment.utc(moment(responseTime, "DD/MM/YYYY HH:mm:ss.SSS").diff(moment(requestTime, "DD/MM/YYYY HH:mm:ss.SSS"))).format("HH:mm:ss.SSS")


        let inserttop = {
          msisdn: data.msisdn,
          denomination: data.amount,
          method: method,
          payment_method: payment_method,
          orderno: orderData.data.orderno,
          payment_type: method,
          rp_code: req.user.rpCode,
          sn_code: req.user.snCode,
          subscriber_type: req.user.user_account_type,
          request_time: requestTime,
          response_time: responseTime,
          duration: moment.duration(duration).asMilliseconds(),
          transaction_id: await getTxnId(),
          // reason: orderData.status ? 'Captured' : 'Cancelled',
          // payment_status: orderData.status ? '1' : '2'
          reason: 'Cancelled',
          payment_status: '2',
          status: '2',
        };

        // IF 3pp FAILS
        if (!orderData.status) {
          inserttopup = await topupDetails.query().insert(inserttop);
          return orderData;
        }

        if (orderData.data.status == 0) {
          inserttopup = await topupDetails.query().insert(inserttop);
          return orderData;
        }

        // Parsing Json
        if (orderData.data && typeof orderData.data == "string") {
          orderData.data = JSON.parse(orderData.data);
        }

        let paymentWindowParams = {
          merchantTrxRef:orderData.data.orderno,
          amountValue:data.amount,
          name:data.name,
          type:data.type,
          method:data.method
        }

        let ipAddress = req.headers['x-forwarded-for'].toString().split(',');
        paymentWindowParams.ipAddress = ipAddress[0]

        let encodedString = await helpers.mGatePaymentWindow(paymentWindowParams)
        // let resultConfig = await helpers.getConfig(data.type, data.method);


        updatePaymentDetails = await paymentDetails
          .query()
          .update({
            orderno: orderData.data.orderno,
            signature_txn: encodedString.trxSignature
          })
          .where({
            request_id: data.requestId,
            signature: data.signature
          });

        inserttopup = await topupDetails.query().insert(inserttop);
        let resp = {}
        switch (paymentHost) {
          case "MAYBANK":
            if (req.route.path.includes(["v1.1"])) {
              resp['html'] = await helpers.generateHtmlFormMaybankv2(
                "post",
                process.env.MGATE_PAYMENT_WINDOW_URL,
                encodedString.encodedString
              );
              resp['orderId'] = orderData.data.orderno;
            } else {
              resp = await helpers.generateHtmlFormMaybankv2(
                "post",
                process.env.MGATE_PAYMENT_WINDOW_URL,
                encodedString.encodedString
              );
            }
            break;
          default:
            return "Unknown payment host: " + paymentHost;
        }
        console.log("Resp",resp)
        return resp;
      } catch (err) {
        console.log(err)
      }

    }

  };

  /* Route hanlders */
  const handlers = {
    start: async (req, res) => {
      try {
        let params = {
          txnID: await getTxnId(),
          type: req.query.type,
          amount: req.query.amount,
          name: req.query.name,
          msisdn: req.user.msisdn,
          email: !req.query.email ? "-" : req.query.email,
          method: req.query.method,
        };
        if (req.query.customercode && typeof req.query.customercode == "string") {
          req.query.customercode = req.query.customercode.trim()
        }

        if (req.query.customercode && req.query.customercode != "undefined") {
          params.customercode = req.query.customercode
        } else {
          params.customercode = null
        }

        let reformattedAmount = params.amount;
        if (
          params.amount &&
          params.amount.length > 3 &&
          params.amount.charAt(params.amount.length - 3) == ","
        ) {
          reformattedAmount = params.amount.replace(/,/g, ".");
          params.amount = reformattedAmount;
        }

        //Changed the Payment Function Version paymentv2 Version is for maybank New version integration
        let response = await helpers.paymentv2(params, req);
        console.log("Response", response)
        if (!response.html && !response.status) {
          return success(res, response.msg, null, response.statusCode);
        } else if (!response.html && response.data.status == 0 && response.data.ErrorCode) {
          let errorMessage = await findErrMsg(2, response.data.ErrorCode, req); // payment hexa
          return preconditionFailed(errorMessage.msg);
        } else if (
          !response.html && response.data.status == 0
          // response.data.status != undefined
        ) {
          return badRequest(process.env.INTERNAL_ERROR);
        }
        let resp = {}
        if (req.route.path.includes(["v1.1"])) {
          resp.html = response.html.data
          resp.orderId = response.orderId
        } else {
          resp = response.data;
        }
        return success(res, "Data loaded Successfully", resp);
      } catch (e) {
        console.log(e);
        error(e);
        return badImplementation("Something went wrong!");
      }
    },

    appResponse: async (req, res) => {
      try {
        // return res.redirect("http://192.168.10.188:1338");
        let reqData = req.payload;
        req.user = {};
        let checkSignParams = await helpers.generateCheckSignParams(reqData);
        let { txn_id: txnID, userId: msisdn } = await paymentDetails
          .query()
          .select(["txn_id", "userId"])
          .findOne({ orderno: reqData.MERCHANT_TRANID })
          .skipUndefined();

        req.user.transactionId = reqData.TRANSACTION_ID;
        req.user.msisdn = msisdn;
        let checkSignature = await helpers.checkSignature(
          "MAYBANK",
          checkSignParams,
          txnID,
          req
        );
        if (checkSignature) {
          await paymentDetails.query().update({ is_update_order: '1' }).where({ orderno: reqData.MERCHANT_TRANID })
        }

        let updateOrderParams = await helpers.generateUpdateOrderParams(
          reqData
        );
        let baseName = "umobile://paymentResult";
        if (!updateOrderParams.status)
          return res.redirect(
            baseName +
            "?status=" +
            responseData.status +
            "&orderNo=" +
            responseData.orderNo +
            "&bankTrxId=" +
            responseData.bankTrxId
          );

          let updateOrder = await helpers.updateOrder(
            updateOrderParams,
            txnID,
            req
          );
          let responseData = await helpers.paymentResult(reqData);

          if (checkSignature) {
            // UPDATE SUCCESS OR ATTEMPTED
            const paymentStatus =
              req.payload.TXN_STATUS === "C"
                ? 1
                : req.payload.TXN_STATUS === "N"
                  ? 3
                  : 2;
            await paymentDetails
              .query()
              .update({
                status: paymentStatus,
                actual_status: req.payload.TXN_STATUS,
                host_response_code: req.payload.HOST_RESPONSE_CODE || null,
                host_response_desc: req.payload.HOST_RESPONSE_DESC || null,
                reason: req.payload.TXN_STATUS === "C" ? 'Captured' : 'Cancelled',
                payment_status: req.payload.TXN_STATUS === "C" ? '1' : '2',
              })
              .where({ orderno: responseData.orderNo });

            //update topupdetails
            await topupDetails
              .query()
              .update({
                status: paymentStatus,
                reason: req.payload.TXN_STATUS === "C" ? 'Captured' : 'Cancelled',
                payment_status: req.payload.TXN_STATUS === "C" ? '1' : '2',
                status: req.payload.TXN_STATUS === "C" ? '1' : '2',
              })
              .where({ orderno: responseData.orderNo });

            if (updateOrder) {
              return res.redirect(
                "umobile://paymentResult?status=" +
                responseData.status +
                "&orderNo=" +
                responseData.orderNo +
                "&bankTrxId=" +
                responseData.bankTrxId
              );
            } else {
              responseData.status =
                responseData.status == "FAILED_BANK"
                  ? "Payment Pending"
                  : responseData.status;
              if (responseData.status == "Payment Pending") {
                return res.redirect(
                  baseName +
                  "?status=" +
                  responseData.status +
                  "&orderNo=" +
                  responseData.orderNo +
                  "&bankTrxId=" +
                  responseData.bankTrxId
                );
              } else {
                return res.redirect(
                  baseName +
                  "?status=" +
                  responseData.status +
                  "&orderNo=" +
                  responseData.orderNo +
                  "&bankTrxId=" +
                  responseData.bankTrxId
                );
              }
            }
          } else {
            return res.redirect(
              baseName +
              "?status=" +
              responseData.status +
              "&orderNo=" +
              responseData.orderNo +
              "&bankTrxId=" +
              responseData.bankTrxId
            );
          }

      } catch (e) {
        console.log(e);
        error(e);
        return badImplementation(e);
      }
    },
    // cancelOrder: async (req,res) => {
    //   try{
    //     let response = {}
    //     let orderno = req.payload.orderno

    //     response.data = {
    //       "status": 1,
    //       "orderno": orderno,
    //       "message": "Transaction has been successfully cancelled"
    //     }
        
    //     return success(res, "Payment cancelled Successfully", response.data);
    //   }catch(err){
    //     console.log(err)
    //     error(e);
    //     return badImplementation("Something went wrong!");
    //   }
    // }
    cancelOrder: async (req, res) => {
      try {
        //check if update order is called or not
        let orderno = req.payload.orderno;
        let url = process.env.url_paybill_cancel_order;

        let flag = await paymentDetails.query().select('is_update_order').where({ orderno: orderno })
        if (flag[0].is_update_order != '1') {

          // Call cancel order 3pp api
          let response = await cancelOrderHelpers.cancelOrder(req, url);

          // if cancellation failed
          if (!response.status) {
            return success(res, response.msg, null, response.statusCode);
          } else if (response.data.status == 0 && response.data.ErrorCode) {
            let errorMessage = await findErrMsg(2, response.data.ErrorCode, req); // payment hexa
            return preconditionFailed(errorMessage.msg);
          } else if (response.data.status == 0) {
            return badRequest(process.env.INTERNAL_ERROR);
          }

          await paymentDetails
            .query()
            .update({
              status: 2,
              actual_status: null,
              host_response_code: null,
              host_response_desc: null,
              reason: 'Cancelled',
              payment_status: '2',
              is_update_order: '2'
            })
            .where({ orderno: orderno });

          //update topupdetails
          await topupDetails
            .query()
            .update({
              status: 2,
              reason: 'Cancelled',
              payment_status: '2',
              status: '2'
            })
            .where({ orderno: orderno });
          return success(res, "Payment cancelled Successfully", response.data);
        } else {
          return preconditionFailed("Payment proceeded already.cannot cancel order");

        }


      } catch (err) {
        console.log(err)
        error(e);
        return badImplementation("Something went wrong!");
      }
    },

    /**
     * New Handler Functions for Maybank Version 2
     */

    //The getMgateToken will send the Access Token , This Access Token is used for calling getKey Maybank API
    getMgateToken : async (req , res) => {
      try{
        const client_id = process.env.MAYBANK_CLIENT_ID;
        const client_secret = process.env.MAYBANK_CLIENT_SECRET;
        let getTokenApiHeaders = {
          "Content-Type" : 'application/json',
          "X-MB-Signed-Headers": 'X-MB-Timestamp',
          "X-MB-Signature-Alg" : 'RSA-SHA256',
          "X-MB-Timestamp": moment().valueOf(), //Epoch Time in Milliseconds
          "X-MB-Signature-Value": '' , //Signed Value is calculated Below
          "X-MB-E2E-Id" : moment().add('8','hours').format("YYYY-MM-DDTHH:mm:ss.SSS[Z]"), 
          "X-MB-ENV" : (process.env.NODE_ENV == 'production') ? 'P' : 'U'
        }
        let getTokenApiRequestBody = {
            grant_type: "client_credentials",
            scope: "mgate",
            client_id: client_id , 
            client_secret: client_secret
        }
      

       let signatureValue = await helpers.generateMgateSignature(
            "POST",
            process.env.MGATE_GET_TOKEN_URL,
            `X-MB-Timestamp=${getTokenApiHeaders["X-MB-Timestamp"]}`,
            getTokenApiRequestBody
        );
      
      console.log("Signature Value",signatureValue)

       getTokenApiHeaders["X-MB-Signature-Value"] = signatureValue
       
       let invokeGetToken = await helpers.invokeMgateAPI({},'getToken','maybank','POST',process.env.MGATE_GET_TOKEN_URL , getTokenApiHeaders , getTokenApiRequestBody)
       
       console.log('InvokeToken',invokeGetToken)

       //Token is Not received Some Error
       if (!invokeGetToken.status){
        return badImplementation("Something went wrong!");
       }else{
        //Token Received 
        console.log('Access Token', invokeGetToken.data)
       }
      } catch (err) {
        console.log(err)
        error(err);
        return badImplementation("Something went wrong!");
      }
    },
    //The getMgateKey is a One time API call only 
    getMgateKey : async (req , res) => {
      try{
        const getKeyRequestPayload = {
          merchantAccID : process.env.MERCHANT_ACCOUNT_ID_PAYBILL
        }
        const getKeyRequestHeaders = {
          'Content-Type':'application/json',
          'X-MB-Signed-Headers':'X-MB-Client-Id;Authorization;X-MB-Timestamp',
          'X-MB-Signature-Alg':'RSA-SHA256',
          'X-MB-Client-Id':process.env.MAYBANK_CLIENT_ID,
          'Authorization': 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyAiaXNzIjoiaHR0cHM6Ly9hcGkubWF5YmFuay5jb20iLCAic3ViIjoiL21nYXRlIiwgImF1ZCI6IjQ5YWU1OTcwYTkwNjU0MzNkMjlhMjJhMzAwMDgzMjA5IiwgImV4cCI6MTY2MzA2NTAzOCwgIm5iZiI6MTY2MzA2MzIzOCwgImlhdCI6MTY2MzA2MzIzOCwgImp0aSI6IkFBSWdORGxoWlRVNU56QmhPVEEyTlRRek0yUXlPV0V5TW1Fek1EQXdPRE15TURudjFQeTJkLVZRQUFaZENyZ3VGWHdfN2d5WjQ0X0ZtcHVWM2tNOWhZdE9NUEszajR2UnVqOHN0QmtHZnRud3lpVnVtMWg3WVgwN2JCZGw2T1RucEFJNlZRNVdleDNIb0dRN2hGTjdQaEp5Zm0xTUVJdlNmTk9EdzB2VHdEbm5aclEiIH0.gRNSb-EpUE3QrvNX1Mt7_t3o6iOqY6shOiyDD12bF5-drPIipihTmJ-8uCz7zXLDBCXQnAkDU3jKhI96wzS2a-rwLrlpiRW3gTdSTvmkWJypfX8B-CvxbCz2ANfGULgKpenB0Bh1fqTf_89-rCn1GWQaKkCdWB9EuZDKekkrLZP9fUca-V13OHVIFHjtuRAz3Ln_JG8hZTQkdhQ6qCeD5vgWXiGWgsdVUHbyUAO7kbpJZQJO4uC8zSY9R5o_eTNJAlonzsezA1HZScpVjZW0O7AVuHf0AAVjDdIp4wkyWTRvGWrJl6CsLF_THoJoWH9ssI874v_6Z7qGE6bxRpaXmA', //Need to get the Token from Database and Pass Here,
          'X-MB-Timestamp': moment().valueOf(),
          'X-MB-Signature-Value': '',
          "X-MB-E2E-Id" : moment().add('8','hours').format("YYYY-MM-DDTHH:mm:ss.SSS[Z]"), 
          "X-MB-ENV" : (process.env.NODE_ENV == 'production') ? 'P' : 'U'
        }

        let signatureValue = await helpers.generateMgateSignature(
          "POST",
          process.env.MGATE_GET_KEY_URL,
          `X-MB-Client-Id=${getKeyRequestHeaders["X-MB-Client-Id"]};Authorization=${getKeyRequestHeaders["Authorization"]};X-MB-Timestamp=${getKeyRequestHeaders["X-MB-Timestamp"]}`,
          getKeyRequestPayload
        );
        
        getKeyRequestHeaders["X-MB-Signature-Value"]=signatureValue

        let invokeGetKey = await helpers.invokeMgateAPI({},'getKey','maybank','POST',process.env.MGATE_GET_KEY_URL , getKeyRequestHeaders , getKeyRequestPayload)
        //Key is Not received Some Error
        console.log("InvokeGetKey",invokeGetKey)
        /**
        {
          "secretKey": "b8Y8yDf94",
          "encryptionKey": "ZexneptIOMTjPkW8nstzJwTLCCcERRFvBMk/W55o6wA=",
          "dateTime": "2022-09-12T12:17:29.385+0800",
          "responseCode": {
            "respCode": "MGK0000",
            "respDesc": "SUCCESS (GetKey)",
            "hostRespCode": null,
            "hostRespDesc": null
          }
        }
         */
        if (!invokeGetKey.status){
          return badImplementation("Something went wrong!");
        }else{
         //Secret Key and Encryption Key Received
         console.log('GET KEY', invokeGetKey.data)
        } 
      } catch (err) {
        console.log(err)
        error(err);
        return badImplementation("Something went wrong!");
      }
    },

    //New Mgate App Response
    appResponseV2: async (req, res) => {
      try {
        let reqData = req.payload; // Maybank will return the Response in Encoded Format , We need to decode it 
        req.user = {};
        console.log("ReqData",reqData.payload)
        let checkSignParams = await helpers.generateCheckSignParamsV2(reqData.payload);
        console.log("CHECK SIGN PARAMS", checkSignParams)
        //Maybank Payment Response will be Encoded , We need to decode the Payload to see the Payment Status and other details
        let decodedResponseData = Buffer.from(JSON.stringify(reqData.payload),'base64').toString();
        decodedResponseData = JSON.parse(decodedResponseData)
        console.log("Decoded Response",decodedResponseData)


        let { txn_id: txnID, userId: msisdn } = await paymentDetails
          .query()
          .select(["txn_id", "userId"])
          .findOne({ orderno: decodedResponseData.merchantTrxRef })
          .skipUndefined();

        req.user.transactionId = decodedResponseData.mgateTrxRef || ''; //This Parameter is no more coming from New Mgate API
        req.user.msisdn = msisdn; 
        let checkSignature = await helpers.checkSignature(
          "MAYBANK",
          checkSignParams,
          txnID,
          req
        );

        console.log("CHECK SIGN",checkSignature)

        if (checkSignature) {
          await paymentDetails.query().update({ is_update_order: '1' }).where({ orderno: decodedResponseData.merchantTrxRef })
        }
        
        //Form the Update Order Request Parameters
        let updateOrderParams = await helpers.generateUpdateOrderParamsV2(
          decodedResponseData
        );
        console.log("Update Order Params", updateOrderParams)

        let responseData = await helpers.paymentResultV2(decodedResponseData);
        let baseName = "umobile://paymentResult";
        if (!updateOrderParams.status)
          return res.redirect(
            baseName +
            "?status=" +
            responseData.status +
            "&orderNo=" +
            responseData.orderNo +
            "&bankTrxId=" +
            responseData.bankTrxId
          );

          let updateOrder = await helpers.updateOrder(
            updateOrderParams,
            txnID,
            req
          );
          console.log("Update Order",updateOrder)

          if (checkSignature) {
            console.log("CHECK SIGN Success")

            // UPDATE SUCCESS OR ATTEMPTED
            
            await paymentDetails
              .query()
              .update({
                status: responseData.status == "SUCCESS" ? 1 : 2 ,
                actual_status: responseData.respCode, //Bank Status
                host_response_code: responseData.hostRespCode || null,
                host_response_desc: responseData.hostRespDesc || null,
                reason: responseData.status == "SUCCESS" ? 'Captured' : 'Cancelled',
                payment_status: responseData.status == "SUCCESS" ? '1' : '2',
              })
              .where({ orderno: responseData.orderNo });

            //update topupdetails
            await topupDetails
              .query()
              .update({
                reason: responseData.status == "SUCCESS" ? 'Captured' : 'Cancelled',
                payment_status: responseData.status == "SUCCESS" ? '1' : '2',
                status: responseData.status == "SUCCESS" ? '1' : '2',
              })
              .where({ orderno: responseData.orderNo });

            //If Order Number from Maybank and Payload Order Number matches
            //If Signature from Update Order Response and Signature from Payload Matches
            if (updateOrder) {
              console.log("Update Order Success")
              return res.redirect(
                "umobile://paymentResult?status=" +
                responseData.status +
                "&orderNo=" +
                responseData.orderNo +
                "&bankTrxId=" +
                responseData.bankTrxId
              );
            } else {
              console.log("Update Order FAIL")

              /**
               * This Condition will not apply for New Maybank Integration Since
               * In New Maybank Version a Payment is Considered either Successful / Failed
               * 
               *  responseData.status = responseData.status == "FAILED_BANK" ? "Payment Pending": responseData.status;
                  if (responseData.status == "Payment Pending") {
                    return res.redirect(
                      baseName +
                      "?status=" +
                      responseData.status +
                      "&orderNo=" +
                      responseData.orderNo +
                      "&bankTrxId=" +
                      responseData.bankTrxId
                    );
               */

               /**
                * The Below Condition will Execute for
                * status = "SUCCESS" when respCode = PYW0000 and hostRespCode = 00
                * status = "FAILED" Any case other than above
                * 
                */
                return res.redirect(
                  baseName +
                  "?status=" +
                  responseData.status +
                  "&orderNo=" +
                  responseData.orderNo +
                  "&bankTrxId=" +
                  responseData.bankTrxId
                );
              
            }
          } else {
            console.log("CHECK SIGN FAIL")

            //If check Signature is Error then return Error to Mobile app
            return res.redirect(
              baseName +
              "?status=" +
              responseData.status +
              "&orderNo=" +
              responseData.orderNo +
              "&bankTrxId=" +
              responseData.bankTrxId
            );
          }

      } catch (e) {
        console.log(e);
        error(e);
        return badImplementation(e);
      }
    }
  };

  return {
    helpers: Object.freeze(helpers),
    handlers: Object.freeze(handlers)
  };
}

module.exports = creditController();
