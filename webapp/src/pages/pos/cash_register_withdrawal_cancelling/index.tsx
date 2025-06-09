import React from 'react'
import type { NextPage } from 'next'
import CashRegisterWithdrawalCancelling from 'webapp/src/views/pos/cash_register_withdrawal_cancelling/cash_register_withdrawal_cancelling'
import Base from 'webapp/src/pages/base'

const Index: NextPage = () => {
    return <Base View={<CashRegisterWithdrawalCancelling />} />
}

export default Index
