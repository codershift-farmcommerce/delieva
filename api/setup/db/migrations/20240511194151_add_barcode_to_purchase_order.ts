import { Knex } from 'knex'

const tableName = 'purchase_order'
const columnName = 'barcode'

exports.up = async function (knex: Knex) {
  if (!(await knex.schema.hasColumn(tableName, columnName))) {
    await knex.schema.table(tableName, t => {
      t.string(columnName).notNullable().defaultTo('')
    })
  }
}

exports.down = async function (knex: Knex) {
  await knex.raw(`ALTER TABLE ${tableName} DROP COLUMN ${columnName}`)
}
