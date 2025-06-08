import { FinishedProduct } from '../entities/finished_product'
import { SearchRS } from '../entities/common'
import { FinishedProductSalesReportEntry } from '../entities/finished_product'

export type FinishedProductListRS = {
  numberOfPages: number
  finished_products: FinishedProduct[]
}

export type FinishedProductGetSalesReportRS = {
  entries: FinishedProductSalesReportEntry[]
}

export type FinishedProductSearchRS = SearchRS<FinishedProduct>
