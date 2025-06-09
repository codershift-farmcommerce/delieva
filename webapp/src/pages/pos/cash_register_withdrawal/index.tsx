import React from 'react'
import type { NextPage } from 'next'
import CashRegisterWithdrawal from 'webapp/src/views/pos/cash_register_withdrawal/cash_register_withdrawal'
import Base from 'webapp/src/pages/base'

const Index: NextPage = () => {
    return <Base View={<CashRegisterWithdrawal />} />
}

export default Index
