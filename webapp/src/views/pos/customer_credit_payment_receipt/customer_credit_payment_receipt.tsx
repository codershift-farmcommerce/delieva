import { CustomerCreditClient } from 'src/api/clients/customer_credit'
import React, { useEffect, useState } from 'react'
import { CustomerCreditPaymentReceipt } from 'interface/entities/customer_credit'
import { useReactToPrint } from 'react-to-print'
import styles from './customer_credit_payment_receipt.module.css'
import moment from 'moment/moment'
import { formatMonetary } from 'src/components/functions/formatting'
import { FormOfPaymentTranslation } from 'src/components/functions/translations'
import { FormOfPayment } from 'interface/entities/purchase_order'

export type CustomerCreditPaymentReceiptProps = {
  creditPaymentId: number | null
  print: boolean
  onAfterPrint?: () => void
}

const customerCreditClient = new CustomerCreditClient()

const CustomerCreditPaymentReceipt = (props: CustomerCreditPaymentReceiptProps) => {
  const { creditPaymentId, print, onAfterPrint } = props
  if (!creditPaymentId) {
    return null
  }
  const [paymentReceipt, setPaymentReceipt] = useState<CustomerCreditPaymentReceipt | null>(null)
  let printingRef: React.ReactInstance | null
  const getPaymentReceipt = async () => {
    const response = await customerCreditClient.getPaymentReceipt({
      customer_credit_payment_id: creditPaymentId,
    })
    if (response.receipt) {
      setPaymentReceipt(response.receipt)
    }
  }

  useEffect(() => {
    if (creditPaymentId && print) {
      getPaymentReceipt().catch(console.error)
    }
  }, [creditPaymentId, print])

  useEffect(() => {
    if (paymentReceipt && print) {
      handlePrint()
    }
  }, [paymentReceipt])

  const handlePrint = useReactToPrint({
    content: () => printingRef,
    onAfterPrint,
  })

  return (
    <div ref={el => (printingRef = el)} className={styles.container}>
      <div className={styles.title}>Eva Ornelas García</div>
      <div className={styles.header_item}>Domicilio Fiscal:</div>
      <div className={styles.header_item}>Calle Angelinas #113, las Puentes, Meoqui, Chih.</div>
      <div className={styles.header_item}>CP: 33130</div>
      <div className={styles.header_item}>RFC: OEGE550225LC0</div>
      <div className={styles.header_item_phone_number}>639-115-18-01 (Solo WhatsApp)</div>
      <div>-----------------------------------</div>
      <div className={styles.sub_header_item}>Abono a crédito #{paymentReceipt?.id}</div>
      <div className={styles.sub_header_item}>Cliente: {paymentReceipt?.customer_name}</div>
      <div className={styles.sub_header_item}>
        Fecha: {moment(paymentReceipt?.created_at).format('DD/MM/YYYY')}
      </div>
      <div className={styles.sub_header_item}>
        Hora: {moment(paymentReceipt?.created_at).format('hh:mm:ss A')}
      </div>
      <div>-----------------------------------</div>
      <div>
        {paymentReceipt?.form_of_payment &&
          (paymentReceipt.form_of_payment === FormOfPayment.TRANSFER ? (
            <div className={styles.amounts_item}>
              Forma de Pago: {FormOfPaymentTranslation[paymentReceipt.form_of_payment]} -{' '}
              {paymentReceipt.transfer_bank_account_name}
            </div>
          ) : (
            <div className={styles.amounts_item}>
              Forma de Pago: {FormOfPaymentTranslation[paymentReceipt.form_of_payment]}
            </div>
          ))}
      </div>
      <div>
        {paymentReceipt?.previous_balance && (
          <div className={styles.amounts_item}>
            Saldo anterior: {formatMonetary(paymentReceipt?.previous_balance)}
          </div>
        )}
        <div className={styles.amounts_item}>
          Monto de pago: {formatMonetary(paymentReceipt?.payment_amount)}
        </div>
        {paymentReceipt?.new_balance && (
          <div className={styles.amounts_item}>
            Saldo nuevo: {formatMonetary(paymentReceipt?.new_balance)}
          </div>
        )}
      </div>
      <div>-----------------------------------</div>
    </div>
  )
}

export default CustomerCreditPaymentReceipt
