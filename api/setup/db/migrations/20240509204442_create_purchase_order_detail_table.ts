import { Knex } from 'knex'

const TABLE_NAME = 'purchase_order_detail'

export async function up(knex: Knex): Promise<void> {
  if (!(await knex.schema.hasTable(TABLE_NAME))) {
    return knex.schema.createTable(TABLE_NAME, table => {
      table.bigIncrements('id')
      table.bigInteger('purchase_order_id').notNullable()
      table.string('product_code').notNullable()
      table.decimal('quantity').notNullable()
      table.decimal('unit_price').notNullable()
      table.decimal('discount').notNullable()
      table.decimal('detail_total').notNullable()
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
