let CustomError = require('./models/customError.model')

module.exports = {
  async getErrorMessage(categoryId) {
    // Get custom Error message
    let errData = await CustomError.query().where({
      category_id: categoryId,
      status: 1
    });
    let finalErrData = {};
    if (errData) {
      errData.forEach(err => {
        finalErrData[err.error_code] = err;
      });
    }
    return finalErrData;
  }
}
