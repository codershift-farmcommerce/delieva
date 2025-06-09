import React from 'react'
import type { NextPage } from 'next'
import FinishedProducts from 'webapp/src/views/catalog/finished_products/finished_products'
import Base from 'webapp/src/pages/base'

const Index: NextPage = () => {
  return <Base View={<FinishedProducts />} />
}

export default Index
