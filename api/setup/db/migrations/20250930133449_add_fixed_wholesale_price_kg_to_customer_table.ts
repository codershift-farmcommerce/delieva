import { Knex } from 'knex'

const tableName = 'customer'

exports.up = async function (knex: Knex) {
  if (!(await knex.schema.hasColumn(tableName, 'fixed_wholesale_price_kg'))) {
    await knex.schema.table(tableName, t => {
      t.decimal('fixed_wholesale_price_kg', 10, 2).nullable()
    })
  }
}

exports.down = async function (knex: Knex) {
  if (await knex.schema.hasColumn(tableName, 'fixed_wholesale_price_kg')) {
    await knex.schema.table(tableName, t => {
      t.dropColumn('fixed_wholesale_price_kg')
    })
  }
}
