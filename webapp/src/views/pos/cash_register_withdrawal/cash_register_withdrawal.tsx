import ViewContainer from 'webapp/src/components/views/container/container'
import { getCashRegisterName } from 'webapp/src/components/functions/cash_register'
import React, { useEffect, useState } from 'react'
import { CashRegister, CashRegisterWithdrawalReceipt, CashRegisterWithdrawalStatus } from 'interface/entities/cash_register'
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
  const [userWithdrawals, setUserWithdrawals] = useState<CashRegisterWithdrawalReceipt[]>([])
  const [cashRegisterName, setCashRegisterName] = useState('')
  const [loadingWithdrawals, setLoadingWithdrawals] = useState(false)
  const [cashierEmail, setCashierEmail] = useState<string>('')

  const getAssignedCashRegister = async () => {
    const response = await cashRegisterClient.getAssignedCashRegister({})
    if (response.cash_register) {
      setCashRegister(response.cash_register)
      setHasOpenReconciliation(response.has_open_reconciliation)
      
      // Get the current reconciliation details if open
      if (response.has_open_reconciliation) {
        try {
          // Get the opened reconciliation to find the cashier email
          const openedReconciliations = await cashRegisterClient.getOpenedReconciliations({
            cash_register_ids: [response.cash_register.id]
          })
          
          if (openedReconciliations.opened_reconciliations && 
              openedReconciliations.opened_reconciliations[response.cash_register.id]) {
            const reconciliation = openedReconciliations.opened_reconciliations[response.cash_register.id]
            setCashierEmail(reconciliation.cashier_user_email)
            setCashRegisterName(reconciliation.cashier_user_name)
            
            // Once we have the cashier email, get their withdrawals
            await getUserWithdrawals(reconciliation.cashier_user_email)
          }
        } catch (error) {
          console.error('Error getting opened reconciliation details', error)
        }
      }
    }
    setCashRegisterLoaded(true)
  }

  const getUserWithdrawals = async (email: string) => {
    if (!email) return
    
    setLoadingWithdrawals(true)
    try {
      const response = await cashRegisterClient.getCashWithdrawalsForCurrentCashierOpenReconciliation({
        user_email: email
      })
      setUserWithdrawals(response.receipts)
      if (response.cash_register_name) {
        setCashRegisterName(response.cash_register_name)
      }
    } catch (error) {
      console.error('Error getting user withdrawals', error)
      toast.error('Error al obtener los retiros del usuario', {
        position: POSITION.TOP_LEFT,
      })
    } finally {
      setLoadingWithdrawals(false)
    }
  }

  useEffect(() => {
    getAssignedCashRegister().catch(err => {
      console.error('Error getting assigned cash register', err)
    })
  }, [])

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
        // Refresh the user withdrawals list
        if (cashierEmail) {
          getUserWithdrawals(cashierEmail)
        }
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('es-MX', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount)
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

      {/* User Withdrawals Table */}
      <div className={styles.withdrawals_container}>
        <h3>Retiros de efectivo de {cashRegisterName}</h3>
        {loadingWithdrawals ? (
          <div>Cargando retiros...</div>
        ) : userWithdrawals?.length > 0 ? (
          <table className={styles.withdrawals_table}>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Causa</th>
                <th>Monto</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {userWithdrawals.map(withdrawal => (
                <tr key={withdrawal.id}>
                  <td>{formatDate(withdrawal.created_at)}</td>
                  <td>{withdrawal.cause}</td>
                  <td>{formatCurrency(withdrawal.amount)}</td>
                  <td>
                    {withdrawal.status === CashRegisterWithdrawalStatus.PROCESSED
                      ? 'Procesado'
                      : 'Cancelado'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div>No hay retiros registrados para este usuario en la reconciliación actual.</div>
        )}
      </div>

      <CashRegisterWithdrawalReceiptPrint
        print={printReceipt}
        withdrawalId={withdrawalIdToPrint}
        onAfterPrint={handleAfterPrint}
      />
    </ViewContainer>
  )
}

export default CashRegisterWithdrawal
