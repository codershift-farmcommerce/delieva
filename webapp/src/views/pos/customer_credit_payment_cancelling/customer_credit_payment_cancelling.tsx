import ViewContainer from 'src/components/views/container/container'
import ViewHeader from 'src/components/views/header/header'
import Table from 'src/components/table/table'
import { CustomerCreditClient } from 'src/api/clients/customer_credit'
import React, { useEffect, useState } from 'react'
import {
  CustomerCreditPayment,
  CustomerCreditPaymentStatus,
} from 'interface/entities/customer_credit'
import { formatMonetary } from 'src/components/functions/formatting'
import { getCashRegisterName } from 'src/components/functions/cash_register'
import { CashRegister } from 'interface/entities/cash_register'
import { CashRegisterClient } from 'src/api/clients/cash_register'
import CauseSearchBox from 'src/components/cause_search_box/cause_search_box'
import { CauseAction } from 'interface/entities/cause'
import styles from './customer_credit_payment_cancelling.module.css'
import viewStyles from 'src/views/views.module.css'
import clsx from 'clsx'
import keyBy from 'lodash.keyby'
import { CauseClient } from 'src/api/clients/cause_client'
import { toast } from 'react-toastify'
import POSITION = toast.POSITION
import { CustomerCreditPaymentStatusTranslation } from 'src/components/functions/translations'

type PaymentsById = { [paymentId: string]: CustomerCreditPayment }

const customerCreditClient = new CustomerCreditClient()
const cashRegisterClient = new CashRegisterClient()
const causeClient = new CauseClient()

const CustomerCreditPaymentCancelling = () => {
  const [cashRegister, setCashRegister] = useState<CashRegister | null>(null)
  const [customerCreditPayments, setCustomerCreditPayments] = useState<CustomerCreditPayment[]>([])
  const [customerCreditPaymentsById, setCustomerCreditPaymentsById] = useState<PaymentsById>({})
  const [cashRegisterLoaded, setCashRegisterLoaded] = useState(false)
  const [hasOpenedReconciliation, setHasOpenReconciliation] = useState<boolean | null>(null)
  const [causeId, setCauseId] = useState('')
  const [causeDescription, setCauseDescription] = useState('')
  const [authorizationCode, setAuthorizationCode] = useState('')
  const [selectedPaymentId, setSelectedPaymentId] = useState<number | null>(null)

  const getAssignedCashRegister = async () => {
    const response = await cashRegisterClient.getAssignedCashRegister({})
    if (response.cash_register) {
      setCashRegister(response.cash_register)
      setHasOpenReconciliation(response.has_open_reconciliation)
    }
    setCashRegisterLoaded(true)
  }
  const getCustomerCreditsPayments = async () => {
    const response = await customerCreditClient.getPaymentsOfCurrentOpenReconciliation({})
    setCustomerCreditPayments(response.payments)
    setCustomerCreditPaymentsById(keyBy(response.payments, 'id'))
  }

  useEffect(() => {
    getAssignedCashRegister().catch(err => {
      console.error('Error getting assigned cash register', err)
    })
    getCustomerCreditsPayments().catch(err => {
      console.error('Error getting assigned customer credit payments', err)
    })
  }, [])

  const cancelPayment = async () => {
    if (!selectedPaymentId) {
      return
    }
    let causeIdNumber = parseInt(causeId)
    if (!causeId) {
      const response = await causeClient.add({
        description: causeDescription,
        cause_action: CauseAction.CUSTOMER_CREDIT_PAYMENT_CANCELLATION,
      })
      causeIdNumber = response.cause.id
    }
    const response = await customerCreditClient.cancelPayment({
      customer_credit_payment_id: selectedPaymentId,
      user_authorization_code: authorizationCode,
      cause_id: causeIdNumber,
    })
    if (response.success) {
      toast.success('Abono cancelado exitosamente.')
      await getCustomerCreditsPayments()
    } else {
      toast.error('Ocurrió un error al cancelar el abonp', {
        position: POSITION.TOP_LEFT,
      })
    }
    setCauseDescription('')
    setAuthorizationCode('')
  }

  const handleAuthorizationCodeChange = (e: any) => {
    const value = e.target.value
    setAuthorizationCode(value)
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

  const rows = customerCreditPayments
    ? customerCreditPayments.map(payment => {
        return {
          id: String(payment.id),
          cells: [
            {
              value: payment.created_at,
            },
            {
              value: payment.customer_name,
            },
            {
              value: formatMonetary(payment.payment_amount),
            },
            {
              value: CustomerCreditPaymentStatusTranslation[payment.status],
            },
          ],
        }
      })
    : []

  const enableCancelPaymentButton =
    selectedPaymentId &&
    customerCreditPaymentsById[selectedPaymentId].status ===
      CustomerCreditPaymentStatus.PROCESSED &&
    causeDescription &&
    authorizationCode

  return (
    <ViewContainer title={`Cancelación de Abono a Crédito - ${getCashRegisterName(cashRegister)}`}>
      <ViewHeader>
        <div>
          {' '}
          <div>
            <CauseSearchBox
              onCauseSelected={resultItem => {
                setCauseId(String(resultItem.id))
              }}
              cause_action={CauseAction.CUSTOMER_CREDIT_PAYMENT_CANCELLATION}
              onQueryChanged={value => setCauseDescription(value || '')}
              defaultValue={causeDescription}
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
                [viewStyles.disabled_button]: !enableCancelPaymentButton,
                [viewStyles.primary_button]: enableCancelPaymentButton,
              })}
              disabled={!enableCancelPaymentButton}
              onClick={cancelPayment}
            >
              Cancelar abono
            </button>
          </div>
        </div>
      </ViewHeader>
      <div>
        <Table
          selectedRowId={String(selectedPaymentId)}
          columnNames={['Fecha', 'Cliente', 'Monto', 'Estado']}
          rows={rows}
          onSelectedRow={id => {
            setSelectedPaymentId(Number(id))
          }}
        />
      </div>
    </ViewContainer>
  )
}

export default CustomerCreditPaymentCancelling
