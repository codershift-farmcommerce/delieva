import React from 'react'
import type { NextPage } from 'next'
import CashRegisterReconciliation from 'webapp//views/pos/cash_register_reconciliation/cash_register_reconciliation'
import Base from 'webapp//pages/base'

const Index: NextPage = () => {
  return <Base View={<CashRegisterReconciliation />} />
}

export default Index
