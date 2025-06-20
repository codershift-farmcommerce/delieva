export type Customer = {
  id: number
  name: string
  address: string
  city: string
  phone_number: string
  email: string
  should_add_ieps: boolean
  enabled: boolean
}

export interface CustomerGetMovementsReportRQ {
  start_date: string
  end_date: string
  customer_id?: string
}

export type CustomerMovementEntry = {
  date: string
  customer_name: string
  movement_type: 'PURCHASE' | 'PAYMENT'
  description: string
  amount: number
  bank_account_name?: string
  previous_balance: number
  new_balance: number
}

export const GeneralPublicCustomer: Customer = {
  id: 1,
  name: 'Publico en General',
  phone_number: '',
  address: '',
  city: '',
  email: '',
  should_add_ieps: false,
  enabled: true,
}
