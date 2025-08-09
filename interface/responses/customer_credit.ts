import {
  CustomerCredit,
  CustomerCreditPayment,
  CustomerCreditPaymentReceipt,
} from '../entities/customer_credit'
import {
  FormOfPaymentWithAmount,
  PurchaseOrderReceipt,
  PurchaseOrderReceiptDetail,
} from '../entities/purchase_order'
import { ApiResponse } from '../entities/common'

export type CustomerCreditGetForCustomerRS = {
  credit: CustomerCredit
}

export type CustomerCreditListRS = {
  credits: CustomerCredit[]
}

export type CustomerCreditAddPaymentRS = {
  payment_id: number
  success: boolean
  error_message?: string
}

export type CustomerCreditCancelPaymentRS = ApiResponse<{}>

export type CustomerCreditGetPaymentReceiptRS = {
  receipt: CustomerCreditPaymentReceipt
}

export type CustomerCreditGetUnpaidPurchaseOrdersRS = {
  unpaid_purchase_orders: PurchaseOrderReceipt[]
}

export type CustomerCreditGetPaymentsGetByCustomerRS = {
  payments: CustomerCreditPayment[]
}

export type CreditPurchaseOrder = {
  order_id: number
  total: number
  paid: number
  created_at: string
}

export type CustomerCreditGetCustomerCreditPurchaseOrdersReportRS = {
  purchase_orders: CreditPurchaseOrder[]
  payments: CustomerCreditPayment[]
  credit_balance: number
  credit_purchases_amount_not_in_system: number
  credit_payments_amount_not_in_system: number
}

export type CustomerCreditGetPaymentsOfCurrentOpenReconciliationRS = {
  payments: CustomerCreditPayment[]
}

export type CustomerCreditGetPaymentRS = {
  payment: CustomerCreditPayment | null
}
