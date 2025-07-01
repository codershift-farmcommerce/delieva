import { Ctx } from 'api/src/app/context'
import {
  PurchaseOrderGetReceiptRQ,
  PurchaseOrderGetReportRQ,
  PurchaseOrderReturnOrderRQ,
  PurchaseOrderProcessRQ,
  PurchaseOrderReturnOrderDetailsRQ,
} from 'interface/requests/purchase_order'
import {
  PurchaseOrderGetReceiptRS,
  PurchaseOrderGetReportRS,
  PurchaseOrderReturnOrderRS,
  PurchaseOrderReturnOrderDetailsRS,
  PurchaseOrderProcessFailRS,
  PurchaseOrderProcessSuccessRS,
} from 'interface/responses/purchase_order'
import { BarcodeType, generateBarcode } from 'api/src/util/barcode'
import * as customerCreditModel from './customer_credit'
import * as customerModel from './customer'
import { getUnitPricesForCart } from './product'
import * as transfer_bank_account_model from './transfer_bank_account'
import {
  decrementCashRegisterReconciliationWithTrx,
  getAssignedCashRegister,
  getOpenedReconciliation,
  updateCashRegisterReconciliationWithTrx,
} from './cash_register'
import {
  FormOfPayment,
  FormOfPaymentWithAmount,
  PurchaseOrderForBankAccount,
  PurchaseOrderForReconciliationReceipt,
  PurchaseOrderStatus,
} from 'interface/entities/purchase_order'
import { FinishedProductUnitType } from 'interface/entities/finished_product'

type PurchaseOrderDetailSQLRow = {
  product: {
    code: string
    name: string
  }
  quantity: number
  unit_price: number
  discount: number
  detail_total: number
}

type PurchaseOrderCustomerSQLRow = {
  name: string
  phone_number: string
  address: string
  city: string
  email: string
}

type PurchaseOrderReportSQLRow = {
  order_id: number
  created_at: string
  cash_register_name: string
  customer: PurchaseOrderCustomerSQLRow
  discount: number
  total: number
  form_of_payments: FormOfPaymentWithAmount[]
  purchase_order_detail: PurchaseOrderDetailSQLRow
  status: PurchaseOrderStatus
}

type PurchaseFormOfPaymentSQLRow = {
  form_of_payment: string
  amount: string
  change: string
  transfer_bank_account_id: number
  transfer_bank_account_name: string
}

