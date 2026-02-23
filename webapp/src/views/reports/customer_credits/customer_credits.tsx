import ViewContainer from 'webapp/src/components/views/container/container'
import ViewHeader from 'webapp/src/components/views/header/header'
import styles from './customer_credits.module.css'
import CustomerSearchBox from 'webapp/src/components/customer_search_box/customer_search_box'
import React, { useState } from 'react'
import { SearchResultItem } from 'interface/entities/common'
import { Customer } from 'interface/entities/customer'
import clsx from 'clsx'
import viewStyles from 'webapp/src/views/views.module.css'
import { CustomerCreditClient } from 'webapp/src/api/clients/customer_credit'
import Table from 'webapp/src/components/table/table'
import { CreditPurchaseOrder } from 'interface/responses/customer_credit'
import { CustomerCreditPayment } from 'interface/entities/customer_credit'
import { formatMonetary } from '../../../components/functions/formatting'
import moment from 'moment'
import { downloadFile } from 'webapp/src/components/functions/files'
import { toast } from 'react-toastify'

const customerCreditClient = new CustomerCreditClient()

const CustomerCredits = () => {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>()
  const [purchaseOrders, setPurchaseOrders] = useState<CreditPurchaseOrder[]>([])
  const [creditBalance, setCreditBalance] = useState<number>()
  const [payments, setPayments] = useState<CustomerCreditPayment[]>([])
  const [selectedPurchaseOrderId, setSelectedPurchaseOrderId] = useState<string>('')
  const [showReceipt, setShowReceipt] = useState(false)

  const handleSelectedCustomer = (resultItem: SearchResultItem<Customer>) => {
    setSelectedCustomer(resultItem.data)
  }

  const getReport = async () => {
    const result = await customerCreditClient.getCustomerCreditPurchaseOrdersReport({
      customer_id: selectedCustomer?.id ?? 0,
    })
    setPurchaseOrders(result.purchase_orders)
    setPayments(result.payments)
    setCreditBalance(result.credit_balance)
  }

  const getReportAsExcelSheet = async () => {
    const data = await customerCreditClient.getCustomerCreditPurchaseOrdersReportAsExcelSheet({
      customer_id: selectedCustomer?.id ?? 0,
    })
    const chunks: any[] = []
    try {
      const reader = data.getReader()
      reader.read().then(function processResult(result): any {
        if (result.done) {
          downloadFile(
            new Blob(chunks),
            `ventas_por_producto_cliente_num_${selectedCustomer?.id}.xlsx`,
          )
        } else {
          chunks.push(result.value)
          return reader.read().then(processResult)
        }
      })
    } catch (err) {
      console.log(err)
      toast.error('Error al descargar el archivo')
    }
  }

  const handlePurchaseOrder = (id: string) => {
    setSelectedPurchaseOrderId(id)
    setShowReceipt(true)
  }

  const purchaseOrdersRows = purchaseOrders
    ? purchaseOrders.map((row, index) => {
        return {
          id: String(index),
          cells: [
            {
              value: row.order_id,
            },
            {
              value: row.created_at.substring(0, 10),
            },
            {
              value: formatMonetary(row.total),
            },
            {
              value: formatMonetary(row.total - row.paid),
            },
          ],
        }
      })
    : []

  const paymentsRows = payments
    ? payments.map((row, index) => {
        return {
          id: String(index),
          cells: [
            {
              value: row.id,
            },
            {
              value: row.created_at.substring(0, 10),
            },
            {
              value: formatMonetary(row.payment_amount),
            },
          ],
        }
      })
    : []

  const enableExcelExportButton = (purchaseOrders?.length ?? 0 > 0) || (payments?.length ?? 0 > 0)

  return (
    <ViewContainer title={'Créditos de Clientes'}>
      <div className={styles.container}>
        <div>
          <ViewHeader flexDirection={'column'}>
            <div>
              <CustomerSearchBox
                onCustomerSelected={handleSelectedCustomer}
                defaultValue={selectedCustomer?.name ?? ''}
              />
            </div>
            <div className={styles.button_container}>
              <button
                onClick={getReport}
                disabled={!selectedCustomer}
                className={clsx({
                  [viewStyles.primary_button]: selectedCustomer,
                  [viewStyles.disabled_button]: !selectedCustomer,
                })}
              >
                Obtener reporte
              </button>
              <button
                className={clsx({
                  [viewStyles.secondary_button]: enableExcelExportButton,
                  [viewStyles.disabled_button]: !enableExcelExportButton,
                })}
                disabled={!enableExcelExportButton}
                onClick={getReportAsExcelSheet}
              >
                Exportar a excel
              </button>
            </div>
          </ViewHeader>
          <div className={styles.balance}>
            Saldo pendiente: <span>{formatMonetary(creditBalance)}</span>
          </div>
          <div className={styles.tables_container}>
            <Table
              selectedRowIds={[selectedPurchaseOrderId]}
              columnNames={['Ticket de venta', 'Fecha', 'Importe', 'Saldo pendiente']}
              rows={purchaseOrdersRows}
              onSelectedRow={handlePurchaseOrder}
            />
            <Table
              selectedRowId={''}
              columnNames={['Ticket de pago', 'Fecha', 'Importe']}
              rows={paymentsRows}
              onSelectedRow={() => {}}
            />
          </div>
        </div>
      </div>
    </ViewContainer>
  )
}

export default CustomerCredits
