import { Ctx } from 'api/src/app/context'
import {
  CustomerCreditAddPaymentRQ,
  CustomerCreditCancelPaymentRQ,
  CustomerCreditGetCustomerCreditPurchaseOrdersReportRQ,
  CustomerCreditGetForCustomerRQ,
  CustomerCreditGetPaymentReceiptRQ,
  CustomerCreditGetPaymentRQ,
  CustomerCreditGetPaymentsByCustomerRQ,
  CustomerCreditGetPaymentsOfCurrentOpenReconciliationRQ,
  CustomerCreditGetUnpaidPurchaseOrdersRQ,
  CustomerCreditListRQ,
} from 'interface/requests/customer_credit'
import {
  CustomerCreditAddPaymentRS,
  CustomerCreditCancelPaymentRS,
  CustomerCreditGetCustomerCreditPurchaseOrdersReportRS,
  CustomerCreditGetForCustomerRS,
  CustomerCreditGetPaymentReceiptRS,
  CustomerCreditGetPaymentRS,
  CustomerCreditGetPaymentsGetByCustomerRS,
  CustomerCreditGetPaymentsOfCurrentOpenReconciliationRS,
  CustomerCreditGetUnpaidPurchaseOrdersRS,
  CustomerCreditListRS,
} from 'interface/responses/customer_credit'
import { Knex } from 'knex'
import {
  getAssignedCashRegister,
  getOpenedReconciliation,
  updateCashRegisterReconciliationWithTrx,
} from './cash_register'
import {
  FormOfPayment,
  FormOfPaymentWithAmount,
} from 'interface/entities/purchase_order'
import * as transfer_bank_account_model from './transfer_bank_account'
import {
  CustomerCreditPaymentForBankAccount,
  CustomerCreditPaymentForReconciliationReceipt,
  CustomerCreditPaymentStatus,
} from 'interface/entities/customer_credit'
import Transaction = Knex.Transaction
import { withSpan } from 'api/src/util/tracing/tracer'

type CustomerCreditGetPaymentReceiptRawSQL = {
  customer_credit_payment_id: string
  customer_name: string
  previous_balance: string
  payment_amount: string
  new_balance: string
  created_at: string
  form_of_payment: FormOfPayment
  transfer_bank_account_name: string
  status: CustomerCreditPaymentStatus
}

export async function list(
  ctx: Ctx,
  _req: CustomerCreditListRQ,
): Promise<CustomerCreditListRS> {
  const credits = await ctx
    .knex('customer_credit')
    .select('customer.name AS customer_name', 'credits_total', 'payments_total')
    .innerJoin('customer', 'customer_credit.customer_id', 'customer.id')

  return {
    credits,
  }
}

export async function getForCustomer(
  ctx: Ctx,
  req: CustomerCreditGetForCustomerRQ,
): Promise<CustomerCreditGetForCustomerRS> {
  const result = await ctx
    .knex('customer_credit')
    .select('credits_total', 'payments_total')
    .where('customer_id', req.customer_id)
    .first()

  const credit = {
    customer_name: '',
    credits_total: result?.credits_total || 0,
    payments_total: result?.payments_total || 0,
  }

  return {
    credit,
  }
}

export async function addCreditDetail(
  trx: Transaction,
  params: {
    customer_id: number
    purchase_order_payment_id: number
    amount: number
  },
): Promise<void> {
  const { customer_id, purchase_order_payment_id, amount } = params

  const existingCustomerCredit = await trx('customer_credit')
    .select('id')
    .where('customer_id', customer_id)
    .first()

  let customerCreditId

  if (existingCustomerCredit) {
    customerCreditId = existingCustomerCredit.id
    await trx('customer_credit')
      .where('id', customerCreditId)
      .increment('credits_total', amount)
  } else {
    const newCustomerCredit = await trx('customer_credit')
      .insert({
        customer_id,
        credits_total: amount,
        payments_total: 0,
      })
      .returning('id')
    customerCreditId = newCustomerCredit[0].id
  }

  await trx('customer_credit_detail').insert({
    customer_credit_id: customerCreditId,
    purchase_order_payment_id: purchase_order_payment_id,
  })
}