export async function process(
  ctx: Ctx,
  req: PurchaseOrderProcessRQ,
): Promise<PurchaseOrderProcessSuccessRS | PurchaseOrderProcessFailRS> {
  const { customer_id, cart, form_of_payments } = req
  const customer = await customerModel.get(ctx, customer_id)
  const { items } = cart
  const productUnitPrices = (
    await getUnitPricesForCart(ctx, {
      customer_id,
      cart,
    })
  ).unit_prices

  let subtotal = 0
  let tax1 = 0

  Object.keys(items).forEach(productCode => {
    const cartItem = items[productCode]
    const unitPrice = productUnitPrices[productCode]
    const itemTotal = unitPrice * cartItem.quantity

    subtotal += itemTotal
    if (cartItem.should_add_ieps) {
      tax1 += itemTotal * 0.08
    }
  })

  let total = subtotal + tax1

  const barcode = generateBarcode(BarcodeType.PURCHASE_ORDER)

  const cashRegisterId = (await getAssignedCashRegister(ctx, {})).cash_register
    .id
  const cashRegisterReconciliation = await getOpenedReconciliation(
    ctx,
    cashRegisterId,
  )

  try {
    const orderId = await ctx.knex.transaction(async trx => {
      const result = await trx('purchase_order')
        .insert({
          customer_id,
          subtotal,
          discount: 0,
          tax1,
          total,
          barcode,
          status: 'PROCESSED',
          payment_status: 'PAID',
          cash_register_id: cashRegisterId,
          cash_register_reconciliation_id: cashRegisterReconciliation.id,
        })
        .returning('id')
      const orderId = result[0].id as number

      const cashPaymentsCount = form_of_payments.filter(
        fop => fop.form_of_payment === FormOfPayment.CASH,
      ).length
      const nonCashTotal = form_of_payments
        .filter(fop => fop.form_of_payment !== FormOfPayment.CASH)
        .reduce((acc, fop) => acc + fop.amount, 0)
      const fopTotal = form_of_payments.reduce(
        (acc, fop) => acc + fop.amount,
        0,
      )
      const change = (fopTotal - total) / (cashPaymentsCount || 1)

      for await (let formOfPayment of form_of_payments) {
        const paymentInsertResults = await trx('purchase_order_payment')
          .insert({
            purchase_order_id: orderId,
            form_of_payment: formOfPayment.form_of_payment,
            amount:
              formOfPayment.form_of_payment === FormOfPayment.CASH
                ? (total - nonCashTotal) / cashPaymentsCount
                : formOfPayment.amount,
            change:
              formOfPayment.form_of_payment === FormOfPayment.CASH ? change : 0,
            transfer_bank_account_id: formOfPayment.transfer_bank_account_id,
          })
          .returning('id')

        if (formOfPayment.form_of_payment === FormOfPayment.CREDIT) {
          await customerCreditModel.addCreditDetail(trx, {
            customer_id,
            purchase_order_payment_id: paymentInsertResults[0].id,
            amount: formOfPayment.amount,
          })
        }
      }
      for await (let productCode of Object.keys(items)) {
        const cartItem = items[productCode]
        const { quantity } = cartItem
        const unitPrice = productUnitPrices[productCode]
        const detailTotal = unitPrice * quantity
        await trx('purchase_order_detail').insert({
          purchase_order_id: orderId,
          product_code: productCode,
          quantity,
          unit_price: unitPrice,
          discount: 0,
          detail_total: detailTotal,
          has_ieps: cartItem.should_add_ieps,
        })
      }

      await updateCashRegisterReconciliationWithTrx(
        ctx,
        trx,
        cashRegisterId,
        form_of_payments,
        total,
      )

      const creditPaymentAmount = form_of_payments
        .filter(fop => fop.form_of_payment === FormOfPayment.CREDIT)
        .reduce((acc, fop) => {
          return acc + fop.amount
        }, 0)

      if (creditPaymentAmount > 0) {
        await trx('credit_purchase_order').insert({
          purchase_order_id: orderId,
          customer_id,
          total: creditPaymentAmount,
          paid: 0,
          status: 'PENDING',
        })
      }

      return orderId
    })
    return {
      success: true,
      barcode,
      order_id: orderId,
    }
  } catch (err) {
    console.error(err)
    return {
      success: false,
      error: (err as Error).message,
    }
  }
}

