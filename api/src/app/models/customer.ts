import { Ctx } from 'api/src/app/context'
import {
  CustomerAddRQ,
  CustomerDisableRQ,
  CustomerEnableRQ,
  CustomerListRQ,
  CustomerModifyRQ,
  CustomerSearchRQ,
  CustomerGetMovementsReportRQ,
} from 'interface/requests/customer'
import {
  CustomerAddFailRS,
  CustomerAddSuccessRS,
  CustomerListRS,
  CustomerSearchRS,
  CustomerGetMovementsReportRS,
} from 'interface/responses/customer'
import {
  CustomerMovementEntry,
  GeneralPublicCustomer,
} from 'interface/entities/customer'
import { ModifyRS } from 'interface/responses/common'

type CustomerSQLRow = {
  id: number
  name: string
  phone_number: string
  address: string
  city: string
  email: string
  should_add_ieps: boolean
  enabled: boolean
}

export async function add(
  ctx: Ctx,
  req: CustomerAddRQ,
): Promise<CustomerAddSuccessRS | CustomerAddFailRS> {
  const { name, phone_number, address, city, email, should_add_ieps } = req
  try {
    await ctx.knex('customer').insert({
      name,
      phone_number,
      address,
      city,
      email,
      should_add_ieps,
    })

    return {
      success: true,
    }
  } catch (e) {
    return {
      success: false,
      error: (e as Error).message,
    }
  }
}

export async function search(
  ctx: Ctx,
  req: CustomerSearchRQ,
): Promise<CustomerSearchRS> {
  const { query } = req
  const result = await ctx
    .knex('customer')
    .select(
      'id',
      'name',
      'phone_number',
      'address',
      'city',
      'email',
      'should_add_ieps',
      'enabled',
    )
    .whereILike('name', `%${query}%`)
    .orWhereILike('email', `%${query}%`)
    .orWhereILike('phone_number', `%${query}%`)
    .orWhereILike('address', `%${query}%`)

  const data = result
    .map((r: CustomerSQLRow) => ({
      id: r.id,
      name: `${r.name}${r.city ? ' (' + r.city + ')' : ''}`,
      data: {
        id: r.id,
        name: r.name,
        address: r.address,
        city: r.city,
        phone_number: r.phone_number,
        email: r.email,
        should_add_ieps: r.should_add_ieps,
        enabled: r.enabled,
      },
    }))
    .filter(r => r.data.enabled)

  return {
    data,
  }
}

const pageSize = 1000

export async function list(
  ctx: Ctx,
  req: CustomerListRQ,
): Promise<CustomerListRS> {
  const { query, page } = req
  const offset = (page - 1) * pageSize

  const result = await ctx
    .knex('customer')
    .select(
      'id',
      'name',
      'phone_number',
      'address',
      'city',
      'email',
      'should_add_ieps',
      'enabled',
    )
    .whereILike('name', `%${query}%`)
    .orWhereILike('email', `%${query}%`)
    .orWhereILike('address', `%${query}%`)
    .offset(offset)
    .limit(pageSize)

  const data = result.map((r: CustomerSQLRow) => ({
    id: r.id,
    name: r.name,
    address: r.address,
    city: r.city,
    phone_number: r.phone_number,
    email: r.email,
    should_add_ieps: r.should_add_ieps,
    enabled: r.enabled,
  }))

  return {
    numberOfPages: 1,
    customers: data,
  }
}

export async function modify(
  ctx: Ctx,
  req: CustomerModifyRQ,
): Promise<ModifyRS> {
  const { id, name, phone_number, address, city, email, should_add_ieps } = req
  try {
    await ctx.knex('customer').where('id', id).update({
      name,
      phone_number,
      address,
      city,
      email,
      should_add_ieps,
    })
    return { success: true }
  } catch (e) {
    return {
      success: false,
      error: (e as Error).message,
    }
  }
}

export async function get(
  ctx: Ctx,
  id: number,
): Promise<CustomerSQLRow | undefined> {
  return ctx.knex('customer').where('id', id).first()
}

