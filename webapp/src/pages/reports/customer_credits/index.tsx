import React from 'react'
import type { NextPage } from 'next'
import CustomerCreditsReport from 'webapp/src/views/reports/customer_credits/customer_credits'
import Base from 'webapp/src/pages/base'

const Index: NextPage = () => {
  return <Base View={<CustomerCreditsReport />} />
}

export default Index
