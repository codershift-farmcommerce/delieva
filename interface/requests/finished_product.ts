import { SearchRQ } from '../entities/common'
import { FinishedProductUnitType } from '../entities/finished_product'

export type FinishedProductAddRQ = {
  code: string
  name: string
  unit_type: FinishedProductUnitType
}

export type FinishedProductModifyRQ = {
  code: string
  name: string
  unit_type: FinishedProductUnitType
}

export type FinishedProductListRQ = {
  query: string
  page: number
}

export type FinishedProductSearchRQ = SearchRQ

export type FinishedProductGetSalesReportRQ = {
  start_date: Date
  end_date: Date
}
