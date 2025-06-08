import { SearchRS } from '../entities/common'
import {
  Product,
  ProductSalesReportEntry,
  ProductUnitPrices,
  ProductWithFinishedProducts,
} from '../entities/product'
import { CartPriceType } from '../entities/cart'

export type ProductSearchRS = SearchRS<Product>

export type ProductAddSuccessRS = {
  success: true
}

export type ProductAddFailRS = {
  success: false
  error: string
}

export type ProductGetByCodeRS = {
  product: Product | null
}

export type ProductListRS = {
  numberOfPages: number
  products: ProductWithFinishedProducts[]
}

export type ProductEnableRS = {
  success: boolean
}

export type ProductDisableRS = {
  success: boolean
}

export type ProductGetSalesReportRS = {
  entries: ProductSalesReportEntry[]
}

export type ProductGetUnitPricesForCartRS = {
  unit_prices: ProductUnitPrices
  unit_price_type: CartPriceType
}
