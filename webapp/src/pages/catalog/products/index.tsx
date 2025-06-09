import React from 'react'
import type { NextPage } from 'next'
import Products from 'webapp/src/views/catalog/products/products'
import Base from 'webapp/src/pages/base'

const Index: NextPage = () => {
  return <Base View={<Products />} />
}

export default Index
