import { Knex } from 'knex'

const TABLE_NAME = 'cash_register_withdrawal'

export async function up(knex: Knex): Promise<void> {
  if (!(await knex.schema.hasTable(TABLE_NAME))) {
    return knex.schema.createTable(TABLE_NAME, table => {
      table.bigIncrements('id')
      table
        .bigInteger('cash_register_id')
        .references('id')
        .inTable('cash_register')
      table
        .bigInteger('cash_register_withdrawal_cause_id')
        .references('id')
        .inTable('cash_register_withdrawal_cause')
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
