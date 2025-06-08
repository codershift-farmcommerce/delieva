import { FinishedProduct } from './finished_product'

export type Product = {
  code: string
  name: string
  wholesale_unit_price: number
  retail_unit_price: number
  enabled: boolean
}

export type ProductWithFinishedProducts = Product & {
  finished_products: ProductFinishedProduct[]
}

export type ProductFinishedProduct = FinishedProduct & {
  unit_quantity: number
}

export type ProductSalesReportEntry = {
  date: string
  product_code: string
  product_name: string
  finished_products: ProductFinishedProduct[]
  quantity: number
  total_sales: number
  cash_register_name: number
}

export type ProductUnitPrices = {
  [productCode: string]: number
}
