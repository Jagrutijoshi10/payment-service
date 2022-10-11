const {
    AppModel
} = require('../../../../config')

class UserCurrentLocation extends AppModel {
    static get tableName() {
        return 'user_current_locations'
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
    //             latitude: {
    //                 type: ['decimal', 'null']
    //             },
    //             longitude: {
    //                 type: ['decimal', 'null']
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

module.exports = UserCurrentLocation