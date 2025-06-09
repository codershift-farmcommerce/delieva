import ViewContainer from 'webapp//components/views/container/container'
import styles from './customer_credits_global_balance.module.css'
import ViewHeader from 'webapp//components/views/header/header'
import React, { useEffect, useState } from 'react'
import viewStyles from 'webapp//views/views.module.css'
import { CustomerCreditClient } from 'webapp//api/clients/customer_credit'
import { CustomerCredit } from 'interface/entities/customer_credit'
import Table from 'webapp//components/table/table'
import { formatMonetary } from 'webapp//components/functions/formatting'

const customerCreditClient = new CustomerCreditClient()

const CustomerCredits = () => {
  const [customerCredits, setCustomerCredits] = useState<CustomerCredit[]>([])
  const [filteredCustomerCredits, setFilteredCustomerCredits] = useState<CustomerCredit[]>([])

  const customerInputRef = React.useRef<HTMLInputElement>(null)

  const getCustomerCredits = async () => {
    const result = await customerCreditClient.list({})
    setCustomerCredits(result.credits)
    setFilteredCustomerCredits(result.credits)
  }

  useEffect(() => {
    getCustomerCredits().catch(console.error)
    customerInputRef.current?.focus()
  }, [])

  const handleCustomerQueryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const filter = event.target.value
    setFilteredCustomerCredits(() => {
      if (filter === '') {
        return customerCredits
      }

      return customerCredits.filter(credit => {
        return credit.customer_name.toLowerCase().includes(filter.toLowerCase())
      })
    })
  }

  const customerCreditRow = filteredCustomerCredits
    ? filteredCustomerCredits.map((credit, index) => {
        const indexString =
          customerCredits.map(c => c.customer_name).indexOf(credit.customer_name) + 1
        return {
          id: String(index),
          cells: [
            {
              value: indexString,
            },
            {
              value: credit.customer_name,
            },
            {
              value: formatMonetary(credit.credits_total),
            },
            {
              value: formatMonetary(credit.payments_total),
            },
            {
              value: formatMonetary(credit.credits_total - credit.payments_total),
            },
          ],
        }
      })
    : []

  const total = customerCredits.reduce((acc, credit) => {
    acc = acc + Number(credit.credits_total) - Number(credit.payments_total)
    return acc
  }, 0)

  return (
    <ViewContainer title={'Saldo Global de Créditos de Clientes'}>
      <ViewHeader flexDirection={'column'}>
        <div>
          <label className={styles.client_label}>Cliente:</label>
          <input
            ref={customerInputRef}
            type={'text'}
            className={viewStyles.input}
            onChange={handleCustomerQueryChange}
          />
        </div>
      </ViewHeader>
      <div className={styles.container}>
        <div className={styles.totals_container}>
          <label>Total de saldo global: </label>
          <label className={styles.totalCredits}>{formatMonetary(total)}</label>
        </div>
        <div>
          <Table
            selectedRowId={''}
            columnNames={['#', 'Cliente', 'Importe', 'Abonos', 'Saldo']}
            rows={customerCreditRow}
            onSelectedRow={() => {}}
          />
        </div>
      </div>
    </ViewContainer>
  )
}

export default CustomerCredits
