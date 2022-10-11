const {
    badImplementation,
    badRequest,
    preconditionFailed
} = require("@hapi/boom");
const CryptoJS = require("crypto");
const moment = require("moment");
const { getTxnId } = require("../../../../utils").global;
const vendorHelpers = require("./../../vendor/newVendor.controller").helpers;
const fs = require('fs')
const atob = require('atob');


module.exports = {

    async invokePost(url, data, requestType, req) {
        console.log('inside invoke post');
        let options;
        try {
            const encodeGetParams = data =>
                Object.entries(data)
                    .map(kv => kv.map(encodeURIComponent).join("="))
                    .join("&");
            // const encodeGetParamsCheck = data =>
            //     Object.entries(data)
            //         .map(kv => kv.map(
            //             v => (encodeURIComponent(v.replace(/['()]/g, escape).replace(/\*/g, '%2A'))
            //             )).join("="))
            //         .join("&");
            const encodeGetParamsCheck = data =>
                Object.entries(data)
                    .map(kv => kv.map(v =>
                        ((encodeURIComponent(v)
                            .replace(/[!'()*]/g, (c) => {
                                return '%' + c.charCodeAt(0).toString(16).toUpperCase();
                            }))
                        )).join("="))
                    .join("&");

            options = {
                uri: url,
                body: (requestType == 'checksignfpx') ? encodeGetParamsCheck(data) : encodeGetParams(data),
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
        } catch (e) {
            console.log("invoke post error", e)
            return badImplementation(e);
        }
    },


    //Create checksum
    async fpxCheckSum(checksum) {
        try {
            let fileKeyName;
            //Construct fpx check sum
            let checkSumString = checksum.fpx_buyerAccNo + "|" + checksum.fpx_buyerBankBranch + "|"
                + checksum.fpx_buyerBankId + "|" + checksum.fpx_buyerEmail + "|"
                + checksum.fpx_buyerIban + "|" + checksum.fpx_buyerId + "|"
                + checksum.fpx_buyerName + "|" + checksum.fpx_makerName + "|"
                + checksum.fpx_msgToken + "|" + checksum.fpx_msgType + "|"
                + checksum.fpx_productDesc + "|" + checksum.fpx_sellerBankCode + "|"
                + checksum.fpx_sellerExId + "|" + checksum.fpx_sellerExOrderNo + "|"
                + checksum.fpx_sellerId + "|" + checksum.fpx_sellerOrderNo + "|"
                + checksum.fpx_sellerTxnTime + "|" + checksum.fpx_txnAmount + "|"
                + checksum.fpx_txnCurrency + "|" + checksum.fpx_version;

            let sign = CryptoJS.createSign('SHA1');


            function write(data, cb) {
                if (!sign.write(data)) {
                    sign.once('drain', cb);
                } else {
                    process.nextTick(cb);
                }
            }

            // Wait for cb to be called before doing any other write.
            write(checkSumString, () => {
            });

            sign.end();

            //fileKeyName = (process.env.NODE_ENV == 'production') ? '/prodkey/EX00010982.key' : '/key/EX00011685.key';
            fileKeyName = (process.env.NODE_ENV == 'production') ? '/prodkey/EX00010982.key' : '/key/fpx_pixel_key/EX00013249.key'; //Pixel Key


            const key = fs.readFileSync(__dirname + fileKeyName);
            signatureHexa = sign.sign(key, 'hex');

            return signatureHexa

        } catch (e) {
            console.log('fpxCheckSum', e);
            return badImplementation(e);
        }
    },

    async generateHtmlForm(url, method, fpxParams) {
        let html = `<!DOCTYPE HTML PUBLIC \"-//W3C//DTD HTML 4.01 Transitional//EN\" \"http://www.w3.org/TR/html4/loose.dtd\" enctype="application/x-www-form-urlencoded"><html><body><form name='paymentForm' method='${method}' action='${url}'>`;
        for (let param in fpxParams) {
            if (fpxParams[param] == null) fpxParams[param] = "";
            html += `<input type='hidden' name='${param}' value='${fpxParams[param]}'/>`;
        }
        html += `<input type='submit' value='Click To Pay'/>`;
        html += `</form><script>document.paymentForm.submit();</script></body></html>`;

        let data = {
            status: true,
            data: html
        };
        return data;
    },

    async fpxPayment(req, oderData, fpxParams) {
        let html, exOrderNo;
        try {
            exOrderNo = oderData.orderno;

            let fpx = {
                fpx_msgType: 'AR',
                fpx_msgToken: '01', // business model B2C
                fpx_sellerExId: fpxParams.fpx_sellerExId,
                fpx_sellerExOrderNo: fpxParams.fpx_sellerExOrderNo, //exOrderNo,
                fpx_sellerTxnTime: fpxParams.fpx_sellerTxnTime,
                fpx_sellerOrderNo: exOrderNo,
                fpx_sellerId: fpxParams.fpx_sellerId, //process.env.fpx_sellerId,
                fpx_sellerBankCode: fpxParams.fpx_sellerBankCode,//'01', //
                fpx_txnCurrency: fpxParams.fpx_txnCurrency, //'MYR',
                fpx_txnAmount: fpxParams.fpx_txnAmount,//req.query.amount,
                fpx_buyerBankId: fpxParams.fpx_buyerBankId, // req.query.bank_id,
                //Empty 
                fpx_buyerEmail: fpxParams.fpx_buyerEmail, //req.query.email,
                fpx_buyerName: fpxParams.fpx_buyerName, //req.query.name,
                fpx_buyerBankBranch: fpxParams.fpx_buyerBankBranch, //'',
                fpx_buyerAccNo: fpxParams.fpx_buyerAccNo, //'',
                fpx_buyerId: fpxParams.fpx_buyerId,
                fpx_makerName: fpxParams.fpx_makerName,
                fpx_buyerIban: fpxParams.fpx_buyerIban, //'',
                fpx_productDesc: 'sample production',
                fpx_version: '7.0'
            }

            //Check sum
            fpx.fpx_checkSum = await this.fpxCheckSum(fpx);

            //Generate FPX html format
            html = await this.generateHtmlForm(
                process.env.fpx_url,
                "post",
                fpx
            );

            return html

        } catch (e) {
            console.log('fpxParams', e);
            return badImplementation(e);
        }
    },


    async generateSignature(signatureParam) {
        let valueToHash =
            // signatureParam.merchant_code +
            // signatureParam.merchant_id +
            signatureParam.orderNo +
            signatureParam.amount;

        let signature = CryptoJS.createHash("sha256")//sha512
            .update(valueToHash)
            .digest("hex");

        return signature;
    },

    async fpxResCheckSum(checksum) {
        try {

            //Construct response fpx check sum
            let checkSumString = checksum.fpx_buyerBankBranch + "|" + checksum.fpx_buyerBankId + "|"
                + checksum.fpx_buyerIban + "|" + checksum.fpx_buyerName + "|"
                + checksum.fpx_creditAuthCode + "|" + checksum.fpx_creditAuthNo + "|"
                + checksum.fpx_debitAuthCode + "|" + checksum.fpx_debitAuthNo + "|"
                + checksum.fpx_fpxTxnId + "|" + checksum.fpx_fpxTxnTime + "|"
                + checksum.fpx_makerName + "|" + checksum.fpx_msgToken + "|"
                + checksum.fpx_msgType + "|" + checksum.fpx_sellerExId + "|"
                + checksum.fpx_sellerExOrderNo + "|" + checksum.fpx_sellerId + "|"
                + checksum.fpx_sellerOrderNo + "|" + checksum.fpx_sellerTxnTime + "|"
                + checksum.fpx_txnAmount + "|" + checksum.fpx_txnCurrency;

            return checkSumString

        } catch (e) {
            console.log('fpxResCheckSum', e);
        }
    },

    async fpxCheckSignGenerate(data) {
        try {
            requestId = "Req" + Math.floor(100000000 + Math.random()  * 900000000);
            data.code = process.env.merchant_code;
            data.requestId = requestId;

            // SIGNATURE
            signatureToHash =
                requestId + process.env.merchant_code + process.env.merchant_key;

            shasum = CryptoJS.createHash("sha256");
            shasum.update(signatureToHash, "utf8");

            signature = shasum.digest("base64");
            data.signature = signature;

            return data;

        } catch (e) {
            console.log('fpxCheckSignGenerate', e);
        }
    },
    async fpxCheckSignature(params, txnID, req) {
        let url, requestId, signature, data = {};
        try {
       
            url = process.env.fpx_check_sum;
            requestId = "Req" + Math.floor(100000000 + Math.random()  * 900000000);
            data.code = process.env.merchant_code;
            data.requestId = requestId;

            // SIGNATURE
            signatureToHash =
                requestId + process.env.merchant_code + process.env.merchant_key;

            shasum = CryptoJS.createHash("sha256");
            shasum.update(signatureToHash, "utf8");

            signature = shasum.digest("base64");
            data.signature = signature;

            //Make fpxreponse for hexa checksum
            let keyArr = Object.keys(params);

            function fixedEncodeURI(str) {
                return encodeURIComponent(str).replace(/[!'()*]/g, (c) => {
                    return '%' + c.charCodeAt(0).toString(16).toUpperCase();
                });
            }
            let fpxString = ''
            for (var i = 0; i < keyArr.length; i++) {
                var curr = keyArr[i]
                if (keyArr.length - 1 == i) {
                    fpxString = fpxString + curr + '=' + fixedEncodeURI(params[curr])
                } else {
                    fpxString = fpxString + curr + '=' + fixedEncodeURI(params[curr]) + '&'
                }
            }

            data.fpxresponse = fpxString

            let result = await this.invokePost(url, data, "checksignfpx", req);

            return (result.status && typeof result.data == 'string' && result.data === "1") ? true : false;

        } catch (e) {
            console.log('fpxCheckSignature', e);
        }
    },


    async resFpxValidateCheckSum(sign, tosign) {
        try {

            return await validateCertificate(__dirname, sign, tosign)

        } catch (e) {
            console.log('resFpxValidateCheckSum', e);
        }
    },

    async validateCertificate(path, sign, tosign) {
        try {

            const fpxcert = fs.readFileSync(path + '/key/EX00011685.cer');


        } catch (e) {
            console.log('validateCertificate', e);
        }
    }


}
