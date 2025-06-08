import { Knex } from 'knex'

const customerInitBalance: { [customerId: number]: number } = {
  [69]: 2869.5,
}

export async function up(knex: Knex): Promise<void> {
  const creditPayments = await knex('purchase_order_payment')
    .innerJoin(
      'purchase_order',
      'purchase_order_payment.purchase_order_id',
      'purchase_order.id',
    )
    .innerJoin('customer', 'purchase_order.customer_id', 'customer.id')
    .select(
      'purchase_order.id AS purchase_order_id',
      'customer.id AS customer_id',
      'purchase_order_payment.amount AS amount',
      'purchase_order.created_at AS purchase_order_created_at',
    )
    .where('form_of_payment', 'CREDIT')
    .andWhere('purchase_order.status', 'PROCESSED')

  const creditPaymentsInserts = creditPayments.map(creditPayment => ({
    purchase_order_id: creditPayment.purchase_order_id,
    customer_id: creditPayment.customer_id,
    total: creditPayment.amount,
    paid: 0.0,
    status: 'PENDING',
    created_at: creditPayment.purchase_order_created_at,
  }))
  if (creditPaymentsInserts.length === 0) return
  await knex('credit_purchase_order').insert(creditPaymentsInserts)

  const creditPurchasePayments = await knex('customer_credit_payment')
    .select(
      'customer_credit_payment.id AS customer_credit_payment_id',
      'customer.id AS customer_id',
      'customer_credit_payment.amount AS customer_credit_payment_amount',
      'customer_credit_payment.created_at AS customer_credit_payment_created_at',
    )
    .innerJoin(
      'customer_credit',
      'customer_credit_payment.customer_credit_id',
      'customer_credit.id',
    )
    .innerJoin('customer', 'customer_credit.customer_id', 'customer.id')
    .orderBy('customer_credit_payment.created_at', 'asc')

  for await (const creditPurchasePayment of creditPurchasePayments) {
    const {
      customer_id,
      customer_credit_payment_amount,
      customer_credit_payment_created_at,
    } = creditPurchasePayment

    const topCreditPurchase = await knex('credit_purchase_order')
      .select('id', 'total', 'paid')
      .where('customer_id', customer_id)
      .andWhere('status', 'PENDING')
      .orderBy('created_at', 'asc')
      .first()

    if (!topCreditPurchase) {
      continue
    }
    let paymentAmount = Number(customer_credit_payment_amount)
    const customerIdNum = customer_id as number
    if (customerInitBalance[customerIdNum] > 0) {
      if (customerInitBalance[customerIdNum] >= paymentAmount) {
        customerInitBalance[customerIdNum] =
          customerInitBalance[customerIdNum] - paymentAmount
        continue
      } else {
        paymentAmount = paymentAmount - customerInitBalance[customerIdNum]
        customerInitBalance[customerIdNum] = 0
      }
    }

    let remainder = 0
    let newPaid = 0
    let newStatus = 'PENDING'
    const paidPlusNewPaymentAmount =
      Number(paymentAmount) + Number(topCreditPurchase.paid)
    if (paidPlusNewPaymentAmount >= Number(topCreditPurchase.total)) {
      remainder = paidPlusNewPaymentAmount - Number(topCreditPurchase.total)
      newPaid = Number(topCreditPurchase.total)
      newStatus = 'PAID'
    } else {
      newPaid = Number(paymentAmount)
    }

    await knex('credit_purchase_order')
      .update({
        paid: newPaid,
        status: newStatus,
        updated_at: customer_credit_payment_created_at,
      })
      .where('id', topCreditPurchase.id)

    while (remainder > 0) {
      const topCreditPurchase = await knex('credit_purchase_order')
        .select('id', 'total', 'paid')
        .where('customer_id', customer_id)
        .andWhere('status', 'PENDING')
        .orderBy('created_at', 'asc')
        .first()

      if (!topCreditPurchase) {
        break
      }

      let newPaid = 0
      let newStatus = 'PENDING'
      if (remainder >= Number(topCreditPurchase.total)) {
        remainder = remainder - Number(topCreditPurchase.total)
        newPaid = Number(topCreditPurchase.total)
        newStatus = 'PAID'
      } else {
        newPaid = remainder
        remainder = 0
      }

      await knex('credit_purchase_order')
        .update({
          paid: newPaid,
          status: newStatus,
          updated_at: creditPurchasePayment.customer_credit_payment_created_at,
        })
        .where('id', topCreditPurchase.id)
    }
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw('DELETE FROM credit_purchase_order;')
}
