const {
    AppModel
} = require('../../../../config')

class TopupDetails extends AppModel {
    static get tableName() {
        return 'topup_details'
    }

    static get idColumn() {
        return 'id'
    }
}

module.exports = TopupDetails
