import {
  PurchaseOrderReceipt,
  PurchaseOrderReportEntry,
} from '../entities/purchase_order'

export type PurchaseOrderProcessSuccessRS = {
  order_id: number
  barcode: string
  success: true
}

export type PurchaseOrderProcessFailRS = {
  success: false
  error: string
}

export type PurchaseOrderGetReportRS = {
  entries: PurchaseOrderReportEntry[]
}

export type PurchaseOrderGetReceiptRS = {
  receipt: PurchaseOrderReceipt
}

export type PurchaseOrderReturnOrderRS = {
  success: boolean
}

export type PurchaseOrderReturnOrderDetailsRS = {
  success: boolean
}
