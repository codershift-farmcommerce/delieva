import React, { useState } from 'react'
import ViewContainer from 'webapp/src/components/views/container/container'
import ViewHeader from 'webapp/src/components/views/header/header'
import { PurchaseOrderClient } from 'webapp/src/api/clients/purchase_order'
import styles from './purchase_orders.module.css'
import Table from 'webapp/src/components/table/table'
import {
  FormOfPaymentWithAmount,
  PurchaseOrderReportEntry,
} from 'interface/entities/purchase_order'
import { formatMonetary, formatQuantity } from 'webapp/src/components/functions/formatting'
import viewStyles from 'webapp/src/views/views.module.css'
import clsx from 'clsx'
import OrderReceipt from 'webapp/src/views/pos/order_receipt/order_receipt'
import {
  FormOfPaymentTranslation,
  PurchaseOrderStatusTranslation,
} from 'webapp/src/components/functions/translations'
import Spinner from '../../../components/spinner/spinner'

const purchaseOrderClient = new PurchaseOrderClient()

type IndexedReport = Record<string, PurchaseOrderReportEntry>

const PurchaseOrdersReport = () => {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const [startDate, setStartDate] = useState<Date>(yesterday)
  const [endDate, setEndDate] = useState<Date>(new Date())
  const [report, setReport] = useState<IndexedReport>({})
  const [selectedMasterRowId, setSelectedMasterRowId] = useState('')
  const [printReceipt, setPrintReceipt] = useState(false)
  const [filteredPurchaseOrdersByCustomer, setFilteredPurchaseOrdersByCustomer] =
    useState<IndexedReport>({})
  const [isLoading, setIsLoading] = useState(false)
  const [canGetReport, setCanGetReport] = useState(true)

  const customerInputRef = React.useRef<HTMLInputElement>(null)

  const getReport = async () => {
    setCanGetReport(false)
    setIsLoading(true)
    const response = await purchaseOrderClient.getReport({
      start_date: startDate,
      end_date: endDate,
    })
    const indexedReport = response.entries.reduce((acc, val, index) => {
      acc[index] = val
      return acc
    }, {} as IndexedReport)
    setReport(indexedReport)
    setFilteredPurchaseOrdersByCustomer(indexedReport)
    setIsLoading(false)
  }

  const handleStartDateChange = (date: string) => {
    setStartDate(new Date(date))
    setCanGetReport(true)
  }

  const handleEndDateChange = (date: string) => {
    setEndDate(new Date(date))
    setCanGetReport(true)
  }

  const handleGetReport = async () => {
    getReport().catch(err => {
      console.error(err)
    })
  }

  const handlePrintReceipt = () => {
    setPrintReceipt(true)
  }

  const getFopDescription = (formOfPaymentObj: FormOfPaymentWithAmount) => {
    const formOfPayment = formOfPaymentObj.form_of_payment
    let formOfPaymentString = FormOfPaymentTranslation[formOfPayment]
    if (formOfPayment === 'TRANSFER' && formOfPaymentObj.transfer_bank_account_name) {
      formOfPaymentString += ` - ${formOfPaymentObj.transfer_bank_account_name}`
    }
    return formOfPaymentString
  }

  const handleCustomerQueryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const filter = event.target.value
    setFilteredPurchaseOrdersByCustomer(() => {
      if (filter === '') {
        return report
      }

      return Object.keys(report)
        .filter(key => {
          const entry = report[key]
          return entry.customer.name.toLowerCase().includes(filter.toLowerCase())
        })
        .reduce((acc, key) => {
          acc[key] = report[key]
          return acc
        }, {} as IndexedReport)
    })
  }

  const reportMasterRows = Object.keys(filteredPurchaseOrdersByCustomer).map(key => {
    const entry = report[key]

    const formOfPaymentString = Array.from(
      new Set(entry.form_of_payments.map(getFopDescription)),
    ).join(', ')

    return {
      id: String(key),
      cells: [
        {
          value: entry.order_id,
        },
        {
          value: entry.created_at,
        },
        {
          value: entry.cash_register_name,
        },
        {
          value: entry.customer.name,
        },
        {
          value: formatMonetary(Number(entry.total)),
        },
        {
          value: formOfPaymentString,
        },
        {
          value: entry.status ? PurchaseOrderStatusTranslation[entry.status] : '',
        },
      ],
    }
  })

  const reportDetailRows = report[selectedMasterRowId]
    ? report[selectedMasterRowId].detail.map((row, index) => {
        return {
          id: String(index),
          cells: [
            {
              value: row.product.code,
            },
            {
              value: row.product.name,
            },
            {
              value: formatMonetary(Number(row.unit_price)),
            },
            {
              value: formatQuantity(Number(row.quantity)),
            },
            {
              value: formatMonetary(Number(row.detail_total)),
            },
          ],
        }
      })
    : []

  const handleSelectMasterRow = (id: string) => {
    setSelectedMasterRowId(id)
  }
  const orderToPrint = report?.[selectedMasterRowId]?.order_id ?? ''

  return (
    <ViewContainer title={'Órdenes de Compra'}>
      <ViewHeader>
        <div className={styles.header_container}>
          <div className={styles.header_input}>
            <label>Fecha inicio: </label>
            <input
              type={'date'}
              value={startDate.toISOString().substring(0, 10)}
              onChange={e => handleStartDateChange(e.target.value)}
            />
          </div>
          <div>
            <label>Fecha fin: </label>
            <input
              type={'date'}
              value={endDate.toISOString().substring(0, 10)}
              onChange={e => handleEndDateChange(e.target.value)}
            />
          </div>
          <div className={styles.header_button_container}>
            <button
              className={clsx({
                [viewStyles.primary_button]: canGetReport,
                [viewStyles.disabled_button]: !canGetReport,
              })}
              disabled={!canGetReport}
              onClick={handleGetReport}
            >
              Obtener reporte
            </button>
            <button
              className={clsx({
                [viewStyles.secondary_button]: selectedMasterRowId,
                [viewStyles.disabled_button]: !selectedMasterRowId,
              })}
              disabled={!selectedMasterRowId}
              onClick={handlePrintReceipt}
            >
              Reimprimir ticket
            </button>
          </div>
          <div>
            <label className={styles.client_label}>Cliente:</label>
            <input
              ref={customerInputRef}
              type={'text'}
              className={viewStyles.input}
              onChange={handleCustomerQueryChange}
            />
          </div>
        </div>
      </ViewHeader>
      {isLoading ? (
        <Spinner />
      ) : (
        <div className={styles.tables_container}>
          <Table
            selectedRowId={selectedMasterRowId}
            columnNames={['ID', 'Fecha', 'Caja', 'Cliente', 'Total', 'Forma de Pago', 'Estado']}
            rows={reportMasterRows}
            onSelectedRow={handleSelectMasterRow}
          />
          <Table
            selectedRowId={''}
            columnNames={['Código', 'Descripción', 'Precio Unitario', 'Cantidad', 'Importe']}
            rows={reportDetailRows}
            onSelectedRow={() => {}}
          />
        </div>
      )}
      <div className={styles.receipt_container}>
        <OrderReceipt
          print={printReceipt}
          orderId={orderToPrint}
          onAfterPrint={() => {
            setPrintReceipt(false)
          }}
        />
      </div>
    </ViewContainer>
  )
}

export default PurchaseOrdersReport
