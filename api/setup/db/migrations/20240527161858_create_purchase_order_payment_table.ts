import { Knex } from 'knex'

const TABLE_NAME = 'purchase_order_payment'

export async function up(knex: Knex): Promise<void> {
  if (!(await knex.schema.hasTable(TABLE_NAME))) {
    return knex.schema.createTable(TABLE_NAME, table => {
      table.bigIncrements('id')
      table.bigInteger('purchase_order_id').notNullable()
      table
        .enum('form_of_payment', ['CASH', 'TRANSFER', 'CREDIT_CARD'])
        .notNullable()
        .defaultTo('CASH')
      table.decimal('amount').notNullable()
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