export async function addPayment(
  ctx: Ctx,
  req: CustomerCreditAddPaymentRQ,
): Promise<CustomerCreditAddPaymentRS> {
  const { customer_id, form_of_payment } = req
  const cashRegisterId = (await getAssignedCashRegister(ctx, {})).cash_register
    .id
  const cashRegisterReconciliation = await getOpenedReconciliation(
    ctx,
    cashRegisterId,
  )
  let paymentId = 0
  try {
    await ctx.knex.transaction(async trx => {
      const customerCredit = await trx('customer_credit')
        .select('id', 'credits_total', 'payments_total')
        .where('customer_id', customer_id)
        .first()
      if (!customerCredit) {
        throw new Error('Customer credit not found')
      }

      const customerCreditBalance =
        Number(customerCredit.credits_total) -
        Number(customerCredit.payments_total)

      const paymentResult = await trx('customer_credit_payment')
        .insert({
          customer_credit_id: customerCredit.id,
          form_of_payment: form_of_payment.form_of_payment,
          previous_balance: customerCreditBalance,
          amount: form_of_payment.amount,
          new_balance: customerCreditBalance - form_of_payment.amount,
          transfer_bank_account_id: form_of_payment.transfer_bank_account_id,
          cash_register_reconciliation_id: cashRegisterReconciliation.id,
        })
        .returning('id')

      paymentId = paymentResult[0].id

      await trx('customer_credit')
        .where('id', customerCredit.id)
        .increment('payments_total', form_of_payment.amount)

      await updateCashRegisterReconciliationWithTrx(
        ctx,
        trx,
        cashRegisterId,
        [form_of_payment],
        form_of_payment.amount,
      )

      await updateCreditPurchaseOrderWithTrx(
        ctx,
        trx,
        customer_id,
        form_of_payment.amount,
      )
    })

    return {
      payment_id: paymentId,
      success: true,
    }
  } catch (error) {
    return {
      payment_id: 0,
      success: false,
      error_message: (error as Error).message,
    }
  }
}

export async function cancelPayment(
  ctx: Ctx,
  req: CustomerCreditCancelPaymentRQ,
  authorizedByUserEmail: string,
): Promise<CustomerCreditCancelPaymentRS> {
  const { customer_credit_payment_id, cause_id } = req
  const cashRegisterId = (await getAssignedCashRegister(ctx, {})).cash_register
    .id
  try {
    await ctx.knex.transaction(async trx => {
      const payment = await trx('customer_credit_payment')
        .select('id', 'customer_credit_id', 'amount', 'form_of_payment')
        .where({
          id: customer_credit_payment_id,
        })
        .first()
      const customerCredit = await trx('customer_credit')
        .select('id', 'customer_id')
        .where('id', payment.customer_credit_id)
        .first()
      if (!customerCredit) {
        throw new Error('Customer credit not found')
      }
      if (!payment) {
        throw new Error('Payment not found!')
      }
      await trx('customer_credit_payment')
        .update({
          status: CustomerCreditPaymentStatus.CANCELED,
        })
        .where({
          id: customer_credit_payment_id,
        })

      const currentOpenReconciliation = await trx(
        'cash_register_reconciliation',
      )
        .select('id')
        .where('cash_register_id', cashRegisterId)
        .andWhere('status', 'OPENED')
        .first()

      await trx('canceled_customer_credit_payment').insert({
        customer_credit_payment_id: customer_credit_payment_id,
        cause_id,
        authorized_by: authorizedByUserEmail,
        cash_register_reconciliation_id: Number(currentOpenReconciliation.id),
      })

      await trx('customer_credit')
        .where('id', customerCredit.id)
        .decrement('payments_total', payment.amount)

      const formOfPayment: FormOfPaymentWithAmount = {
        form_of_payment: FormOfPayment.CASH,
        amount: payment.amount,
        change: 0,
      }

      await updateCashRegisterReconciliationWithTrx(
        ctx,
        trx,
        cashRegisterId,
        [formOfPayment],
        payment.amount,
      )

      await revertCreditPurchaseOrderWithTrx(
        ctx,
        trx,
        customerCredit.customer_id,
        payment.amount,
      )
    })

    return {
      success: true,
    }
  } catch (error) {
    return {
      success: false,
      error: {
        message: (error as Error).message,
      },
    }
  }
}

