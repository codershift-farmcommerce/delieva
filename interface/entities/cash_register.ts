import {
  FormOfPayment,
  PurchaseOrderForReconciliationReceipt,
} from './purchase_order'
import { CustomerCreditPaymentForReconciliationReceipt } from './customer_credit'

export enum CashRegisterQuantityInputType {
  MANUAL = 'MANUAL',
  PRODUCT_SCAN = 'PRODUCT_SCAN',
}

export type CashRegister = {
  id: number
  name: string
  location_description: string
  quantity_input_type: CashRegisterQuantityInputType
  apply_wholesale_price_after_x_kg: number
}

export type Cashier = {
  user_email: string
  user_name: string
}

export type CashRegisterAssignation = {
  id: number
  cash_register_id: number
  cash_register_name: string
  user_email: string
  user_name: string
}

export type OpenedCashRegisterReconciliation = {
  id: number
  cash_register_id: number
  cashier_user_email: string
  cashier_user_name: string
  opening_cash_balance: number
  closing_cash_balance: number
  closing_credit_card_balance: number
  closing_credit_card_voucher_count: number
  closing_bank_transfer_balance: number
  closing_credit_balance: number
}

export enum CashRegisterReconciliationState {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
}

export type CashWithdrawalReceiptForReconciliationReport = {
  id: number
  withdrawal_cause: string
  amount: number
  created_at: string
}

export type OtherIncomeReceiptForReconciliationReport = {
  id: number
  cause: string
  amount: number
  form_of_payment: FormOfPayment
  transfer_bank_account_id: number
  created_at: string
}

export type CashRegisterReconciliation = {
  id: number
  closed_at: string
  cash_register_id: number
  cashier_user_email: string
  cashier_user_name: string
  opening_cash_balance: number
  closing_cash_balance: number
  closing_credit_card_balance: number
  closing_credit_card_voucher_count: number
  closing_bank_transfer_balance: number
  actual_cash_balance: number
  actual_credit_card_balance: number
  actual_credit_card_voucher_count: number
  actual_bank_transfer_balance: number
  closing_credit_balance: number
  purchase_orders_receipt: PurchaseOrderForReconciliationReceipt
  customer_credit_payments_receipt: CustomerCreditPaymentForReconciliationReceipt
  cash_withdrawal_receipts: CashWithdrawalReceiptForReconciliationReport[]
  other_income_receipts: OtherIncomeReceiptForReconciliationReport[]
  status: CashRegisterReconciliationState
}

export enum CashRegisterWithdrawalStatus {
  PROCESSED = 'PROCESSED',
  CANCELED = 'CANCELED',
}

export type CashRegisterWithdrawalReceipt = {
  id: number
  cause: string
  amount: number
  created_at: string
  status: CashRegisterWithdrawalStatus
}

export type CashRegisterOtherIncomeReceipt = {
  id: number
  cause: string
  amount: number
  created_at: string
}
