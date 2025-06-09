import React from 'react'
import type { NextPage } from 'next'
import CashRegisters from 'webapp//views/catalog/cash_registers/cash_registers'
import Base from 'webapp//pages/base'

const Index: NextPage = () => {
  return <Base View={<CashRegisters />} />
}

export default Index
