import { Knex } from 'knex'

const tableName = 'purchase_order'
const columnName = 'payment_status'

exports.up = async function (knex: Knex) {
  if (!(await knex.schema.hasColumn(tableName, columnName))) {
    await knex.schema.table(tableName, t => {
      t.enum(columnName, ['PAYMENT_PENDING', 'PAID', 'PAYMENT_RETURNED'])
        .notNullable()
        .defaultTo('PAID')
    })
  }
}

exports.down = async function (knex: Knex) {
  await knex.raw(`ALTER TABLE ${tableName} DROP COLUMN ${columnName}`)
}
