import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  const cashRegisterWithdrawalCauses = await knex(
    'cash_register_withdrawal_cause',
  )
  if (cashRegisterWithdrawalCauses.length) {
    await knex('cause').insert(
      cashRegisterWithdrawalCauses.map(cause => ({
        cause_action_code: 'CASH_REGISTER_WITHDRAWAL',
        description: cause.description,
        created_at: cause.created_at,
        updated_at: cause.updated_at,
      })),
    )
  }

  const returnedPurchaseOrderCauses = await knex(
    'returned_purchase_order_cause',
  )
  if (returnedPurchaseOrderCauses.length) {
    await knex('cause').insert(
      returnedPurchaseOrderCauses.map(cause => ({
        cause_action_code: 'RETURNED_PURCHASE_ORDER',
        description: cause.description,
        created_at: cause.created_at,
        updated_at: cause.updated_at,
      })),
    )
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw('TRUNCATE TABLE cause;')
}
