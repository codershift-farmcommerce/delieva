import { Knex } from 'knex'

const TABLE_NAME = 'customer_credit_payment'

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
        .enum('form_of_payment', ['CASH', 'TRANSFER', 'CREDIT_CARD'])
        .notNullable()
        .defaultTo('CASH')
      table.decimal('amount', 12, 2).notNullable()
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
