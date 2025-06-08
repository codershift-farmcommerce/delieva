import { Knex } from 'knex'

const tableName = 'cash_register_reconciliation'

exports.up = async function (knex: Knex) {
  if (!(await knex.schema.hasColumn(tableName, 'closing_credit_balance'))) {
    await knex.schema.table(tableName, t => {
      t.decimal('closing_credit_balance', 12, 2).notNullable().defaultTo(0)
    })
  }
  if (!(await knex.schema.hasColumn(tableName, 'actual_credit_balance'))) {
    await knex.schema.table(tableName, t => {
      t.decimal('actual_credit_balance', 12, 2).notNullable().defaultTo(0)
    })
  }
}

exports.down = async function (knex: Knex) {
  await knex.raw(`ALTER TABLE ${tableName} DROP COLUMN closing_credit_balance`)
  await knex.raw(`ALTER TABLE ${tableName} DROP COLUMN actual_credit_balance`)
}
