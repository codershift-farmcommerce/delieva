import { Knex } from 'knex'

const tableName = 'purchase_order_payment'

export async function up(knex: Knex) {
  let existRows: any[]
  return knex
    .select()
    .from(tableName)
    .then((rows: any) => {
      existRows = rows
      return knex.schema.table(tableName, (table: any) =>
        table.dropColumn('form_of_payment'),
      )
    })
    .then(() =>
      knex.schema.table(tableName, (table: any) =>
        table.string('form_of_payment').notNullable().defaultTo('CASH'),
      ),
    )
    .then(() => {
      return Promise.all(
        existRows.map(row => {
          return knex(tableName)
            .update({ form_of_payment: row.form_of_payment })
            .where('id', row.id)
        }),
      )
    })
}

export async function down(knex: Knex) {
  let existRows: any[]
  return knex
    .select()
    .from(tableName)
    .then(rows => {
      existRows = rows
      return knex.schema.table(tableName, table =>
        table.dropColumn('form_of_payment'),
      )
    })
    .then(() =>
      knex.schema.table(tableName, table =>
        table
          .enum('form_of_payment', [
            'CASH',
            'TRANSFER',
            'CREDIT_CARD',
            'CREDIT',
          ])
          .notNullable()
          .defaultTo('CASH'),
      ),
    )
    .then(() => {
      return Promise.all(
        existRows.map(row => {
          return knex(tableName)
            .update({
              form_of_payment: row.form_of_payment,
            })
            .where('id', row.id)
        }),
      )
    })
}
