const {
    badImplementation,
    badRequest,
    preconditionFailed
} = require("@hapi/boom");
const CryptoJS = require("crypto");
const moment = require("moment");
const { getTxnId,getUniqueSellerExId } = require("../../../../utils").global;
const fpx3pp = require('./fpx_3pp');
const {
    paymentDetails,
    topupDetails
} = require('../../payment/models/index');
const {
    fxpBankList
} = require('../models/index');

module.exports = {

    async makeParams(req) {
        let params;
        try {

            params = {
                txnID: await getTxnId(),
                type: req.query.type, // type 1 - postpaid paybill, 3 - prepaid topup
                amount: req.query.amount,
                name: req.query.name,
                msisdn: req.user.msisdn,
                email: !req.query.email ? "-" : req.query.email,
                method: 3, //req.query.method FPX,
                fpx_msgType: 'AR',
                fpx_msgToken: '01', // business model B2C
                fpx_sellerExId: process.env.fpx_sellerExId,
                fpx_sellerExOrderNo: getUniqueSellerExId(),
                fpx_sellerTxnTime: moment().utcOffset(480).format('YYYYMMDDHHmmss'),
                fpx_sellerId: process.env.fpx_sellerId,
                fpx_sellerBankCode: '01', //
                fpx_txnCurrency: 'MYR',
                fpx_txnAmount: req.query.amount,
                //Empty 
                fpx_buyerEmail: '', //req.query.email,
                fpx_buyerName: '', //req.query.name,
                fpx_buyerBankId: req.query.bank_id,
                fpx_buyerBankBranch: '',
                fpx_buyerAccNo: '',
                fpx_buyerId: '', //req.query.bank_id + moment().utc().format('YYMMDDHHmmSS'),
                fpx_makerName: '', //req.query.name,
                fpx_buyerIban: '',
                fpx_productDesc: 'sample production',
                fpx_version: '7.0'
            }


            //check customer code 
            if (req.query.customercode && typeof req.query.customercode == "string") {
                req.query.customercode = req.query.customercode.trim()
            }

            if (req.query.customercode && req.query.customercode != "undefined") {
                params.customercode = req.query.customercode
            } else {
                params.customercode = null
            }

            let reformattedAmount = params.amount;
            if (params.amount.length > 3 && params.amount.charAt(params.amount.length - 3) == ",") {
                reformattedAmount = params.amount.replace(/,/g, ".");
                params.amount = reformattedAmount;
                params.fpx_txnAmount = reformattedAmount;
            }

            return params;
        } catch (e) {
            return badImplementation(e);
        }
    },

    async addOrder(data, req) {
        let url, result, signatureToHash,
            shasum, signature, insertParams, requestTime, responseTime, duration, insertResult
        try {

            url = process.env.fpx_url_paybill_add_order;
            requestId = "Req" + Math.floor(100000000 + Math.random() * 900000000);
            data.code = process.env.merchant_code;
            data.requestId = requestId;

            // SIGNATURE
            signatureToHash =
                requestId + process.env.merchant_code + process.env.merchant_key;

            shasum = CryptoJS.createHash("sha256");
            shasum.update(signatureToHash, "utf8");

            signature = shasum.digest("base64");
            data.signature = signature;
            data.mercRefNo = data.txnID;
            data.platform = 2;
            data.gst = 0;
            data.actamount = data.amount;
            data.payment_host = 'PAYNET'

            req.user.transactionId = data.txnID;
            delete data.txnID;

            //HEXA ADD ORDER 3PP
            result = await fpx3pp.invokePost(url, data, "addorderfpx", req);

            requestTime = moment(req.info.received).format('YYYY/MM/DD HH:mm:ss.SSS');
            responseTime = moment().format('YYYY/MM/DD HH:mm:ss.SSS');
            duration = moment.utc(moment(responseTime, "DD/MM/YYYY HH:mm:ss.SSS").diff(moment(requestTime, "DD/MM/YYYY HH:mm:ss.SSS"))).format("HH:mm:ss.SSS")

            // ENTRY INTO DB
            let method = data.method == 3 ? 'Fpx' : '';
            insertParams = {
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

            let value = {
                'result': result,
                'data': data
            }
            return value;
        } catch (e) {
            return badImplementation(e);
        }
    },

    async updateTopup(addOrderData, req, fpxParams) {
        let data, orderData, requestTime, inserttopup;
        try {
            data = addOrderData.data
            orderData = addOrderData.result
            requestTime = moment(req.info.received).format('YYYY/MM/DD HH:mm:ss.SSS');

            let responseTime = moment().format('YYYY/MM/DD HH:mm:ss.SSS');
            let duration = moment.utc(moment(responseTime, "DD/MM/YYYY HH:mm:ss.SSS").diff(moment(requestTime, "DD/MM/YYYY HH:mm:ss.SSS"))).format("HH:mm:ss.SSS")

            let payment_method = fpxParams.type == 3 ? "Prepaid Topup" : "Postpaid Paybill";
            let method = fpxParams.method == 3 ? 'Fpx' : '';
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
                reason: 'Cancelled',
                payment_status: '2',
                status: '2'
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


            //Start update order no get from Hexa in payment details 
            let signatureParams = {
                // merchant_id: resultConfig.merchant_id,
                // merchant_code: resultConfig.merchant_key,
                orderNo: orderData.data.orderno,
                amount: data.amount
            };

            let txn_signature = await fpx3pp.generateSignature(signatureParams);
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
            //End

            //insert topup table
            inserttopup = await topupDetails.query().insert(inserttop);

            let fpxPayment = await fpx3pp.fpxPayment(req, orderData.data, fpxParams)

            return fpxPayment;

        } catch (e) {
            return badImplementation(e);
        }
    },

    async updateOrderFpxParms(data) {
        try {

            let orderNo = data.fpx_sellerOrderNo;
            if (orderNo == null || orderNo == "")
                return {
                    status: false,
                    msg: "fpx_sellerExOrderNo from fpx response is null or empty"
                };


            if (data.fpx_debitAuthCode == null || data.fpx_debitAuthCode == "")
                return {
                    status: false,
                    msg: "fpx_debitAuthCode from fpx response is null or empty"
                };

            return {
                code: process.env.merchant_code,
                orderno: orderNo,
                signature: CryptoJS.createHash("sha256")
                    .update(
                        orderNo +
                        process.env.merchant_code +
                        process.env.merchant_key +
                        data.fpx_debitAuthCode
                    )
                    .digest("base64"),
                transactionid: data.fpx_fpxTxnId,
                bankcode: '',
                status: (data.fpx_debitAuthCode == '00') ? 'C' : (data.fpx_debitAuthCode == '99') ? 'N' : 'F',
                rescode: data.fpx_debitAuthCode,
                resdesc: '',
                datecreate: data.fpx_fpxTxnTime
            };

        } catch (e) {
            console.log('updateOrderFpx', e);
            return badImplementation(e);
        }
    },

    async updateOrderFpx(params, txnID, req) {
        try {
            url = process.env.fpx_url_paybill_update_order;
            merchantCode = process.env.merchant_code;
            merchantKey = process.env.merchant_key;
            orderNo = params.orderno;

            let postParams = [];
            for (let paramData in params) {
                postParams[paramData] = params[paramData];
            }
            let response = await fpx3pp.invokePost(
                url,
                postParams,
                "updateOrder",
                req
            );

            if (!response.status) return response;
            if (!response.data.orderno == orderNo) return false;

            let generatedSign = CryptoJS.createHash("sha256")
                .update(orderNo + merchantCode + merchantKey + response.status)
                .digest("base64");

            return !response.data.signature == generatedSign ? false : true;

        } catch (e) {
            console.log('updateOrderFpx', e);
            return badImplementation(e);
        }
    },

    async fpxPaymentResult(fpxResponse) {
        try {

            if (fpxResponse.fpx_debitAuthCode) {
                switch (fpxResponse.fpx_debitAuthCode) {
                    case "00":
                        status = "SUCCESS";
                        break;
                    case "09":
                    case "99":
                        status = "FAILED_BANK";
                        break;
                    default:
                        status = "FAILED"; //FAILED_BANK_FPX
                        break;
                }
            } else {
                status = "FAILED";
            }

            orderNo = fpxResponse.fpx_sellerOrderNo; //order no from hexa
            bankTrxId = fpxResponse.fpx_fpxTxnId;
            bankName = fpxResponse.fpx_buyerBankBranch;
            transactionDate = (fpxResponse.fpx_fpxTxnTime) ? moment(fpxResponse.fpx_fpxTxnTime, 'YYYYMMDDHHmmss').format('YYYY-MM-DD hh:mm A') : fpxResponse.fpx_fpxTxnTime; //The fpx transation time is alredy in MYT
            let responseData = {
                status: status,
                amount: null,
                orderNo: orderNo,
                bankTrxId: bankTrxId,
                bankName: bankName,
                transactionDate: transactionDate
            };
            return responseData;

        } catch (e) {
            console.log('fpxPaymentResult', e);
            return badImplementation(e);
        }
    },

    async hexaGetBankList(req) {
        let url, result, signatureToHash, shasum, signature, data = {};
        try {

            url = process.env.fpx_bank_list;
            requestId = "Req" + Math.floor(100000000 + Math.random() * 900000000);
            data.code = process.env.merchant_code;
            data.requestId = requestId;

            // SIGNATURE
            signatureToHash =
                requestId + process.env.merchant_code + process.env.merchant_key;

            shasum = CryptoJS.createHash("sha256");
            shasum.update(signatureToHash, "utf8");

            signature = shasum.digest("base64");
            data.signature = signature;

            //HEXA FPX BANK LIST 3PP
            result = await fpx3pp.invokePost(url, data, "getbanklist", req);

            return result;

        } catch (e) {
            return badImplementation(e);
        }
    },

    async insertBankList(bankList) {
        let fpxBank;
        try {
            fpxBank = bankList.result;

            // status is commented below to handle FPX downtime.
            for (let bank of fpxBank) {
                let bankExist = await fxpBankList.query().where({ 'bank_id': bank.bankcode }).first();
                if (bankExist) {
                    let value = {
                        // 'bank_id': bank.bankcode,
                        'bank_name': bank.bankname,
                        'bank_sort': bank.banksort,
                        'display_name': bank.bankname,
                        'bank_image': bank.bankimage,
                        'bank_status': (bank.bankstatus == 'online') ? 1 : 0
                        // 'status': 1
                    }
                    await fxpBankList.query().patch(value).where({ 'bank_id': bank.bankcode })
                }
                else {
                    let value = {
                        'bank_id': bank.bankcode,
                        'bank_name': bank.bankname,
                        'display_name': bank.bankname,
                        'bank_sort': bank.banksort,
                        'bank_image': bank.bankimage,
                        'bank_status': (bank.bankstatus == 'online') ? 1 : 0
                        // 'status': 1
                    }
                    await fxpBankList.query().insert(value);
                }
            }

            return true

        } catch (e) {
            console.log('insertBankList', e);
            return false
        }
    }

}