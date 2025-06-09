import React from 'react'
import type { NextPage } from 'next'
import CashRegisterReconciliation from 'webapp/src/views/pos/cash_register_reconciliation/cash_register_reconciliation'
import Base from 'webapp/src/pages/base'

const Index: NextPage = () => {
  return <Base View={<CashRegisterReconciliation />} />
}

export default Index
