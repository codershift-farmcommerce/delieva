import React, { useState } from 'react'
import moment from 'moment'
import ViewContainer from 'webapp/src/components/views/container/container'
import ViewHeader from 'webapp/src/components/views/header/header'
import styles from './finished_product_sales.module.css'
import Table from 'webapp/src/components/table/table'
import { formatMonetary, formatQuantity } from 'webapp/src/components/functions/formatting'
import viewStyles from 'webapp/src/views/views.module.css'
import { FinishedProductSalesReportEntry } from 'interface/entities/finished_product'
import { FinishedProductClient } from 'webapp/src/api/clients/finished_product'
import clsx from 'clsx'
import { FinishedProductUnitTranslation } from 'webapp/src/components/functions/translations'
import { downloadFile } from 'webapp/src/components/functions/files'
import { toast } from 'react-toastify'

const finishedProductClient = new FinishedProductClient()

const FinishedProductSalesReport = () => {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const [startDate, setStartDate] = useState<Date>(yesterday)
  const [endDate, setEndDate] = useState<Date>(new Date())
  const [report, setReport] = useState<FinishedProductSalesReportEntry[]>([])
  const [selectedMasterRowId, setSelectedMasterRowId] = useState('')
  const [canGetReport, setCanGetReport] = useState(true)

  const getReport = async () => {
    const response = await finishedProductClient.getSalesReport({
      start_date: startDate,
      end_date: endDate,
    })
    setReport(response.entries)
    setCanGetReport(false)
  }

  const getReportAsExcelSheet = async () => {
    const data = await finishedProductClient.getSalesReportAsExcelSheet({
      start_date: startDate,
      end_date: endDate,
    })
    const chunks: any[] = []
    try {
      const reader = data.getReader()
      reader.read().then(function processResult(result): any {
        if (result.done) {
          const start = moment(startDate).format('YYYY-MM-DD')
          const end = moment(endDate).format('YYYY-MM-DD')
          downloadFile(new Blob(chunks), `ventas_por_producto_terminado_${start}-${end}.xlsx`)
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

  const handleStartDateChange = (date: string) => {
    setStartDate(new Date(date))
    setCanGetReport(true)
    setReport([])
  }

  const handleEndDateChange = (date: string) => {
    setEndDate(new Date(date))
    setCanGetReport(true)
    setReport([])
  }

  const handleGetReport = async () => {
    getReport().catch(err => {
      console.error(err)
    })
  }

  const reportMasterRows = report
    ? report.map((entry, index) => {
        return {
          id: String(index),
          cells: [
            {
              value: entry.date.substring(0, 10),
            },
            {
              value: entry.finished_product_code,
            },
            {
              value: entry.finished_product_name,
            },
            {
              value: formatQuantity(entry.quantity),
            },
            {
              value: FinishedProductUnitTranslation[entry.finished_product_unit_type],
            },
            {
              value: formatMonetary(entry.total_sales),
            },
            {
              value: formatMonetary(entry.total_sales / entry.quantity),
            },
            {
              value: entry.cash_register_name,
            },
          ],
        }
      })
    : []

  const handleSelectRow = (id: string) => {
    setSelectedMasterRowId(id)
  }

  return (
    <ViewContainer title={'Ventas por Producto Terminado'}>
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
              onClick={handleGetReport}
              className={clsx({
                [viewStyles.primary_button]: canGetReport,
                [viewStyles.disabled_button]: !canGetReport,
              })}
              disabled={!canGetReport}
            >
              Obtener reporte
            </button>
            <button
              className={clsx({
                [viewStyles.secondary_button]: report.length > 0,
                [viewStyles.disabled_button]: report.length === 0,
              })}
              disabled={report.length === 0}
              onClick={getReportAsExcelSheet}
            >
              Exportar a excel
            </button>
          </div>
        </div>
      </ViewHeader>
      <div className={styles.tables_container}>
        <Table
          selectedRowId={selectedMasterRowId}
          columnNames={[
            'Fecha',
            'Código',
            'Descripción',
            'Cantidad',
            'Unidad',
            'Total Efectivo',
            'Costo x Unidad',
            'Caja',
          ]}
          rows={reportMasterRows}
          onSelectedRow={handleSelectRow}
        />
      </div>
    </ViewContainer>
  )
}

export default FinishedProductSalesReport
