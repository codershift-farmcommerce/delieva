import { Ctx } from 'api/src/app/context'
import {
  CashRegisterAddRQ,
  CashRegisterAssignCashierRQ,
  CashRegisterCancelCashWithdrawalRQ,
  CashRegisterCloseReconciliationRQ,
  CashRegisterEnterOtherIncomeRQ,
  CashRegisterGetAssignedCashRegisterRQ,
  CashRegisterGetCashWithdrawalsOfCurrentOpenReconciliationRQ,
  CashRegisterGetOpenedReconciliationsRQ,
  CashRegisterGetOtherIncomeReceiptRQ,
  CashRegisterGetWithdrawCashReceiptRQ,
  CashRegisterListAssignationsRQ,
  CashRegisterListRQ,
  CashRegisterModifyRQ,
  CashRegisterOpenReconciliationRQ,
  CashRegisterReconciliationGetReportRQ,
  CashRegisterUnassignCashierRQ,
  CashRegisterWithdrawRQ,
  CashRegisterGetCashWithdrawalsForCurrentCashierOpenReconciliationRQ,
} from 'interface/requests/cash_register'
import {
  CashRegisterAddRS,
  CashRegisterAssignCashierRS,
  CashRegisterCloseReconciliationRS,
  CashRegisterEnterOtherIncomeRS,
  CashRegisterGetAssignedCashRegisterRS,
  CashRegisterGetCashWithdrawalsOfCurrentOpenReconciliationRS,
  CashRegisterGetClosedReconciliationRS,
  CashRegisterGetOpenedReconciliationsRS,
  CashRegisterGetOtherIncomeReceiptRS,
  CashRegisterGetWithdrawCashReceiptRS,
  CashRegisterListAssignationsRS,
  CashRegisterListCashiersRS,
  CashRegisterListRS,
  CashRegisterOpenReconciliationRS,
  CashRegisterReconciliationGetReportRS,
  CashRegisterUnassignCashierRS,
  CashRegisterWithdrawRS,
  CashRegisterGetCashWithdrawalsForCurrentCashierOpenReconciliationRS,
} from 'interface/responses/cash_register'
import { ModifyRS } from 'interface/responses/common'
import { Knex } from 'knex'
import {
  FormOfPayment,
  FormOfPaymentWithAmount,
} from 'interface/entities/purchase_order'
import {
  CashRegisterQuantityInputType,
  CashRegisterReconciliationState,
  CashRegisterWithdrawalStatus,
  OpenedCashRegisterReconciliation,
} from 'interface/entities/cash_register'
import * as purchase_order_model from './purchase_order'
import * as customer_credit_model from './customer_credit'
import { ApiErrorCode } from 'interface/entities/api_error_code'
import Transaction = Knex.Transaction

type RawCashRegister = {
  id: number
  name: string
  location_description: string
  quantity_input_type: string
  apply_wholesale_price_after_x_kg: string
}

type RawReconciliation = {
  id: number
  closed_at: string
  cash_register_id: number
  cash_register_name: string
  cashier_user_email: string
  cashier_user_name: string
  opening_cash_balance: number
  closing_cash_balance: number
  closing_credit_card_balance: number
  closing_credit_card_voucher_count: number
  closing_bank_transfer_balance: number
  closing_credit_balance: number
  actual_cash_balance: string
  actual_credit_card_balance: string
  actual_credit_card_voucher_count: string
  actual_bank_transfer_balance: string
  status: string
}

export async function add(
  ctx: Ctx,
  req: CashRegisterAddRQ,
): Promise<CashRegisterAddRS> {
  try {
    await ctx.knex('cash_register').insert({
      name: req.name,
      location_description: req.location_description,
      quantity_input_type: req.quantity_input_type,
      apply_wholesale_price_after_x_kg: req.apply_wholesale_price_after_x_kg,
    })
    return {
      success: true,
    }
  } catch (e) {
    console.log(e)
    return {
      success: false,
    }
  }
}

