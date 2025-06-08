import { Knex } from 'knex'

const tableName = 'discount'

exports.up = async function (knex: Knex) {
  if (!(await knex.schema.hasColumn(tableName, 'type'))) {
    await knex.schema.table(tableName, t => {
      t.enum('type', ['PERCENTAGE', 'FLAT_AMOUNT', 'FIXED_PRICE'])
        .notNullable()
        .defaultTo('PERCENTAGE')
      t.decimal('discount_flat_amount', 10, 2).notNullable().defaultTo(0)
      t.decimal('fixed_price', 10, 2).nullable().notNullable().defaultTo(0)
    })
  }
}

exports.down = async function (knex: Knex) {
  await knex.raw(`ALTER TABLE ${tableName} DROP COLUMN type`)
  await knex.raw(`ALTER TABLE ${tableName} DROP COLUMN discount_flat_amount`)
  await knex.raw(`ALTER TABLE ${tableName} DROP COLUMN fixed_price`)
}
