import { Knex } from 'knex'

const tableName = 'customer_credit_payment'

exports.up = async function (knex: Knex) {
    if (!(await knex.schema.hasColumn(tableName, 'cash_register_reconciliation_id'))) {
        await knex.schema.table(tableName, t => {
            t.bigInteger('cash_register_reconciliation_id').notNullable().defaultTo(0)
        })
    }
}

exports.down = async function (knex: Knex) {
    await knex.raw(`ALTER TABLE ${tableName} DROP COLUMN cash_register_reconciliation_id`)
}
