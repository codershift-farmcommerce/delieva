import { Knex } from 'knex'

const TABLE_NAME = 'returned_purchase_order_detail'

export async function up(knex: Knex): Promise<void> {
    if (!(await knex.schema.hasTable(TABLE_NAME))) {
        return knex.schema.createTable(TABLE_NAME, table => {
            table.bigIncrements('id')
            table.bigInteger('returned_purchase_order_id')
                .references('id')
                .inTable('returned_purchase_order')
                .notNullable()
            table.bigInteger('purchase_order_detail_id')
                .references('id')
                .inTable('purchase_order_detail')
                .notNullable()
            table.decimal('quantity', 10, 2).notNullable()
            table.decimal('unit_price', 10, 2).notNullable()
            table.decimal('total_price', 10, 2).notNullable()
            table.bigInteger('returned_purchase_order_cause_id')
                .references('id')
                .inTable('returned_purchase_order_cause')
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
