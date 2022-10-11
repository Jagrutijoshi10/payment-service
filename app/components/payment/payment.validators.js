const joi = require('@hapi/joi')

function pushValidators(route) {
  const validators = {}

  if (!validators[route]) throw new Error('Invalid route passed to validator')

  return validators[route]
}

module.exports = pushValidators
