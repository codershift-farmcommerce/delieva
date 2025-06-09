import React from 'react'
import type { NextPage } from 'next'
import FinishedProducts from 'src/views/catalog/finished_products/finished_products'
import Base from 'src/pages/base'

const Index: NextPage = () => {
  return <Base View={<FinishedProducts />} />
}

export default Index
