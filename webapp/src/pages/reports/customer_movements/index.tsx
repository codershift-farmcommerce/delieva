import React from 'react'
import type { NextPage } from 'next'
import CustomerMovementsReport from 'webapp/src/views/reports/customer_movements'
import Base from 'webapp/src/pages/base'

const Index: NextPage = () => {
  return <Base View={<CustomerMovementsReport />} />
}

export default Index
