const { CmsModel } = require('../config')

class SubPage extends CmsModel {
  static get tableName() {
    return 'sub_pages'
  }

  static get idColumn() {
    return 'id'
  }
}

module.exports = SubPage
