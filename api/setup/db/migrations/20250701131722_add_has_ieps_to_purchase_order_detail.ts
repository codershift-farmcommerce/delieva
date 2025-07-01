import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    return knex.schema.alterTable('purchase_order_detail', (table) => {
        table.boolean('has_ieps').notNullable().defaultTo(false);
    });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.alterTable('purchase_order_detail', (table) => {
        table.dropColumn('has_ieps');
    });
}
