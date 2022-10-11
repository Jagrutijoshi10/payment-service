const hapiJwt = require('hapi-auth-jwt2')
const {
  verifyToken
} = require('../components/auth').contoller.helpers

function register(server, options) {
  server.register(hapiJwt)
  server.auth.strategy('jwt', 'jwt', {
    key: process.env.JWT_SECRET,
    validate: async function (decoded, request) {
      let validity = await verifyToken(decoded)
      request.user = {
        ...validity.userData,
        ...decoded
      }
      return validity
    },
    verifyOptions: {
      algorithms: ['HS256']
    }
  })

  server.auth.default('jwt')
}
const authPlugin = {
  plugin: {
    register,
    name: 'jwt'
  }
}

module.exports = authPlugin