export async function getReceipt(
  ctx: Ctx,
  req: PurchaseOrderGetReceiptRQ,
): Promise<PurchaseOrderGetReceiptRS> {
  const { order_id } = req
  const result = await ctx.knex.raw(
    `
      SELECT 
        purchase_order.id AS order_id,
        customer.name AS customer_name,
        users.name AS cashier_name,
        cash_register.name AS cash_register_name,
        purchase_order.discount,
        purchase_order.subtotal,
        purchase_order.tax1,
        purchase_order.total,
        purchase_order.created_at
      FROM purchase_order
        INNER JOIN public.customer on customer.id = purchase_order.customer_id
        INNER JOIN public.cash_register on cash_register.id = purchase_order.cash_register_id
        INNER JOIN public.cash_register_assignation on cash_register_assignation.cash_register_id = cash_register.id
        INNER JOIN public.users on cash_register_assignation.assigned_user_email = users.email
        INNER JOIN public.purchase_order_detail on purchase_order.id = purchase_order_detail.purchase_order_id
        INNER JOIN public.purchase_order_payment on purchase_order.id = purchase_order_payment.purchase_order_id
        INNER JOIN public.product on product.code = purchase_order_detail.product_code
      WHERE purchase_order.id = :order_id
      GROUP BY purchase_order.id, customer.name, users.name, cash_register.name, purchase_order.subtotal, purchase_order.discount, purchase_order.total, purchase_order.created_at;
  `,
    { order_id },
  )

  const detailResult = await ctx.knex.raw(
    `
    SELECT
      purchase_order_detail.id AS detail_id,
      product.code AS product_code,
      product.name AS product_name,
      purchase_order_detail.quantity,
      purchase_order_detail.unit_price,
      purchase_order_detail.discount,
      purchase_order_detail.detail_total,
      purchase_order_detail.status AS status,
      purchase_order_detail.has_ieps AS has_ieps,
      finished_product.unit_type AS unit_type,
      (
        SELECT JSON_AGG(JSON_BUILD_OBJECT(
          'code', finished_product.code,
          'name', finished_product.name,
          'unit_type', finished_product.unit_type,
          'unit_quantity', product_finished_product.unit_quantity
        ))
        FROM product_finished_product
            INNER JOIN finished_product ON finished_product.code = product_finished_product.finished_product_code
        WHERE product_finished_product.product_code = purchase_order_detail.product_code
      ) as finished_products,
      purchase_order_detail.quantity * (select sum(product_finished_product.unit_quantity)
       FROM product_finished_product
            INNER JOIN finished_product ON finished_product.code = product_finished_product.finished_product_code
        WHERE product_finished_product.product_code = purchase_order_detail.product_code) AS weight
    FROM purchase_order_detail
    INNER JOIN product ON product.code = purchase_order_detail.product_code
    INNER JOIN product_finished_product ON product_finished_product.product_code = product.code
    INNER JOIN finished_product ON finished_product.code = product_finished_product.finished_product_code
    WHERE purchase_order_detail.purchase_order_id = :order_id;
    `,
    { order_id },
  )

  const formOfPaymentsResult = await ctx.knex.raw(
    `
     SELECT
      form_of_payment,
      amount as amount,
      change,
      transfer_bank_account.id as transfer_bank_account_id,
      transfer_bank_account.name as transfer_bank_account_name
    FROM purchase_order_payment
        LEFT JOIN transfer_bank_account ON transfer_bank_account.id = purchase_order_payment.transfer_bank_account_id
    WHERE purchase_order_id = :order_id;
  `,
    { order_id },
  )
  const formOfPaymentsResultRows = (
    formOfPaymentsResult.rows as PurchaseFormOfPaymentSQLRow[]
  ).map(row => {
    return {
      form_of_payment: row.form_of_payment as FormOfPayment,
      amount: Number(row.amount),
      change: Number(row.change),
      transfer_bank_account_id: row.transfer_bank_account_id,
      transfer_bank_account_name: row.transfer_bank_account_name,
    }
  })

  const { fop_amount, change } = getFopAmountAndChange(formOfPaymentsResultRows)

  const sortedDetail = detailResult.rows?.sort((a: any, b: any) => {
    const finishedProductA = a.finished_products[0]
    const finishedProductB = b.finished_products[0]
    if (
      finishedProductA.unit_type === FinishedProductUnitType.PIECE &&
      finishedProductB.unit_type !== FinishedProductUnitType.PIECE
    ) {
      return 2
    }

    if (
      finishedProductA.name.indexOf('GRANEL') > 0 &&
      finishedProductB.name.indexOf('GRANEL') <= 0
    ) {
      return 3
    }

    const unitQuantityA = finishedProductA.unit_quantity
    const unitQuantityB = finishedProductB.unit_quantity
    return unitQuantityB > unitQuantityA ? 1 : -1
  })

  const receipt = {
    ...result.rows[0],
    form_of_payments: formOfPaymentsResult.rows,
    detail: sortedDetail,
    change,
    fop_amount,
  }

  return {
    receipt,
  }
}

