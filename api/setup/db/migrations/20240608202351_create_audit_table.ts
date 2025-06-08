import { Knex } from 'knex'

const TABLE_NAME = 'audit'

export async function up(knex: Knex): Promise<void> {
    if (!(await knex.schema.hasTable(TABLE_NAME))) {
        return knex.schema.createTable(TABLE_NAME, table => {
            table.bigIncrements('id')
            table.string('user_email')
            table.string('action_path')
            table.string('description')
            table.string('previous_value')
            table.string('new_value')
            table.string('ip')
            table.string('comments')
            table
                .enum('status', ['', 'UNDER_INVESTIGATION', 'SOLVED'])
                .notNullable()
                .defaultTo('')
            table
                .timestamp('performed_at')
                .notNullable()
                .defaultTo(knex.raw('CURRENT_TIMESTAMP'))    })
    }
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTableIfExists(TABLE_NAME)
}
