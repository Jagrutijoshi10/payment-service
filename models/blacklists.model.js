const { AppModel } = require('../config')

class Blacklist extends AppModel {
  static get tableName() {
    return 'blacklists'
  }

  static get idColumn() {
    return 'id'
  }
}

module.exports = Blacklist
