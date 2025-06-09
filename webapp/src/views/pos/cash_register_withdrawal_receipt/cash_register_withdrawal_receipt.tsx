import { CashRegisterClient } from 'webapp//api/clients/cash_register'
import React, { useEffect, useState } from 'react'
import { CashRegisterWithdrawalReceipt } from 'interface/entities/cash_register'
import { useReactToPrint } from 'react-to-print'
import styles from './cash_register_withdrawal_receipt.module.css'
import moment from 'moment/moment'
import { formatMonetary } from 'webapp//components/functions/formatting'

export type CashRegisterWithdrawalReceiptProps = {
  withdrawalId: number | null
  print: boolean
  onAfterPrint?: () => void
}

const cashRegisterClient = new CashRegisterClient()

const CashRegisterWithdrawalReceipt = (props: CashRegisterWithdrawalReceiptProps) => {
  const { withdrawalId, print, onAfterPrint } = props
  if (!withdrawalId) {
    return null
  }
  const [receipt, setReceipt] = useState<CashRegisterWithdrawalReceipt | null>(null)
  let printingRef: React.ReactInstance | null
  const getReceipt = async () => {
    const response = await cashRegisterClient.getWithdrawCashReceipt({
      withdrawal_id: withdrawalId,
    })
    if (response) {
      setReceipt(response)
    }
  }

  useEffect(() => {
    if (withdrawalId && print) {
      getReceipt().catch(console.error)
    }
  }, [withdrawalId, print])

  useEffect(() => {
    if (receipt && print) {
      handlePrint()
    }
  }, [receipt])

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
      <div className={styles.sub_header_item}>Retiro de efectivo #{receipt?.id}</div>
      <div className={styles.sub_header_item}>
        Fecha: {moment(receipt?.created_at).format('DD/MM/YYYY')}
      </div>
      <div className={styles.sub_header_item}>
        Hora: {moment(receipt?.created_at).format('hh:mm:ss A')}
      </div>
      <div>-----------------------------------</div>
      <div>
        <div className={styles.amounts_item}>Causa: {receipt?.cause}</div>
        <div className={styles.amounts_item}>Monto: {formatMonetary(receipt?.amount)}</div>
      </div>
      <div>-----------------------------------</div>
    </div>
  )
}

export default CashRegisterWithdrawalReceipt
