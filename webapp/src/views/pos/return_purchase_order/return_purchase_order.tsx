import ViewContainer from 'src/components/views/container/container'
import ViewHeader from 'src/components/views/header/header'
import CauseSearchBox from 'src/components/cause_search_box/cause_search_box'
import viewStyles from 'src/views/views.module.css'
import { useEffect, useRef, useState } from 'react'
import OrderReceipt from '../order_receipt/order_receipt'
import { toast } from 'react-toastify'
import clsx from 'clsx'
import styles from './return_purchase_order.module.css'
import { PurchaseOrderClient } from 'src/api/clients/purchase_order'
import { CauseClient } from 'src/api/clients/cause_client'
import { CauseAction } from 'interface/entities/cause'

const purchaseOrderClient = new PurchaseOrderClient()
const causeClient = new CauseClient()
const ReturnPurchaseOrder = () => {
  const [orderIdInput, setOrderIdInput] = useState<string>('')
  const [orderId, setOrderId] = useState<number | null>(null)
  const [enableSearchButton, setEnableSearchButton] = useState<boolean>(false)
  const [causeId, setCauseId] = useState('')
  const [causeDescription, setCauseDescription] = useState('')

  const orderIdRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    orderIdRef.current?.focus()
  }, [])

  const getPurchasedOrder = async () => {
    const orderIdNumber = parseInt(orderIdInput)
    if (isNaN(orderIdNumber)) {
      toast('Ingrese un número de orden válido', { type: 'error' })
      return
    }
    setOrderId(orderIdNumber)
    setEnableSearchButton(false)
  }

  const onOrderIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOrderId(null)
    setOrderIdInput(e.target.value)
    setEnableSearchButton(e.target.value.length > 0)
  }

  const cancelOrder = async () => {
    if (!orderId) {
      return
    }
    let causeIdNumber = parseInt(causeId)
    if (!causeId) {
      const response = await causeClient.add({
        description: causeDescription,
        cause_action: CauseAction.RETURNED_PURCHASE_ORDER,
      })
      causeIdNumber = response.cause.id
    }
    const response = await purchaseOrderClient.returnOrder({
      order_id: orderId,
      cause_id: causeIdNumber,
    })
    if (response.success) {
      toast.success('Orden cancelada')
      setOrderId(null)
      setOrderIdInput('')
      setEnableSearchButton(false)
      setCauseDescription('')
    } else {
      toast.error('Error al cancelar orden')
    }
  }

  return (
    <ViewContainer title={'Cancelación de Orden de Compra'}>
      <div>
        <ViewHeader flexDirection={'column'}>
          <div>
            <label>Ticket #: </label>
            <input
              ref={orderIdRef}
              value={orderIdInput}
              className={viewStyles.input}
              onChange={onOrderIdChange}
              type="text"
            />
            <button
              onClick={getPurchasedOrder}
              disabled={!enableSearchButton}
              className={clsx({
                [viewStyles.secondary_button]: enableSearchButton,
                [viewStyles.disabled_button]: !enableSearchButton,
              })}
            >
              Buscar
            </button>
          </div>
          <div>
            <CauseSearchBox
              onCauseSelected={resultItem => {
                setCauseId(String(resultItem.id))
              }}
              cause_action={CauseAction.RETURNED_PURCHASE_ORDER}
              onQueryChanged={value => setCauseDescription(value || '')}
            />
          </div>
          <div className={styles.button_container}>
            <button
              className={clsx({
                [viewStyles.disabled_button]: !orderId || !causeDescription,
                [viewStyles.primary_button]: orderId && causeDescription,
              })}
              disabled={!orderId || !causeDescription}
              onClick={cancelOrder}
            >
              Cancelar orden
            </button>
          </div>
        </ViewHeader>
      </div>
      <div>{orderId && <OrderReceipt orderId={orderId} print={false} />}</div>
    </ViewContainer>
  )
}

export default ReturnPurchaseOrder
