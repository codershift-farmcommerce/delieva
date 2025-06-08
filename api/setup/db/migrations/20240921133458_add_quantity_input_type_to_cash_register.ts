import { Knex } from 'knex'

const tableName = 'cash_register'

exports.up = async function (knex: Knex) {
  if (!(await knex.schema.hasColumn(tableName, 'quantity_input_type'))) {
    await knex.schema.table(tableName, t => {
      t.enum('quantity_input_type', ['MANUAL', 'PRODUCT_SCAN'])
        .notNullable()
        .defaultTo('MANUAL')
    })
  }
}

exports.down = async function (knex: Knex) {
  await knex.raw(`ALTER TABLE ${tableName} DROP COLUMN quantity_input_type`)
}