async function updateCreditPurchaseOrderWithTrx(
  ctx: Ctx,
  trx: Transaction,
  customer_id: number,
  amount: number,
) {
  const topCreditPurchase = await trx('credit_purchase_order')
    .where('customer_id', customer_id)
    .andWhere('status', 'PENDING')
    .orderBy('created_at', 'asc')
    .first()

  if (topCreditPurchase) {
    let remainder = 0
    let newPaid = 0
    let newStatus = 'PENDING'
    const paidPlusNewPaymentAmount =
      Number(amount) + Number(topCreditPurchase.paid)
    if (paidPlusNewPaymentAmount >= Number(topCreditPurchase.total)) {
      remainder = paidPlusNewPaymentAmount - Number(topCreditPurchase.total)
      newPaid = Number(topCreditPurchase.total)
      newStatus = 'PAID'
    } else {
      newPaid = Number(amount)
    }

    await trx('credit_purchase_order')
      .update({
        paid: newPaid,
        status: newStatus,
        updated_at: ctx.knex.fn.now(),
      })
      .where('id', topCreditPurchase.id)
    debugger
    while (remainder > 0) {
      const topCreditPurchase = await trx('credit_purchase_order')
        .select('id', 'total', 'paid')
        .where('customer_id', customer_id)
        .andWhere('status', 'PENDING')
        .orderBy('created_at', 'asc')
        .first()

      if (topCreditPurchase) {
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

        await trx('credit_purchase_order')
          .update({
            paid: newPaid,
            status: newStatus,
            updated_at: ctx.knex.fn.now(),
          })
          .where('id', topCreditPurchase.id)
      } else {
        remainder = 0
      }
    }
  }
}

async function revertCreditPurchaseOrderWithTrx(
  ctx: Ctx,
  trx: Transaction,
  customer_id: number,
  canceledAmount: number,
) {
  const topCreditPurchase = await trx('credit_purchase_order')
    .where('customer_id', customer_id)
    .andWhere('status', 'PAID')
    .orderBy('created_at', 'asc')
    .first()

  if (topCreditPurchase) {
    let remainder = 0
    let newPaid = 0
    let newStatus = 'PAID'
    const paymentAmountMinusCanceledPaid =
      Number(topCreditPurchase.paid) - Number(canceledAmount)
    if (paymentAmountMinusCanceledPaid < 0.01) {
      remainder = Number(canceledAmount) - Number(topCreditPurchase.paid)
      newPaid = 0
      newStatus = 'PENDING'
    } else {
      newPaid = Number(paymentAmountMinusCanceledPaid)
    }

    await trx('credit_purchase_order')
      .update({
        paid: newPaid,
        status: newStatus,
        updated_at: ctx.knex.fn.now(),
      })
      .where('id', topCreditPurchase.id)

    while (remainder > 0) {
      const topCreditPurchase = await trx('credit_purchase_order')
        .select('id', 'total', 'paid')
        .where('customer_id', customer_id)
        .andWhere('status', 'PAID')
        .orderBy('created_at', 'asc')
        .first()

      if (topCreditPurchase) {
        let newPaid = Number(topCreditPurchase.paid)
        let newStatus = 'PAID'
        const paymentAmountMinusRemainder =
          Number(topCreditPurchase.paid) - Number(remainder)
        if (paymentAmountMinusRemainder < 0.01) {
          remainder = Number(remainder) - Number(topCreditPurchase.paid)
          newPaid = 0
          newStatus = 'PENDING'
        } else {
          newPaid = Number(paymentAmountMinusRemainder)
          remainder = 0
        }

        await trx('credit_purchase_order')
          .update({
            paid: newPaid,
            status: newStatus,
            updated_at: ctx.knex.fn.now(),
          })
          .where('id', topCreditPurchase.id)
      } else {
        remainder = 0
      }
    }
  }
}

