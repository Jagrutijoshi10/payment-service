const {
    Model,
    QueryBuilder
} = require('objection')
const knex = require('knex')(require('../db/app.knexfile'))
const moment = require('moment')
const {
    info,
    error
} = require('../utils').logs

// Test connection
knex
    .raw('select 1+1 as result')
    .then(_ => {
        info('APP DB connected')
    })
    .catch(e => {
        error(e)
        process.exit(1)
    })

Model.knex(knex)

class CustomQueryBuilder extends QueryBuilder {
     constructor(modelClass) {
         super(modelClass)
         if (modelClass.defaultSchema) {
             this.withSchema(modelClass.defaultSchema);
         }
     }
     
    softDelete(id) {
        if (id) {
            return this.patch({
                status: 3
            }).findById(id)
        }
    }

    async isValid(data) {
        let validity = await this.findOne({
            ...data,
            status: 1
        })
        return !!validity
    }

    upsert(model) {
        if (model.id) {
            return this.update(model).where('id', model.id)
        } else {
            return this.insert(model)
        }
    }
}

class BaseModel extends Model {
    $beforeInsert() {
        this.created_at = moment().utc().format('YYYY/MM/DD HH:mm:ss')
        this.updated_at = moment().utc().format('YYYY/MM/DD HH:mm:ss')
    }

    $beforeUpdate() {
        this.updated_at = moment().utc().format('YYYY/MM/DD HH:mm:ss')
    }
}

BaseModel.QueryBuilder = CustomQueryBuilder

module.exports = BaseModel