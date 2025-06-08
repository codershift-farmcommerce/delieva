import { Knex } from 'knex'

const TABLE_NAME = 'purchase_order'

export async function up(knex: Knex): Promise<void> {
    if (!(await knex.schema.hasTable(TABLE_NAME))) {
        return knex.schema.createTable(TABLE_NAME, table => {
            table.bigIncrements('id')
            table.bigInteger('customer_id').notNullable()
            table.decimal('subtotal').notNullable()
            table.decimal('discount').notNullable()
            table.decimal('tax1').notNullable()
            table.decimal('total').notNullable()
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