export async function getPaymentReceipt(
  ctx: Ctx,
  req: CustomerCreditGetPaymentReceiptRQ,
): Promise<CustomerCreditGetPaymentReceiptRS> {
  const payment: CustomerCreditGetPaymentReceiptRawSQL = await ctx
    .knex('customer_credit_payment')
    .select(
      'customer_credit_payment.id AS customer_credit_payment_id',
      'customer.name AS customer_name',
      'customer_credit_payment.previous_balance AS previous_balance',
      'customer_credit_payment.amount AS payment_amount',
      'customer_credit_payment.new_balance AS new_balance',
      'customer_credit_payment.created_at',
      'customer_credit_payment.form_of_payment',
      'transfer_bank_account.name AS transfer_bank_account_name',
    )
    .innerJoin(
      'customer_credit',
      'customer_credit_payment.customer_credit_id',
      'customer_credit.id',
    )
    .innerJoin('customer', 'customer_credit.customer_id', 'customer.id')
    .leftJoin(
      'transfer_bank_account',
      'transfer_bank_account.id',
      'customer_credit_payment.transfer_bank_account_id',
    )
    .where('customer_credit_payment.id', req.customer_credit_payment_id)
    .first()

  return {
    receipt: {
      id: Number(payment.customer_credit_payment_id),
      customer_name: payment.customer_name,
      previous_balance: payment.previous_balance
        ? Number(payment.previous_balance)
        : null,
      payment_amount: Number(payment.payment_amount),
      new_balance: payment.new_balance ? Number(payment.new_balance) : null,
      created_at: payment.created_at,
      form_of_payment: payment.form_of_payment,
      transfer_bank_account_name: payment.transfer_bank_account_name,
    },
  }
}

export async function getPaymentsByCustomer(
  ctx: Ctx,
  req: CustomerCreditGetPaymentsByCustomerRQ,
): Promise<CustomerCreditGetPaymentsGetByCustomerRS> {
  const payments: CustomerCreditGetPaymentReceiptRawSQL[] = await ctx
    .knex('customer_credit_payment')
    .select(
      'customer_credit_payment.id AS customer_credit_payment_id',
      'customer.name AS customer_name',
      'customer_credit_payment.previous_balance AS previous_balance',
      'customer_credit_payment.amount AS payment_amount',
      'customer_credit_payment.new_balance AS new_balance',
      'customer_credit_payment.created_at',
      'customer_credit_payment.status',
    )
    .innerJoin(
      'customer_credit',
      'customer_credit_payment.customer_credit_id',
      'customer_credit.id',
    )
    .innerJoin('customer', 'customer_credit.customer_id', 'customer.id')
    .where('customer_credit.customer_id', req.customer_id)
    .orderBy('customer_credit_payment.id', 'desc')

  return {
    payments: payments.map(payment => ({
      id: Number(payment.customer_credit_payment_id),
      customer_name: payment.customer_name,
      previous_balance: Number(payment.previous_balance),
      payment_amount: Number(payment.payment_amount),
      new_balance: Number(payment.new_balance),
      created_at: payment.created_at,
      status: payment.status,
    })),
  }
}

export async function getForReconciliationReceipt(
  ctx: Ctx,
  reconciliationId: number,
): Promise<CustomerCreditPaymentForReconciliationReceipt> {
  const cashCreditPayments = await getForReconciliationReceiptByFormOfPayment(
    ctx,
    reconciliationId,
    FormOfPayment.CASH,
  )

  const canceledCashCreditPayments =
    await getCanceledCashPaymentsForReconciliationReceipt(ctx, reconciliationId)

  const { transfer_bank_accounts } = await transfer_bank_account_model.list(
    ctx,
    {
      query: '*',
      page: 1,
    },
  )

  const creditPaymentsForBankAccounts: CustomerCreditPaymentForBankAccount = {}

  for await (let transferBankAccount of transfer_bank_accounts) {
    const customerPayments = await getForReconciliationReceiptByFormOfPayment(
      ctx,
      reconciliationId,
      FormOfPayment.TRANSFER,
      transferBankAccount.id,
    )
    const total = customerPayments.reduce(
      (acc: number, purchaseOrder: { amount: number }) =>
        acc + Number(purchaseOrder.amount),
      0,
    )

    creditPaymentsForBankAccounts[transferBankAccount.id] = {
      bank_account_name: transferBankAccount.name,
      total,
      credit_payment: customerPayments,
    }
  }

  let total = cashCreditPayments.reduce(
    (acc: number, purchaseOrder: { amount: number }) =>
      acc + Number(purchaseOrder.amount),
    0,
  )
  total += Object.keys(creditPaymentsForBankAccounts).reduce(
    (acc: number, bankAccountId: string) => {
      const bankAccount = creditPaymentsForBankAccounts[Number(bankAccountId)]
      acc += bankAccount.total
      return acc
    },
    0,
  )

  return {
    cash_credit_payments: cashCreditPayments,
    canceled_cash_credit_payments: canceledCashCreditPayments,
    credit_payments_by_transfer_bank_account: creditPaymentsForBankAccounts,
    total,
  }
}

