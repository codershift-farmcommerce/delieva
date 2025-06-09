import ViewContainer from 'webapp/src/components/views/container/container'
import styles from './customer_credit_payment.module.css'
import CustomerSearchBox from 'webapp/src/components/customer_search_box/customer_search_box'
import ViewHeader from 'webapp/src/components/views/header/header'
import React, { useEffect, useRef, useState } from 'react'
import { SearchResultItem } from 'interface/entities/common'
import { Customer, GeneralPublicCustomer } from 'interface/entities/customer'
import { CustomerCredit } from 'interface/entities/customer_credit'
import { CustomerCreditClient } from 'webapp/src/api/clients/customer_credit'
import { formatMonetary } from 'webapp/src/components/functions/formatting'
import viewStyles from 'webapp/src/views/views.module.css'
import { FormOfPayment } from 'interface/entities/purchase_order'
import { FormOfPaymentTranslation } from 'webapp/src/components/functions/translations'
import clsx from 'clsx'
import { toast } from 'react-toastify'
import CustomerCreditPaymentReceipt from 'webapp/src/views/pos/customer_credit_payment_receipt/customer_credit_payment_receipt'
import { CashRegister } from 'interface/entities/cash_register'
import { TransferBankAccount } from 'interface/entities/transfer_bank_account'
import { TransferBankAccountClient } from 'webapp/src/api/clients/transfer_bank_account'
import { getCashRegisterName } from 'webapp/src/components/functions/cash_register'
import { CashRegisterClient } from 'webapp/src/api/clients/cash_register'

const customerCreditClient = new CustomerCreditClient()
const transferBankAccountClient = new TransferBankAccountClient()
const cashRegisterClient = new CashRegisterClient()

