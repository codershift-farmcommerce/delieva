import React from 'react'
import type { NextPage } from 'next'
import CashRegister from 'webapp//views/pos/cash_register/cash_register'
import Base from 'webapp//pages/base'

const Index: NextPage = () => {
  return <Base View={<CashRegister />} />
}

export default Index
