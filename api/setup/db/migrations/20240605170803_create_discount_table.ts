import { Knex } from 'knex'

const TABLE_NAME = 'discount'

export async function up(knex: Knex): Promise<void> {
  if (!(await knex.schema.hasTable(TABLE_NAME))) {
    return knex.schema.createTable(TABLE_NAME, table => {
      table.bigIncrements('id')
      table.bigInteger('customer_id').notNullable()
      table.string('product_code').notNullable()
      table
        .decimal('discount_percentage', 4, 4)
        .checkBetween([0, 1])
        .notNullable()
        .defaultTo(0)

      table.unique(['customer_id', 'product_code'])
    })
  }
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists(TABLE_NAME)
}
