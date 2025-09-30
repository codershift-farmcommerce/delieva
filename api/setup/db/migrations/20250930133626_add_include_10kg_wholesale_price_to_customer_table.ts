import { Knex } from 'knex'

const tableName = 'customer'

exports.up = async function (knex: Knex) {
  const hasColumn = await knex.schema.hasColumn(tableName, 'include_10kg_wholesale_price')
  if (!hasColumn) {
    // Add column with default false for new customers
    await knex.schema.table(tableName, t => {
      t.boolean('include_10kg_wholesale_price').notNullable().defaultTo(false)
    })

    // Set true for existing customers
    await knex(tableName).update({ include_10kg_wholesale_price: true })
  }
}

exports.down = async function (knex: Knex) {
  const hasColumn = await knex.schema.hasColumn(tableName, 'include_10kg_wholesale_price')
  if (hasColumn) {
    await knex.schema.table(tableName, t => {
      t.dropColumn('include_10kg_wholesale_price')
    })
  }
}
