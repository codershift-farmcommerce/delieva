import { Knex } from 'knex'

const tableName = 'purchase_order'
const indexName = 'idx_purchase_order_created_at'

exports.up = async function (knex: Knex) {
  await knex.schema.table(tableName, t => {
    t.index('created_at', indexName)
  })
}

exports.down = async function (knex: Knex) {
  await knex.schema.table(tableName, t => {
    t.dropIndex('created_at', indexName)
  })
}
