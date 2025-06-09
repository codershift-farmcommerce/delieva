import { FinishedProductUnitType } from './finished_product'

export type Cart = {
  items: CartItems
}

export type CartItems = {
  [product_code: string]: CartItemDetail
}

export type CartItemDetail = {
  product_name: string
  wholesale_unit_price: number
  retail_unit_price: number
  quantity: number
  unit_type: FinishedProductUnitType
  should_add_ieps: boolean
}

export enum CartPriceType {
  WHOLESALE = 'WHOLESALE',
  RETAIL = 'RETAIL',
}
