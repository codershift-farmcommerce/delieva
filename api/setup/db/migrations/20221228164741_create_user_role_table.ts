import { Knex } from 'knex'

const TABLE_NAME = 'user_role'

export async function up(knex: Knex): Promise<void> {
  if (!(await knex.schema.hasTable(TABLE_NAME))) {
    await knex.schema.createTable(TABLE_NAME, table => {
      table.bigIncrements('id')
      table.string('name').unique().notNullable()
      table.integer('assignation_limit')
    })
    return knex.raw(`
        ALTER TABLE ${TABLE_NAME} 
            ADD code varchar(200) UNIQUE GENERATED ALWAYS
                AS (UPPER(REGEXP_REPLACE(name, ' ','_\\1', 'g'))) STORED;
    `)
  }
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists(TABLE_NAME)
}
