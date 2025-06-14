import ViewContainer from 'webapp/src/components/views/container/container'
import { getCashRegisterName } from 'webapp/src/components/functions/cash_register'
import React, { useEffect, useState } from 'react'

import { CashRegister, CashRegisterWithdrawalReceipt } from 'interface/entities/cash_register'
import { CashRegisterClient } from 'webapp/src/api/clients/cash_register'
import styles from './cash_register_withdrawal.module.css'
import ViewHeader from 'webapp/src/components/views/header/header'
import viewStyles from 'webapp/src/views/views.module.css'
import { toast } from 'react-toastify'
import { CauseClient } from 'webapp/src/api/clients/cause_client'
import CashRegisterWithdrawalReceiptPrint from '../cash_register_withdrawal_receipt/cash_register_withdrawal_receipt'
import { ApiErrorCodeTranslation } from 'webapp/src/components/functions/translations'
import { CauseAction } from 'interface/entities/cause'
import CauseSearchBox from 'webapp/src/components/cause_search_box/cause_search_box'
import POSITION = toast.POSITION
import clsx from 'clsx'
import { useUser } from 'webapp/src/hooks/use_user'
import { UserRole, UserWithRoles } from 'interface/entities/user'
import { WithdrawalsByCashRegister } from '../../../../../interface/responses/cash_register'
import CashRegisterWithdrawalTable from './subviews/cash_register_withdrawal_table/cash_register_withdrawal_table'

const cashRegisterClient = new CashRegisterClient()
const causeClient = new CauseClient()

