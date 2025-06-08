import { Knex } from 'knex'

const TABLE_NAME = 'cash_register'

export async function up(knex: Knex): Promise<void> {
  if (!(await knex.schema.hasTable(TABLE_NAME))) {
    return knex.schema.createTable(TABLE_NAME, table => {
      table.bigIncrements('id')
      table.string('barcode').nullable().unique()
      table.string('name').unique().notNullable()
      table.string('location_description').notNullable().defaultTo('')
      table
        .enum('status', ['IN_SERVICE', 'OUT_OF_SERVICE'])
        .notNullable()
        .defaultTo('IN_SERVICE')
      table.boolean('enabled').notNullable().defaultTo(true)
      table
        .timestamp('created_at')
        .notNullable()
        .defaultTo(knex.raw('CURRENT_TIMESTAMP'))
      table
        .timestamp('updated_at')
        .notNullable()
        .defaultTo(knex.raw('CURRENT_TIMESTAMP'))
    })
  }
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists(TABLE_NAME)
}