async function getForReconciliationReceiptByFormOfPayment(
  ctx: Ctx,
  reconciliationId: number,
  formOfPayment: FormOfPayment,
  transferBankAccountId?: number,
) {
  const bankAccountFilter = transferBankAccountId
    ? ' AND transfer_bank_account_id = :transferBankAccountId'
    : ''
  const result = await ctx.knex.raw(
    `
        SELECT
          customer_credit_payment.id AS customer_credit_payment_id,
          customer.name AS customer_name,
          customer_credit_payment.amount AS amount
        FROM customer_credit_payment
        INNER JOIN public.customer_credit on customer_credit.id = customer_credit_payment.customer_credit_id
        INNER JOIN public.customer on customer.id = customer_credit.customer_id
        WHERE form_of_payment = :formOfPayment
        AND customer_credit_payment.cash_register_reconciliation_id = :reconciliationId
        AND customer_credit_payment.status = 'PROCESSED'
        ${bankAccountFilter};
    `,
    { reconciliationId, formOfPayment, transferBankAccountId },
  )

  return result.rows
}
async function getCanceledCashPaymentsForReconciliationReceipt(
  ctx: Ctx,
  reconciliationId: number,
) {
  const result = await ctx.knex.raw(
    `
        SELECT
          customer_credit_payment.id AS customer_credit_payment_id,
          customer.name AS customer_name,
          customer_credit_payment.amount AS amount
        FROM customer_credit_payment
        INNER JOIN public.canceled_customer_credit_payment on customer_credit_payment.id = canceled_customer_credit_payment.customer_credit_payment_id
        INNER JOIN public.customer_credit on customer_credit.id = customer_credit_payment.customer_credit_id
        INNER JOIN public.customer on customer.id = customer_credit.customer_id
        WHERE form_of_payment = 'CASH'
        AND canceled_customer_credit_payment.cash_register_reconciliation_id = :reconciliationId
        AND customer_credit_payment.status = 'CANCELED';
    `,
    { reconciliationId },
  )

  return result.rows
}

export async function getUnpaidPurchaseOrders(
  ctx: Ctx,
  req: CustomerCreditGetUnpaidPurchaseOrdersRQ,
): Promise<CustomerCreditGetUnpaidPurchaseOrdersRS> {
  const unpaidPurchaseOrders = await ctx.knex.raw(`
    SELECT id, t2.amount, CASE
    WHEN remainder >= 0 THEN t2.amount
    ELSE ABS(remainder)
    END AS pagado
FROM (SELECT id, amount, previous_amount - amount AS remainder
               FROM (SELECT pop.id,
                            cc.payments_total,
                            pop.amount,
                            COALESCE(LAG(cc.payments_total - pop.amount, 1) OVER (ORDER BY pop.created_at),
                                     cc.payments_total) as previous_amount,
                            pop.created_at
                     FROM customer_credit_detail
                              INNER JOIN public.customer_credit cc ON cc.id = customer_credit_detail.customer_credit_id
                              INNER JOIN public.purchase_order_payment pop
                                         ON pop.id = customer_credit_detail.purchase_order_payment_id
                              INNER JOIN public.purchase_order po on po.id = pop.purchase_order_id
                     WHERE po.customer_id = 5
                     AND po.status = 'PROCESSED'
                     ORDER BY pop.created_at) as t1) as t2;
    `)

  return {
    unpaid_purchase_orders: [],
  }
}