const CashRegisterWithdrawal = () => {
  const [cashRegister, setCashRegister] = useState<CashRegister | null>(null)
  const [cashRegisterLoaded, setCashRegisterLoaded] = useState(false)
  const [hasOpenedReconciliation, setHasOpenReconciliation] = useState<boolean | null>(null)
  const [amount, setAmount] = useState('')
  const [causeId, setCauseId] = useState('')
  const [causeDescription, setCauseDescription] = useState('')
  const [printReceipt, setPrintReceipt] = useState(false)
  const [withdrawalIdToPrint, setWithdrawalIdToPrint] = useState<number | null>(null)
  const [processingWithdrawal, setProcessingWithdrawal] = useState(false)
  const [cashierEmail, setCashierEmail] = useState<string>('')
  const [userWithdrawals, setUserWithdrawals] = useState<CashRegisterWithdrawalReceipt[]>([])
  const [cashRegisterName, setCashRegisterName] = useState('')
  const [allCashiersWithdrawals, setAllCashiersWithdrawals] = useState<WithdrawalsByCashRegister>(
    {},
  )
  const [loadingWithdrawals, setLoadingWithdrawals] = useState(false)

  const getAssignedCashRegister = async () => {
    const response = await cashRegisterClient.getAssignedCashRegister({})
    if (response.cash_register) {
      setCashRegister(response.cash_register)
      setHasOpenReconciliation(response.has_open_reconciliation)
    }
    setCashRegisterLoaded(true)
  }

  const getWithdrawals = async () => {
    if (!cashRegister) return

    setLoadingWithdrawals(true)
    try {
      if (isAdmin) {
        const response =
          await cashRegisterClient.getCashWithdrawalsForAllCashiersOpenReconciliation({})
        setAllCashiersWithdrawals(response.withdrawalsByCashRegister)
      } else {
        const response = await cashRegisterClient.getCashWithdrawalsOfCurrentOpenReconciliation({})
        setUserWithdrawals(response.receipts)
        setCashRegisterName(response.cash_register_name)
      }
    } catch (error) {
      console.error('Error getting withdrawals', error)
      toast.error('Error al obtener los retiros', {
        position: POSITION.TOP_LEFT,
      })
    } finally {
      setLoadingWithdrawals(false)
    }
  }

  const { user } = useUser()
  const isAdmin = (user as unknown as UserWithRoles)?.roles.includes(UserRole.ADMIN)

  useEffect(() => {
    getAssignedCashRegister()
  }, [])

  useEffect(() => {
    if (cashRegister && hasOpenedReconciliation) {
      getWithdrawals()
    }
  }, [cashRegister, hasOpenedReconciliation, isAdmin])

  const handleWithdrawal = async () => {
    setProcessingWithdrawal(true)
    try {
      const amountNumber = parseFloat(amount)
      if (isNaN(amountNumber) || amountNumber <= 0) {
        toast.error('Ingrese un monto válido', {
          position: POSITION.TOP_LEFT,
        })
        return
      }
      let causeIdNumber = parseInt(causeId)
      if (!causeId) {
        if (!/^[a-zA-Z0-9 ]+$/.test(causeDescription)) {
          toast.error('La causa solo permite letras y números', {
            position: POSITION.TOP_LEFT,
          })
          return
        }
        if (causeDescription.length > 50) {
          toast.error('La causa no debe ser mayor a 50 caracteres.', {
            position: POSITION.TOP_LEFT,
          })
          return
        }
        const response = await causeClient.add({
          description: causeDescription,
          cause_action: CauseAction.CASH_REGISTER_WITHDRAWAL,
        })
        causeIdNumber = response.cause.id
      }
      const response = await cashRegisterClient.withdrawCash({
        cashRegisterWithdrawalCauseId: causeIdNumber,
        amount: amountNumber,
      })
      if (response.success) {
        toast.success('Retiro exitoso')
        setAmount('')
        setCauseId('')
        setCauseDescription('')
        setWithdrawalIdToPrint(response.id)
        setPrintReceipt(true)
        getWithdrawals()
      } else {
        const message = ApiErrorCodeTranslation[response.errorCode] || 'Error al retirar efectivo'
        toast.error(message, {
          position: POSITION.TOP_LEFT,
        })
      }
    } catch (error) {
      toast.dark('Ocurrió un error al realizar el retiro', {
        position: POSITION.TOP_LEFT,
      })
    } finally {
      setProcessingWithdrawal(false)
    }
  }

  const handleAfterPrint = () => {
    setPrintReceipt(false)
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

  const handleCauseDescriptionChange = (value?: string) => {
    setCauseDescription(value || '')
  }

  const enableWithdrawalButton = !processingWithdrawal

  return (
    <ViewContainer title={`Retiro de Efectivo - ${getCashRegisterName(cashRegister)}`}>
      <div className={styles.container}>
        <div>
          <ViewHeader flexDirection={'column'}>
            <div>
              <CauseSearchBox
                onCauseSelected={resultItem => {
                  setCauseId(String(resultItem.id))
                }}
                cause_action={CauseAction.CASH_REGISTER_WITHDRAWAL}
                onQueryChanged={handleCauseDescriptionChange}
                defaultValue={causeDescription}
              />
            </div>
            <div className={styles.form_field}>
              <div>
                <label>Monto: </label>
                <input
                  value={amount}
                  className={viewStyles.search_input}
                  type="text"
                  onChange={e => setAmount(e.target.value)}
                />
              </div>
            </div>
            <div className={styles.form_field}>
              <button
                onClick={handleWithdrawal}
                className={clsx({
                  [viewStyles.primary_button]: enableWithdrawalButton,
                  [viewStyles.disabled_button]: !enableWithdrawalButton,
                })}
                disabled={!enableWithdrawalButton}
              >
                Retirar
              </button>
            </div>
          </ViewHeader>
        </div>
      </div>

      <CashRegisterWithdrawalReceiptPrint
        print={printReceipt}
        withdrawalId={withdrawalIdToPrint}
        onAfterPrint={handleAfterPrint}
      />

      {isAdmin &&
        (Object.keys(allCashiersWithdrawals) || []).map(cashRegisterName => (
          <div className={styles.withdrawals_container}>
            <CashRegisterWithdrawalTable
              key={cashRegisterName}
              cashRegisterName={cashRegisterName}
              withdrawals={allCashiersWithdrawals[cashRegisterName]}
              loading={loadingWithdrawals}
            />
          </div>
        ))}
    </ViewContainer>
  )
}

export default CashRegisterWithdrawal
