import ViewContainer from 'webapp//components/views/container/container'
import styles from './customer_credit_payments.module.css'
import ViewHeader from 'webapp//components/views/header/header'
import CustomerSearchBox from 'webapp//components/customer_search_box/customer_search_box'
import React, { useState } from 'react'
import { SearchResultItem } from 'interface/entities/common'
import { Customer, GeneralPublicCustomer } from 'interface/entities/customer'
import viewStyles from 'webapp//views/views.module.css'
import { CustomerCreditClient } from 'webapp//api/clients/customer_credit'
import { CustomerCreditPayment } from 'interface/entities/customer_credit'
import Table from 'webapp//components/table/table'
import { formatMonetary } from 'webapp//components/functions/formatting'
import clsx from 'clsx'
import CustomerCreditPaymentReceipt from 'webapp//views/pos/customer_credit_payment_receipt/customer_credit_payment_receipt'
import { CustomerCreditPaymentStatusTranslation } from '../../../components/functions/translations'

const customerCreditClient = new CustomerCreditClient()

const CashRegisterReconciliation = () => {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>()
  const [payments, setPayments] = useState<CustomerCreditPayment[]>([])
  const [selectedPaymentId, setSelectedPaymentId] = useState<number | null>(null)
  const [printReceipt, setPrintReceipt] = useState(false)

  const handleSelectedCustomer = (resultItem: SearchResultItem<Customer>) => {
    setSelectedCustomer(resultItem.data)
  }

  const handleSelectedPayment = (paymentId: string) => {
    setSelectedPaymentId(Number(paymentId))
  }

  const handlePrintReceipt = () => {
    setPrintReceipt(true)
  }

  const handleAfterPrint = () => {
    setPrintReceipt(false)
  }

  const getReport = async () => {
    const result = await customerCreditClient.getPaymentsByCustomer({
      customer_id: selectedCustomer?.id ?? 0,
    })
    setPayments(result.payments)
  }

  const customerCreditPaymentRow = payments.map((payment, index) => {
    return {
      id: String(payment.id),
      cells: [
        {
          value: payment.id,
        },
        {
          value: payment.created_at,
        },
        {
          value: payment.previous_balance ? formatMonetary(payment.previous_balance) : '',
        },
        {
          value: formatMonetary(payment.payment_amount),
        },
        {
          value: payment.new_balance ? formatMonetary(payment.new_balance) : '',
        },
        {
          value: CustomerCreditPaymentStatusTranslation[payment.status],
        },
      ],
    }
  })

  return (
    <ViewContainer title={'Reporte de Abonos a Créditos'}>
      <div className={styles.container}>
        <div>
          <ViewHeader flexDirection={'column'}>
            <div>
              <CustomerSearchBox
                onCustomerSelected={handleSelectedCustomer}
                defaultValue={selectedCustomer?.name ?? ''}
              />
            </div>
            <div className={styles.button_container}>
              <button
                onClick={getReport}
                disabled={!selectedCustomer}
                className={clsx({
                  [viewStyles.primary_button]: selectedCustomer,
                  [viewStyles.disabled_button]: !selectedCustomer,
                })}
              >
                Obtener reporte
              </button>
              <button
                className={clsx({
                  [viewStyles.secondary_button]: selectedPaymentId,
                  [viewStyles.disabled_button]: !selectedPaymentId,
                })}
                disabled={!selectedPaymentId}
                onClick={handlePrintReceipt}
              >
                Reimprimir ticket
              </button>
            </div>
          </ViewHeader>
          <div>
            <Table
              selectedRowId={String(selectedPaymentId)}
              columnNames={['# Recibo', 'Fecha', 'Saldo anterior', 'Pago', 'Saldo nuevo', 'Estado']}
              rows={customerCreditPaymentRow}
              onSelectedRow={handleSelectedPayment}
            />
          </div>
        </div>
      </div>
      {(printReceipt && selectedPaymentId && (
        <CustomerCreditPaymentReceipt
          print={printReceipt}
          creditPaymentId={selectedPaymentId}
          onAfterPrint={handleAfterPrint}
        />
      )) || <></>}
    </ViewContainer>
  )
}

export default CashRegisterReconciliation
