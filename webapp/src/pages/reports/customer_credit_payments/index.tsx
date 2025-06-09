import React from 'react'
import type { NextPage } from 'next'
import CustomerCreditPaymentsReport from 'src/views/reports/customer_credit_payments/customer_credit_payments'
import Base from 'src/pages/base'

const Index: NextPage = () => {
  return <Base View={<CustomerCreditPaymentsReport />} />
}

export default Index
