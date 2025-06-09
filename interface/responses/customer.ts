import { SearchRS } from '../entities/common'
import { Customer, CustomerMovementEntry } from '../entities/customer'

export type CustomerSearchRS = SearchRS<Customer>

export type CustomerGetMovementsReportRS = {
  entries: CustomerMovementEntry[]
}

export type CustomerListRS = {
  numberOfPages: number
  customers: Customer[]
}

export type CustomerAddSuccessRS = {
  success: true
}

export type CustomerAddFailRS = {
  success: false
  error: string
}
