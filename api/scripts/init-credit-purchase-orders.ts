#!/usr/bin/env ts-node

import * as yargs from 'yargs'
import { getClient } from '../setup/db/client'
import { DATABASE } from '../setup/db/types'

const customerInitBalance: { [customerId: number]: number } = {
  [69]: 2869.5,
  [117]: 112060.24,
}

async function showCreditPurchaseOrders(trx: any, customerId: number) {
  const orders = await trx('credit_purchase_order')
    .where('customer_id', customerId)
    .orderBy('created_at', 'asc')

  console.table(
    orders.map((order: any) => ({
      id: order.id,
      total: Number(order.total),
      paid: Number(order.paid),
      remaining: Number(order.total) - Number(order.paid),
      status: order.status,
      created_at: order.created_at,
    })),
  )
}

async function initializeCreditPurchaseOrders(trx: any, customerId: number) {
  // Delete existing orders
  await trx('credit_purchase_order').where('customer_id', customerId).delete()

  // Get all credit payments for this customer
  const creditPayments = await trx('purchase_order_payment')
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
      'purchase_order_payment.id AS payment_id',
    )
    .where('form_of_payment', 'CREDIT')
    .where('customer.id', customerId)
    .where('purchase_order.status', 'PROCESSED')
    .orderBy('purchase_order.created_at', 'asc')

  // Create new credit purchase orders and track their IDs
  const creditPurchaseOrderMap = new Map()
  for (const payment of creditPayments) {
    const [newOrder] = await trx('credit_purchase_order')
      .insert({
        customer_id: payment.customer_id,
        purchase_order_id: payment.purchase_order_id,
        total: payment.amount,
        paid: 0,
        status: 'PENDING',
        created_at: payment.purchase_order_created_at,
        updated_at: trx.fn.now(),
      })
      .returning('*')

    creditPurchaseOrderMap.set(newOrder.id, {
      total: Number(newOrder.total),
      paid: 0,
    })
  }

  // Get customer credit payments
  const customerCreditPayments = await trx('customer_credit_payment')
    .innerJoin(
      'customer_credit',
      'customer_credit.id',
      'customer_credit_payment.customer_credit_id',
    )
    .select(
      'customer_credit_payment.id',
      'customer_credit_payment.amount',
      'customer_credit_payment.status',
      'customer_credit_payment.created_at',
    )
    .where('customer_credit.customer_id', customerId)
    .where('customer_credit_payment.status', 'PROCESSED')
    .orderBy('customer_credit_payment.created_at', 'asc')

  // Apply payments to credit purchase orders
  for (const payment of customerCreditPayments) {
    const topCreditPurchase = await trx('credit_purchase_order')
      .select('id', 'total', 'paid', 'purchase_order_id')
      .where('customer_id', customerId)
      .andWhere('status', 'PENDING')
      .orderBy('created_at', 'asc')
      .first()

    if (!topCreditPurchase) {
      continue
    }

    let paymentAmount = Number(payment.amount)
    if (customerInitBalance[customerId] > 0) {
      if (customerInitBalance[customerId] >= paymentAmount) {
        customerInitBalance[customerId] =
          customerInitBalance[customerId] - paymentAmount
        continue
      } else {
        paymentAmount = paymentAmount - customerInitBalance[customerId]
        customerInitBalance[customerId] = 0
      }
    }

    let remainder = 0
    let newPaid = 0
    let newStatus = 'PENDING'
    const paidPlusNewPaymentAmount =
      paymentAmount + Number(topCreditPurchase.paid)

    if (paidPlusNewPaymentAmount >= Number(topCreditPurchase.total)) {
      remainder = paidPlusNewPaymentAmount - Number(topCreditPurchase.total)
      newPaid = Number(topCreditPurchase.total)
      newStatus = 'PAID'
    } else {
      newPaid = Number(topCreditPurchase.paid) + paymentAmount
    }

    await trx('credit_purchase_order')
      .where('id', topCreditPurchase.id)
      .update({
        paid: newPaid,
        status: newStatus,
        updated_at: payment.created_at,
      })
    // Process remainder if any
    while (remainder > 0) {
      const nextCreditPurchase = await trx('credit_purchase_order')
        .select('id', 'total', 'paid')
        .where('customer_id', customerId)
        .andWhere('status', 'PENDING')
        .orderBy('created_at', 'asc')
        .first()

      if (!nextCreditPurchase) {
        break
      }
      let newPaid = 0
      let newStatus = 'PENDING'
      if (remainder >= Number(nextCreditPurchase.total)) {
        remainder = remainder - Number(nextCreditPurchase.total)
        newPaid = Number(nextCreditPurchase.total)
        newStatus = 'PAID'
      } else {
        newPaid = remainder
        remainder = 0
      }
      await trx('credit_purchase_order')
        .where('id', nextCreditPurchase.id)
        .update({
          paid: newPaid,
          status: newStatus,
          updated_at: payment.created_at,
        })
    }
  }

  // Show summary
  const totalCredits = creditPayments.reduce(
    (sum: number, payment: { amount: string | number }) =>
      sum + Number(payment.amount),
    0,
  )
  const totalPaid = customerCreditPayments
    .filter((payment: { status: string }) => payment.status === 'PROCESSED')
    .reduce(
      (sum: number, payment: { amount: string | number }) =>
        sum + Number(payment.amount),
      0,
    )

  console.log('\nSummary:')
  console.log(`Total credits: $${totalCredits}`)
  console.log(`Total paid: $${totalPaid}`)
  console.log(`Remaining balance: $${totalCredits - totalPaid}`)
}

async function main() {
  const argv = (await yargs
    .command('$0', 'Initialize credit purchase orders')
    .demandOption(['c'])
    .number('c')
    .describe('c', 'Customer ID')
    .parse()) as { c: number }

  const knex = getClient(DATABASE.DELIEVA)
  if (!knex) {
    throw new Error('knex is missing')
  }
  try {
    await knex.transaction(async trx => {
      console.log('\nCurrent Credit Purchase Orders:')
      await showCreditPurchaseOrders(trx, argv.c)

      console.log('\nInitializing credit purchase orders...')
      await initializeCreditPurchaseOrders(trx, argv.c)

      console.log('\nNew Credit Purchase Orders:')
      await showCreditPurchaseOrders(trx, argv.c)
    })
  } catch (error) {
    console.error(
      'Error:',
      error instanceof Error ? error.message : 'Unknown error occurred',
    )
    process.exit(1)
  } finally {
    await knex.destroy()
  }
}

main()
