import {
  FinishedProduct, FinishedProductUnitType,
  FinishedProductWithQuantity,
  ProductFinishedProduct,
} from './finished_product'

export type PurchaseOrderReceipt = {
  order_id: number
  customer_name: string
  cashier_name: string
  cash_register_name: string
  subtotal: string
  discount: string
  total: string
  tax1: number
  change: number
  fop_amount: number
  form_of_payments: FormOfPaymentWithAmount[]
  detail: PurchaseOrderReceiptDetail[]
  created_at: string
  note: string
}

export type PurchaseOrderReceiptDetail = {
  detail_id: number
  product_code: string
  product_name: string
  quantity: string
  unit_price: string
  unit_type: FinishedProductUnitType
  discount: string
  detail_total: string
  weight: number
  finished_products: ProductFinishedProduct[]
  status: PurchaseOrderDetailStatus
  has_ieps: boolean
}

export enum PurchaseOrderDetailStatus {
  PROCESSED = 'PROCESSED',
  RETURNED = 'RETURNED',
}

export enum PurchaseOrderStatus {
  PROCESSED = 'PROCESSED',
  RETURNED = 'RETURNED',
}

export type PurchaseOrderReportEntry = {
  order_id: number
  created_at: string
  customer: {
    name: string
    address: string
    city: string
    phone_number: string
    email: string
  }
  cash_register_name: string
  discount: string
  total: string
  form_of_payments: FormOfPaymentWithAmount[]
  detail: PurchaseOrderReportEntryDetail[]
  status: PurchaseOrderStatus
  tax1: number
  returned_cause: string | null
}

export type PurchaseOrderReportEntryDetail = {
  product: {
    code: string
    name: string
  }
  quantity: string
  unit_price: string
  discount: string
  detail_total: string
}

export enum FormOfPayment {
  CASH = 'CASH',
  TRANSFER = 'TRANSFER',
  CREDIT_CARD = 'CREDIT_CARD',
  CREDIT = 'CREDIT',
  DONATION = 'DONATION',
}

export type FormOfPaymentWithAmount = {
  form_of_payment: FormOfPayment
  amount: number
  change: number
  transfer_bank_account_id?: number | null
  transfer_bank_account_name?: string | null
}

export type PurchaseOrderForReconciliationReceipt = {
  cash_purchase_orders: PurchaseOrderAmount[]
  credit_purchase_orders: PurchaseOrderAmount[]
  donation_purchase_orders: PurchaseOrderAmount[]
  purchase_orders_by_transfer_bank_account: PurchaseOrderForBankAccount
  total: number
}

export type PurchaseOrderForBankAccount = {
  [bankAccountId: number]: {
    bank_account_name: string
    total: number
    purchase_order: PurchaseOrderAmount[]
  }
}

export type PurchaseOrderAmount = {
  purchase_order_id: number
  amount: number
  customer_name: number
}
