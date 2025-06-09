import React from 'react'
import type { NextPage } from 'next'
import CustomerCreditPayment from 'src/views/pos/customer_credit_payment/customer_credit_payment'
import Base from 'src/pages/base'

const Index: NextPage = () => {
  return <Base View={<CustomerCreditPayment />} />
}

export default Index
