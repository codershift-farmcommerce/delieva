import ViewContainer from 'webapp/src/components/views/container/container'
import ViewHeader from 'webapp/src/components/views/header/header'
import viewStyles from 'webapp/src/views/views.module.css'
import { CashRegisterClient } from 'webapp/src/api/clients/cash_register'
import { CashRegister } from 'interface/entities/cash_register'
import React, { useEffect, useState } from 'react'
import styles from './cash_register_reconciliations.module.css'
import Table from 'webapp/src/components/table/table'
import { CashRegisterReconciliation } from 'interface/entities/cash_register'
import clsx from 'clsx'
import ClosedReconciliationReceipt from 'webapp/src/views/pos/closed_reconciliation_receipt/closed_reconciliation_receipt'
import momentTz from 'moment-timezone'
import { DefaultTimezone } from 'webapp/src/components/functions/constants'

const cashRegisterClient = new CashRegisterClient()

type ReconciliationById = {
  [id: string]: CashRegisterReconciliation
}

const CashRegisterReconciliation = () => {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const [cashRegisters, setCashRegisters] = useState<CashRegister[]>([])
  const [reconciliations, setReconciliations] = useState<CashRegisterReconciliation[]>([])
  const [reconciliationsById, setReconciliationsById] = useState<ReconciliationById>({})
  const [selectedReconciliationId, setSelectedReconciliationId] = useState<string>('')
  const [printReceipt, setPrintReceipt] = useState(false)
  const [showReceipt, setShowReceipt] = useState(false)

  const getCashRegisters = async () => {
    const result = await cashRegisterClient.list({})
    setCashRegisters(result.cash_registers)
  }

  const getReconciliations = async (selectedCashRegisterId: number) => {
    const result = await cashRegisterClient.getReconciliationsReport({
      cash_register_id: selectedCashRegisterId,
    })
    setReconciliations(result.reconciliations)
    setReconciliationsById(
      result.reconciliations.reduce((acc: ReconciliationById, reconciliation) => {
        acc[reconciliation.id.toString()] = reconciliation
        return acc
      }, {}),
    )
  }

  useEffect(() => {
    getCashRegisters().catch(console.error)
  }, [])

  const reportRows = (reconciliations ?? []).map(reconciliation => {
    return {
      id: String(reconciliation.id),
      cells: [
        {
          value: reconciliation.id.toString(),
        },
        {
          value: momentTz(reconciliation.closed_at)
            .tz(DefaultTimezone)
            .format('DD/MM/YYYY hh:mm a'),
        },
        {
          value: reconciliation.cashier_user_name,
        },
        {
          value: reconciliation.status,
        },
      ],
    }
  })

  const isSelectedReconciliationClosed =
    reconciliationsById[selectedReconciliationId]?.status === 'CLOSED'

  const handleCashRegisterSelection = async (cashRegisterId: string) => {
    await getReconciliations(parseInt(cashRegisterId))
    setPrintReceipt(false)
  }

  const handleSelectReconciliation = (id: string) => {
    setSelectedReconciliationId(id)
    setPrintReceipt(false)
    setShowReceipt(true)
  }

  const handlePrintReceipt = () => {
    setPrintReceipt(true)
  }

  return (
    <ViewContainer title={'Cortes de Caja'}>
      <ViewHeader flexDirection={'column'}>
        <div>
          <select
            className={viewStyles.select}
            onChange={event => handleCashRegisterSelection(event.target.value)}
          >
            <option value={''}>Seleccione una caja</option>
            {cashRegisters.map(cashRegister => (
              <option key={cashRegister.id} value={cashRegister.id}>
                {cashRegister.name} - {cashRegister.location_description}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.header_button_container}>
          <button
            className={clsx({
              [viewStyles.secondary_button]:
                selectedReconciliationId !== '' && isSelectedReconciliationClosed,
              [viewStyles.disabled_button]:
                selectedReconciliationId === '' || !isSelectedReconciliationClosed,
            })}
            disabled={selectedReconciliationId === '' || !isSelectedReconciliationClosed}
            onClick={handlePrintReceipt}
          >
            Imprimir Ticket
          </button>
        </div>
      </ViewHeader>
      <div className={styles.body_container}>
        <div className={styles.tables_container}>
          <Table
            selectedRowId={selectedReconciliationId}
            columnNames={['#', 'Fecha de Cierre', 'Cajero', 'Status']}
            rows={reportRows}
            onSelectedRow={handleSelectReconciliation}
          />
        </div>
        <div>
          <ClosedReconciliationReceipt
            closedReconciliationId={Number(selectedReconciliationId)}
            print={printReceipt}
            showReceipt={showReceipt}
          />
        </div>
      </div>
    </ViewContainer>
  )
}

export default CashRegisterReconciliation
