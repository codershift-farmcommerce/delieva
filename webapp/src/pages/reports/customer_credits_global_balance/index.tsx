import React from 'react'
import type { NextPage } from 'next'
import CustomerCreditsGlobalBalanceReport from 'webapp/src/views/reports/customer_credits_global_balance/customer_credits_global_balance'
import Base from 'webapp/src/pages/base'

const Index: NextPage = () => {
  return <Base View={<CustomerCreditsGlobalBalanceReport />} />
}

export default Index
