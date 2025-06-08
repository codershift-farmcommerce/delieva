import { Knex } from 'knex'

const tableName = 'product'
const unitType = 'unit_type'
const kilogramsInUnit = 'kilograms_in_unit'

exports.up = async function (knex: Knex) {
  if (await knex.schema.hasColumn(tableName, unitType)) {
    await knex.raw(`ALTER TABLE ${tableName} DROP COLUMN ${unitType}`)
  }
  if (await knex.schema.hasColumn(tableName, kilogramsInUnit)) {
    await knex.raw(`ALTER TABLE ${tableName} DROP COLUMN ${kilogramsInUnit}`)
  }
}

exports.down = async function (knex: Knex) {
  if (!(await knex.schema.hasColumn(tableName, unitType))) {
    await knex.schema.table(tableName, t => {
      t.decimal(unitType).nullable()
    })
  }
  if (!(await knex.schema.hasColumn(tableName, kilogramsInUnit))) {
    await knex.schema.table(tableName, t => {
      t.decimal(kilogramsInUnit).notNullable().defaultTo(0)
    })
  }
}
