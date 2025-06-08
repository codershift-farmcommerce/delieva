import { Knex } from 'knex'

const tableName = 'purchase_order'
const columnName = 'cash_register_id'

exports.up = async function (knex: Knex) {
  if (!(await knex.schema.hasColumn(tableName, columnName))) {
    await knex.schema.table(tableName, t => {
      t.bigInteger(columnName)
        .nullable()
        .references('id')
        .inTable('cash_register')
    })
  }
}

exports.down = async function (knex: Knex) {
  await knex.raw(`ALTER TABLE ${tableName} DROP COLUMN ${columnName}`)
}
