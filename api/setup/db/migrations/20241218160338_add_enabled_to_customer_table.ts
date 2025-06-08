import { Knex } from 'knex'

const tableName = 'customer'

exports.up = async function (knex: Knex) {
  if (!(await knex.schema.hasColumn(tableName, 'enabled'))) {
    await knex.schema.table(tableName, t => {
      t.boolean('enabled').notNullable().defaultTo(true)
    })
  }
}

exports.down = async function (knex: Knex) {
  await knex.raw(`ALTER TABLE ${tableName} DROP COLUMN enabled`)
}
