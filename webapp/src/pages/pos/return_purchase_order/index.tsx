import React from 'react'
import type { NextPage } from 'next'
import ReturnPurchaseOrder from 'src/views/pos/return_purchase_order/return_purchase_order'
import Base from 'src/pages/base'

const Index: NextPage = () => {
    return <Base View={<ReturnPurchaseOrder />} />
}

export default Index