export async function enable(
  ctx: Ctx,
  req: CustomerEnableRQ,
): Promise<ModifyRS> {
  const { id } = req
  try {
    await ctx.knex('customer').where('id', id).update({ enabled: true })
    return { success: true }
  } catch (e) {
    return {
      success: false,
      error: (e as Error).message,
    }
  }
}

export async function disable(
  ctx: Ctx,
  req: CustomerDisableRQ,
): Promise<ModifyRS> {
  const { id } = req
  try {
    await ctx.knex('customer').where('id', id).update({ enabled: false })
    return { success: true }
  } catch (e) {
    return {
      success: false,
      error: (e as Error).message,
    }
  }
}

export type CustomerMovementReportInfo = {
  [customerName: string]: {
    movements: CustomerMovementEntry[]
    customerGlobalTotalPurchases: number
    customerGlobalTotalCreditPayments: number
    customerGlobalTotalCreditBalance: number
  }
}

export type CustomerMovementsReportResponse = {
  customerReportInfo: CustomerMovementReportInfo
  inDateRangeTotalPurchases: number
  inDateRangeTotalCreditPayments: number
  globalTotalPurchases: number
  globalTotalCreditPayments: number
  globalTotalCreditBalance: number
}

export async function getMovementsReport(
  ctx: Ctx,
  req: CustomerGetMovementsReportRQ,
): Promise<CustomerMovementsReportResponse> {
  const { start_date, end_date } = req
  const { customer_id } = req

  // Get in-date-range totals
  const inDateRangeTotals = await ctx.knex.raw(
    `
    SELECT
      SUM(CASE WHEN movement_type = 'PURCHASE' THEN amount ELSE 0 END) as total_purchases,
      SUM(CASE WHEN movement_type = 'PAYMENT' THEN amount ELSE 0 END) as total_credit_payments
    FROM (
      SELECT
        'PURCHASE' as movement_type,
        po.total as amount
      FROM purchase_order po
      INNER JOIN customer c ON c.id = po.customer_id
      WHERE (po.created_at AT TIME ZONE 'America/Chihuahua')::date BETWEEN ? AND ?
        AND c.id != ?
        AND po.status = 'PROCESSED'
        AND c.enabled IS TRUE
      UNION ALL
      SELECT
        'PAYMENT' as movement_type,
        ccp.amount
      FROM customer_credit_payment ccp
      INNER JOIN customer_credit cc ON cc.id = ccp.customer_credit_id
      INNER JOIN customer c ON c.id = cc.customer_id
      WHERE (ccp.created_at AT TIME ZONE 'America/Chihuahua')::date BETWEEN ? AND ?
        AND c.id != ?
        AND c.enabled IS TRUE
    ) movements
    `,
    [start_date, end_date, GeneralPublicCustomer.id, start_date, end_date, GeneralPublicCustomer.id],
  )

  // Get global credit balance per customer
  const globalCreditBalances = await ctx.knex.raw(
    `
    SELECT 
      c.id as customer_id,
      c.name as customer_name,
      GREATEST(SUM(cc.credits_total) - SUM(cc.payments_total), 0) as credit_balance
    FROM customer_credit cc
    INNER JOIN customer c ON c.id = cc.customer_id
    WHERE c.id != ?
      AND c.enabled IS TRUE
    GROUP BY c.id, c.name
    `,
    [GeneralPublicCustomer.id],
  )

  // Get global total credit payments per customer
  const globalCreditPayments = await ctx.knex.raw(
    `
    SELECT 
      c.id as customer_id,
      c.name as customer_name,
      SUM(ccp.amount) as total_credit_payments
    FROM customer_credit_payment ccp
    INNER JOIN customer_credit cc ON cc.id = ccp.customer_credit_id
    INNER JOIN customer c ON c.id = cc.customer_id
    WHERE c.id != ?
      AND c.enabled IS TRUE
    GROUP BY c.id, c.name
    `,
    [GeneralPublicCustomer.id],
  )

  // Get global total purchases per customer
  const globalPurchases = await ctx.knex.raw(
    `
    SELECT 
      c.id as customer_id,
      c.name as customer_name,
      SUM(po.total) as total_purchases
    FROM purchase_order po
    INNER JOIN customer c ON c.id = po.customer_id
    WHERE c.id != ?
      AND po.status = 'PROCESSED'
      AND c.enabled IS TRUE
    GROUP BY c.id, c.name
    `,
    [GeneralPublicCustomer.id],
  )

  // Get purchases
  const purchases = await ctx.knex.raw(
    `
    SELECT 
      c.id as customer_id,
      po.created_at as date,
      'PURCHASE' as movement_type,
      CONCAT('NOTA ', po.id) as description,
      po.total as amount,
      c.name as customer_name,
      SUM(CASE WHEN pop.form_of_payment = 'CREDIT' THEN pop.amount ELSE 0 END) as credit_payment_amount,
      string_agg(
        CASE 
          WHEN pop.form_of_payment = 'CASH' THEN 'Efectivo'
          WHEN pop.form_of_payment = 'CREDIT' THEN 'Crédito'
          WHEN pop.form_of_payment = 'TRANSFER' THEN CONCAT('Transferencia (', tba.name, ')')
          ELSE pop.form_of_payment
        END,
        ', '
      ) as payment_method
    FROM purchase_order po
    INNER JOIN customer c ON c.id = po.customer_id
    LEFT JOIN customer_credit cc ON cc.customer_id = c.id
    LEFT JOIN purchase_order_payment pop ON pop.purchase_order_id = po.id
    LEFT JOIN transfer_bank_account tba ON tba.id = pop.transfer_bank_account_id
    WHERE (po.created_at AT TIME ZONE 'America/Chihuahua')::date BETWEEN ? AND ?
      AND po.status = 'PROCESSED'
      AND c.enabled IS TRUE
    ${customer_id ? 'AND c.id = ?' : 'AND c.id != ?'}
    GROUP BY c.id, po.id, po.created_at, po.total, c.name
    ORDER BY po.created_at
    `,
    customer_id
      ? [start_date, end_date, customer_id]
      : [start_date, end_date, GeneralPublicCustomer.id],
  )

  // Get payments
  const payments = await ctx.knex.raw(
    `
    SELECT 
      c.id as customer_id,
      ccp.created_at as date,
      'PAYMENT' as movement_type,
      CONCAT('ABONO ', ccp.id) as description,
      ccp.amount as amount,
      c.name as customer_name,
      CASE 
        WHEN ccp.form_of_payment = 'CASH' THEN 'Efectivo'
        WHEN ccp.form_of_payment = 'CREDIT' THEN 'Crédito'
        WHEN ccp.form_of_payment = 'TRANSFER' THEN CONCAT('Transferencia (', tba.name, ')')
      END as payment_method,
      tba.name as bank_account_name
    FROM customer_credit_payment ccp
    INNER JOIN customer_credit cc ON cc.id = ccp.customer_credit_id
    INNER JOIN customer c ON c.id = cc.customer_id
    LEFT JOIN transfer_bank_account tba ON tba.id = ccp.transfer_bank_account_id
    WHERE ccp.created_at BETWEEN ? AND ?
      AND c.enabled IS TRUE
    ${customer_id ? 'AND c.id = ?' : ''}
    ORDER BY ccp.created_at
    `,
    customer_id ? [start_date, end_date, customer_id] : [start_date, end_date],
  )

  // Get unique customer IDs from the movements
  const customerIds = [
    ...new Set([...purchases.rows, ...payments.rows].map(m => m.customer_id)),
  ]

  // Get initial balances for each customer
  const initialBalances = await ctx.knex.raw(
    `
    WITH RankedPayments AS (
      SELECT 
        cc.customer_id,
        ccp.new_balance as initial_balance,
        ROW_NUMBER() OVER (PARTITION BY cc.customer_id ORDER BY ccp.created_at DESC) as rn
      FROM customer_credit cc
      INNER JOIN customer_credit_payment ccp ON ccp.customer_credit_id = cc.id
      WHERE (ccp.created_at AT TIME ZONE 'America/Chihuahua')::date < ?
        AND cc.customer_id = ANY(?::int[])
    )
    SELECT 
      customer_id,
      COALESCE(initial_balance, 0) as initial_balance
    FROM RankedPayments
    WHERE rn = 1
    `,
    [start_date, `{${customerIds.join(',')}}`],
  )

  // Create a map of customer ID to initial balance
  const customerInitialBalances = initialBalances.rows.reduce(
    (
      acc: { [key: number]: number },
      row: { customer_id: number; initial_balance: string },
    ) => {
      acc[row.customer_id] = Number(row.initial_balance)
      return acc
    },
    {} as { [key: number]: number },
  )

  // Combine and sort movements
  const movements = [...purchases.rows, ...payments.rows].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  )

  // Map movements to entries and calculate running balance per customer
  const balancesByCustomer: { [key: number]: number } = {
    ...customerInitialBalances,
  }
  const entries = movements.map(m => {
    const customerId = m.customer_id
    if (m.movement_type === 'PURCHASE') {
      balancesByCustomer[customerId] =
        (balancesByCustomer[customerId] || 0) +
        Number(m.credit_payment_amount ?? 0)
    } else {
      balancesByCustomer[customerId] =
        (balancesByCustomer[customerId] || 0) - Number(m.amount)
    }
    return {
      date: m.date,
      customer_name: m.customer_name,
      movement_type: m.movement_type,
      description: m.description,
      amount: m.amount,
      payment_method: m.payment_method,
      bank_account_name: m.bank_account_name,
      initial_balance: customerInitialBalances[customerId],
      new_balance: balancesByCustomer[customerId],
    }
  })

  // Group entries by customer
  const entriesGroupedByCustomerName = entries.reduce<{
    [key: string]: CustomerMovementEntry[]
  }>((acc, entry) => {
    if (!acc[entry.customer_name]) {
      acc[entry.customer_name] = []
    }
    acc[entry.customer_name].push(entry)
    return acc
  }, {})

  // Create maps for global totals by customer name
  const globalPurchasesByCustomer = globalPurchases.rows.reduce(
    (acc: { [key: string]: number }, row: { customer_name: string; total_purchases: string }) => {
      acc[row.customer_name] = Number(row.total_purchases)
      return acc
    },
    {}
  )

  const globalCreditPaymentsByCustomer = globalCreditPayments.rows.reduce(
    (acc: { [key: string]: number }, row: { customer_name: string; total_credit_payments: string }) => {
      acc[row.customer_name] = Number(row.total_credit_payments)
      return acc
    },
    {}
  )

  // Create map for global credit balances by customer name
  const globalCreditBalancesByCustomer = globalCreditBalances.rows.reduce(
    (acc: { [key: string]: number }, row: { customer_name: string; credit_balance: string }) => {
      acc[row.customer_name] = Number(row.credit_balance)
      return acc
    },
    {}
  )

  const customerReportInfo = Object.keys(entriesGroupedByCustomerName).reduce(
    (acc, customerName) => {
      const entry = entriesGroupedByCustomerName[customerName]
      acc[customerName] = {
        movements: entry,
        customerGlobalTotalPurchases: globalPurchasesByCustomer[customerName] ?? 0,
        customerGlobalTotalCreditPayments: globalCreditPaymentsByCustomer[customerName] ?? 0,
        customerGlobalTotalCreditBalance: globalCreditBalancesByCustomer[customerName] ?? 0,
      }
      return acc
    },
    {} as CustomerMovementReportInfo,
  )

  // Calculate global totals across all customers
  const globalTotalPurchases = globalPurchases.rows.reduce(
    (total: number, row: { total_purchases: string }) => total + Number(row.total_purchases),
    0
  )

  const globalTotalCreditPayments = globalCreditPayments.rows.reduce(
    (total: number, row: { total_credit_payments: string }) => total + Number(row.total_credit_payments),
    0
  )

  const globalTotalCreditBalance = globalCreditBalances.rows.reduce(
    (total: number, row: { credit_balance: string }) => total + Number(row.credit_balance),
    0
  )

  // Extract in-date-range totals
  const inDateRangeTotalPurchases = Number(inDateRangeTotals.rows[0]?.total_purchases ?? 0)
  const inDateRangeTotalCreditPayments = Number(inDateRangeTotals.rows[0]?.total_credit_payments ?? 0)

  return {
    customerReportInfo,
    inDateRangeTotalPurchases,
    inDateRangeTotalCreditPayments,
    globalTotalPurchases,
    globalTotalCreditPayments,
    globalTotalCreditBalance,
  }
}
