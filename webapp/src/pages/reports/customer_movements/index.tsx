import React from 'react'
import type { NextPage } from 'next'
import CustomerMovementsReport from 'src/views/reports/customer_movements'
import Base from 'src/pages/base'

const Index: NextPage = () => {
  return <Base View={<CustomerMovementsReport />} />
}

export default Index
