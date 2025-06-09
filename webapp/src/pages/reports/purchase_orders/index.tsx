import React from 'react'
import type { NextPage } from 'next'
import PurchaseOrdersReport from 'webapp/src/views/reports/purchase_orders/purchase_orders'
import Base from 'webapp/src/pages/base'

const Index: NextPage = () => {
  return <Base View={<PurchaseOrdersReport />} />
}

export default Index
