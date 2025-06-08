import React from 'react'
import type { NextPage } from 'next'
import CashRegisterWithdrawal from 'src/views/pos/cash_register_withdrawal/cash_register_withdrawal'
import Base from 'src/pages/base'

const Index: NextPage = () => {
    return <Base View={<CashRegisterWithdrawal />} />
}

export default Index
