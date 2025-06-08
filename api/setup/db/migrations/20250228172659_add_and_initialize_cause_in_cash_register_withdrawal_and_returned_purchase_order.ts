import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  if (!(await knex.schema.hasColumn('cash_register_withdrawal', 'cause_id'))) {
    await knex.schema.table('cash_register_withdrawal', t => {
      t.bigInteger('cause_id')
    })
  }
  if (!(await knex.schema.hasColumn('returned_purchase_order', 'cause_id'))) {
    await knex.schema.table('returned_purchase_order', t => {
      t.bigInteger('cause_id')
    })
  }

  const hasCauses = await knex('cause').limit(1)
  if (hasCauses.length) {
    await knex.raw(`
     UPDATE cash_register_withdrawal
     SET cause_id = (SELECT id 
                     FROM cause 
                     WHERE cause_action_code = 'CASH_REGISTER_WITHDRAWAL' 
                        AND description = (SELECT description 
                                          FROM cash_register_withdrawal_cause
                                          WHERE cash_register_withdrawal_cause.id = cash_register_withdrawal.cash_register_withdrawal_cause_id))
  `)

    await knex.raw(`
     UPDATE returned_purchase_order
     SET cause_id = (SELECT id 
                     FROM cause 
                     WHERE cause_action_code = 'RETURNED_PURCHASE_ORDER' 
                       AND description = (SELECT description 
                                          FROM returned_purchase_order_cause
                                          WHERE returned_purchase_order_cause.id = returned_purchase_order.returned_purchase_order_cause_id))
  `)
  }
}

export async function down(knex: Knex): Promise<void> {
  if (await knex.schema.hasColumn('cash_register_withdrawal', 'cause_id')) {
    await knex.raw(`ALTER TABLE cash_register_withdrawal DROP COLUMN cause_id`)
  }
  if (await knex.schema.hasColumn('returned_purchase_order', 'cause_id')) {
    await knex.raw(`ALTER TABLE returned_purchase_order DROP COLUMN cause_id`)
  }
}
