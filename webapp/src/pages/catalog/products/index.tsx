import React from 'react'
import type { NextPage } from 'next'
import Products from 'webapp//views/catalog/products/products'
import Base from 'webapp//pages/base'

const Index: NextPage = () => {
  return <Base View={<Products />} />
}

export default Index
