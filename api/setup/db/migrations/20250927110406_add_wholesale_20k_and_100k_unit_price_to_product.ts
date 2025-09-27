import { Knex } from 'knex'

const tableName = 'product'

exports.up = async function (knex: Knex) {
  if (!(await knex.schema.hasColumn(tableName, 'wholesale_20k_unit_price'))) {
    await knex.schema.table(tableName, t => {
      t.decimal('wholesale_20k_unit_price').nullable()
    })
  }
  
  if (!(await knex.schema.hasColumn(tableName, 'wholesale_100k_unit_price'))) {
    await knex.schema.table(tableName, t => {
      t.decimal('wholesale_100k_unit_price').nullable()
    })
  }
}

exports.down = async function (knex: Knex) {
  if (await knex.schema.hasColumn(tableName, 'wholesale_20k_unit_price')) {
    await knex.schema.table(tableName, t => {
      t.dropColumn('wholesale_20k_unit_price')
    })
  }
  
  if (await knex.schema.hasColumn(tableName, 'wholesale_100k_unit_price')) {
    await knex.schema.table(tableName, t => {
      t.dropColumn('wholesale_100k_unit_price')
    })
  }
}
