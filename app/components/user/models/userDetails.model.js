const {
    AppModel
} = require('../../../../config')

class UserDetails extends AppModel {
    static get tableName() {
        return 'user_details'
    }

    static get idColumn() {
        return 'id'
    }

    // static get jsonSchema() {
    //     return {
    //         type: 'object',
    //         properties: {
    //             id: {
    //                 type: 'integer'
    //             },
    //             msisdn: {
    //                 type: 'string',
    //                 minLength: 10,
    //                 maxLength: 30
    //             },
    //             name: {
    //                 type: 'string'
    //             },
    //             pin: {
    //                 type: 'string'
    //             },
    //             suspension_enabled: {
    //                 type: 'integer'
    //             },
    //             volte_enabled: {
    //                 type: 'integer'
    //             },
    //             caller_blocking_enabled: {
    //                 type: 'integer'
    //             },
    //             device_os: {
    //                 type: 'number'
    //             },
    //             device_name: {
    //                 type: ['string', 'null']
    //             },
    //             device_id: {
    //                 type: ['string', 'null']
    //             },
    //             fcm_token: {
    //                 type: ['string', 'null']
    //             },
    //             user_session_id: {
    //                 type: 'integer'
    //             },
    //             status: {
    //                 type: 'integer'
    //             },
    //             created_at: {
    //                 type: 'date'
    //             },
    //             updated_at: {
    //                 type: 'date'
    //             }
    //         }
    //     }
    // }
}

module.exports = UserDetails