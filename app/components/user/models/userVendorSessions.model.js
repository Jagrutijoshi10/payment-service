const {
    AppModel
} = require('../../../../config')

class UserVendorSession extends AppModel {
    static get tableName() {
        return 'user_vendor_session_ids'
    }

    static get idColumn() {
        return 'id'
    }

    // static get jsonSchema() {
    //   return {
    //     type: 'object',
    //     properties: {
    //       id: {
    //         type: 'integer'
    //       },
    //       user_detail_id: {
    //                 type: 'integer'
    //       },
    //       msisdn: {
    //         type: 'string',
    //         minLength: 10,
    //         maxLength: 30
    //       },
    //       latitude: {
    //         type: ['decimal', 'null']
    //       },
    //       longitude: {
    //         type: ['decimal', 'null']
    //       },
    //       zip_code: {
    //         type: ['string', 'null']
    //       },
    //       address: {
    //         type: ['string', 'null']
    //       },
    //       connection_type: {
    //         type: ['string', 'null']
    //       },
    //       signal_strength: {
    //         type: ['number', 'null']
    //       },
    //       device_os: {
    //         type: ['number', 'null']
    //       },
    //       device_name: {
    //         type: ['string', 'null']
    //       },
    //       device_id: {
    //         type: ['string', 'null']
    //       },
    //       fcm_token: {
    //         type: ['string', 'null']
    //       },
    //       login_time: {
    //         type: 'date'
    //       },
    //       logout_time: {
    //         type: 'date'
    //       },
    //       session_status: {
    //         type: 'integer'
    //       },
    //       status: {
    //         type: 'integer'
    //       },
    //       created_at: {
    //         type: 'date'
    //       },
    //       updated_at: {
    //         type: 'date'
    //       }
    //     }
    //   }
    // }
}

module.exports = UserVendorSession