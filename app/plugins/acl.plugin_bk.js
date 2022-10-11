const {
  forbidden
} = require('@hapi/boom')

module.exports = {
  plugin: 'hapi-acl-auth',

  options: {
    allowUnauthenticated: true,
    handler: async function (req) {
      return {
        msisdn: req.user.msisdn,
        roles: ['user']
      }
    },

    forbiddenPageFunction: async function (credentials, request, h) {
      return forbidden('Insufficient permissions')
    }
  }
}