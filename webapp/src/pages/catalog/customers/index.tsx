import React from 'react'
import type { NextPage } from 'next'
import Customers from 'src/views/catalog/customers/customers'
import Base from 'src/pages/base'

const Index: NextPage = () => {
  return <Base View={<Customers />} />
}

export default Index
