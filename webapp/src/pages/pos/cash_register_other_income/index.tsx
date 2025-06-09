import React from 'react'
import type { NextPage } from 'next'
import CashRegisterOtherIncome from 'webapp/src/views/pos/cash_register_other_income/cash_register_other_income'
import Base from 'webapp/src/pages/base'

const Index: NextPage = () => {
    return <Base View={<CashRegisterOtherIncome />} />
}

export default Index
