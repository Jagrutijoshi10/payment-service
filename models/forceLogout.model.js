const { CmsModel } = require('../config')

class ForceLogout extends CmsModel {
  static get tableName() {
    return 'noc_force_logout'
  }

  static get idColumn() {
    return 'id'
  }
}

module.exports = ForceLogout
