import React, { useEffect, useState } from 'react'
import moment from 'moment'
import { PurchaseOrderReceipt } from 'interface/entities/purchase_order'
import { PurchaseOrderClient } from 'webapp/src/api/clients/purchase_order'
import styles from './order_receipt.module.css'
import { formatMonetary, formatQuantity } from 'webapp/src/components/functions/formatting'
import { FormOfPaymentTranslation } from 'webapp/src/components/functions/translations'
import { useReactToPrint } from 'react-to-print'

export type OrderReceiptProps = {
  orderId: number | null
  print: boolean
  onAfterPrint?: () => void
}

const purchaseOrderClient = new PurchaseOrderClient()

const OrderReceipt = (props: OrderReceiptProps) => {
  const { orderId, print, onAfterPrint } = props
  if (!orderId) {
    return null
  }

  const [orderReceipt, setOrderReceipt] = useState<PurchaseOrderReceipt | null>(null)
  let printingRef: React.ReactInstance | null

  const getOrderReceipt = async () => {
    const response = await purchaseOrderClient.getReceipt({
      order_id: orderId,
    })
    if (response.receipt) {
      setOrderReceipt(response.receipt)
    }
  }

  useEffect(() => {
    if (orderId) {
      getOrderReceipt().catch(console.error)
    }
  }, [orderId])

  useEffect(() => {
    if (orderReceipt && print) {
      handlePrint()
    }
  }, [orderReceipt, print])

  const handlePrint = useReactToPrint({
    content: () => printingRef,
    onAfterPrint,
  })

  return (
    <div ref={el => (printingRef = el)} className={styles.container}>
      <div className={styles.title}>Eva Ornelas García</div>
      <div className={styles.header_item}>Domicilio Fiscal:</div>
      <div className={styles.header_item}>Calle Angelinas #113, las Puentes, Meoqui, Chih.</div>
      <div className={styles.header_item}>CP: 33130</div>
      <div className={styles.header_item}>RFC: OEGE550225LC0</div>
      <div className={styles.header_item_phone_number}>639-115-18-01 (Solo WhatsApp)</div>
      <div>-----------------------------------</div>
      <div className={styles.sub_header_item}>Tienda No. 01</div>
      <div className={styles.sub_header_item}>Caja: {orderReceipt?.cash_register_name}</div>
      <div className={styles.sub_header_item}>Nota de Venta: {orderReceipt?.order_id}</div>
      <div className={styles.sub_header_item}>
        Fecha: {moment(orderReceipt?.created_at).format('DD/MM/YYYY')}
      </div>
      <div className={styles.sub_header_item}>
        Hora: {moment(orderReceipt?.created_at).format('hh:mm:ss A')}
      </div>
      <div className={styles.sub_header_item}>Cajero: {orderReceipt?.cashier_name}</div>
      <div className={styles.sub_header_item}>Cliente: {orderReceipt?.customer_name}</div>
      <div>-----------------------------------</div>
      <div className={styles.product_list_header_container}>
        <div className={styles.product_list_header_item_quantity}>Cant.</div>
        <div className={styles.product_list_header_item_description}>Descripción del Producto</div>
        <div className={styles.product_list_header_item_price}>Precio Unitario</div>
        <div className={styles.product_list_header_item_import}>Importe</div>
      </div>
      <div>-----------------------------------</div>
      {/* Products without IEPS */}
      {orderReceipt?.detail?.some(d => !d.has_ieps) && (
        <>
          {orderReceipt?.detail
            ?.filter(d => !d.has_ieps)
            .map((detail, index) => (
              <div key={index} className={styles.product_list_header_container}>
                <div className={styles.product_list_item_quantity}>{detail.quantity}</div>
                <div className={styles.product_list_item_description}>{detail.product_name}</div>
                <div className={styles.product_list_item_price}>
                  {formatMonetary(Number(detail.unit_price))}
                </div>
                <div className={styles.product_list_item_import}>
                  {formatMonetary(Number(detail.detail_total))}
                </div>
              </div>
            ))}
          <div className={`${styles.subtotals_item_container} ${styles.small_subtotal}`}>
            <div>IEPS:</div>
            <div>$0.00</div>
          </div>
          <div className={`${styles.subtotals_item_container} ${styles.small_subtotal}`}>
            <div>TOTAL:</div>
            <div>
              {formatMonetary(
                orderReceipt?.detail
                  ?.filter(d => !d.has_ieps)
                  .reduce((acc, val) => acc + Number(val.detail_total), 0) ?? 0,
              )}
            </div>
          </div>
          <div>-----------------------------------</div>
        </>
      )}

      {/* Products with IEPS */}
      {orderReceipt?.detail?.some(d => d.has_ieps) && (
        <>
          {orderReceipt?.detail
            ?.filter(d => d.has_ieps)
            .map((detail, index) => (
              <div key={index} className={styles.product_list_header_container}>
                <div className={styles.product_list_item_quantity}>{detail.quantity}</div>
                <div className={styles.product_list_item_description}>{detail.product_name}</div>
                <div className={styles.product_list_item_price}>
                  {formatMonetary(Number(detail.unit_price))}
                </div>
                <div className={styles.product_list_item_import}>
                  {formatMonetary(Number(detail.detail_total))}
                </div>
              </div>
            ))}
          <div>-----------------------------------</div>
        </>
      )}
      {orderReceipt?.detail?.some(d => d.has_ieps) && (
        <>
          <div className={`${styles.subtotals_item_container} ${styles.small_subtotal}`}>
            <div>SUBTOTAL:</div>
            <div>
              {formatMonetary(
                orderReceipt?.detail
                  ?.filter(d => d.has_ieps)
                  .reduce((acc, val) => acc + Number(val.detail_total), 0) ?? 0,
              )}
            </div>
          </div>
          <div className={`${styles.subtotals_item_container} ${styles.small_subtotal}`}>
            <div>IEPS:</div>
            <div>{formatMonetary(Number(orderReceipt?.tax1))}</div>
          </div>
          <div className={`${styles.subtotals_item_container} ${styles.small_subtotal}`}>
            <div>TOTAL:</div>
            <div>
              {formatMonetary(
                (orderReceipt?.detail
                  ?.filter(d => d.has_ieps)
                  .reduce((acc, val) => acc + Number(val.detail_total), 0) ?? 0) +
                  Number(orderReceipt?.tax1 ?? 0),
              )}
            </div>
          </div>
        </>
      )}
      <div className={`${styles.subtotals_item_container} ${styles.small_subtotal}`}>
        <div>TOTAL DE LA NOTA:</div>
        <div>
          {formatMonetary(
            // Total for products without IEPS
            (orderReceipt?.detail
              ?.filter(d => !d.has_ieps)
              .reduce((acc, val) => acc + Number(val.detail_total), 0) ?? 0) +
              // Total for products with IEPS including IEPS tax
              (orderReceipt?.detail
                ?.filter(d => d.has_ieps)
                .reduce((acc, val) => acc + Number(val.detail_total), 0) ?? 0) +
              Number(orderReceipt?.tax1 ?? 0),
          )}
        </div>
      </div>
      <div>-----------------------------------</div>
      <div className={styles.subtotals_container}>
        {orderReceipt?.form_of_payments?.length === 1 && (
          <div className={styles.subtotals_item_container}>
            <div>Forma de pago:</div>
            <div>{FormOfPaymentTranslation[orderReceipt?.form_of_payments[0].form_of_payment]}</div>
          </div>
        )}
        {(orderReceipt?.form_of_payments?.length ?? 0) > 1 && (
          <>
            <div>Formas de pago:</div>
            <div>
              {orderReceipt?.form_of_payments.map((fop, i) => (
                <div key={i} className={styles.subtotals_item_container}>
                  <div>{FormOfPaymentTranslation[fop.form_of_payment]}:</div>
                  <div>{formatMonetary(fop.amount)}</div>
                </div>
              ))}
            </div>
          </>
        )}
        <div className={styles.subtotals_item_container}>
          <div>Monto:</div>
          <div>
            {formatMonetary(
              Number(orderReceipt?.fop_amount ?? 0) + Number(orderReceipt?.change ?? 0),
            )}
          </div>
        </div>
        <div className={styles.subtotals_footer_container}>
          <div className={styles.subtotals_item_container}>
            <div>Cambio:</div>
            <div>{formatMonetary(Number(orderReceipt?.change ?? 0))}</div>
          </div>
          <div className={styles.subtotals_item_container}>
            <div>Articulos vendidos:</div>
            <div>
              {orderReceipt?.detail.reduce((acc, val) => {
                acc += Number(val.quantity)
                return acc
              }, 0)}
            </div>
          </div>
          {orderReceipt?.detail.some(item => item.unit_type === 'KILOGRAM') && (
            <div className={styles.subtotals_item_container}>
              <div>Kilogramos vendidos:</div>
              <div>
                {formatMonetary(
                  orderReceipt?.detail
                    .reduce((acc, val) => {
                      if (val.unit_type === 'KILOGRAM') {
                        acc += Number(val.weight) || 0
                      }
                      return acc
                    }, 0)
                    .toFixed(2),
                ).replace('$', '')}
              </div>
            </div>
          )}
          <div className={styles.note_container}>
            {'>>'}&nbsp;{orderReceipt?.note}
          </div>
        </div>
      </div>
      <div>Gracias por su compra! Regrese pronto...</div>
    </div>
  )
}

export default OrderReceipt
