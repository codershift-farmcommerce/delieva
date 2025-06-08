import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  if (
    !(await knex.schema.hasColumn('returned_purchase_order_detail', 'cause_id'))
  ) {
    await knex.schema.table('returned_purchase_order_detail', t => {
      t.bigInteger('cause_id')
    })
  }

  const hasCauses = await knex('cause').limit(1)
  if (hasCauses.length) {
    await knex.raw(`
     UPDATE returned_purchase_order_detail
     SET cause_id = (SELECT id 
                     FROM cause 
                     WHERE cause_action_code = 'RETURNED_PURCHASE_ORDER_DETAIL' 
                        AND description = (SELECT description 
                                          FROM returned_purchase_order_cause
                                          WHERE returned_purchase_order_cause.id = returned_purchase_order_detail.returned_purchase_order_cause_id))
  `)
  }
}

export async function down(knex: Knex): Promise<void> {
  if (
    await knex.schema.hasColumn('returned_purchase_order_detail', 'cause_id')
  ) {
    await knex.raw(`ALTER TABLE returned_purchase_order DROP COLUMN cause_id`)
  }
}
