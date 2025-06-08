import { Knex } from 'knex'

const TABLE_NAME = 'user_authorization_code'

export async function up(knex: Knex): Promise<void> {
  if (!(await knex.schema.hasTable(TABLE_NAME))) {
    return knex.schema.createTable(TABLE_NAME, table => {
      table.bigIncrements('id')
      table.bigInteger('user_id').unique().references('id').inTable('users')
      table.string('code').nullable()
      table
        .timestamp('expiring_at')
        .notNullable()
        .defaultTo(knex.raw(`CURRENT_TIMESTAMP + interval '12' HOUR`))
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
