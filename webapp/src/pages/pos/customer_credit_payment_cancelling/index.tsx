import React from 'react'
import type { NextPage } from 'next'
import CustomerCreditPaymentCancelling from 'src/views/pos/customer_credit_payment_cancelling/customer_credit_payment_cancelling'
import Base from 'src/pages/base'

const Index: NextPage = () => {
    return <Base View={<CustomerCreditPaymentCancelling />} />
}

export default Index