export function getFopAmountAndChange(
  formOfPayments: FormOfPaymentWithAmount[],
) {
  const fop_amount =
    formOfPayments?.reduce(
      (acc: number, fop: FormOfPaymentWithAmount) => acc + Number(fop.amount),
      0,
    ) ?? 0

  const change =
    formOfPayments?.reduce(
      (acc: number, fop: FormOfPaymentWithAmount) => acc + Number(fop.change),
      0,
    ) ?? 0

  return {
    fop_amount,
    change,
  }
}

export async function getReport(
  ctx: Ctx,
  req: PurchaseOrderGetReportRQ,
): Promise<PurchaseOrderGetReportRS> {
  const { start_date, end_date } = req
  //TODO: Investigate why this is being return are UTC when AT TIMEZONE is not being used
  const result = await ctx.knex.raw(
    `
    SELECT purchase_order.id AS order_id,
    (purchase_order.created_at AT TIME ZONE 'America/Chihuahua') AS created_at,
    cash_register.name AS cash_register_name,
        JSON_BUILD_OBJECT(
            'name', customer.name,
            'phone_number', customer.phone_number,
            'address', customer.address,
            'city', customer.city,
            'email', customer.email
        ) AS customer,
    purchase_order.discount AS
    discount,
    purchase_order.total AS total,
    purchase_order.status AS status,
    (SELECT JSON_AGG(JSON_BUILD_OBJECT(
        'product', JSON_BUILD_OBJECT(
            'code', purchase_order_detail.product_code,
            'name', product.name),
        'quantity', purchase_order_detail.quantity,
        'unit_price', purchase_order_detail.unit_price,
        'discount', purchase_order_detail.discount,
        'detail_total', purchase_order_detail.detail_total))
     FROM purchase_order_detail 
       INNER JOIN public.product ON product.code = purchase_order_detail.product_code 
     WHERE purchase_order_detail.purchase_order_id = purchase_order.id
    ) AS purchase_order_detail,
    (SELECT JSON_AGG(JSON_BUILD_OBJECT(
         'form_of_payment', purchase_order_payment.form_of_payment,
         'amount', purchase_order_payment.amount,
         'transfer_bank_account_name', transfer_bank_account.name)) 
      FROM purchase_order_payment
        LEFT JOIN public.transfer_bank_account ON transfer_bank_account.id = purchase_order_payment.transfer_bank_account_id
      WHERE purchase_order_payment.purchase_order_id = purchase_order.id
    ) AS form_of_payments
    FROM purchase_order
      INNER JOIN public.customer ON customer.id = purchase_order.customer_id
      INNER JOIN public.cash_register ON cash_register.id = purchase_order.cash_register_id
    WHERE (purchase_order.created_at AT TIME ZONE 'America/Chihuahua')::date BETWEEN :start_date AND :end_date
    GROUP BY purchase_order.id, purchase_order.created_at, cash_register.name, customer.id, purchase_order.discount, purchase_order.total, purchase_order.status
    ORDER BY purchase_order.created_at DESC;
    `,
    {
      start_date,
      end_date,
    },
  )

  const data = (result.rows || []).map((row: PurchaseOrderReportSQLRow) => {
    return {
      order_id: row.order_id,
      created_at: row.created_at,
      cash_register_name: row.cash_register_name,
      customer: row.customer,
      discount: row.discount,
      total: row.total,
      form_of_payments: row.form_of_payments,
      detail: row.purchase_order_detail,
      status: row.status,
    }
  })

  return {
    entries: data,
  }
}

