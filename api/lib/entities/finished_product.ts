export enum FinishedProductUnitType {
  KILOGRAM = 'KILOGRAM',
  LITER = 'LITER',
  PIECE = 'PIECE',
}

export type FinishedProduct = {
  code: string
  name: string
  unit_type: FinishedProductUnitType
}

export type FinishedProductWithQuantity = {
  finished_product_code: string
  unit_quantity: number
}

export type ProductFinishedProduct = FinishedProduct & {
  unit_quantity: number
}

export type FinishedProductSalesReportEntry = {
  date: string
  finished_product_code: string
  finished_product_name: string
  finished_product_unit_type: FinishedProductUnitType
  quantity: number
  total_sales: number
  cash_register_name: number
}
