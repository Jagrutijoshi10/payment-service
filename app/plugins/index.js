const glob = require('glob')

module.exports = new Promise((resolve, reject) => {
  glob('./app/plugins/*.plugin.js', null, (err, items) => {
    if (err) reject(err)

    const pluginArray = items.map(x => {
      x = x.replace(/app\/plugins\//, '')
      return require(x)
    })
    resolve(pluginArray)
  })
})
