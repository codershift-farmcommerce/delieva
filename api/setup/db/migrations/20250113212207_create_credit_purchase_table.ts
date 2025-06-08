import { Knex } from 'knex'

const TABLE_NAME = 'credit_purchase_order'

export async function up(knex: Knex): Promise<void> {
  if (!(await knex.schema.hasTable(TABLE_NAME))) {
    return knex.schema.createTable(TABLE_NAME, table => {
      table.bigIncrements('id')
      table.bigInteger('purchase_order_id').notNullable()
      table.bigInteger('customer_id').notNullable()
      table.decimal('total', 10, 2).notNullable().defaultTo(0)
      table.decimal('paid', 10, 2).notNullable().defaultTo(0)
      table
        .enum('status', ['PENDING', 'PAID', 'CANCELLED'])
        .notNullable()
        .defaultTo('PENDING')
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
