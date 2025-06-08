import { Knex } from 'knex'

const TABLE_NAME = 'customer'

export async function up(knex: Knex): Promise<void> {
    if (!(await knex.schema.hasTable(TABLE_NAME))) {
        return knex.schema.createTable(TABLE_NAME, table => {
            table.bigIncrements('id')
            table.string('name').notNullable()
            table.string('phone_number').notNullable()
            table.string('address').notNullable()
            table.string('city').notNullable()
            table.string('email').notNullable()
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
