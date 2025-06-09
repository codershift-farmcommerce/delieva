import React from 'react'
import type { NextPage } from 'next'
import CashRegisterReconciliationsReport from 'src/views/reports/cash_register_reconciliations/cash_register_reconciliations'
import Base from 'src/pages/base'

const Index: NextPage = () => {
  return <Base View={<CashRegisterReconciliationsReport />} />
}

export default Index
