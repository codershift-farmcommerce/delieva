import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('note', (table) => {
        table.bigIncrements('id').primary();
        table.string('entity_type', 255).notNullable();
        table.bigint('entity_id').notNullable();
        table.string('value', 50).notNullable();
        table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
        table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());

        // Create an index on entity_type and entity_id for faster lookups
        table.index(['entity_type', 'entity_id']);
    });

    // Add check constraint for allowed characters
    return knex.raw(
      "ALTER TABLE note ADD CONSTRAINT value_alphanumeric_check CHECK (value ~ '^[a-zA-Z0-9ñÑ\\s]*$')"
    );
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable('note');
}
