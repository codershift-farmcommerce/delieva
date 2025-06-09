import React from 'react'
import type { NextPage } from 'next'
import CashRegisters from 'webapp/src/views/catalog/cash_registers/cash_registers'
import Base from 'webapp/src/pages/base'

const Index: NextPage = () => {
  return <Base View={<CashRegisters />} />
}

export default Index
