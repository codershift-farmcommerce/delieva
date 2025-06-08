import { Knex } from 'knex'

const TABLE_NAME = 'assigned_role'

export async function up(knex: Knex): Promise<void> {
  if (!(await knex.schema.hasTable(TABLE_NAME))) {
    return knex.schema.createTable(TABLE_NAME, table => {
      table.bigIncrements('id')
      table.string('user_email').references('email').inTable('users')
      table.string('role_code').references('code').inTable('user_role')

      table.unique(['user_email', 'role_code'])
    })
  }
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists(TABLE_NAME)
}
