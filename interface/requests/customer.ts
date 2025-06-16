import { SearchRQ } from '../entities/common'

export type CustomerSearchRQ = SearchRQ

export type CustomerAddRQ = {
  name: string
  phone_number: string
  address: string
  city: string
  email: string
  should_add_ieps: boolean
}

export type CustomerListRQ = {
  query: string
  page: number
}

export type CustomerGetMovementsReportRQ = {
  start_date: string
  end_date: string
  customer_id?: string
}

export type CustomerModifyRQ = {
  id: number
  name: string
  phone_number: string
  address: string
  city: string
  email: string
  should_add_ieps: boolean
}

export type CustomerEnableRQ = {
  id: number
}

export type CustomerDisableRQ = {
  id: number
}