export async function getCustomerCreditPurchaseOrdersReport(
  ctx: Ctx,
  req: CustomerCreditGetCustomerCreditPurchaseOrdersReportRQ,
): Promise<CustomerCreditGetCustomerCreditPurchaseOrdersReportRS> {
  const { customer_id } = req

  const purchaseOrdersResult = await withSpan(ctx, 'purchaseOrdersResult', () => {
    return ctx.knex.raw(
      `
    SELECT 
        purchase_order_id, 
        total, 
        paid,
        created_at
    FROM credit_purchase_order
    WHERE customer_id = :customerId
    AND status != 'CANCELLED'
    ORDER BY created_at DESC
  `,
      { customerId: customer_id },
    )
  })

  const purchaseOrders = purchaseOrdersResult.rows.map((row: any) => ({
    order_id: row.purchase_order_id,
    total: row.total,
    paid: row.paid,
    created_at: row.created_at,
  }))

  const creditPaymentsResult = await ctx.knex.raw(
    `
    SELECT 
        customer_credit_payment.id,
        customer_credit_payment.amount,
        customer_credit_payment.created_at
    FROM customer_credit_payment
        INNER JOIN customer_credit ON customer_credit.id = customer_credit_payment.customer_credit_id
        INNER JOIN customer ON customer.id = customer_credit.customer_id
    WHERE customer.id = :customerId
    AND customer_credit_payment.status != 'CANCELED'
    ORDER BY customer_credit_payment.created_at DESC
  `,
    { customerId: customer_id },
  )

  const payments = creditPaymentsResult.rows.map((row: any) => ({
    id: row.id,
    payment_amount: row.amount,
    created_at: row.created_at,
  }))

  const credit_balance = await ctx
    .knex('customer_credit')
    .select('credits_total', 'payments_total')
    .where('customer_id', customer_id)
    .first()

  if (!credit_balance) {
    return {
      purchase_orders: [],
      payments: [],
      credit_balance: 0,
      credit_purchases_amount_not_in_system: 0,
      credit_payments_amount_not_in_system: 0,
    }
  }

  const creditPurchaseOrdersTotal = purchaseOrders.reduce(
    (acc: number, purchaseOrder: { total: number; paid: number }) =>
      acc + Number(purchaseOrder.total) - Number(purchaseOrder.paid),
    0,
  )

  const paymentsTotal = payments.reduce(
    (acc: number, payment: { payment_amount: number }) =>
      acc + Number(payment.payment_amount),
    0,
  )

  return {
    purchase_orders: purchaseOrders,
    payments,
    credit_balance:
      Number(credit_balance.credits_total) -
      Number(credit_balance.payments_total),
    credit_purchases_amount_not_in_system:
      Number(credit_balance.credits_total) - creditPurchaseOrdersTotal,
    credit_payments_amount_not_in_system:
      Number(credit_balance.payments_total) - paymentsTotal,
  }
}

export async function getPaymentsOfCurrentOpenReconciliation(
  ctx: Ctx,
  req: CustomerCreditGetPaymentsOfCurrentOpenReconciliationRQ,
): Promise<CustomerCreditGetPaymentsOfCurrentOpenReconciliationRS> {
  const assignedCashRegister = await getAssignedCashRegister(ctx, {})
  const reconciliation = await getOpenedReconciliation(
    ctx,
    assignedCashRegister.cash_register.id,
  )

  const result = await ctx.knex.raw(
    `
      SELECT 
        ccp.id, 
        c.name AS customer_name,
        ccp.previous_balance,
        ccp.amount AS payment_amount,
        ccp.new_balance,
        ccp.created_at,
        ccp.status
      FROM customer_credit_payment ccp
        INNER JOIN customer_credit cc ON cc.id = ccp.customer_credit_id
        INNER JOIN customer c ON cc.customer_id = c.id
      WHERE ccp.cash_register_reconciliation_id = :reconciliationId
  `,
    {
      reconciliationId: reconciliation.id,
    },
  )

  return {
    payments: result.rows,
  }
}

export async function getPayment(
  ctx: Ctx,
  req: CustomerCreditGetPaymentRQ,
): Promise<CustomerCreditGetPaymentRS> {
  const { id } = req
  const result = await ctx.knex.raw(
    `
      SELECT 
        ccp.id, 
        c.name AS customer_name,
        ccp.previous_balance,
        ccp.amount AS payment_amount,
        ccp.new_balance,
        ccp.created_at,
        ccp.status
      FROM customer_credit_payment ccp
        INNER JOIN customer_credit cc ON cc.id = ccp.customer_credit_id
        INNER JOIN customer c ON cc.customer_id = c.id
      WHERE ccp.id = :paymentId
  `,
    {
      paymentId: id,
    },
  )

  return {
    payment: result.rows?.[0] ?? null,
  }
}
