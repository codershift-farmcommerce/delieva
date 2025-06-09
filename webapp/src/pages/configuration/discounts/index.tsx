import React from 'react'
import type { NextPage } from 'next'
import Discounts from 'webapp/src/views/configuration/discounts/discounts'
import Base from 'webapp/src/pages/base'

const Index: NextPage = () => {
  return <Base View={<Discounts />} />
}

export default Index
