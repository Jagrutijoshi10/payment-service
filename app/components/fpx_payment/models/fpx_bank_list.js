const {
    AppModel
} = require('../../../../config')

class fxpBankList extends AppModel {
    static get tableName() {
        return 'fpx_bank_list'
    }

    static get idColumn() {
        return 'id'
    }
}

module.exports = fxpBankList