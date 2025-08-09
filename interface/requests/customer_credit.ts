import { FormOfPaymentWithAmount } from '../entities/purchase_order'

export type CustomerCreditGetForCustomerRQ = {
  customer_id: number
}

export type CustomerCreditListRQ = {}

export type CustomerCreditAddPaymentRQ = {
  customer_id: number
  form_of_payment: FormOfPaymentWithAmount
}

export type CustomerCreditCancelPaymentRQ = {
  user_authorization_code: string
  customer_credit_payment_id: number
  cause_id: number
}

export type CustomerCreditGetPaymentRQ = {
  id: number
}

export type CustomerCreditGetPaymentReceiptRQ = {
  customer_credit_payment_id: number
}

export type CustomerCreditGetUnpaidPurchaseOrdersRQ = {
  customer_id: number
}

export type CustomerCreditGetPaymentsByCustomerRQ = {
  customer_id: number
}

export type CustomerCreditGetCustomerCreditPurchaseOrdersReportRQ = {
  customer_id: number
}

export type CustomerCreditGetPaymentsOfCurrentOpenReconciliationRQ = {}
