import React from 'react'
import type { NextPage } from 'next'
import CashRegisterOtherIncome from 'webapp//views/pos/cash_register_other_income/cash_register_other_income'
import Base from 'webapp//pages/base'

const Index: NextPage = () => {
    return <Base View={<CashRegisterOtherIncome />} />
}

export default Index
