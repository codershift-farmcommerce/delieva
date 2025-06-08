import { SearchRQ } from '../entities/common'
import {
  FinishedProductUnitType,
  FinishedProductWithQuantity,
} from '../entities/finished_product'
import { Cart } from '../entities/cart'

export type ProductSearchRQ = SearchRQ

export type ProductAddRQ = {
  code: string
  name: string
  finished_products: Array<FinishedProductWithQuantity>
  wholesale_unit_price: number
  retail_unit_price: number
}

export type ProductGetByCodeRQ = {
  code: string
}

export type ProductListRQ = {
  query: string
  page: number
}

export type ProductModifyRQ = {
  code: string
  name: string
  finished_products: Array<FinishedProductWithQuantity>
  wholesale_unit_price: number
  retail_unit_price: number
}

export type ProductEnableRQ = {
  code: string
}

export type ProductDisableRQ = {
  code: string
}

export type ProductGetSalesReportRQ = {
  start_date: Date
  end_date: Date
}

export type ProductGetUnitPricesForCartRQ = {
  customer_id: number
  cart: Cart
}