export async function modify(
  ctx: Ctx,
  req: CashRegisterModifyRQ,
): Promise<ModifyRS> {
  try {
    await ctx.knex('cash_register').where('id', req.id).update({
      name: req.name,
      location_description: req.location_description,
      quantity_input_type: req.quantity_input_type,
      apply_wholesale_price_after_x_kg: req.apply_wholesale_price_after_x_kg,
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

export async function list(
  ctx: Ctx,
  _req: CashRegisterListRQ,
): Promise<CashRegisterListRS> {
  const results = await ctx
    .knex('cash_register')
    .select(
      'id',
      'name',
      'location_description',
      'quantity_input_type',
      'apply_wholesale_price_after_x_kg',
    )
    .orderBy('id')

  const cashRegisters = results.map((cashRegister: RawCashRegister) => ({
    id: cashRegister.id,
    name: cashRegister.name,
    location_description: cashRegister.location_description,
    quantity_input_type:
      cashRegister.quantity_input_type as CashRegisterQuantityInputType,
    apply_wholesale_price_after_x_kg: Number(
      cashRegister.apply_wholesale_price_after_x_kg,
    ),
  }))

  return {
    cash_registers: cashRegisters,
  }
}

export async function listCashiers(
  ctx: Ctx,
  _req: CashRegisterListRQ,
): Promise<CashRegisterListCashiersRS> {
  const results = await ctx
    .knex('users')
    .select('email AS user_email', 'name AS user_name')
    .innerJoin('assigned_role', 'users.email', 'assigned_role.user_email')
    .whereIn('assigned_role.role_code', ['CASHIER', 'ADMIN'])

  return {
    cashiers: results,
  }
}

export async function listAssignations(
  ctx: Ctx,
  _req: CashRegisterListAssignationsRQ,
): Promise<CashRegisterListAssignationsRS> {
  const results = await ctx
    .knex('cash_register_assignation')
    .select(
      'cash_register_assignation.id',
      'cash_register.id AS cash_register_id',
      'cash_register.name AS cash_register_name',
      'users.email AS user_email',
      'users.name AS user_name',
    )
    .innerJoin(
      'cash_register',
      'cash_register.id',
      'cash_register_assignation.cash_register_id',
    )
    .innerJoin(
      'users',
      'users.email',
      'cash_register_assignation.assigned_user_email',
    )

  return {
    assignations: results,
  }
}

export async function assignCashier(
  ctx: Ctx,
  req: CashRegisterAssignCashierRQ,
): Promise<CashRegisterAssignCashierRS> {
  try {
    await ctx.knex('cash_register_assignation').insert({
      assigned_user_email: req.user_email,
      cash_register_id: req.cash_register_id,
    })
    return {
      success: true,
    }
  } catch (e) {
    console.log(e)
    return {
      success: false,
    }
  }
}

export async function unassignCashier(
  ctx: Ctx,
  req: CashRegisterUnassignCashierRQ,
): Promise<CashRegisterUnassignCashierRS> {
  try {
    await ctx
      .knex('cash_register_assignation')
      .where('assigned_user_email', req.user_email)
      .delete()
    return {
      success: true,
    }
  } catch (e) {
    console.log(e)
    return {
      success: false,
    }
  }
}

export async function getAssignedCashRegister(
  ctx: Ctx,
  _req: CashRegisterGetAssignedCashRegisterRQ,
): Promise<CashRegisterGetAssignedCashRegisterRS> {
  const userEmail = ctx.session.user_email
  const results = await ctx
    .knex('cash_register_assignation')
    .select(
      'cash_register.id AS id',
      'cash_register.name AS name',
      'cash_register.location_description AS location_description',
      'cash_register.quantity_input_type AS quantity_input_type',
      'cash_register.apply_wholesale_price_after_x_kg AS apply_wholesale_price_after_x_kg',
    )
    .innerJoin(
      'cash_register',
      'cash_register.id',
      'cash_register_assignation.cash_register_id',
    )
    .where('cash_register_assignation.assigned_user_email', userEmail)

  return {
    cash_register: results[0],
    has_open_reconciliation: await hasOpenedReconciliation(ctx, results[0]?.id),
  }
}

export async function hasOpenedReconciliation(
  ctx: Ctx,
  cashRegisterId: number | null,
): Promise<boolean> {
  if (!cashRegisterId) {
    return false
  }
  const result = await ctx
    .knex('cash_register_reconciliation')
    .select('id')
    .where('cash_register_reconciliation.cash_register_id', cashRegisterId)
    .andWhere('cash_register_reconciliation.status', 'OPENED')
    .first()

  return !!result
}

export async function openReconciliation(
  ctx: Ctx,
  req: CashRegisterOpenReconciliationRQ,
): Promise<CashRegisterOpenReconciliationRS> {
  const { opening_cash_balance } = req
  const assignedCashRegister = await getAssignedCashRegister(ctx, {})
  const cashRegisterId = assignedCashRegister.cash_register.id
  const userEmail = ctx.session.user_email
  if (await hasOpenedReconciliation(ctx, cashRegisterId)) {
    throw new Error('Cash register already has an open reconciliation')
  }
  try {
    await ctx.knex('cash_register_reconciliation').insert({
      cash_register_id: cashRegisterId,
      cashier_user_email: userEmail,
      opening_cash_balance: opening_cash_balance,
      closing_cash_balance: 0,
      closing_credit_card_balance: 0,
      closing_credit_card_voucher_count: 0,
      closing_bank_transfer_balance: 0,
      opened_at: ctx.knex.fn.now(),
      status: 'OPENED',
    })
    return {
      success: true,
    }
  } catch (e) {
    console.log(e)
    return {
      success: false,
    }
  }
}

export async function closeReconciliation(
  ctx: Ctx,
  req: CashRegisterCloseReconciliationRQ,
): Promise<CashRegisterCloseReconciliationRS> {
  const {
    cash_register_id,
    actual_cash_balance,
    actual_credit_card_voucher_count,
  } = req
  const currentOpenReconciliations = await ctx
    .knex('cash_register_reconciliation')
    .select(
      'id',
      'closing_credit_card_balance',
      'closing_credit_balance',
      'closing_bank_transfer_balance',
    )
    .where('cash_register_id', cash_register_id)
    .andWhere('status', 'OPENED')

  if (currentOpenReconciliations.length > 1) {
    throw new Error('More than one open reconciliation found')
  }
  if (currentOpenReconciliations.length === 0) {
    throw new Error('No open reconciliation found')
  }
  const {
    id,
    closing_credit_card_balance,
    closing_credit_balance,
    closing_bank_transfer_balance,
  } = currentOpenReconciliations[0]

  await ctx
    .knex('cash_register_reconciliation')
    .update({
      actual_cash_balance: actual_cash_balance,
      actual_credit_card_balance: closing_credit_card_balance,
      actual_credit_balance: closing_credit_balance,
      actual_credit_card_voucher_count: actual_credit_card_voucher_count,
      actual_bank_transfer_balance: closing_bank_transfer_balance,
      closed_at: ctx.knex.fn.now(),
      status: 'CLOSED',
    })
    .where('id', id)

  return {
    success: true,
  }
}

export async function updateCashRegisterReconciliationWithTrx(
  ctx: Ctx,
  trx: Transaction,
  cashRegisterId: number,
  formOfPayments: FormOfPaymentWithAmount[],
  total: number,
): Promise<void> {
  const formOfPaymentAmounts = formOfPayments.reduce((acc, formOfPayment) => {
    if (!acc[formOfPayment.form_of_payment]) {
      acc[formOfPayment.form_of_payment] = 0
    }
    acc[formOfPayment.form_of_payment] += formOfPayment.amount
    return acc
  }, {} as Record<FormOfPayment, number>)

  const fop_amount =
    formOfPayments?.reduce(
      (acc: number, fop: FormOfPaymentWithAmount) => acc + Number(fop.amount),
      0,
    ) ?? 0

  const change = fop_amount > total ? Number(fop_amount) - total : 0

  formOfPaymentAmounts[FormOfPayment.CASH] =
    (formOfPaymentAmounts[FormOfPayment.CASH] ?? 0) > 0
      ? formOfPaymentAmounts[FormOfPayment.CASH] - change
      : 0

  const currentOpenReconciliations = await trx('cash_register_reconciliation')
    .select('id')
    .where('cash_register_id', cashRegisterId)
    .andWhere('status', 'OPENED')

  if (currentOpenReconciliations.length > 1) {
    throw new Error('More than one open reconciliation found')
  }
  if (currentOpenReconciliations.length === 0) {
    throw new Error('No open reconciliation found')
  }
  const openReconciliationId = currentOpenReconciliations[0].id
  await trx('cash_register_reconciliation')
    .increment('closing_cash_balance', formOfPaymentAmounts.CASH ?? 0)
    .increment(
      'closing_credit_card_balance',
      formOfPaymentAmounts.CREDIT_CARD ?? 0,
    )
    .increment(
      'closing_credit_card_voucher_count',
      formOfPaymentAmounts.CREDIT_CARD ? 1 : 0,
    )

    .increment(
      'closing_bank_transfer_balance',
      formOfPaymentAmounts.TRANSFER ?? 0,
    )
    .increment('closing_credit_balance', formOfPaymentAmounts.CREDIT ?? 0)
    .update('updated_at', ctx.knex.fn.now())
    .where('id', openReconciliationId)
}

export async function decrementCashRegisterReconciliationWithTrx(
  ctx: Ctx,
  trx: Transaction,
  cashRegisterId: number,
  formOfPayments: FormOfPaymentWithAmount[],
): Promise<void> {
  const formOfPaymentAmounts = formOfPayments.reduce((acc, formOfPayment) => {
    if (!acc[formOfPayment.form_of_payment]) {
      acc[formOfPayment.form_of_payment] = 0
    }
    acc[formOfPayment.form_of_payment] += formOfPayment.amount
    return acc
  }, {} as Record<FormOfPayment, number>)

  const currentOpenReconciliations = await trx('cash_register_reconciliation')
    .select('id')
    .where('cash_register_id', cashRegisterId)
    .andWhere('status', 'OPENED')

  if (currentOpenReconciliations.length > 1) {
    throw new Error('More than one open reconciliation found')
  }
  if (currentOpenReconciliations.length === 0) {
    throw new Error('No open reconciliation found')
  }
  const openReconciliationId = currentOpenReconciliations[0].id
  await trx('cash_register_reconciliation')
    .decrement('closing_cash_balance', formOfPaymentAmounts.CASH ?? 0)
    .decrement(
      'closing_credit_card_balance',
      formOfPaymentAmounts.CREDIT_CARD ?? 0,
    )
    .decrement(
      'closing_credit_card_voucher_count',
      formOfPaymentAmounts.CREDIT_CARD ? 1 : 0,
    )
    .decrement(
      'closing_bank_transfer_balance',
      formOfPaymentAmounts.TRANSFER ?? 0,
    )
    .decrement('closing_credit_balance', formOfPaymentAmounts.CREDIT ?? 0)
    .update('updated_at', ctx.knex.fn.now())
    .where('id', openReconciliationId)
}

export async function getOpenedReconciliations(
  ctx: Ctx,
  req: CashRegisterGetOpenedReconciliationsRQ,
): Promise<CashRegisterGetOpenedReconciliationsRS> {
  const { cash_register_ids } = req
  const query = ctx
    .knex('cash_register_reconciliation')
    .select(
      'cash_register_reconciliation.id',
      'cash_register.id AS cash_register_id',
      'cash_register.name AS cash_register_name',
      'users.email AS cashier_user_email',
      'users.name AS cashier_user_name',
      'cash_register_reconciliation.opening_cash_balance AS opening_cash_balance',
      'cash_register_reconciliation.closing_cash_balance AS closing_cash_balance',
      'cash_register_reconciliation.closing_credit_card_balance AS closing_credit_card_balance',
      'cash_register_reconciliation.closing_credit_card_voucher_count AS closing_credit_card_voucher_count',
      'cash_register_reconciliation.closing_bank_transfer_balance AS closing_bank_transfer_balance',
      'cash_register_reconciliation.closing_credit_balance AS closing_credit_balance',
    )
    .innerJoin(
      'cash_register',
      'cash_register.id',
      'cash_register_reconciliation.cash_register_id',
    )
    .innerJoin(
      'users',
      'users.email',
      'cash_register_reconciliation.cashier_user_email',
    )
    .whereIn('cash_register_reconciliation.cash_register_id', cash_register_ids)
    .where('cash_register_reconciliation.status', 'OPENED')

  const results = await query
  const reconciliations = results.reduce(
    (acc, reconciliation: RawReconciliation) => {
      const cashRegisterId = reconciliation.cash_register_id
      if (!acc[cashRegisterId]) {
        acc[cashRegisterId] = {
          id: reconciliation.id,
          cash_register_id: reconciliation.cash_register_id,
          cashier_user_email: reconciliation.cashier_user_email,
          cashier_user_name: reconciliation.cashier_user_name,
          opening_cash_balance: reconciliation.opening_cash_balance,
          closing_cash_balance: reconciliation.closing_cash_balance,
          closing_credit_card_balance:
            reconciliation.closing_credit_card_balance,
          closing_credit_card_voucher_count:
            reconciliation.closing_credit_card_voucher_count,
          closing_bank_transfer_balance:
            reconciliation.closing_bank_transfer_balance,
          closing_credit_balance: reconciliation.closing_credit_balance,
        }
      }
      return acc
    },
    {} as {
      [cashRegisterId: number]: OpenedCashRegisterReconciliation
    },
  )

  return {
    opened_reconciliations: reconciliations,
  }
}

export async function getOpenedReconciliation(
  ctx: Ctx,
  cashRegisterId: number,
) {
  const result = await ctx
    .knex('cash_register_reconciliation')
    .select(
      'cash_register_reconciliation.id',
      'cash_register.id AS cash_register_id',
      'cash_register.name AS cash_register_name',
      'users.email AS cashier_user_email',
      'users.name AS cashier_user_name',
      'cash_register_reconciliation.opening_cash_balance AS opening_cash_balance',
      'cash_register_reconciliation.closing_cash_balance AS closing_cash_balance',
      'cash_register_reconciliation.closing_credit_card_balance AS closing_credit_card_balance',
      'cash_register_reconciliation.closing_credit_card_voucher_count AS closing_credit_card_voucher_count',
      'cash_register_reconciliation.closing_bank_transfer_balance AS closing_bank_transfer_balance',
      'cash_register_reconciliation.closing_credit_balance AS closing_credit_balance',
    )
    .innerJoin(
      'cash_register',
      'cash_register.id',
      'cash_register_reconciliation.cash_register_id',
    )
    .innerJoin(
      'users',
      'users.email',
      'cash_register_reconciliation.cashier_user_email',
    )
    .where('cash_register_reconciliation.cash_register_id', cashRegisterId)
    .andWhere('cash_register_reconciliation.status', 'OPENED')
    .first()

  return {
    id: result.id,
    cash_register_id: result.cash_register_id,
    cashier_user_email: result.cashier_user_email,
    cashier_user_name: result.cashier_user_name,
    opening_cash_balance: result.opening_cash_balance,
    closing_cash_balance: result.closing_cash_balance,
    closing_credit_card_balance: result.closing_credit_card_balance,
    closing_credit_card_voucher_count: result.closing_credit_card_voucher_count,
    closing_bank_transfer_balance: result.closing_bank_transfer_balance,
    closing_credit_balance: result.closing_credit_balance,
  }
}

async function getCashWithdrawalForReconciliationReceipt(
  ctx: Ctx,
  reconciliationId: number,
) {
  const result = await ctx
    .knex('cash_register_withdrawal')
    .innerJoin('cause', 'cash_register_withdrawal.cause_id', 'cause.id')
    .select(
      'cash_register_withdrawal.id AS id',
      'cause.description AS withdrawal_cause',
      'amount',
      'cash_register_withdrawal.created_at',
    )
    .where(
      'cash_register_withdrawal.cash_register_reconciliation_id',
      reconciliationId,
    )
    .where('cash_register_withdrawal.status', 'PROCESSED')

  return result.map((result: any) => {
    return {
      id: result.id,
      withdrawal_cause: result.withdrawal_cause,
      amount: Number(result.amount),
      created_at: result.created_at,
    }
  })
}
async function getOtherIncomeForReconciliationReceipt(
  ctx: Ctx,
  reconciliationId: number,
) {
  const result = await ctx
    .knex('cash_register_other_income')
    .innerJoin('cause', 'cash_register_other_income.cause_id', 'cause.id')
    .select(
      'cash_register_other_income.id AS id',
      'cause.description AS other_income_cause',
      'amount',
      'cash_register_other_income.created_at',
      'cash_register_other_income.form_of_payment',
      'cash_register_other_income.transfer_bank_account_id',
    )
    .where(
      'cash_register_other_income.cash_register_reconciliation_id',
      reconciliationId,
    )

  return result.map((result: any) => {
    return {
      id: result.id,
      cause: result.other_income_cause,
      amount: Number(result.amount),
      form_of_payment: result.form_of_payment,
      transfer_bank_account_id: result.transfer_bank_account_id,
      created_at: result.created_at,
    }
  })
}

export async function getClosedReconciliation(
  ctx: Ctx,
  req: { reconciliation_id: number },
): Promise<CashRegisterGetClosedReconciliationRS> {
  const result = await ctx
    .knex('cash_register_reconciliation')
    .select(
      'cash_register_reconciliation.id',
      'cash_register_reconciliation.closed_at',
      'cash_register.id AS cash_register_id',
      'cash_register.name AS cash_register_name',
      'users.email AS cashier_user_email',
      'users.name AS cashier_user_name',
      'cash_register_reconciliation.opening_cash_balance AS opening_cash_balance',
      'cash_register_reconciliation.closing_cash_balance AS closing_cash_balance',
      'cash_register_reconciliation.closing_credit_card_balance AS closing_credit_card_balance',
      'cash_register_reconciliation.closing_credit_card_voucher_count AS closing_credit_card_voucher_count',
      'cash_register_reconciliation.closing_bank_transfer_balance AS closing_bank_transfer_balance',
      'cash_register_reconciliation.actual_cash_balance AS actual_cash_balance',
      'cash_register_reconciliation.actual_credit_card_balance AS actual_credit_card_balance',
      'cash_register_reconciliation.actual_credit_card_voucher_count AS actual_credit_card_voucher_count',
      'cash_register_reconciliation.actual_bank_transfer_balance AS actual_bank_transfer_balance',
      'cash_register_reconciliation.closing_credit_balance AS closing_credit_balance',
    )
    .innerJoin(
      'cash_register',
      'cash_register.id',
      'cash_register_reconciliation.cash_register_id',
    )
    .innerJoin(
      'users',
      'users.email',
      'cash_register_reconciliation.cashier_user_email',
    )
    .where('cash_register_reconciliation.id', req.reconciliation_id)
    .andWhere('cash_register_reconciliation.status', 'CLOSED')
    .first()

  const purchaseOrdersReceipt =
    await purchase_order_model.getForReconciliationReceipt(ctx, result.id)

  const customerCreditPaymentsReceipt =
    await customer_credit_model.getForReconciliationReceipt(ctx, result.id)

  const cashWithdrawalReceipts =
    await getCashWithdrawalForReconciliationReceipt(ctx, result.id)

  const otherIncomeReceipts = await getOtherIncomeForReconciliationReceipt(
    ctx,
    result.id,
  )

  return {
    reconciliation: {
      id: result.id,
      closed_at: result.closed_at,
      cash_register_id: result.cash_register_id,
      cashier_user_email: result.cashier_user_email,
      cashier_user_name: result.cashier_user_name,
      opening_cash_balance: result.opening_cash_balance,
      closing_cash_balance: result.closing_cash_balance,
      closing_credit_card_balance: result.closing_credit_card_balance,
      closing_credit_card_voucher_count:
        result.closing_credit_card_voucher_count,
      closing_bank_transfer_balance: result.closing_bank_transfer_balance,
      actual_cash_balance: result.actual_cash_balance,
      actual_credit_card_balance: result.actual_credit_card_balance,
      actual_credit_card_voucher_count: result.actual_credit_card_voucher_count,
      actual_bank_transfer_balance: result.actual_bank_transfer_balance,
      closing_credit_balance: result.closing_credit_balance,
      purchase_orders_receipt: purchaseOrdersReceipt,
      customer_credit_payments_receipt: customerCreditPaymentsReceipt,
      cash_withdrawal_receipts: cashWithdrawalReceipts,
      other_income_receipts: otherIncomeReceipts,
      status: CashRegisterReconciliationState.CLOSED,
    },
  }
}

export async function withdrawCash(
  ctx: Ctx,
  req: CashRegisterWithdrawRQ,
): Promise<CashRegisterWithdrawRS> {
  const { cashRegisterWithdrawalCauseId, amount } = req
  let withdrawalId = -1
  const cashRegisterId = (await getAssignedCashRegister(ctx, {})).cash_register
    .id
  const cashRegisterReconciliation = await getOpenedReconciliation(
    ctx,
    cashRegisterId,
  )
  if (
    Number(amount) >
    Number(cashRegisterReconciliation.opening_cash_balance) +
      Number(cashRegisterReconciliation.closing_cash_balance)
  ) {
    return {
      success: false,
      errorCode: ApiErrorCode.WithdrawalAmountIsGreaterThanClosingCashBalance,
    }
  }
  try {
    await ctx.knex.transaction(async trx => {
      const response = await trx('cash_register_withdrawal')
        .insert({
          cash_register_id: cashRegisterId,
          cause_id: cashRegisterWithdrawalCauseId,
          amount,
          cash_register_reconciliation_id: cashRegisterReconciliation.id,
        })
        .returning('id')
      withdrawalId = response[0].id
      const currentOpenReconciliation =
        await getCashRegisterOpenedReconciliation(trx, cashRegisterId)
      await trx('cash_register_reconciliation')
        .decrement('closing_cash_balance', amount)
        .where('id', currentOpenReconciliation.id)
    })

    return {
      id: withdrawalId,
      success: true,
    }
  } catch (e) {
    console.log(e)
    return {
      success: false,
      errorCode: ApiErrorCode.Unknown,
    }
  }
}

export async function cancelCashWithdrawal(
  ctx: Ctx,
  req: CashRegisterCancelCashWithdrawalRQ,
  authorizedByUserEmail: string,
): Promise<ModifyRS> {
  const { withdrawal_id, cause_id } = req

  try {
    await ctx.knex.transaction(async trx => {
      const withdrawal = await trx('cash_register_withdrawal')
        .select('amount')
        .where({
          id: withdrawal_id,
        })
        .first()

      await trx('cash_register_withdrawal')
        .where({
          id: withdrawal_id,
        })
        .update({
          status: CashRegisterWithdrawalStatus.CANCELED,
          updated_at: ctx.knex.fn.now(),
        })

      await trx('canceled_cash_withdrawal').insert({
        cash_withdrawal_id: withdrawal_id,
        cause_id,
        authorized_by: authorizedByUserEmail,
      })

      const cashRegisterId = (await getAssignedCashRegister(ctx, {}))
        .cash_register.id
      const currentOpenReconciliation =
        await getCashRegisterOpenedReconciliation(trx, cashRegisterId)
      await trx('cash_register_reconciliation')
        .increment('closing_cash_balance', withdrawal.amount)
        .where('id', currentOpenReconciliation.id)
    })
    return {
      success: true,
    }
  } catch (error) {
    return {
      success: false,
      error: (error as Error).message,
    }
  }
}

export async function getWithdrawCashReceipt(
  ctx: Ctx,
  req: CashRegisterGetWithdrawCashReceiptRQ,
): Promise<CashRegisterGetWithdrawCashReceiptRS> {
  const result = await ctx
    .knex('cash_register_withdrawal')
    .innerJoin('cause', 'cash_register_withdrawal.cause_id', 'cause.id')
    .select(
      'cash_register_withdrawal.id AS id',
      'cause.description AS withdrawal_cause',
      'amount',
      'cash_register_withdrawal.created_at',
      'cash_register_withdrawal.status',
    )
    .where('cash_register_withdrawal.id', req.withdrawal_id)
    .first()

  return {
    id: result.id,
    cause: result.withdrawal_cause,
    amount: Number(result.amount),
    created_at: result.created_at,
    status: result.status,
  }
}

export async function getCashWithdrawalsOfCurrentOpenReconciliation(
  ctx: Ctx,
  req: CashRegisterGetCashWithdrawalsOfCurrentOpenReconciliationRQ,
): Promise<CashRegisterGetCashWithdrawalsOfCurrentOpenReconciliationRS> {
  const assignedCashRegister = await getAssignedCashRegister(ctx, {})
  const cashRegisterId = assignedCashRegister.cash_register?.id

  if (!cashRegisterId) {
    return {
      receipts: [],
    }
  }

  const currentOpenReconciliation = await ctx
    .knex('cash_register_reconciliation')
    .select('id')
    .where('cash_register_id', cashRegisterId)
    .andWhere('status', 'OPENED')
    .first()

  if (!currentOpenReconciliation) {
    return {
      receipts: [],
    }
  }

  const receipts = await ctx
    .knex('cash_register_withdrawal')
    .select(
      'cash_register_withdrawal.id',
      'cause.description AS cause',
      'cash_register_withdrawal.amount',
      'cash_register_withdrawal.created_at',
      'cash_register_withdrawal.status',
    )
    .innerJoin('cause', 'cause.id', 'cash_register_withdrawal.cause_id')
    .where(
      'cash_register_withdrawal.cash_register_reconciliation_id',
      currentOpenReconciliation.id,
    )
    .orderBy('cash_register_withdrawal.created_at', 'desc')

  return {
    receipts,
  }
}

export async function getCashWithdrawalsForCurrentCashierOpenReconciliation(
  ctx: Ctx,
  req: CashRegisterGetCashWithdrawalsForCurrentCashierOpenReconciliationRQ,
): Promise<CashRegisterGetCashWithdrawalsForCurrentCashierOpenReconciliationRS> {
  const { user_email } = req
  const assignedCashRegister = await getAssignedCashRegister(ctx, {})
  const cashRegisterId = assignedCashRegister.cash_register?.id

  if (!cashRegisterId) {
    return {
      receipts: [],
      cash_register_name: '',
    }
  }

  const currentOpenReconciliation = await ctx
    .knex('cash_register_reconciliation')
    .select('id')
    .where('cash_register_id', cashRegisterId)
    .andWhere('status', 'OPENED')
    .first()

  if (!currentOpenReconciliation) {
    return {
      receipts: [],
      cash_register_name: '',
    }
  }

  // Get the cash register name
  const cashRegister = await ctx
    .knex('cash_register')
    .select('name')
    .where('id', cashRegisterId)
    .first()

  if (!cashRegister) {
    return {
      receipts: [],
      cash_register_name: '',
    }
  }

  const receipts = await ctx
    .knex('cash_register_withdrawal')
    .select(
      'cash_register_withdrawal.id',
      'cause.description AS cause',
      'cash_register_withdrawal.amount',
      'cash_register_withdrawal.created_at',
      'cash_register_withdrawal.status',
    )
    .innerJoin('cause', 'cause.id', 'cash_register_withdrawal.cause_id')
    .where(
      'cash_register_withdrawal.cash_register_reconciliation_id',
      currentOpenReconciliation.id,
    )
    .orderBy('cash_register_withdrawal.created_at', 'desc')

  return {
    receipts,
    cash_register_name: cashRegister.name,
  }
}

export async function getCashWithdrawalsForAllCashiersOpenReconciliation(
  ctx: Ctx,
  cashRegisterIds: number[],
): Promise<CashRegisterGetCashWithdrawalsForCurrentCashierOpenReconciliationRS> {
  if (!cashRegisterIds.length) {
    return {
      receipts: [],
      cash_register_name: '',
    }
  }

  // Get all current open reconciliations for the given cash registers
  const currentOpenReconciliations = await ctx
    .knex('cash_register_reconciliation')
    .select('id', 'cash_register_id')
    .whereIn('cash_register_id', cashRegisterIds)
    .andWhere('status', 'OPENED')

  if (!currentOpenReconciliations.length) {
    return {
      receipts: [],
      cash_register_name: '',
    }
  }

  // Get all cash register names
  const cashRegisters = await ctx
    .knex('cash_register')
    .select('id', 'name')
    .whereIn('id', cashRegisterIds)

  if (!cashRegisters.length) {
    return {
      receipts: [],
      cash_register_name: '',
    }
  }

  // Create a map of cash register names for easy lookup
  const cashRegisterNames = new Map(
    cashRegisters.map(cr => [cr.id, cr.name])
  )

  // Get all withdrawals for the open reconciliations
  const receipts = await ctx
    .knex('cash_register_withdrawal')
    .select(
      'cash_register_withdrawal.id',
      'cause.description AS cause',
      'cash_register_withdrawal.amount',
      'cash_register_withdrawal.created_at',
      'cash_register_withdrawal.status',
      'cash_register_reconciliation.cash_register_id',
    )
    .innerJoin('cause', 'cause.id', 'cash_register_withdrawal.cause_id')
    .innerJoin(
      'cash_register_reconciliation',
      'cash_register_reconciliation.id',
      'cash_register_withdrawal.cash_register_reconciliation_id'
    )
    .whereIn(
      'cash_register_withdrawal.cash_register_reconciliation_id',
      currentOpenReconciliations.map(r => r.id)
    )
    .orderBy('cash_register_withdrawal.created_at', 'desc')

  // Add cash register name to each receipt
  const receiptsWithCashRegisterName = receipts.map(receipt => ({
    ...receipt,
    cash_register_name: cashRegisterNames.get(receipt.cash_register_id) || '',
  }))

  return {
    receipts: receiptsWithCashRegisterName,
    cash_register_name: cashRegisters.map(cr => cr.name).join(', '),
  }
}

export async function enterOtherIncome(
  ctx: Ctx,
  req: CashRegisterEnterOtherIncomeRQ,
): Promise<CashRegisterEnterOtherIncomeRS> {
  const { cause_id, form_of_payment_with_amount } = req
  const { form_of_payment, amount, transfer_bank_account_id } =
    form_of_payment_with_amount
  let otherIncomeId = -1
  const cashRegisterId = (await getAssignedCashRegister(ctx, {})).cash_register
    .id
  const cashRegisterReconciliation = await getOpenedReconciliation(
    ctx,
    cashRegisterId,
  )

  try {
    await ctx.knex.transaction(async trx => {
      const response = await trx('cash_register_other_income')
        .insert({
          cash_register_id: cashRegisterId,
          cause_id,
          amount,
          transfer_bank_account_id: transfer_bank_account_id,
          cash_register_reconciliation_id: cashRegisterReconciliation.id,
        })
        .returning('id')
      otherIncomeId = response[0].id
      const currentOpenReconciliation =
        await getCashRegisterOpenedReconciliation(trx, cashRegisterId)
      if (form_of_payment === FormOfPayment.CREDIT) {
        throw new Error('Invalid form of payment')
      }
      if (form_of_payment === FormOfPayment.CASH) {
        await trx('cash_register_reconciliation')
          .increment('closing_cash_balance', amount)
          .where('id', currentOpenReconciliation.id)
      }
      if (form_of_payment === FormOfPayment.TRANSFER) {
        await trx('cash_register_reconciliation')
          .increment('closing_bank_transfer_balance', amount)
          .where('id', currentOpenReconciliation.id)
      }
    })

    return {
      id: otherIncomeId,
      success: true,
    }
  } catch (e) {
    console.log(e)
    return {
      success: false,
      errorCode: ApiErrorCode.Unknown,
    }
  }
}

export async function getOtherIncomeReceipt(
  ctx: Ctx,
  req: CashRegisterGetOtherIncomeReceiptRQ,
): Promise<CashRegisterGetOtherIncomeReceiptRS> {
  const result = await ctx
    .knex('cash_register_other_income')
    .innerJoin('cause', 'cash_register_other_income.cause_id', 'cause.id')
    .select(
      'cash_register_other_income.id AS id',
      'cause.description AS cause_description',
      'amount',
      'cash_register_other_income.created_at',
    )
    .where('cash_register_other_income.id', req.other_income_id)
    .first()

  return {
    id: result.id,
    cause: result.cause_description,
    amount: Number(result.amount),
    created_at: result.created_at,
  }
}

async function getCashRegisterOpenedReconciliation(
  trx: Transaction,
  cashRegisterId: number,
) {
  const currentOpenReconciliations = await trx('cash_register_reconciliation')
    .select('id')
    .where('cash_register_id', cashRegisterId)
    .andWhere('status', 'OPENED')

  if (currentOpenReconciliations.length > 1) {
    throw new Error('More than one open reconciliation found')
  }
  if (currentOpenReconciliations.length === 0) {
    throw new Error('No open reconciliation found')
  }
  return currentOpenReconciliations[0]
}

export async function getReconciliationsReport(
  ctx: Ctx,
  req: CashRegisterReconciliationGetReportRQ,
): Promise<CashRegisterReconciliationGetReportRS> {
  const { cash_register_id } = req
  const result = await ctx.knex.raw(
    `
      SELECT 
        cash_register_reconciliation.id,
        cash_register_reconciliation.closed_at,
        cash_register.id AS cash_register_id,
        cash_register.name AS cash_register_name,
        users.email AS cashier_user_email,
        users.name AS cashier_user_name,
        cash_register_reconciliation.opening_cash_balance AS opening_cash_balance,
        cash_register_reconciliation.closing_cash_balance AS closing_cash_balance,
        cash_register_reconciliation.closing_credit_card_balance AS closing_credit_card_balance,
        cash_register_reconciliation.closing_credit_card_voucher_count AS closing_credit_card_voucher_count,
        cash_register_reconciliation.closing_bank_transfer_balance AS closing_bank_transfer_balance,
        cash_register_reconciliation.actual_cash_balance AS actual_cash_balance,
        cash_register_reconciliation.actual_credit_card_balance AS actual_credit_card_balance,
        cash_register_reconciliation.actual_credit_card_voucher_count AS actual_credit_card_voucher_count,
        cash_register_reconciliation.actual_bank_transfer_balance AS actual_bank_transfer_balance,
        cash_register_reconciliation.closing_credit_balance AS closing_credit_balance,
        cash_register_reconciliation.status AS status
      FROM cash_register_reconciliation
        INNER JOIN cash_register ON cash_register.id = cash_register_reconciliation.cash_register_id
        INNER JOIN users ON users.email = cash_register_reconciliation.cashier_user_email
      WHERE cash_register_reconciliation.cash_register_id = :cash_register_id
      ORDER BY cash_register_reconciliation.created_at DESC
      LIMIT 100
        `,
    {
      cash_register_id,
    },
  )

  return {
    reconciliations: (result.rows || []).map((result: RawReconciliation) => {
      return {
        id: result.id,
        closed_at: result.closed_at,
        cash_register_id: result.cash_register_id,
        cashier_user_email: result.cashier_user_email,
        cashier_user_name: result.cashier_user_name,
        opening_cash_balance: result.opening_cash_balance,
        closing_cash_balance: result.closing_cash_balance,
        closing_credit_card_balance: result.closing_credit_card_balance,
        closing_credit_card_voucher_count:
          result.closing_credit_card_voucher_count,
        closing_bank_transfer_balance: result.closing_bank_transfer_balance,
        actual_cash_balance: Number(result.actual_cash_balance),
        actual_credit_card_balance: Number(result.actual_credit_card_balance),
        actual_credit_card_voucher_count: Number(
          result.actual_credit_card_voucher_count,
        ),
        actual_bank_transfer_balance: Number(
          result.actual_bank_transfer_balance,
        ),
        closing_credit_balance: result.closing_credit_balance,
        status: result.status as CashRegisterReconciliationState,
        purchase_orders_receipt: {
          cash_purchase_orders: [],
          credit_purchase_orders: [],
          purchase_orders_by_transfer_bank_account: [],
          total: 0,
        },
      }
    }),
  }
}