const CreditPayment = () => {
  const [cashRegister, setCashRegister] = useState<CashRegister | null>(null)
  const [hasOpenedReconciliation, setHasOpenReconciliation] = useState<boolean | null>(null)
  const [cashRegisterLoaded, setCashRegisterLoaded] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>()
  const [customerCredit, setCustomerCredit] = useState<CustomerCredit[]>([])
  const [selectedFormOfPayment, setSelectedFormOfPayment] = useState<FormOfPayment>(
    FormOfPayment.CASH,
  )
  const [transferBankAccounts, setTransferBankAccounts] = useState<TransferBankAccount[]>([])
  const [formOfPaymentAmount, setFormOfPaymentAmount] = useState<string>('')
  const [selectedBankTransferId, setSelectedBankTransferId] = useState<number>(0)
  const [printReceipt, setPrintReceipt] = useState(false)
  const [paymentIdToPrint, setPaymentIdToPrint] = useState<number | null>(null)
  const [processingPayment, setProcessingPayment] = useState(false)

  const formOfPaymentAmountRef = useRef<HTMLInputElement>(null)

  const getAssignedCashRegister = async () => {
    const response = await cashRegisterClient.getAssignedCashRegister({})
    if (response.cash_register) {
      setCashRegister(response.cash_register)
      setHasOpenReconciliation(response.has_open_reconciliation)
    }
    setCashRegisterLoaded(true)
  }

  const getCustomerCredit = async () => {
    if (selectedCustomer) {
      const result = await customerCreditClient.getForCustomer({
        customer_id: selectedCustomer.id,
      })
      setCustomerCredit([result.credit])
    }
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
    getTransferBankAccounts().catch(console.error)
  }, [])

  useEffect(() => {
    getCustomerCredit().catch(console.error)
  }, [selectedCustomer])

  const handleSelectedCustomer = (resultItem: SearchResultItem<Customer>) => {
    if (String(resultItem.data.id) === String(GeneralPublicCustomer.id)) {
      setSelectedCustomer(null)
      return
    }
    setSelectedCustomer(resultItem.data)
    setTimeout(() => {
      formOfPaymentAmountRef.current?.focus()
    }, 100)
  }

  const handleFormOfPaymentChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    if (event.target.value.startsWith(FormOfPayment.TRANSFER)) {
      const [formOfPayment, bankAccountId] = event.target.value.split('-')
      setSelectedFormOfPayment(formOfPayment as FormOfPayment)
      setSelectedBankTransferId(Number(bankAccountId))
    } else {
      setSelectedFormOfPayment(event.target.value as FormOfPayment)
    }
    formOfPaymentAmountRef.current?.focus()
  }

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let value = event.target.value
    // const numberValue = Number(value.replace('$', '').replace(',', ''))
    // if (!isNaN(numberValue) && numberValue >= 0 && event.target.value) {
    //   value = formatMonetary(numberValue)
    // }
    setFormOfPaymentAmount(value)
  }

  const handlePayment = async () => {
    setProcessingPayment(true)
    try {
      if (!selectedCustomer) {
        return
      }
      const amount = Number(formOfPaymentAmount.replace('$', '').replace(',', ''))
      if (isNaN(amount) || amount <= 0) {
        return
      }
      const balance = customerCredit[0]?.credits_total - customerCredit[0]?.payments_total
      if (Number(amount.toFixed(0)) > Number(balance.toFixed(0))) {
        toast.error('El pago es mayor al saldo.')
        return
      }
      const response = await customerCreditClient.addPayment({
        customer_id: selectedCustomer.id,
        form_of_payment: {
          form_of_payment: selectedFormOfPayment,
          amount: Math.min(amount, balance),
          transfer_bank_account_id: selectedFormOfPayment.startsWith(FormOfPayment.TRANSFER)
            ? selectedBankTransferId
            : null,
          change: 0,
        },
      })
      if (response.success) {
        toast.dark('Pago realizado con éxito')
        setPaymentIdToPrint(response.payment_id)
        setPrintReceipt(true)
      } else {
        toast.error('Error al realizar el pago')
      }
      setFormOfPaymentAmount('')
      getCustomerCredit().catch(console.error)
    } catch (err) {
      toast.error('Error al realizar el pago')
    } finally {
      setProcessingPayment(false)
    }
  }

  const handleAfterPrint = () => {
    setPrintReceipt(false)
  }

  const formOfPaymentOptions = []
  formOfPaymentOptions.push(
    <option key={FormOfPayment.CASH} value={FormOfPayment.CASH}>
      {FormOfPaymentTranslation[FormOfPayment.CASH]}
    </option>,
  )
  transferBankAccounts.forEach(bankAccount => {
    formOfPaymentOptions.push(
      <option key={bankAccount.id} value={`${FormOfPayment.TRANSFER}-${bankAccount.id}`}>
        {FormOfPaymentTranslation[FormOfPayment.TRANSFER]} - {bankAccount.name}
      </option>,
    )
  })

  const balance = customerCredit[0]?.credits_total - customerCredit[0]?.payments_total

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

  const enablePayment = balance > 0 && formOfPaymentAmount && !processingPayment

  return (
    <ViewContainer title={`Pago de Crédito - ${getCashRegisterName(cashRegister)}`}>
      <div className={styles.container}>
        <div>
          <ViewHeader flexDirection={'column'}>
            <div>
              <CustomerSearchBox
                onCustomerSelected={handleSelectedCustomer}
                defaultValue={selectedCustomer?.name ?? ''}
              />
            </div>
          </ViewHeader>
        </div>
        <div className={styles.credit_payment_container} hidden={!selectedCustomer}>
          <div className={styles.balance_container}>
            <label className={styles.field_label}>Balance:</label>
            <label className={styles.balance_label}>{formatMonetary(balance)}</label>
          </div>
          <div hidden={balance <= 0}>
            <div className={styles.form_of_payment_container}>
              <label>Forma de Pago: </label>
              <div className={styles.form_of_payment_item}>
                <select className={viewStyles.select} onChange={handleFormOfPaymentChange}>
                  {formOfPaymentOptions}
                </select>
              </div>
              <div className={styles.form_of_payment_item}>
                <input
                  className={styles.payment_amount_input}
                  value={formOfPaymentAmount}
                  placeholder={'$'}
                  onChange={e => setFormOfPaymentAmount(e.target.value)}
                  ref={formOfPaymentAmountRef}
                />
              </div>
            </div>
          </div>
          <div className={styles.buttons_container}>
            <button
              className={clsx({
                [viewStyles.primary_button]: enablePayment,
                [viewStyles.disabled_button]: !enablePayment,
              })}
              disabled={!enablePayment}
              hidden={balance <= 0}
              onClick={handlePayment}
            >
              {processingPayment ? 'Procesando...' : 'Pagar'}
            </button>
          </div>
        </div>
      </div>
      {(printReceipt && paymentIdToPrint && (
        <CustomerCreditPaymentReceipt
          print={printReceipt}
          creditPaymentId={paymentIdToPrint}
          onAfterPrint={handleAfterPrint}
        />
      )) || <></>}
    </ViewContainer>
  )
}

export default CreditPayment
