import { Knex } from 'knex'

const TABLE_NAME = 'cash_register_other_income'

export async function up(knex: Knex): Promise<void> {
  if (!(await knex.schema.hasTable(TABLE_NAME))) {
    return knex.schema.createTable(TABLE_NAME, table => {
      table.bigIncrements('id')
      table
        .bigInteger('cash_register_id')
        .references('id')
        .inTable('cash_register')
      table.bigInteger('cause_id').references('id').inTable('cause')
      table.decimal('amount').notNullable()
      table
        .enum('form_of_payment', ['CASH', 'TRANSFER'])
        .notNullable()
        .defaultTo('CASH')
      table
        .bigInteger('cash_register_reconciliation_id')
        .notNullable()
        .defaultTo(0)

      table.bigInteger('transfer_bank_account_id')
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
