import React from 'react'
import type { NextPage } from 'next'
import ReturnPurchaseOrderDetails from 'webapp/src/views/pos/return_purchase_order_details/return_purchase_order_details'
import Base from 'webapp/src/pages/base'

const Index: NextPage = () => {
  return <Base View={<ReturnPurchaseOrderDetails />} />
}

export default Index
