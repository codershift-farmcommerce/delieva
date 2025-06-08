import momentTz from 'moment-timezone'
import { CashRegisterClient } from 'src/api/clients/cash_register'
import React, { useEffect, useState } from 'react'
import styles from './closed_reconciliation_receipt.module.css'
import { CashRegisterReconciliation } from 'codershift-farmcommerce-api/entities/cash_register'
import { useReactToPrint } from 'react-to-print'
import { formatMonetary } from 'src/components/functions/formatting'
import { ClientConfigurationClient } from 'src/api/clients/client_configuration'
import { Configuration } from 'codershift-farmcommerce-api/entities/client_configuration'
import { DefaultTimezone } from 'src/components/functions/constants'
import { TransferBankAccountClient } from 'src/api/clients/transfer_bank_account'
import { TransferBankAccount } from 'codershift-farmcommerce-api/entities/transfer_bank_account'
import { FormOfPayment } from 'codershift-farmcommerce-api/entities/purchase_order'

export type ClosedReconciliationReceiptProps = {
  closedReconciliationId: number | null
  print: boolean
  onAfterPrint?: () => void
}

const cashRegisterClient = new CashRegisterClient()
const clientConfigurationClient = new ClientConfigurationClient()
const transferBankAccountClient = new TransferBankAccountClient()

