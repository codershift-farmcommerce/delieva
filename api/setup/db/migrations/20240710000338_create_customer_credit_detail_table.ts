import { Knex } from 'knex'

const TABLE_NAME = 'customer_credit_detail'

export async function up(knex: Knex): Promise<void> {
  if (!(await knex.schema.hasTable(TABLE_NAME))) {
    return knex.schema.createTable(TABLE_NAME, table => {
      table.bigIncrements('id')
      table
        .bigInteger('customer_credit_id')
        .notNullable()
        .references('id')
        .inTable('customer_credit')
      table
        .bigInteger('purchase_order_payment_id')
        .notNullable()
        .references('id')
        .inTable('purchase_order_payment')
      table
        .timestamp('created_at')
        .notNullable()
        .defaultTo(knex.raw('CURRENT_TIMESTAMP'))
      table
        .timestamp('updated_at')
        .notNullable()
        .defaultTo(knex.raw('CURRENT_TIMESTAMP'))

      table.unique(['customer_credit_id', 'purchase_order_payment_id'])
    })
  }
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists(TABLE_NAME)
}
