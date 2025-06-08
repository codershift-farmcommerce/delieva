import { Knex } from 'knex'

const tableName = 'cash_register_withdrawal'
const columnName = 'status'

exports.up = async function (knex: Knex) {
  if (!(await knex.schema.hasColumn(tableName, columnName))) {
    await knex.schema.table(tableName, t => {
      t.enum(columnName, ['PROCESSED', 'CANCELED'])
        .notNullable()
        .defaultTo('PROCESSED')
    })
  }
}

exports.down = async function (knex: Knex) {
  await knex.raw(`ALTER TABLE ${tableName} DROP COLUMN ${columnName}`)
}