const ClosedReconciliationReceipt = (props: ClosedReconciliationReceiptProps) => {
  const { closedReconciliationId, print, onAfterPrint } = props
  if (!closedReconciliationId) {
    return null
  }

  const [transferBankAccounts, setTransferBankAccounts] = useState<TransferBankAccount[]>([])
  const [clientConfiguration, setClientConfiguration] = useState<Configuration | null>(null)
  const [closedReconciliationReceipt, setClosedReconciliationReceipt] =
    useState<CashRegisterReconciliation | null>(null)
  let printingRef: React.ReactInstance | null

  const getClientConfiguration = async () => {
    const response = await clientConfigurationClient.list({})
    if (response.configuration) {
      setClientConfiguration(response.configuration)
    }
  }

  const getTransferBankAccounts = async () => {
    const response = await transferBankAccountClient.list({
      query: '*',
      page: 1,
    })
    if (response.transfer_bank_accounts) {
      setTransferBankAccounts(response.transfer_bank_accounts)
    }
  }

  useEffect(() => {
    getClientConfiguration().catch(console.error)
    getTransferBankAccounts().catch(console.error)
  }, [])

  const getClosedReconciliationReceipt = async () => {
    const response = await cashRegisterClient.getClosedReconciliation({
      reconciliation_id: closedReconciliationId,
    })
    if (response.reconciliation) {
      setClosedReconciliationReceipt(response.reconciliation)
    }
  }

  useEffect(() => {
    if (closedReconciliationId && print) {
      getClosedReconciliationReceipt().catch(console.error)
    }
  }, [closedReconciliationId, print])

  useEffect(() => {
    if (closedReconciliationReceipt && print) {
      handlePrint()
    }
  }, [closedReconciliationReceipt])

  const handlePrint = useReactToPrint({
    content: () => printingRef,
    onAfterPrint,
  })

  let leftoverCash = 0
  let missingCash = 0

  if (
    closedReconciliationReceipt?.actual_cash_balance &&
    closedReconciliationReceipt?.opening_cash_balance &&
    closedReconciliationReceipt?.closing_cash_balance
  ) {
    const cashBalance =
      Number(closedReconciliationReceipt?.actual_cash_balance) -
      (Number(closedReconciliationReceipt?.opening_cash_balance) +
        Number(closedReconciliationReceipt?.closing_cash_balance))
    leftoverCash = cashBalance > 0 ? cashBalance : 0
    missingCash = cashBalance < 0 ? Math.abs(cashBalance) : 0
  }

  let leftoverVoucherCount = 0
  let missingVoucherCount = 0
  if (
    closedReconciliationReceipt?.actual_credit_card_voucher_count &&
    closedReconciliationReceipt?.closing_credit_card_voucher_count
  ) {
    const voucherCount =
      Number(closedReconciliationReceipt?.actual_credit_card_voucher_count) -
      Number(closedReconciliationReceipt?.closing_credit_card_voucher_count)
    leftoverVoucherCount = voucherCount > 0 ? voucherCount : 0
    missingVoucherCount = voucherCount < 0 ? voucherCount : 0
  }

  const getTransferBankAccountPurchaseOrdersTotal = (transferBankAccountId: number) => {
    return (
      closedReconciliationReceipt?.purchase_orders_receipt
        ?.purchase_orders_by_transfer_bank_account[transferBankAccountId]?.total ?? 0
    )
  }

  const getTransferBankAccountCustomerCreditPaymentTotal = (transferBankAccountId: number) => {
    return (
      closedReconciliationReceipt?.customer_credit_payments_receipt
        ?.credit_payments_by_transfer_bank_account[transferBankAccountId]?.total ?? 0
    )
  }

  const hasTransferBankAccountPurchaseOrders = (transferBankAccountId: number) => {
    return (
      (closedReconciliationReceipt?.purchase_orders_receipt
        ?.purchase_orders_by_transfer_bank_account[transferBankAccountId]?.purchase_order.length ??
        0) > 0
    )
  }

  const hasTransferBankAccountCreditPayments = (transferBankAccountId: number) => {
    return (
      (closedReconciliationReceipt?.customer_credit_payments_receipt
        ?.credit_payments_by_transfer_bank_account[transferBankAccountId]?.credit_payment.length ??
        0) > 0
    )
  }

  const hasCashWithdrawals = () => {
    return (closedReconciliationReceipt?.cash_withdrawal_receipts?.length ?? 0) > 0
  }

  const hasOtherIncomes = () => {
    return (closedReconciliationReceipt?.other_income_receipts?.length ?? 0) > 0
  }

  const hasCashPurchaseOrders =
    (closedReconciliationReceipt?.purchase_orders_receipt?.cash_purchase_orders?.length ?? 0) > 0

  const hasCashCreditPayments =
    (closedReconciliationReceipt?.customer_credit_payments_receipt?.cash_credit_payments?.length ??
      0) > 0

  const cashWithdrawalTotal =
    closedReconciliationReceipt?.cash_withdrawal_receipts.reduce(
      (acc, withdrawal) => acc + withdrawal.amount,
      0,
    ) ?? 0

  const cashPurchaseOrdersTotal = closedReconciliationReceipt?.purchase_orders_receipt
    ?.cash_purchase_orders
    ? closedReconciliationReceipt.purchase_orders_receipt.cash_purchase_orders.reduce(
        (acc, val) => {
          acc += Number(val.amount)
          return acc
        },
        0,
      )
    : 0

  const creditPurchaseOrdersTotal = closedReconciliationReceipt?.purchase_orders_receipt
    ?.credit_purchase_orders
    ? closedReconciliationReceipt.purchase_orders_receipt.credit_purchase_orders.reduce(
        (acc, val) => {
          acc += Number(val.amount)
          return acc
        },
        0,
      )
    : 0

  const cashCustomerCreditPaymentsTotal = closedReconciliationReceipt
    ?.customer_credit_payments_receipt?.cash_credit_payments
    ? closedReconciliationReceipt.customer_credit_payments_receipt.cash_credit_payments.reduce(
        (acc, val) => {
          acc += Number(val.amount)
          return acc
        },
        0,
      )
    : 0

  const transferCustomerCreditPaymentsTotal = Object.values(
    closedReconciliationReceipt?.customer_credit_payments_receipt
      ?.credit_payments_by_transfer_bank_account ?? [],
  ).reduce((acc, val) => {
    acc += Number(val.total)
    return acc
  }, 0)

  const transferPurchasesTotal = transferBankAccounts
    ? transferBankAccounts.reduce((acc, val) => {
        acc += getTransferBankAccountPurchaseOrdersTotal(val.id)
        return acc
      }, 0)
    : 0

  const withdrawalsTotal = closedReconciliationReceipt?.cash_withdrawal_receipts
    ? closedReconciliationReceipt?.cash_withdrawal_receipts.reduce((acc, val) => {
        acc += val.amount
        return acc
      }, 0)
    : 0

  const otherIncomeTotal = closedReconciliationReceipt?.other_income_receipts
    ? closedReconciliationReceipt?.other_income_receipts.reduce((acc, val) => {
        acc += val.amount
        return acc
      }, 0)
    : 0

  const otherIncomeTotalCash = closedReconciliationReceipt?.other_income_receipts
    ? closedReconciliationReceipt?.other_income_receipts
        .filter(income => {
          return income.form_of_payment === FormOfPayment.CASH
        })
        .reduce((acc, val) => {
          acc += val.amount
          return acc
        }, 0)
    : 0

  const salesTotal = cashPurchaseOrdersTotal + transferPurchasesTotal + creditPurchaseOrdersTotal

  const totalCash =
    salesTotal +
    otherIncomeTotalCash +
    cashCustomerCreditPaymentsTotal -
    withdrawalsTotal -
    transferPurchasesTotal -
    creditPurchaseOrdersTotal

  return (
    <div ref={el => (printingRef = el)} className={styles.container}>
      <h1>Corte de Caja</h1>
      <div className={styles.receipt_details}>
        <div>
          <span>Fecha y Hora: </span>
          <span>
            {momentTz(closedReconciliationReceipt?.closed_at)
              .tz(clientConfiguration?.timezone?.value ?? DefaultTimezone)
              .format('MMM DD YYYY h:mm a')}
          </span>
        </div>
        <div></div>
        <div>
          <span>Cajero: </span>
          <span>{closedReconciliationReceipt?.cashier_user_name}</span>
        </div>
        <div>
          <span>Corte: #{closedReconciliationReceipt?.id}</span>
        </div>
        <div className={styles.detail_section}>
          <div>
            <b>- Venta de caja: </b>
            <b>{formatMonetary(cashPurchaseOrdersTotal)}</b>
          </div>
          {hasCashPurchaseOrders && (
            <>
              <u>Órdenes de compra</u>
              <div className={styles.purchase_orders_receipts_container}>
                {closedReconciliationReceipt?.purchase_orders_receipt?.cash_purchase_orders.map(
                  (purchaseOrder, index) => (
                    <div key={index}>
                      <span>#{purchaseOrder.purchase_order_id}</span>
                      <span> - </span>
                      <span>{formatMonetary(purchaseOrder.amount)}</span>
                    </div>
                  ),
                )}
              </div>
            </>
          )}
        </div>
        <div className={styles.detail_section}>
          <div>
            <b>- Créditos: </b>
            <b>{formatMonetary(creditPurchaseOrdersTotal)}</b>
          </div>
          <div className={styles.purchase_orders_receipts_container}>
            {closedReconciliationReceipt?.purchase_orders_receipt?.credit_purchase_orders.map(
              (purchaseOrder, index) => (
                <div key={index}>
                  <span>#{purchaseOrder.purchase_order_id}</span>
                  <span> - </span>
                  <span>{formatMonetary(purchaseOrder.amount)}</span>
                  <span> - </span>
                  <span>{purchaseOrder.customer_name}</span>
                </div>
              ),
            )}
          </div>
        </div>
        <div className={styles.detail_section}>
          <div>
            <b>- Ventas p/transferencia y donaciones: </b>
            <b>{formatMonetary(transferPurchasesTotal)}</b>
          </div>
          {transferBankAccounts.map(transferBankAccount => (
            <div key={transferBankAccount.id} className={styles.detail_section}>
              <div>
                <b>- Transf. {transferBankAccount.name}</b>&nbsp;
                <b>
                  {formatMonetary(
                    getTransferBankAccountPurchaseOrdersTotal(transferBankAccount.id),
                  )}
                </b>
              </div>
              {hasTransferBankAccountPurchaseOrders(transferBankAccount.id) && (
                <>
                  <div className={styles.purchase_orders_receipts_container}>
                    {closedReconciliationReceipt?.purchase_orders_receipt?.purchase_orders_by_transfer_bank_account[
                      transferBankAccount.id
                    ]?.purchase_order.map((purchaseOrder, index) => (
                      <div key={index}>
                        <span>#{purchaseOrder.purchase_order_id}</span>
                        <span> - </span>
                        <span>{formatMonetary(purchaseOrder.amount)}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
        <div className={styles.detail_section}>
          <div>
            <b>TOTAL VENTA: </b>
            <b>{formatMonetary(salesTotal)}</b>
          </div>
        </div>
        <div className={styles.detail_section}>
          <div>
            <b>- Pagos de Créditos Efectivo: </b>
            <b>{formatMonetary(cashCustomerCreditPaymentsTotal)}</b>
          </div>
          {hasCashCreditPayments && (
            <>
              <div className={styles.purchase_orders_receipts_container}>
                {closedReconciliationReceipt?.customer_credit_payments_receipt?.cash_credit_payments.map(
                  (creditPayment, index) => (
                    <div key={index}>
                      <span>#{creditPayment.customer_credit_payment_id}</span>
                      <span> - </span>
                      <span>{formatMonetary(creditPayment.amount)}</span>
                      <span> - </span>
                      <span>{creditPayment.customer_name}</span>
                    </div>
                  ),
                )}
              </div>
            </>
          )}
        </div>
        <div className={styles.detail_section}>
          <div>
            <b>- Pagos de Créditos Transferencia: </b>
            <b>{formatMonetary(transferCustomerCreditPaymentsTotal)}</b>
          </div>
          {transferBankAccounts.map(
            transferBankAccount =>
              hasTransferBankAccountCreditPayments(transferBankAccount.id) && (
                <>
                  <div className={styles.purchase_orders_receipts_container}>
                    {closedReconciliationReceipt?.customer_credit_payments_receipt?.credit_payments_by_transfer_bank_account[
                      transferBankAccount.id
                    ]?.credit_payment.map((creditPayment, index) => (
                      <div key={index}>
                        <span>#{creditPayment.customer_credit_payment_id}</span>
                        <span> - </span>
                        <span>{formatMonetary(creditPayment.amount)}</span>
                        <span> - </span>
                        <span>{creditPayment.customer_name}</span>
                      </div>
                    ))}
                  </div>
                </>
              ),
          )}
        </div>
        <div className={styles.detail_section}>
          {hasCashWithdrawals() && (
            <>
              <div>
                <b>- Retiros: </b>
                <b>{formatMonetary(withdrawalsTotal)}</b>
              </div>
              <div className={styles.purchase_orders_receipts_container}>
                {closedReconciliationReceipt?.cash_withdrawal_receipts?.map(
                  (cashWithdrawal, index) => (
                    <div key={index}>
                      <span>#{cashWithdrawal.id}</span>
                      <span> - </span>
                      <span>({formatMonetary(cashWithdrawal.amount)})</span>
                      <span> - </span>
                      <span>{cashWithdrawal.withdrawal_cause?.toLowerCase()}</span>
                    </div>
                  ),
                )}
              </div>
            </>
          )}
        </div>
        <div className={styles.detail_section}>
          {hasOtherIncomes() && (
            <>
              <div>
                <b>- Otros ingresos: </b>
                <b>{formatMonetary(otherIncomeTotal)}</b>
              </div>
              <div className={styles.purchase_orders_receipts_container}>
                {closedReconciliationReceipt?.other_income_receipts?.map(
                  (cashWithdrawal, index) => (
                    <div key={index}>
                      <span>#{cashWithdrawal.id}</span>
                      <span> - </span>
                      <span>({formatMonetary(cashWithdrawal.amount)})</span>
                      <span> - </span>
                      <span>{cashWithdrawal.cause?.toLowerCase()}</span>
                    </div>
                  ),
                )}
              </div>
            </>
          )}
        </div>
        <div className={styles.detail_section}>
          <b>TOTAL EFECTIVO: </b>
          <b>{formatMonetary(totalCash)}</b>
        </div>
      </div>
    </div>
  )
}

export default ClosedReconciliationReceipt
