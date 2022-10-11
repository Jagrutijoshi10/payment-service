const {
    AppModel
} = require('../../../../config')

class paymentDetails extends AppModel {
    static get tableName() {
        return 'payment_details'
    }

    static get idColumn() {
        return 'id'
    }
}

module.exports = paymentDetails