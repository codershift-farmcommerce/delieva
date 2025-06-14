import React from 'react'
import { CashRegisterWithdrawalReceipt } from 'interface/entities/cash_register'
import { CashRegisterWithdrawalStatus } from 'interface/entities/cash_register'
import styles from './cash_register_withdrawal_table.module.css'

type Props = {
  cashRegisterName: string
  withdrawals: CashRegisterWithdrawalReceipt[]
  loading: boolean
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(amount)
}

const CashRegisterWithdrawalTable = React.memo(
  ({ withdrawals, loading, cashRegisterName }: Props) => {
    if (loading) {
      return <p>Cargando retiros...</p>
    }

    return (
      <div>
        <div>Retiros de {cashRegisterName}</div>
        <table className={styles.withdrawals_table}>
          <thead>
            <tr>
              <th>Cajero</th>
              <th>Causa</th>
              <th>Monto</th>
              <th>Fecha</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {(withdrawals ?? []).map(withdrawal => (
              <tr key={withdrawal.id}>
                <td>{withdrawal.cash_register_name}</td>
                <td>{withdrawal.cause}</td>
                <td>{formatCurrency(Number(withdrawal.amount))}</td>
                <td>{new Date(withdrawal.created_at).toLocaleString()}</td>
                <td>
                  {withdrawal.status === CashRegisterWithdrawalStatus.PROCESSED
                    ? 'Procesado'
                    : 'Cancelado'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  },
)

export default CashRegisterWithdrawalTable
