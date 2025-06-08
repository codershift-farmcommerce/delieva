import { Knex } from 'knex'

const TABLE_NAME = 'product'

export async function up(knex: Knex): Promise<void> {
    if (!(await knex.schema.hasTable(TABLE_NAME))) {
        return knex.schema.createTable(TABLE_NAME, table => {
            table.bigIncrements('id')
            table.string('code').unique().notNullable()
            table.string('name').notNullable()
            table.decimal('unit_price').notNullable()
            table.enum('unit_type', ['KILOGRAM', 'UNIT']).notNullable()
            table.boolean('enabled').notNullable().defaultTo(true)
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
