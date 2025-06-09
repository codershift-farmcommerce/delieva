import React from 'react'
import type { NextPage } from 'next'
import CustomerMovementsReport from 'webapp//views/reports/customer_movements'
import Base from 'webapp//pages/base'

const Index: NextPage = () => {
  return <Base View={<CustomerMovementsReport />} />
}

export default Index
