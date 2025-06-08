import React from 'react'
import type { NextPage } from 'next'
import Customers from 'webapp/src/views/catalog/customers/customers'
import Base from 'webapp/src/pages/base'

const Index: NextPage = () => {
  return <Base View={<Customers />} />
}

export default Index
