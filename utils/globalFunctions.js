const moment = require("moment");
const randomstring = require("randomstring");
const path = require("path");
const _ = require("ramda");
var exceltojson = require("xlsx-to-json-lc");
const CryptoJS = require("crypto-js");

function globalFunctions() {
  const methods = {
    addFileBaseUrl: data => {
      // Single File
      if (!Array.isArray(data)) {
        return `${process.env.GCP_BASE_URL + data}`;
      }
      // Multiple
      data = data.map(v => {
        return `${process.env.GCP_BASE_URL + v}`;
      });
      return data;
    },
    randomString: () => {
      return randomstring.generate(15);
    },
    // Extract from nested object
    getObjValue: (object, keys, d = null) => {
      return _.pathOr(d, keys, object);
    },
    readXLFile: async filePath => {
      let pathfile = filePath
        ? filePath
        : path.join(__dirname, "../static/RP-code-List.xlsx");
      let resData = await new Promise(function (resolve, reject) {
        exceltojson(
          {
            input: pathfile,
            output: null, //since we don't need output.json
            lowerCaseHeaders: true
          },
          function (err, data) {
            return resolve({
              data: data
            });
          }
        );
      });
      return resData;
    },
    getTxnId: async () => {
      let randomStr = randomstring.generate({
        length: 5,
        charset: "numeric"
      });
      const transactionId = `${moment()
        .utc()
        .format("x")}-${randomStr}`;
      return transactionId;
    },
    dataDecryption: (data, type = "json") => {
      try {
        let bytes = CryptoJS.AES.decrypt(data, process.env.ENCRYPT_KEY);
        let decrypted = bytes.toString(CryptoJS.enc.Utf8);
        if (type != "json") {
          return decrypted;
        } else {
          return {
            ...JSON.parse(decrypted)
          };
        }
      } catch (err) {
        console.log(JSON.stringify(err), "API_DECRYPTED_ERROR");
        return false;
      }
    },
    dataEncryption: (data, type = "json") => {
      try {
        if (type == "json") {
          data = JSON.stringify(data);
        }
        return CryptoJS.AES.encrypt(data, process.env.ENCRYPT_KEY).toString();
      } catch (err) {
        console.log(JSON.stringify(err), "API_ENCRYPTED_ERROR");
        return false;
      }
    },
    getTransactionId: () => {
      let randomStr = randomstring.generate({
        length: 5,
        charset: 'numeric'
      })

      let txnId = `${moment()
        .utc()
        .format('x')}-${randomStr}`
      return txnId
    },
    getUniqueSellerExId: () => {
      //       Format: [AAA YYYY MM DD HH 24 MI SS CCCC]
      //       AAA: Channel Identiﬁer (3 digit) , value to be provided by ZSmart.
      // Datetime: YYYYMMDDHH24MISS.
      // CCCC: Sequence number (4 digit), value range [0000-9999].
      try {
        let randomStr = randomstring.generate({
          length: 4,
          charset: 'numeric'
        })
        let timeFormat = moment().add(8,'hours').format('YYYYMMDDHHmmss');
        let finalMSGID = `${timeFormat}${randomStr}`
        console.log('finalMSGID', finalMSGID)
        return finalMSGID
      } catch (err) {
        console.log(JSON.stringify(err), 'MSG-ID')
        return false
      }
    }
  };

  return Object.freeze(methods);
}

// globalFunctions().readXLFile()

module.exports = globalFunctions();
