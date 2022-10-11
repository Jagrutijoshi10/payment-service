const {
    AppModel
} = require('../../../../config')

class PaymentCardDetails extends AppModel {
    static get tableName() {
        return 'payment_card_details'
    }

    static get idColumn() {
        return 'id'
    }
}

module.exports = PaymentCardDetails