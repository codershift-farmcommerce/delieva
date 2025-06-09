import React from 'react'
import type { NextPage } from 'next'
import ProductSalesReport from 'webapp//views/reports/product_sales/product_sales'
import Base from 'webapp//pages/base'

const Index: NextPage = () => {
  return <Base View={<ProductSalesReport />} />
}

export default Index
