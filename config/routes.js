const glob = require('glob')

module.exports = new Promise((resolve, reject) => {
  glob('app/components/*', null, (err, routes) => {
    if (err) reject(err)
    const routeArray = routes.map(x => {
      return require(`../${x}`).routes
    })
    resolve(routeArray)
  })
})
