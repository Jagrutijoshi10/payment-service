const joi = require('@hapi/joi')

function userValidators(route) {

  const validators = {}

  if (!validators[route]) throw new Error('Invalid route passed to validator')

  return validators[route]
}

module.exports = userValidators