import React from 'react'
import type { NextPage } from 'next'
import ReturnPurchaseOrder from 'webapp//views/pos/return_purchase_order/return_purchase_order'
import Base from 'webapp//pages/base'

const Index: NextPage = () => {
    return <Base View={<ReturnPurchaseOrder />} />
}

export default Index
