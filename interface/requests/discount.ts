import { DiscountType } from '../entities/discount'

export type DiscountAddRQ = {
  customer_id: number
  product_code: string
  type: DiscountType
  discount_percentage: number
  discount_flat_amount: number
  fixed_price: number
}

export type DiscountListRQ = {
  customer_id: number | null
  product_code: string | null
}

export type DiscountModifyRQ = {
  id: number
  type: DiscountType
  discount_percentage: number
  discount_flat_amount: number
  fixed_price: number
}

export type DiscountDeleteRQ = {
  id: number
}

export type DiscountGetForCustomerAndProductRQ = {
  customer_id: number
  product_code: string
}

export type DiscountGetForCustomerAndProductsRQ = {
  customer_id: number
  product_codes: string[]
}
