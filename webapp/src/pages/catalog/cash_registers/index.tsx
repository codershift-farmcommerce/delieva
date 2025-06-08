import React from 'react'
import type { NextPage } from 'next'
import CashRegisters from 'src/views/catalog/cash_registers/cash_registers'
import Base from 'src/pages/base'

const Index: NextPage = () => {
  return <Base View={<CashRegisters />} />
}

export default Index
