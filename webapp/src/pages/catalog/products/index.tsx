import React from 'react'
import type { NextPage } from 'next'
import Products from 'src/views/catalog/products/products'
import Base from 'src/pages/base'

const Index: NextPage = () => {
  return <Base View={<Products />} />
}

export default Index
