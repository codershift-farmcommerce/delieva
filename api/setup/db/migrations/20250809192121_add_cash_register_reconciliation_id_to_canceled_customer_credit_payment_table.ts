import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('canceled_customer_credit_payment', (table) => {
    table.bigInteger('cash_register_reconciliation_id');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable('canceled_customer_credit_payment', (table) => {
    table.dropColumn('cash_register_reconciliation_id');
  });
}
