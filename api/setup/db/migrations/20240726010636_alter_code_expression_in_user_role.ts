import { Knex } from 'knex'

const TABLE_NAME = 'user_role'

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
        ALTER TABLE ${TABLE_NAME} 
            ALTER COLUMN code DROP EXPRESSION IF EXISTS;
    `)
}

export async function down(knex: Knex): Promise<void> {}
