import keyBy from 'lodash.keyby'
import ViewHeader from 'webapp//components/views/header/header'
import ViewContainer from 'webapp//components/views/container/container'
import viewStyles from 'webapp//views/views.module.css'
import clsx from 'clsx'
import React, { useEffect, useRef, useState } from 'react'
import { toast } from 'react-toastify'
import OrderReceipt from '../order_receipt/order_receipt'
import { PurchaseOrderClient } from 'webapp//api/clients/purchase_order'
import {
  PurchaseOrderReceipt,
  PurchaseOrderReceiptDetail,
} from 'interface/entities/purchase_order'
import Table from 'webapp//components/table/table'
import { formatMonetary, formatQuantity } from 'webapp//components/functions/formatting'
import CauseSearchBox from 'webapp//components/cause_search_box/cause_search_box'
import styles from './return_purchase_order_details.module.css'
import { CauseClient } from 'webapp//api/clients/cause_client'
import { PurchaseOrderDetailStatusTranslation } from 'webapp//components/functions/translations'
import { CauseAction } from 'interface/entities/cause'

const purchaseOrderClient = new PurchaseOrderClient()
const returnedPurchaseOrderCauseClient = new CauseClient()

type OrderDetailById = { [orderDetailId: string]: PurchaseOrderReceiptDetail }

const ReturnPurchaseOrderDetail = () => {
  const [orderIdInput, setOrderIdInput] = useState<string>('')
  const [purchaseOrder, setPurchaseOrder] = useState<PurchaseOrderReceipt | null>(null)
  const [enableSearchButton, setEnableSearchButton] = useState<boolean>(false)
  const [causeId, setCauseId] = useState('')
  const [causeDescription, setCauseDescription] = useState('')
  const [selectedOrderDetailId, setSelectedOrderDetailId] = useState<number | null>(null)
  const [orderDetailsById, setOrderDetailsById] = useState<OrderDetailById>({})

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
    const purchaseOrderRsp = await purchaseOrderClient.getReceipt({
      order_id: orderIdNumber,
    })
    setPurchaseOrder(purchaseOrderRsp.receipt)
    setEnableSearchButton(false)
    setOrderDetailsById(keyBy(purchaseOrderRsp.receipt?.detail, 'detail_id'))
  }

  const cancelDetails = async () => {
    if (!purchaseOrder || selectedOrderDetailId === null) {
      return
    }
    if ((purchaseOrder?.form_of_payments?.length ?? 0) > 1) {
      toast.error('No se puede devolver un producto de una orden con más de una forma pago.')
      return
    }
    let causeIdNumber = parseInt(causeId)
    if (!causeId) {
      const response = await returnedPurchaseOrderCauseClient.add({
        description: causeDescription,
        cause_action: CauseAction.RETURNED_PURCHASE_ORDER_DETAIL,
      })
      causeIdNumber = response.cause.id
    }
    const response = await purchaseOrderClient.returnOrderDetails({
      order_id: purchaseOrder.order_id,
      details_and_causes: [
        {
          order_detail_id: selectedOrderDetailId.toString(),
          cause_id: causeIdNumber,
        },
      ],
    })
    if (response.success) {
      toast.success('Producto devuelto')
      await getPurchasedOrder()
      setCauseDescription('')
      setSelectedOrderDetailId(null)
    } else {
      toast.error('Error al devolver producto')
    }
  }

  const reportDetailRows = purchaseOrder?.detail
    ? purchaseOrder?.detail.map(row => {
        return {
          id: String(row.detail_id),
          cells: [
            {
              value: row.product_code,
            },
            {
              value: row.product_name,
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
            {
              value: PurchaseOrderDetailStatusTranslation[row.status],
            },
          ],
        }
      })
    : []

  const onOrderIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPurchaseOrder(null)
    setOrderIdInput(e.target.value)
    setEnableSearchButton(e.target.value.length > 0)
    setSelectedOrderDetailId(null)
  }

  const enableCancelButton =
    purchaseOrder &&
    causeDescription &&
    selectedOrderDetailId !== null &&
    orderDetailsById[selectedOrderDetailId]?.status === 'PROCESSED'

  return (
    <ViewContainer title={'Devolución de Producto'}>
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
              cause_action={CauseAction.RETURNED_PURCHASE_ORDER_DETAIL}
              onQueryChanged={value => setCauseDescription(value || '')}
            />
          </div>
          <div className={styles.button_container}>
            <button
              className={clsx({
                [viewStyles.disabled_button]: !enableCancelButton,
                [viewStyles.primary_button]: enableCancelButton,
              })}
              disabled={!enableCancelButton}
              onClick={cancelDetails}
            >
              Devolver producto
            </button>
          </div>
        </ViewHeader>
      </div>
      <div>
        <Table
          selectedRowId={String(selectedOrderDetailId)}
          columnNames={[
            'Código',
            'Descripción',
            'Precio Unitario',
            'Cantidad',
            'Importe',
            'Status',
          ]}
          rows={reportDetailRows}
          onSelectedRow={id => {
            setSelectedOrderDetailId(Number(id))
          }}
        />
      </div>
      <div>
        {purchaseOrder?.order_id && <OrderReceipt orderId={purchaseOrder.order_id} print={false} />}
      </div>
    </ViewContainer>
  )
}

export default ReturnPurchaseOrderDetail
