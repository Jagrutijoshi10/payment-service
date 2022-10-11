const {
    AppModel
} = require('../../../../config')

class maybankTokenDetails extends AppModel {
    static get tableName() {
        return 'maybank_token_details'
    }

    static get idColumn() {
        return 'id'
    }
}

module.exports = maybankTokenDetails