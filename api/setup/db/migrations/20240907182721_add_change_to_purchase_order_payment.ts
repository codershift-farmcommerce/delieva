import { Knex } from 'knex'

const tableName = 'purchase_order_payment'

exports.up = async function (knex: Knex) {
    if (!(await knex.schema.hasColumn(tableName, 'change'))) {
        await knex.schema.table(tableName, t => {
            t.decimal('change').notNullable().defaultTo(0)
        })
    }
}

exports.down = async function (knex: Knex) {
    await knex.raw(`ALTER TABLE ${tableName} DROP COLUMN change`)
}
