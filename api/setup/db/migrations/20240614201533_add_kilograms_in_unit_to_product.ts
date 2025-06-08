import { Knex } from 'knex'

const tableName = 'product'
const columnName = 'kilograms_in_unit'

exports.up = async function (knex: Knex) {
    if (!(await knex.schema.hasColumn(tableName, columnName))) {
        await knex.schema.table(tableName, t => {
            t.decimal(columnName).notNullable().defaultTo(0)
        })
    }
}

exports.down = async function (knex: Knex) {
    await knex.raw(`ALTER TABLE ${tableName} DROP COLUMN ${columnName}`)
}