export async function getForReconciliationReceipt(
  ctx: Ctx,
  reconciliationId: number,
): Promise<PurchaseOrderForReconciliationReceipt> {
  const cashPurchaseOrders = await getForReconciliationReceiptByFormOfPayment(
    ctx,
    reconciliationId,
    FormOfPayment.CASH,
  )

  const creditPurchaseOrders = await getForReconciliationReceiptByFormOfPayment(
    ctx,
    reconciliationId,
    FormOfPayment.CREDIT,
  )

  const { transfer_bank_accounts } = await transfer_bank_account_model.list(
    ctx,
    {
      query: '*',
      page: 1,
    },
  )

  const purchaseOrderForBankAccounts: PurchaseOrderForBankAccount = {}

  for await (let transferBankAccount of transfer_bank_accounts) {
    const purchaseOrders = await getForReconciliationReceiptByFormOfPayment(
      ctx,
      reconciliationId,
      FormOfPayment.TRANSFER,
      transferBankAccount.id,
    )
    const total = purchaseOrders.reduce(
      (acc: number, purchaseOrder: { amount: number }) =>
        acc + Number(purchaseOrder.amount),
      0,
    )

    purchaseOrderForBankAccounts[transferBankAccount.id] = {
      bank_account_name: transferBankAccount.name,
      total,
      purchase_order: purchaseOrders,
    }
  }

  let total = cashPurchaseOrders.reduce(
    (acc: number, purchaseOrder: { amount: number }) =>
      acc + Number(purchaseOrder.amount),
    0,
  )
  total += creditPurchaseOrders.reduce(
    (acc: number, purchaseOrder: { amount: number }) =>
      acc + Number(purchaseOrder.amount),
    0,
  )
  total += Object.keys(purchaseOrderForBankAccounts).reduce(
    (acc: number, bankAccountId: string) => {
      const bankAccount = purchaseOrderForBankAccounts[Number(bankAccountId)]
      acc += bankAccount.total
      return acc
    },
    0,
  )

  return {
    cash_purchase_orders: cashPurchaseOrders,
    credit_purchase_orders: creditPurchaseOrders,
    purchase_orders_by_transfer_bank_account: purchaseOrderForBankAccounts,
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
          purchase_order.id AS purchase_order_id,
          purchase_order_payment.amount AS amount,
          customer.name AS customer_name
        FROM purchase_order_payment
          INNER JOIN purchase_order on purchase_order.id = purchase_order_payment.purchase_order_id
          INNER JOIN public.customer on customer.id = purchase_order.customer_id
        WHERE form_of_payment = :formOfPayment
        AND purchase_order.cash_register_reconciliation_id = :reconciliationId
        AND purchase_order.status = 'PROCESSED'
        ${bankAccountFilter};
    `,
    { reconciliationId, formOfPayment, transferBankAccountId },
  )

  return result.rows
}

export async function returnOrder(
  ctx: Ctx,
  req: PurchaseOrderReturnOrderRQ,
): Promise<PurchaseOrderReturnOrderRS> {
  const { order_id, cause_id } = req
  try {
    await ctx.knex.transaction(async trx => {
      await trx('returned_purchase_order').insert({
        purchase_order_id: order_id,
        cause_id: cause_id,
      })

      await trx('purchase_order')
        .update({
          status: 'RETURNED',
        })
        .where('id', order_id)

      const purchaseOrder = await trx('purchase_order')
        .select(
          'id',
          'customer_id',
          'cash_register_id',
          'cash_register_reconciliation_id',
          'total',
        )
        .where('id', order_id)
        .first()

      const formOfPayments = await trx('purchase_order_payment')
        .select('amount', 'form_of_payment')
        .where('purchase_order_id', order_id)

      const formOfPaymentsForReconciliation: FormOfPaymentWithAmount[] = []
      for await (const formOfPayment of formOfPayments) {
        if (formOfPayment.form_of_payment === FormOfPayment.CASH) {
          formOfPaymentsForReconciliation.push({
            form_of_payment: FormOfPayment.CASH,
            amount: formOfPayment.amount,
            change: 0,
          })
        }
        if (formOfPayment.form_of_payment === FormOfPayment.TRANSFER) {
          formOfPaymentsForReconciliation.push({
            form_of_payment: FormOfPayment.CASH,
            amount: formOfPayment.amount,
            change: 0,
          })
        }
        if (formOfPayment.form_of_payment === FormOfPayment.CREDIT) {
          formOfPaymentsForReconciliation.push({
            form_of_payment: FormOfPayment.CREDIT,
            amount: formOfPayment.amount,
            change: 0,
          })

          const customerCredit = await trx('customer_credit')
            .select('id')
            .where('customer_id', purchaseOrder.customer_id)
            .first()

          await trx('customer_credit')
            .where('id', customerCredit.id)
            .decrement('credits_total', formOfPayment.amount)

          await trx('credit_purchase_order')
            .where('purchase_order_id', purchaseOrder.id)
            .update('status', 'CANCELLED')
        }
      }

      await decrementCashRegisterReconciliationWithTrx(
        ctx,
        trx,
        purchaseOrder.cash_register_id,
        formOfPaymentsForReconciliation,
      )
    })
  } catch (err) {
    console.error(err)
    return {
      success: false,
    }
  }
  return {
    success: true,
  }
}

export async function returnOrderDetails(
  ctx: Ctx,
  req: PurchaseOrderReturnOrderDetailsRQ,
): Promise<PurchaseOrderReturnOrderDetailsRS> {
  const { order_id, details_and_causes } = req

  await ctx.knex.transaction(async trx => {
    for await (const productAndCause of details_and_causes) {
      const { order_detail_id, cause_id } = productAndCause

      await trx('returned_purchase_order_detail').insert({
        purchase_order_detail_id: order_id,
        cause_id: cause_id,
      })

      const purchaseOrderDetail = await trx('purchase_order_detail')
        .select('quantity', 'unit_price')
        .where('id', order_detail_id)
        .andWhere('purchase_order_id', order_id)
        .first()

      if (!purchaseOrderDetail) {
        throw new Error('Purchase order detail not found')
      }

      await trx('purchase_order_detail')
        .update({
          status: 'RETURNED',
        })
        .where('id', order_detail_id)

      const purchaseOrder = await trx('purchase_order')
        .select('id', 'cash_register_id', 'customer_id')
        .where('id', order_id)
        .first()

      const formOfPayments = await trx('purchase_order_payment')
        .select('amount', 'form_of_payment')
        .where('purchase_order_id', order_id)

      if (formOfPayments.length > 1) {
        throw new Error(
          'Multiple form of payments not allowed for return order details',
        )
      }
      const formOfPayment = formOfPayments[0]
      let formOfPaymentForReconciliation: FormOfPaymentWithAmount | null = null
      const amountToReturn =
        purchaseOrderDetail.unit_price * purchaseOrderDetail.quantity
      if (formOfPayment.form_of_payment === FormOfPayment.CASH) {
        formOfPaymentForReconciliation = {
          form_of_payment: FormOfPayment.CASH,
          amount: amountToReturn,
          change: 0,
        }
      }
      if (formOfPayment.form_of_payment === FormOfPayment.TRANSFER) {
        formOfPaymentForReconciliation = {
          form_of_payment: FormOfPayment.CASH,
          amount: amountToReturn,
          change: 0,
        }
      }
      if (formOfPayment.form_of_payment === FormOfPayment.CREDIT) {
        formOfPaymentForReconciliation = {
          form_of_payment: FormOfPayment.CREDIT,
          amount: amountToReturn,
          change: 0,
        }

        const customerCredit = await trx('customer_credit')
          .select('id')
          .where('customer_id', purchaseOrder.customer_id)
          .first()

        await trx('customer_credit')
          .where('id', customerCredit.id)
          .decrement('credits_total', amountToReturn)

        const creditPurchaseOrder = await trx('credit_purchase_order')
          .select('total')
          .where('purchase_order_id', purchaseOrder.id)
          .first()

        if (Number(creditPurchaseOrder.total) === Number(amountToReturn)) {
          await trx('credit_purchase_order')
            .where('purchase_order_id', purchaseOrder.id)
            .update('status', 'CANCELLED')
        }
      }

      if (formOfPaymentForReconciliation) {
        await decrementCashRegisterReconciliationWithTrx(
          ctx,
          trx,
          purchaseOrder.cash_register_id,
          [formOfPaymentForReconciliation],
        )
      }
    }
  })

  return {
    success: true,
  }
}
