import React from 'react'
import type { NextPage } from 'next'
import PurchaseOrdersReport from 'src/views/reports/purchase_orders/purchase_orders'
import Base from 'src/pages/base'

const Index: NextPage = () => {
  return <Base View={<PurchaseOrdersReport />} />
}

export default Index
