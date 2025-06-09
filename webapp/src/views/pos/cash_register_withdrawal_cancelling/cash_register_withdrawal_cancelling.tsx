import keyBy from 'lodash.keyby'
import ViewContainer from 'webapp//components/views/container/container'
import ViewHeader from 'webapp//components/views/header/header'
import { getCashRegisterName } from 'webapp//components/functions/cash_register'
import React, { useEffect, useState } from 'react'
import {
  CashRegister,
  CashRegisterWithdrawalReceipt,
  CashRegisterWithdrawalStatus,
} from 'interface/entities/cash_register'
import { CashRegisterClient } from 'webapp//api/clients/cash_register'
import { CauseClient } from 'webapp//api/clients/cause_client'
import Table from 'webapp//components/table/table'
import { formatMonetary } from 'webapp//components/functions/formatting'
import { CashRegisterWithdrawalStatusTranslation } from 'webapp//components/functions/translations'
import CauseSearchBox from 'webapp//components/cause_search_box/cause_search_box'
import { CauseAction } from 'interface/entities/cause'
import styles from './cash_register_withdrawal_cancelling.module.css'
import clsx from 'clsx'
import viewStyles from 'webapp//views/views.module.css'
import { toast } from 'react-toastify'
import POSITION = toast.POSITION

const cashRegisterClient = new CashRegisterClient()
const causeClient = new CauseClient()

type WithdrawalsById = { [withdrawalId: string]: CashRegisterWithdrawalReceipt }

const CashRegisterOtherIncome = () => {
  const [cashRegister, setCashRegister] = useState<CashRegister | null>(null)
  const [cashRegisterLoaded, setCashRegisterLoaded] = useState(false)
  const [hasOpenedReconciliation, setHasOpenReconciliation] = useState<boolean | null>(null)
  const [cashRegisterWithdrawals, setCashRegisterWithdrawals] = useState<
    CashRegisterWithdrawalReceipt[]
  >([])
  const [withdrawalsById, setWithdrawalsById] = useState<WithdrawalsById>({})
  const [causeId, setCauseId] = useState('')
  const [causeDescription, setCauseDescription] = useState('')
  const [selectedWithdrawalId, setSelectedWithdrawalId] = useState<number | null>(null)
  const [authorizationCode, setAuthorizationCode] = useState('')

  const getAssignedCashRegister = async () => {
    const response = await cashRegisterClient.getAssignedCashRegister({})
    if (response.cash_register) {
      setCashRegister(response.cash_register)
      setHasOpenReconciliation(response.has_open_reconciliation)
    }
    setCashRegisterLoaded(true)
  }

  const getCashRegisterWithdrawals = async () => {
    const response = await cashRegisterClient.getCashWithdrawalsOfCurrentOpenReconciliation({})
    setCashRegisterWithdrawals(response.receipts)
    setWithdrawalsById(keyBy(response.receipts, 'id'))
  }

  useEffect(() => {
    getAssignedCashRegister().catch(err => {
      console.error('Error getting assigned cash register', err)
    })
  }, [])

  useEffect(() => {
    if (cashRegisterLoaded) {
      getCashRegisterWithdrawals().catch(err => {
        console.error('Error getting assigned cash register withdrawals', err)
      })
    }
  }, [cashRegisterLoaded])

  const handleAuthorizationCodeChange = (e: any) => {
    const value = e.target.value
    setAuthorizationCode(value)
  }

  const cancelOrder = async () => {
    if (!selectedWithdrawalId) {
      return
    }
    let causeIdNumber = parseInt(causeId)
    if (!causeId) {
      const response = await causeClient.add({
        description: causeDescription,
        cause_action: CauseAction.CASH_REGISTER_WITHDRAWAL_CANCELLATION,
      })
      causeIdNumber = response.cause.id
    }

    const response = await cashRegisterClient.cancelCashWithdrawal({
      withdrawal_id: selectedWithdrawalId,
      user_authorization_code: authorizationCode,
      cause_id: causeIdNumber,
    })
    if (response.success) {
      toast.success('Retiro cancelado exitosamente.')
      await getCashRegisterWithdrawals()
      setCauseDescription('')
    } else {
      toast.error('Ocurrió un error al cancelar el retiro', {
        position: POSITION.TOP_LEFT,
      })
    }
    setAuthorizationCode('')
  }

  if (!cashRegisterLoaded) {
    return <div>Cargando...</div>
  }

  if (cashRegisterLoaded && !cashRegister) {
    return <div>No se ha asignado Caja Registradora.</div>
  }

  if (
    cashRegisterLoaded &&
    cashRegister &&
    hasOpenedReconciliation !== null &&
    !hasOpenedReconciliation
  ) {
    return <div>La caja no ha sido abierta.</div>
  }

  const withdrawalRows = cashRegisterWithdrawals
    ? cashRegisterWithdrawals.map(w => {
        return {
          id: String(w.id),
          cells: [
            {
              value: w.created_at,
            },
            {
              value: formatMonetary(w.amount),
            },
            {
              value: w.cause,
            },
            {
              value: CashRegisterWithdrawalStatusTranslation[w.status],
            },
          ],
        }
      })
    : []

  const enableCancelWithdrawalButton =
    selectedWithdrawalId &&
    withdrawalsById[selectedWithdrawalId].status === CashRegisterWithdrawalStatus.PROCESSED &&
    causeDescription &&
    authorizationCode

  return (
    <ViewContainer
      title={`Cancelación de Retiro de Efectivo - ${getCashRegisterName(cashRegister)}`}
    >
      <ViewHeader flexDirection={'column'}>
        <div>
          <div>
            <CauseSearchBox
              onCauseSelected={resultItem => {
                setCauseId(String(resultItem.id))
              }}
              cause_action={CauseAction.CASH_REGISTER_WITHDRAWAL_CANCELLATION}
              onQueryChanged={value => setCauseDescription(value || '')}
            />
          </div>
          <div className={styles.form_field}>
            <label>Código de autorización: </label>
            <input
              className={viewStyles.input}
              value={authorizationCode}
              onChange={handleAuthorizationCodeChange}
            />
          </div>
          <div className={styles.button_container}>
            <button
              className={clsx({
                [viewStyles.disabled_button]: !enableCancelWithdrawalButton,
                [viewStyles.primary_button]: enableCancelWithdrawalButton,
              })}
              disabled={!enableCancelWithdrawalButton}
              onClick={cancelOrder}
            >
              Cancelar retiro
            </button>
          </div>
        </div>
      </ViewHeader>
      <div>
        <Table
          selectedRowId={String(selectedWithdrawalId)}
          columnNames={['Fecha', 'Cantidad', 'Causa', 'Estado']}
          rows={withdrawalRows}
          onSelectedRow={id => {
            setSelectedWithdrawalId(Number(id))
          }}
        />
      </div>
    </ViewContainer>
  )
}

export default CashRegisterOtherIncome
