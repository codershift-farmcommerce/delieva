import React from 'react'
import type { NextPage } from 'next'
import RawMaterialSalesReport from 'src/views/reports/finished_product_sales/finished_product_sales'
import Base from 'src/pages/base'

const Index: NextPage = () => {
  return <Base View={<RawMaterialSalesReport />} />
}

export default Index
