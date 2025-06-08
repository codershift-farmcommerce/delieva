import { Knex } from 'knex'

const tableName = 'customer_credit_payment'

exports.up = async function (knex: Knex) {
  if (!(await knex.schema.hasColumn(tableName, 'previous_balance'))) {
    await knex.schema.table(tableName, t => {
      t.decimal('previous_balance', 12, 2).nullable()
    })
  }
  if (!(await knex.schema.hasColumn(tableName, 'new_balance'))) {
    await knex.schema.table(tableName, t => {
      t.decimal('new_balance', 12, 2).nullable()
    })
  }
}

exports.down = async function (knex: Knex) {
  await knex.raw(`ALTER TABLE ${tableName} DROP COLUMN previous_balance`)
  await knex.raw(`ALTER TABLE ${tableName} DROP COLUMN new_balance`)
}
