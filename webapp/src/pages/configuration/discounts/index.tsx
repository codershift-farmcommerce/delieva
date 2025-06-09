import React from 'react'
import type { NextPage } from 'next'
import Discounts from 'webapp//views/configuration/discounts/discounts'
import Base from 'webapp//pages/base'

const Index: NextPage = () => {
  return <Base View={<Discounts />} />
}

export default Index
