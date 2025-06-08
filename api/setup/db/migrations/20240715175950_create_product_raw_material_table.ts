import { Knex } from 'knex'

const TABLE_NAME = 'product_raw_material'

export async function up(knex: Knex): Promise<void> {
  if (!(await knex.schema.hasTable(TABLE_NAME))) {
    return knex.schema.createTable(TABLE_NAME, table => {
      table.bigIncrements('id')
      table
        .string('product_code')
        .references('code')
        .inTable('product')
        .notNullable()
      table
        .string('raw_material_code')
        .references('code')
        .inTable('raw_material')
        .notNullable()
      table
        .timestamp('created_at')
        .notNullable()
        .defaultTo(knex.raw('CURRENT_TIMESTAMP'))
      table
        .timestamp('updated_at')
        .notNullable()
        .defaultTo(knex.raw('CURRENT_TIMESTAMP'))

      table.index(['product_code', 'raw_material_code'])
    })
  }
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists(TABLE_NAME)
}
