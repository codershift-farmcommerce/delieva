import { Knex } from 'knex'

const tableName = 'cash_register_reconciliation'

exports.up = async function (knex: Knex) {
  if (!(await knex.schema.hasColumn(tableName, 'closing_donation_balance'))) {
    await knex.schema.table(tableName, t => {
      t.decimal('closing_donation_balance', 12, 2).notNullable().defaultTo(0)
    })
  }
  if (!(await knex.schema.hasColumn(tableName, 'actual_donation_balance'))) {
    await knex.schema.table(tableName, t => {
      t.decimal('actual_donation_balance', 12, 2).notNullable().defaultTo(0)
    })
  }
}

exports.down = async function (knex: Knex) {
  await knex.raw(`ALTER TABLE ${tableName} DROP COLUMN closing_donation_balance`)
  await knex.raw(`ALTER TABLE ${tableName} DROP COLUMN actual_donation_balance`)
}
