const vendorHelpers = require("../../vendor/newVendor.controller").helpers;

module.exports = {
    async invokePost(url, data, requestType, req) {
        const encodeGetParams = data =>
            Object.entries(data)
                .map(kv => kv.map(encodeURIComponent).join("="))
                .join("&");

        let options = {
            url: url,
            body: requestType == 'cancelorder' ? `orderno=${req.payload.orderno}` : encodeGetParams(data),
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            method: "POST"
        };

        let reqData = {
            orderno:  requestType == 'cancelorder' ? req.payload.orderno : data,
            options: options
        }
        return vendorHelpers.apiFetch(
            reqData,
            requestType,
            "HEXA",
            req
        );
    },

    async cancelOrder(req, url) {
        console.log('invoke post ')
        return await this.invokePost(url, req.payload.orderno, "cancelorder", req)
         
    }
}