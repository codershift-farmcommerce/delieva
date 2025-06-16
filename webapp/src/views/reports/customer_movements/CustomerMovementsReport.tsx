import React, { useState } from 'react'
import type { Dayjs } from 'dayjs'
import { downloadCustomerMovementsReport } from './service'
import styles from './customer_movements.module.css'
import { DatePicker, Button, message } from 'antd'
import type { RangePickerProps } from 'antd/es/date-picker'
import type { ButtonProps } from 'antd/es/button'
import ViewContainer from 'webapp/src/components/views/container/container'
import CustomerSearchBox from 'webapp/src/components/customer_search_box/customer_search_box'

const { RangePicker } = DatePicker

type CustomerMovementsReportProps = Record<string, never>

const CustomerMovementsReport: React.FC<CustomerMovementsReportProps> = () => {
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | undefined>()
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>()

  const handleDownload = async () => {
    if (!dateRange) {
      message.error('Por favor seleccione un rango de fechas')
      return
    }

    try {
      await downloadCustomerMovementsReport({
        start_date: dateRange[0].format('DD-MM-YYYY'),
        end_date: dateRange[1].format('DD-MM-YYYY'),
        customer_id: selectedCustomerId
      })
    } catch (error: any) {
      message.error('Error al descargar el reporte')
    }
  }

  const handleDateRangeChange: RangePickerProps['onChange'] = (dates) => {
    if (dates) {
      setDateRange(dates as [Dayjs, Dayjs])
    }
  }

  return React.createElement(ViewContainer, { title: 'Movimientos de Clientes', children:
    React.createElement('div', { className: styles.container },
      React.createElement('div', null,
        React.createElement('div', { className: styles.customerSearch },
          React.createElement(CustomerSearchBox, {
            onCustomerSelected: (customer) => setSelectedCustomerId(customer?.id?.toString()),
            placeholderText: 'Seleccione un cliente (opcional)'
          })
        ),
        React.createElement('label', { className: styles.label }, 'Rango de fechas:'),
        React.createElement<RangePickerProps>(RangePicker, {
          className: styles.datePicker,
          onChange: handleDateRangeChange,
          format: 'DD-MM-YYYY'
        })
      ),
      React.createElement<ButtonProps>(Button, {
        type: 'primary',
        onClick: () => void handleDownload(),
        className: styles.button,
        children: 'Descargar Reporte'
      })
    )
  })
}

export default CustomerMovementsReport
