import React from 'react'
import type { NextPage } from 'next'
import CashRegister from 'src/views/pos/cash_register/cash_register'
import Base from 'src/pages/base'

const Index: NextPage = () => {
  return <Base View={<CashRegister />} />
}

export default Index
