import { Knex } from 'knex'

const tableName = 'product'

exports.up = async function (knex: Knex) {
  if (await knex.schema.hasColumn(tableName, 'unit_price')) {
    await knex.schema.table(tableName, t => {
      t.renameColumn('unit_price', 'wholesale_unit_price')
    })
  }
}

exports.down = async function (knex: Knex) {
  if (await knex.schema.hasColumn(tableName, 'wholesale_unit_price')) {
    await knex.schema.table(tableName, t => {
      t.renameColumn('wholesale_unit_price', 'unit_price')
    })
  }
}
