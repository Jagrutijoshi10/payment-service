const {
  AppModel
} = require('../../../../config')

class UserSession extends AppModel {
  static get tableName() {
    return 'user_sessions'
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

  static get relationMappings() {
    const {
      UserDetail,
      UserVendorSession
    } = require('../../user').model
    return {
      user_detail: {
        relation: AppModel.HasOneRelation,
        modelClass: UserDetail,
        join: {
          from: 'user_sessions.user_detail_id',
          to: 'user_details.id'
        }
      },
      user_vendor_session: {
        relation: AppModel.HasManyRelation,
        modelClass: UserVendorSession,
        join: {
          from: 'user_sessions.user_detail_id',
          to: 'user_vendor_session_ids.user_detail_id'
        }
      }
    }
  }

}

module.exports = UserSession