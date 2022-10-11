function Response() {
  const methods = {
    success: (res, message, data = null, statusCode = 200) => {
      return res.response({
        message,
        error: null,
        data
      }).code(statusCode)
    }
  };
  return Object.freeze(methods);
}

module.exports = Response();