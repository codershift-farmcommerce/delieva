import { Knex } from 'knex'

const tableName = 'cash_register'

exports.up = async function (knex: Knex) {
  if (
    !(await knex.schema.hasColumn(
      tableName,
      'apply_wholesale_price_after_x_kg',
    ))
  ) {
    await knex.schema.table(tableName, t => {
      t.decimal('apply_wholesale_price_after_x_kg').notNullable().defaultTo(10)
    })
  }
}

exports.down = async function (knex: Knex) {
  await knex.raw(
    `ALTER TABLE ${tableName} DROP COLUMN apply_wholesale_price_after_x_kg`,
  )
}
