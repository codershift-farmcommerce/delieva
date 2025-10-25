import ViewContainer from 'webapp/src/components/views/container/container'
import {
  CashRegister,
  OpenedCashRegisterReconciliation,
} from 'interface/entities/cash_register'
import React, { useEffect, useRef, useState } from 'react'
import { CashRegisterClient } from 'webapp/src/api/clients/cash_register'
import Table from 'webapp/src/components/table/table'
import { formatMonetary } from 'webapp/src/components/functions/formatting'
import ViewHeader from 'webapp/src/components/views/header/header'
import viewStyles from 'webapp/src/views/views.module.css'
import styles from './cash_register_reconciliation.module.css'
import clsx from 'clsx'
import { toast } from 'react-toastify'
import ClosedReconciliationReceipt from '../closed_reconciliation_receipt/closed_reconciliation_receipt'
import { getCashRegisterName } from '../../../components/functions/cash_register'

const cashRegisterClient = new CashRegisterClient()

const CashierClosing = () => {
  const [cashRegisters, setCashRegisters] = React.useState<CashRegister[]>([])
  const [reconciliations, setReconciliations] = React.useState<{
    [cashRegisterId: number]: OpenedCashRegisterReconciliation
  }>([])
  const [selectedReconciliation, setSelectedReconciliation] =
    React.useState<OpenedCashRegisterReconciliation | null>(null)
  const [closedReconciliationIdToPrint, setClosedReconciliationIdToPrint] = React.useState<
    number | null
  >(null)
  const [closeReconciliationFormEnabled, setCloseReconciliationFormEnabled] = React.useState(false)
  const [actualCashBalance, setActualCashBalance] = useState('')
  const [actualVoucherCount, setActualVoucherCount] = useState('0')
  const [printReceipt, setPrintReceipt] = useState(false)

  const cashInputRef = useRef<HTMLInputElement>(null)

  const getCashRegistersReconciliations = async () => {
    const { cash_registers } = await cashRegisterClient.list({})
    setCashRegisters(cash_registers)
    const response = await cashRegisterClient.getOpenedReconciliations({
      cash_register_ids: cash_registers.map(cashRegister => cashRegister.id),
    })
    setReconciliations(response.opened_reconciliations)
  }

  useEffect(() => {
    getCashRegistersReconciliations().catch(() => {
      console.log('Error al obtener cajas')
    })
  }, [])

  const handleSelectedReconciliation = (id: string) => {
    const reconciliation = reconciliations[parseInt(id)]
    if (reconciliation.cash_register_id === selectedReconciliation?.cash_register_id) {
      setSelectedReconciliation(null)
      return
    }
    setSelectedReconciliation(reconciliation)
  }

  const handleCloseReconciliation = async () => {
    if (!selectedReconciliation) {
      return
    }
    const actualCashBalanceNumber = Number(actualCashBalance)
    if (isNaN(actualCashBalanceNumber)) {
      toast.dark('Efectivo en caja debe ser un número')
      return
    }
    const actualVoucherCountNumber = Number(actualVoucherCount)
    if (isNaN(actualVoucherCountNumber)) {
      toast.dark('Número de vouchers debe ser un número')
      return
    }
    const response = await cashRegisterClient.closeReconciliation({
      cash_register_id: selectedReconciliation.cash_register_id,
      actual_cash_balance: actualCashBalanceNumber,
      actual_credit_card_voucher_count: actualVoucherCountNumber,
    })
    if (response.success) {
      toast.dark('Corte de caja procesado correctamente')
      await getCashRegistersReconciliations()
      setSelectedReconciliation(null)
      setClosedReconciliationIdToPrint(selectedReconciliation.id)
      setPrintReceipt(true)
      setCloseReconciliationFormEnabled(false)
    } else {
      toast.dark('Error al procesar corte de caja')
    }
  }

  const handleEnableCloseReconciliationForm = () => {
    setCloseReconciliationFormEnabled(true)
    setTimeout(() => {
      cashInputRef.current?.focus()
    }, 100)
  }

  const handleCancelCloseReconciliation = () => {
    setCloseReconciliationFormEnabled(false)
    setActualCashBalance('')
    setActualVoucherCount('')
  }

  const reconciliationsForTable = reconciliations
    ? Object.keys(reconciliations).map(cashRegisterId => {
        const cashRegister = cashRegisters.find(
          cashRegister => String(cashRegister.id) === cashRegisterId,
        )
        const reconciliation = reconciliations[parseInt(cashRegisterId)]
        const cashRegisterName = getCashRegisterName(cashRegister)

        return {
          id: cashRegisterId,
          cells: [
            {
              value: cashRegisterName,
            },
            {
              value: formatMonetary(
                Number(reconciliation.opening_cash_balance) +
                  Number(reconciliation.closing_cash_balance),
              ),
            },
            {
              value: formatMonetary(reconciliation.closing_credit_balance),
            },
            {
              value: formatMonetary(reconciliation.closing_bank_transfer_balance),
            },
            {
              value: formatMonetary(reconciliation.closing_donation_balance),
            },
          ],
        }
      })
    : []

  return (
    <ViewContainer title={'Corte de caja'}>
      <ViewHeader flexDirection={'column'}>
        <div className={styles.top_button_container}>
          <button
            disabled={selectedReconciliation === null || closeReconciliationFormEnabled}
            className={clsx({
              [viewStyles.primary_button]:
                selectedReconciliation !== null && !closeReconciliationFormEnabled,
              [viewStyles.disabled_button]:
                selectedReconciliation === null || closeReconciliationFormEnabled,
            })}
            onClick={handleEnableCloseReconciliationForm}
          >
            Realizar corte de caja
          </button>
          <div className={styles.instructions} hidden={!!selectedReconciliation}>
            Seleccione caja a realizar corte
          </div>
        </div>
        <div hidden={!closeReconciliationFormEnabled}>
          <div className={styles.form_container_input_container}>
            <label className={styles.form_container_input_label}>Efectivo actual en Caja: </label>
            <input
              ref={cashInputRef}
              className={viewStyles.input}
              value={actualCashBalance}
              placeholder={'$ Introducir monto'}
              onChange={event => setActualCashBalance(event.target.value)}
            />
          </div>
          {/*<div className={styles.form_container_input_container}>*/}
          {/*  <label className={styles.form_container_input_label}>*/}
          {/*    Número de vouchers en Caja:{' '}*/}
          {/*  </label>*/}
          {/*  <input*/}
          {/*    className={viewStyles.input}*/}
          {/*    value={actualVoucherCount}*/}
          {/*    placeholder={'Introducir cantidad'}*/}
          {/*    onChange={event => setActualVoucherCount(event.target.value)}*/}
          {/*  />*/}
          {/*</div>*/}
          <div>
            <button
              className={clsx({
                [viewStyles.primary_button]: actualCashBalance !== '' && actualVoucherCount !== '',
                [viewStyles.disabled_button]: actualCashBalance === '' || actualVoucherCount === '',
              })}
              disabled={actualCashBalance === '' || actualVoucherCount === ''}
              onClick={handleCloseReconciliation}
            >
              Procesar
            </button>
            <button
              className={viewStyles.secondary_button}
              onClick={handleCancelCloseReconciliation}
            >
              Cancelar
            </button>
          </div>
        </div>
      </ViewHeader>
      <div>
        <Table
          selectedRowId={selectedReconciliation?.cash_register_id?.toString() ?? ''}
          columnNames={['Caja', 'Efectivo', 'Crédito', 'Transferencias', 'Donaciones']}
          rows={reconciliationsForTable}
          onSelectedRow={handleSelectedReconciliation}
        />
      </div>
      <ClosedReconciliationReceipt
        closedReconciliationId={closedReconciliationIdToPrint}
        print={printReceipt}
      />
    </ViewContainer>
  )
}

export default CashierClosing
