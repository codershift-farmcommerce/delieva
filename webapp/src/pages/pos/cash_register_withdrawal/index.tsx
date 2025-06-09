import React from 'react'
import type { NextPage } from 'next'
import CashRegisterWithdrawal from 'webapp//views/pos/cash_register_withdrawal/cash_register_withdrawal'
import Base from 'webapp//pages/base'

const Index: NextPage = () => {
    return <Base View={<CashRegisterWithdrawal />} />
}

export default Index
