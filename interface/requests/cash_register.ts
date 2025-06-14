import { CashRegisterQuantityInputType } from '../entities/cash_register'
import { FormOfPaymentWithAmount } from '../entities/purchase_order'

export type CashRegisterAddRQ = {
  name: string
  location_description: string
  quantity_input_type: CashRegisterQuantityInputType
  apply_wholesale_price_after_x_kg: number
}

export type CashRegisterListRQ = {}

export type CashRegisterModifyRQ = {
  id: number
  name: string
  location_description: string
  quantity_input_type: CashRegisterQuantityInputType
  apply_wholesale_price_after_x_kg: number
}

export type CashRegisterListCashiersRQ = {}

export type CashRegisterListAssignationsRQ = {}

export type CashRegisterAssignCashierRQ = {
  cash_register_id: number
  user_email: string
}

export type CashRegisterUnassignCashierRQ = {
  user_email: string
}

export type CashRegisterGetAssignedCashRegisterRQ = {}

export type CashRegisterOpenReconciliationRQ = {
  opening_cash_balance: number
}

export type CashRegisterCloseReconciliationRQ = {
  cash_register_id: number
  actual_cash_balance: number
  actual_credit_card_voucher_count: number
}

export type CashRegisterGetOpenedReconciliationsRQ = {
  cash_register_ids: number[]
}

export type CashRegisterGetClosedReconciliationRQ = {
  reconciliation_id: number
}

export type CashRegisterWithdrawRQ = {
  cashRegisterWithdrawalCauseId: number
  amount: number
}

export type CashRegisterEnterOtherIncomeRQ = {
  cause_id: number
  form_of_payment_with_amount: FormOfPaymentWithAmount
}

export type CashRegisterGetWithdrawCashReceiptRQ = {
  withdrawal_id: number
}

export type CashRegisterCancelCashWithdrawalRQ = {
  user_authorization_code: string
  withdrawal_id: number
  cause_id: number
}

export type CashRegisterGetCashWithdrawalsOfCurrentOpenReconciliationRQ = {}

export type CashRegisterGetCashWithdrawalsForCurrentCashierOpenReconciliationRQ = {}

export type CashRegisterGetOtherIncomeReceiptRQ = {
  other_income_id: number
}

export type CashRegisterReconciliationGetReportRQ = {
  cash_register_id: number
}

export type CashRegisterGetCashWithdrawalsForAllCashiersOpenReconciliationRQ = {
  cash_register_ids: number[]
}
