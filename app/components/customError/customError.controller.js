// Models
const { CustomError } = require("./models");

function customErrorController() {
  /* Controller helper functions */
  const helpers = {
    async findErrMsg(categoryId, errCode, req) {
      // Default Error Message
      let errMsg = process.env.DEFAULT_ERR_MSG;

      // let errList = await knex('custom_messages').where({
      //   error_code: errCode,
      //   category_id: categoryId,
      //   status: 1
      // })
      // let errData = await CustomError.query().findOne({
      //   error_code: errCode,
      //   category_id: categoryId,
      //   status: 1
      // });

      let errData = await CustomError.query()
        .alias('custom_messages')
        .select(
          'custom_messages.error_code',
          'custom_messages.omesti_error_code',
          'custom_message_language.message',
          'custom_message_language.prompt_message'
        )
        .join(
          'custom_message_language as custom_message_language',
          'custom_messages.id',
          'custom_message_language.custom_message_id'
        )
        .where({
          'custom_messages.error_code': errCode,
          'custom_messages.category_id': categoryId,
          'custom_messages.status': 1,
          'custom_message_language.language_id': req.user
            ? req.user.langId
            : req.langId || 1
        })
        .first()

      if (!errData) {
        if (!errData) {
          errData = await CustomError.query()
            .alias('custom_messages')
            .select(
              'custom_messages.error_code',
              'custom_messages.omesti_error_code',
              'custom_message_language.message',
              'custom_message_language.prompt_message'
            )
            .join(
              'custom_message_language as custom_message_language',
              'custom_messages.id',
              'custom_message_language.custom_message_id'
            )
            .where({
              'custom_messages.error_code': 'internal_error',
              'custom_messages.category_id': Number(
                process.env.CUSTOM_MESSAGE_CAT
              ),
              'custom_messages.status': 1,
              'custom_message_language.language_id': req.user
                ? req.user.langId
                : req.langId || 1
            })
            .first()
        }
      }

      if (errData) {
        errMsg = errData.prompt_message;
      }

      return {
        msg: errMsg
      };
    }
  };

  /* Route hanlders */
  const handlers = {};

  return {
    helpers: Object.freeze(helpers),
    handlers: Object.freeze(handlers)
  };
}

module.exports = customErrorController();
