import React from 'react'
import type { NextPage } from 'next'
import Customers from 'webapp//views/catalog/customers/customers'
import Base from 'webapp//pages/base'

const Index: NextPage = () => {
  return <Base View={<Customers />} />
}

export default Index
