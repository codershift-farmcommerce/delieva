import { FormOfPaymentWithAmount } from '../entities/purchase_order'
import { Cart } from '../entities/cart'

export type PurchaseOrderGetReceiptRQ = {
  order_id: number
}

export type PurchaseOrderProcessRQ = {
  customer_id: number
  cart: Cart
  form_of_payments: FormOfPaymentWithAmount[]
}

export type PurchaseOrderGetReportRQ = {
  start_date: Date
  end_date: Date
}

export type PurchaseOrderGetAnnualReportRQ = {
  year: number
  withDetails: boolean
}

export type PurchaseOrderReturnOrderRQ = {
  order_id: number
  cause_id: number
}

export type PurchaseOrderDetailAndReturnCause = {
  order_detail_id: string
  cause_id: number
}

export type PurchaseOrderReturnOrderDetailsRQ = {
  order_id: number
  details_and_causes: PurchaseOrderDetailAndReturnCause[]
}
