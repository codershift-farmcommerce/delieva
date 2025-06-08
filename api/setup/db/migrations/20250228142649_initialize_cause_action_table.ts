import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex('cause_action').insert([
    {
      code: 'CASH_REGISTER_WITHDRAWAL',
      description: 'Cash Register Withdrawal',
    },
    {
      code: 'RETURNED_PURCHASE_ORDER',
      description: 'Returned Purchase Order',
    },
    {
      code: 'RETURNED_PURCHASE_ORDER_DETAIL',
      description: 'Returned Purchase Order Detail',
    },
    {
      code: 'CASH_REGISTER_OTHER_INCOME',
      description: 'Cash Register Other Income',
    },
    {
      code: 'CASH_REGISTER_WITHDRAWAL_CANCELLATION',
      description: 'Cash Register Withdrawal Cancellation',
    },
    {
      code: 'CUSTOMER_CREDIT_PAYMENT_CANCELLATION',
      description: 'Customer Credit Payment Cancellation',
    },
  ])
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw('DELETE FROM cause_action;')
}
