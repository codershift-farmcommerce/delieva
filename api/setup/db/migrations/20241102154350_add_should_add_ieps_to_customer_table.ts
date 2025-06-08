import { Knex } from 'knex'

const tableName = 'customer'

exports.up = async function (knex: Knex) {
  if (!(await knex.schema.hasColumn(tableName, 'should_add_ieps'))) {
    await knex.schema.table(tableName, t => {
      t.boolean('should_add_ieps').notNullable().defaultTo(false)
    })
  }
}

exports.down = async function (knex: Knex) {
  await knex.raw(`ALTER TABLE ${tableName} DROP COLUMN should_add_ieps`)
}
