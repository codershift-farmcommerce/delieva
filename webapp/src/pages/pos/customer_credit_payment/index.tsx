import React from 'react'
import type { NextPage } from 'next'
import CustomerCreditPayment from 'webapp/src/views/pos/customer_credit_payment/customer_credit_payment'
import Base from 'webapp/src/pages/base'

const Index: NextPage = () => {
  return <Base View={<CustomerCreditPayment />} />
}

export default Index
