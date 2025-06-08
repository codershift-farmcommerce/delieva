import { Knex } from 'knex'

const TABLE_NAME = 'cash_register_reconciliation'

export async function up(knex: Knex): Promise<void> {
  if (!(await knex.schema.hasTable(TABLE_NAME))) {
    return knex.schema.createTable(TABLE_NAME, table => {
      table.bigIncrements('id')
      table
        .bigInteger('cash_register_id')
        .references('id')
        .inTable('cash_register')
      table.string('cashier_user_email').references('email').inTable('users')
      table.enum('status', ['OPENED', 'CLOSED']).notNullable()
      table.decimal('opening_cash_balance', 12, 2).notNullable().defaultTo(0)
      table.decimal('closing_cash_balance', 12, 2).notNullable().defaultTo(0)
      table
        .decimal('closing_credit_card_balance', 12, 2)
        .notNullable()
        .defaultTo(0)
      table
        .decimal('closing_credit_card_voucher_count')
        .notNullable()
        .defaultTo(0)
      table
        .decimal('closing_bank_transfer_balance', 12, 2)
        .notNullable()
        .defaultTo(0)
      table.decimal('actual_cash_balance', 12, 2).notNullable().defaultTo(0)
      table
        .decimal('actual_credit_card_balance', 12, 2)
        .notNullable()
        .defaultTo(0)
      table
        .decimal('actual_credit_card_voucher_count')
        .notNullable()
        .defaultTo(0)
      table.decimal('actual_bank_transfer_balance').notNullable().defaultTo(0)
      table
        .timestamp('created_at')
        .notNullable()
        .defaultTo(knex.raw('CURRENT_TIMESTAMP'))
      table
        .timestamp('updated_at')
        .notNullable()
        .defaultTo(knex.raw('CURRENT_TIMESTAMP'))
      table
        .timestamp('opened_at')
        .notNullable()
        .defaultTo(knex.raw('CURRENT_TIMESTAMP'))
      table
        .timestamp('closed_at')
        .notNullable()
        .defaultTo(knex.raw('CURRENT_TIMESTAMP'))

      table.index(['cash_register_id', 'status'])
      table.index(['cashier_user_email', 'status'])
    })
  }
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists(TABLE_NAME)
}
