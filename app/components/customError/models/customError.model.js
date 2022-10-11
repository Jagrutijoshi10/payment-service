const {
    CmsModel
} = require('../../../../config/index');

const {
    QueryBuilder
} = require('objection')

class CustomError extends CmsModel {
    static get tableName() {
        return 'custom_messages'
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
    //             error_code: {
    //                 type: 'string',
    //             },
    //             omesti_error_code: {
    //                 type: 'string'
    //             },
    //             category_id: {
    //                 type: 'integer'
    //             },
    //             notes: {
    //                 type: 'string'
    //             },
    //             edited_by: {
    //                 type: 'integer'
    //             },
    //             message: {
    //                 type: 'string'
    //             },
    //             prompt_message: {
    //                 type: 'string'
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

module.exports = CustomError