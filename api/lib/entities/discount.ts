export enum DiscountType {
  PERCENTAGE = 'PERCENTAGE',
  FLAT_AMOUNT = 'FLAT_AMOUNT',
  FIXED_PRICE = 'FIXED_PRICE',
}

export type Discount = {
  id: number
  type: DiscountType
  discount_percentage: number
  discount_flat_amount: number
  fixed_price: number
}

export type DiscountWithCustomerAndProduct = Discount & {
  customer_id: number
  customer_name: string
  product_code: string
  product_name: string
  product_wholesale_unit_price: number
  product_retail_unit_price: number
}

export type DiscountByProduct = {
  [product_code: string]: Discount
}
