import ViewContainer from 'src/components/views/container/container'
import ViewHeader from 'src/components/views/header/header'
import { getCashRegisterName } from 'src/components/functions/cash_register'
import React, { useEffect, useState } from 'react'
import { CashRegister } from 'interface/entities/cash_register'
import { CashRegisterClient } from 'src/api/clients/cash_register'
import { CauseAction } from 'interface/entities/cause'
import CauseSearchBox from 'src/components/cause_search_box/cause_search_box'
import styles from './cash_register_other_income.module.css'
import viewStyles from 'src/views/views.module.css'
import { FormOfPayment } from 'interface/entities/purchase_order'
import {
  ApiErrorCodeTranslation,
  FormOfPaymentTranslation,
} from 'src/components/functions/translations'
import { TransferBankAccount } from 'interface/entities/transfer_bank_account'
import { TransferBankAccountClient } from 'src/api/clients/transfer_bank_account'
import clsx from 'clsx'
import { toast } from 'react-toastify'
import POSITION = toast.POSITION
import { CauseClient } from 'src/api/clients/cause_client'
import CashRegisterOtherIncomeReceipt from '../cash_register_other_income_receipt/cash_register_other_income_receipt'

const cashRegisterClient = new CashRegisterClient()
const transferBankAccountClient = new TransferBankAccountClient()
const causeClient = new CauseClient()

const CashRegisterOtherIncome = () => {
  const [cashRegister, setCashRegister] = useState<CashRegister | null>(null)
  const [cashRegisterLoaded, setCashRegisterLoaded] = useState(false)
  const [hasOpenedReconciliation, setHasOpenReconciliation] = useState<boolean | null>(null)
  const [amount, setAmount] = useState('')
  const [causeId, setCauseId] = useState('')
  const [causeDescription, setCauseDescription] = useState('')
  const [selectedFormOfPayment, setSelectedFormOfPayment] = useState<FormOfPayment>(
    FormOfPayment.CASH,
  )
  const [transferBankAccounts, setTransferBankAccounts] = useState<TransferBankAccount[]>([])
  const [selectedBankTransferId, setSelectedBankTransferId] = useState<number | null>(null)
  const [processingEnterOtherIncome, setProcessingEnterOtherIncome] = useState(false)
  const [printReceipt, setPrintReceipt] = useState(false)
  const [otherIncomeIdToPrint, setOtherIncomeIdToPrint] = useState<number | null>(null)

  const getAssignedCashRegister = async () => {
    const response = await cashRegisterClient.getAssignedCashRegister({})
    if (response.cash_register) {
      setCashRegister(response.cash_register)
      setHasOpenReconciliation(response.has_open_reconciliation)
    }
    setCashRegisterLoaded(true)
  }

  const getTransferBankAccounts = async () => {
    const response = await transferBankAccountClient.list({
      query: '',
      page: 1,
    })
    setTransferBankAccounts(response.transfer_bank_accounts)
  }

  useEffect(() => {
    getAssignedCashRegister().catch(err => {
      console.error('Error getting assigned cash register', err)
    })
    getTransferBankAccounts().catch(err => {
      console.error('Error getting transfer bank accounts', err)
    })
  }, [])

  const handleFormOfPaymentChange = (fopString: string) => {
    if (fopString.startsWith(FormOfPayment.TRANSFER)) {
      const [formOfPayment, bankAccountId] = fopString.split('-')
      setSelectedFormOfPayment(formOfPayment as FormOfPayment)
      setSelectedBankTransferId(Number(bankAccountId))
    } else {
      setSelectedFormOfPayment(fopString as FormOfPayment)
    }
  }

  const handleAfterPrint = () => {
    setPrintReceipt(false)
  }

  const getFormOfPaymentOptions = (formOfPayment: FormOfPayment) => {
    const formOfPaymentOptions: JSX.Element[] = []
    formOfPaymentOptions.push(
      <option
        key={FormOfPayment.CASH}
        value={FormOfPayment.CASH}
        selected={formOfPayment === FormOfPayment.CASH}
      >
        {FormOfPaymentTranslation[FormOfPayment.CASH]}
      </option>,
    )

    transferBankAccounts.forEach((bankAccount, index) => {
      formOfPaymentOptions.push(
        <option
          key={bankAccount.id}
          value={`${FormOfPayment.TRANSFER}-${bankAccount.id}`}
          selected={
            formOfPayment === FormOfPayment.TRANSFER && selectedBankTransferId === bankAccount.id
          }
        >
          {FormOfPaymentTranslation[FormOfPayment.TRANSFER]} - {bankAccount.name}
        </option>,
      )
    })
    return formOfPaymentOptions
  }

  const handleCauseDescriptionChange = (value?: string) => {
    setCauseDescription(value || '')
  }

  const handleEnterOtherIncome = async () => {
    setProcessingEnterOtherIncome(true)
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
          cause_action: CauseAction.CASH_REGISTER_OTHER_INCOME,
        })
        causeIdNumber = response.cause.id
      }
      const response = await cashRegisterClient.enterOtherIncome({
        cause_id: causeIdNumber,
        form_of_payment_with_amount: {
          form_of_payment: selectedFormOfPayment,
          amount: amountNumber,
          change: 0,
          transfer_bank_account_id: selectedBankTransferId,
        },
      })
      if (response.success) {
        toast.success('Ingreso agregado exitosamente')
        setAmount('')
        setCauseId('')
        setCauseDescription('')
        setOtherIncomeIdToPrint(response.id)
        setPrintReceipt(true)
      } else {
        const message = ApiErrorCodeTranslation[response.errorCode] || 'Error al agregar ingreso'
        toast.error(message, {
          position: POSITION.TOP_LEFT,
        })
      }
    } catch (error) {
      toast.dark('Ocurrió un error al realizar el ingreso', {
        position: POSITION.TOP_LEFT,
      })
    } finally {
      setProcessingEnterOtherIncome(false)
    }
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

  const enableEnterOtherIncomeButton = !processingEnterOtherIncome

  return (
    <ViewContainer title={`Otros Ingresos - ${getCashRegisterName(cashRegister)}`}>
      <ViewHeader>
        <div>
          <ViewHeader flexDirection={'column'}>
            <div>
              <CauseSearchBox
                onCauseSelected={resultItem => {
                  setCauseId(String(resultItem.id))
                }}
                cause_action={CauseAction.CASH_REGISTER_OTHER_INCOME}
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
              <div className={styles.form_of_payment_item}>
                <select
                  className={viewStyles.select}
                  onChange={event => handleFormOfPaymentChange(event.target.value)}
                >
                  {getFormOfPaymentOptions(selectedFormOfPayment)}
                </select>
              </div>
            </div>
            <div className={styles.form_field}>
              <button
                onClick={handleEnterOtherIncome}
                className={clsx({
                  [viewStyles.primary_button]: enableEnterOtherIncomeButton,
                  [viewStyles.disabled_button]: !enableEnterOtherIncomeButton,
                })}
                disabled={!enableEnterOtherIncomeButton}
              >
                Agregar Ingreso
              </button>
            </div>
          </ViewHeader>
        </div>
      </ViewHeader>
      <CashRegisterOtherIncomeReceipt
        print={printReceipt}
        otherIncomeId={otherIncomeIdToPrint}
        onAfterPrint={handleAfterPrint}
      />
    </ViewContainer>
  )
}

export default CashRegisterOtherIncome
