import { FormOfPayment } from './purchase_order'

export type CustomerCredit = {
  customer_name: string
  credits_total: number
  payments_total: number
}

export type CustomerCreditPaymentReceipt = {
  id: number
  customer_name: string
  previous_balance: number | null
  payment_amount: number
  new_balance: number | null
  created_at: string
  form_of_payment: FormOfPayment
  transfer_bank_account_name: string | null
}

export type CustomerCreditPaymentForReconciliationReceipt = {
  cash_credit_payments: CustomerCreditPaymentAmount[]
  credit_payments_by_transfer_bank_account: CustomerCreditPaymentForBankAccount
  total: number
}

export type CustomerCreditPaymentAmount = {
  customer_credit_payment_id: number
  customer_name: string
  amount: number
}

export type CustomerCreditPaymentForBankAccount = {
  [bankAccountId: number]: {
    bank_account_name: string
    total: number
    credit_payment: CustomerCreditPaymentAmount[]
  }
}

export enum CustomerCreditPaymentStatus {
  PROCESSED = 'PROCESSED',
  CANCELED = 'CANCELED',
}

export type CustomerCreditPayment = {
  id: number
  customer_name: string
  previous_balance: number | null
  payment_amount: number
  new_balance: number | null
  created_at: string
  status: CustomerCreditPaymentStatus
}
