import React from 'react'
import type { NextPage } from 'next'
import CustomerCreditPaymentsReport from 'webapp//views/reports/customer_credit_payments/customer_credit_payments'
import Base from 'webapp//pages/base'

const Index: NextPage = () => {
  return <Base View={<CustomerCreditPaymentsReport />} />
}

export default Index
