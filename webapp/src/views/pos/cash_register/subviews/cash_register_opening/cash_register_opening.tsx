import ViewContainer from 'src/components/views/container/container'
import React, { useEffect } from 'react'
import { CashRegister } from 'interface/entities/cash_register'
import { CashRegisterClient } from 'src/api/clients/cash_register'
import { toast } from 'react-toastify'
import viewStyles from 'src/views/views.module.css'
import styles from './cash_register_opening.module.css'
import ViewHeader from 'src/components/views/header/header'
import Router from 'next/router'

const cashRegisterClient = new CashRegisterClient()

type CashRegisterOpeningProps = {
  cashRegister: CashRegister | null
}
const CashRegisterOpening = (props: CashRegisterOpeningProps) => {
  const { cashRegister } = props
  const [openingCashBalance, setOpeningCashBalance] = React.useState('')

  const initialBalanceInputRef = React.useRef<HTMLInputElement>(null)

  useEffect(() => {
    initialBalanceInputRef.current?.focus()
  }, [])

  const handleCashRegisterOpening = async (e: any) => {
    e.preventDefault()
    if (!cashRegister) {
      return
    }
    const balanceNumber = parseFloat(openingCashBalance)
    if (isNaN(balanceNumber)) {
      toast.dark('El balance inicial debe ser un número')
      return
    }
    const response = await cashRegisterClient.openReconciliation({
      opening_cash_balance: parseFloat(openingCashBalance),
    })
    if (response.success) {
      toast.dark('Caja abierta correctamente')
      setTimeout(() => {
        Router.reload()
      }, 500)
    } else {
      toast.dark('Error al abrir caja')
    }
  }

  return (
    <ViewContainer title={`Apertura de ${cashRegister?.name ?? ''}`}>
      <ViewHeader flexDirection={'column'}>
        <form className={styles.form_container} onSubmit={handleCashRegisterOpening}>
          <div>
            <label className={styles.form_container_input_label}>
              Indique balance de efectivo inicial:
            </label>
            <input
              ref={initialBalanceInputRef}
              className={styles.form_container_input}
              value={openingCashBalance}
              onChange={event => setOpeningCashBalance(event.target.value)}
            />
          </div>
          <div>
            <input type={'submit'} value={'Abrir caja'} className={viewStyles.primary_button} />
          </div>
        </form>
      </ViewHeader>
    </ViewContainer>
  )
}

export default CashRegisterOpening
