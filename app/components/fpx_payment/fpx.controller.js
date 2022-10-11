const { error } = require("../../../utils").logs;
const { success } = require("../../../utils").response;
const { getTxnId } = require("../../../utils").global;
const {
  fxpBankList
} = require("./models");
const {
  badImplementation,
  badRequest,
  preconditionFailed
} = require("@hapi/boom");
const CryptoJS = require("crypto");
const vendorHelpers = require("./../vendor/newVendor.controller").helpers;
const moment = require("moment");

const { findErrMsg } = require("./../customError/customError.controller").helpers;
const { fpxHelper, fpx3pp } = require('./helper/index')
const {
  paymentDetails,
  topupDetails
} = require('../payment/models/index')

function creditController() {


  const handlers = {

    async bankList(req, h) {
      try {

        //Fpx bank list
        let banklist = await fxpBankList.query()
          .select('bank_id', 'display_name as bank_name', 'bank_image', 'bank_status')
          .orderBy('bank_sort', 'asc')
          .where('status', 1);

        banklist.forEach((element) => {
          element.bank_status == 0 ? element.bank_name = element.bank_name + ' (Offline)' : element.bank_name = element.bank_name
          return element
        });
        return success(h, "fpx banklisted Successfully", banklist);

      } catch (e) {
        return badImplementation(e);
      }
    },

    async fpxPaymentStart(req, h) {
      let params, orderData, response;

      try {

        //Make params for addorder fpx
        params = await fpxHelper.makeParams(req);

        //Fpx add order 
        orderData = await fpxHelper.addOrder(params, req);

        //update the table from the hexa add order response
        response = await fpxHelper.updateTopup(orderData, req, params);

        if (!response.status) {
          return success(h, response.msg, null, response.statusCode);
        } else if (response.data.status == 0 && response.data.ErrorCode) {
          let errorMessage = await findErrMsg(2, response.data.ErrorCode, req); // payment hexa
          return preconditionFailed(errorMessage.msg);
        } else if (
          response.data.status == 0 ||
          response.data.status != undefined
        ) {
          return badRequest(process.env.INTERNAL_ERROR);
        }
        return success(h, "Data loaded Successfully", response.data);
      } catch (e) {
        console.log('fpxPaymentStart', e);
        return badImplementation(e);
      }
    },

    async hexafpxbankList(req, h) {
      let data = {}, inserted = false;
      try {

        req.user = {
          'transactionId': await getTxnId(),
          'msisdn': ''
        }

        let hexaBankRes = await fpxHelper.hexaGetBankList(req);

        if (hexaBankRes.status && hexaBankRes.data.status == 1) {
          inserted = await fpxHelper.insertBankList(hexaBankRes.data);
          data = {
            success: true,
            'inserted': inserted

          }
          return success(h, "fpx banklisted Successfully", data);
        }
        else {
          data = {
            'success': false,
            'inserted': inserted
          }
          return success(h, "fpx banklisted err from hexa", data);
        }

      } catch (e) {
        data = {
          'success': false,
          'inserted': inserted
        }
        console.log('hexafpxbankList', e);
        return success(h, "fpx banklisted errr", data);
      }
    },

    async directfpx(req, h) {
      try {

        return h.response("OK")
          .type('text/plain')
          .header('Content-Type', 'text/plain')

      } catch (e) {
        console.log('directfpx', e);
        return badImplementation(e);
      }
    },
    async indirectfpx(req, res) {
      let resDataFpx, checkSignature, updateOrderParams, baseName, updateOrderFpx, responseData
      try {
 
        resDataFpx = req.payload;
        console.log('indirectfpx');
        let { txn_id: txnID, userId: msisdn } = await paymentDetails
          .query()
          .select(["txn_id", "userId"])
          .findOne({ orderno: resDataFpx.fpx_sellerOrderNo })
          .skipUndefined();
        req.user.msisdn = msisdn;
        req.user.transactionId = resDataFpx.fpx_sellerOrderNo;

        checkSignature = await fpx3pp.fpxCheckSignature(
          resDataFpx,
          txnID,
          req
        );

        //Get update order params
        updateOrderParams = await fpxHelper.updateOrderFpxParms(resDataFpx);

        baseName = "umobile://paymentResult";
        if (!updateOrderParams.status)
          return res.redirect(
            baseName +
            "?status=" +
            responseData.status +
            "&orderNo=" +
            responseData.orderNo +
            "&bankTrxId=" +
            responseData.bankTrxId +
            "&bankName=" +
            responseData.bankName
          );

        //If check signature is valid call the update order
        if (checkSignature) {
          updateOrderFpx = await fpxHelper.updateOrderFpx(
            updateOrderParams,
            txnID,
            req
          );
        }

        //Response for mobile side
        responseData = await fpxHelper.fpxPaymentResult(resDataFpx);

        //true or false update db
        if (checkSignature || !checkSignature) {
          // UPDATE SUCCESS OR ATTEMPTED
          const paymentStatus =
            req.payload.fpx_debitAuthCode === '00'
              ? 1
              : req.payload.fpx_debitAuthCode === '09' //Transaction Pending FPX
                ? 3
                : 2;

          await paymentDetails
            .query()
            .update({
              status: paymentStatus,
              actual_status: req.payload.fpx_debitAuthCode,
              host_response_code: null,
              host_response_desc: null,
              reason: req.payload.fpx_debitAuthCode === '00' ? 'Captured' : 'Cancelled',
              payment_status: req.payload.fpx_debitAuthCode === '00' ? '1' : '2',
              buyer_name: req.payload.fpx_buyerName || '',
              buyer_id: req.payload.fpx_buyerId || '',
              bank_branch: req.payload.fpx_buyerBankBranch || '',
              buyer_bank_id: req.payload.fpx_buyerBankId || '',
            })
            .where({ orderno: responseData.orderNo });

          await topupDetails
            .query()
            .update({
              status: paymentStatus,
              reason: req.payload.fpx_debitAuthCode === '00' ? 'Captured' : 'Cancelled',
              payment_status: req.payload.fpx_debitAuthCode === '00' ? '1' : '2',
              status: req.payload.fpx_debitAuthCode === '00' ? '1' : '2',
            })
            .where({ orderno: responseData.orderNo });

          if (updateOrderFpx) {
            return res.redirect(
              "umobile://paymentResult?status=" +
              responseData.status +
              "&orderNo=" +
              responseData.orderNo +
              "&bankTrxId=" +
              responseData.bankTrxId +
              "&bankName=" +
              responseData.bankName +
              "&transactionDate=" +
              responseData.transactionDate
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
                responseData.bankTrxId +
                "&bankName=" +
                responseData.bankName +
                "&transactionDate=" +
                responseData.transactionDate
              );
            } else {
              return res.redirect(
                baseName +
                "?status=" +
                responseData.status +
                "&orderNo=" +
                responseData.orderNo +
                "&bankTrxId=" +
                responseData.bankTrxId +
                "&bankName=" +
                responseData.bankName +
                "&transactionDate=" +
                responseData.transactionDate
              );
            }
          }
        }
        else {
          return res.redirect(
            baseName +
            "?status=" +
            responseData.status +
            "&orderNo=" +
            responseData.orderNo +
            "&bankTrxId=" +
            responseData.bankTrxId +
            "&bankName=" +
            responseData.bankName +
            "&transactionDate=" +
            responseData.transactionDate
          );
        }


      } catch (e) {
        console.log('indirectfpx', e);
        return badImplementation(e);
      }
    }

  }

  return {
    // helpers: Object.freeze(helpers),
    handlers: Object.freeze(handlers)
  };
}

module.exports = creditController();
