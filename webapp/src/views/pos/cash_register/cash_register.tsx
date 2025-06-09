import { toast } from 'react-toastify'
import clsx from 'clsx'
import ViewContainer from 'src/components/views/container/container'
import ViewHeader from 'src/components/views/header/header'
import styles from './cash_register.module.css'
import viewStyles from 'src/views/views.module.css'
import { ProductUnitPrices, ProductWithFinishedProducts } from 'interface/entities/product'
import { FinishedProductUnitType } from 'interface/entities/finished_product'
import type { CashRegister as CashRegisterType } from 'interface/entities/cash_register'
import { CashRegisterQuantityInputType } from 'interface/entities/cash_register'
import React, { useEffect, useRef, useState } from 'react'
import Table from 'src/components/table/table'
import { ProductClient } from 'src/api/clients/product'
import CustomerSearchBox from 'src/components/customer_search_box/customer_search_box'
import { PurchaseOrderClient } from 'src/api/clients/purchase_order'
import { Customer, GeneralPublicCustomer } from 'interface/entities/customer'
import { SearchResultItem } from 'interface/entities/common'
import { formatMonetary, formatQuantity } from 'src/components/functions/formatting'
import ProductSearchBox from 'src/components/product_search_box/product_search_box'
import OrderReceipt from '../order_receipt/order_receipt'
import {
  FormOfPayment,
  PurchaseOrderReceipt,
} from 'interface/entities/purchase_order'
import { FormOfPaymentTranslation } from 'src/components/functions/translations'
import { Discount } from 'interface/entities/discount'
import { Cart, CartItemDetail, CartItems } from 'interface/entities/cart'
import { CashRegisterClient } from 'src/api/clients/cash_register'
import CashRegisterOpening from './subviews/cash_register_opening/cash_register_opening'
import { TransferBankAccountClient } from 'src/api/clients/transfer_bank_account'
import { TransferBankAccount } from 'interface/entities/transfer_bank_account'
import { getCashRegisterName } from '../../../components/functions/cash_register'

const cashRegisterClient = new CashRegisterClient()
const productClient = new ProductClient()
const purchaseOrderClient = new PurchaseOrderClient()
const transferBankAccountClient = new TransferBankAccountClient()

type ProductDiscount = {
  [product_code: string]: Discount | null
}

const CashRegister = () => {
  const [cashRegister, setCashRegister] = useState<CashRegisterType | null>(null)
  const [hasOpenReconciliation, setHasOpenReconciliation] = useState(false)
  const [cashRegisterLoaded, setCashRegisterLoaded] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer>(GeneralPublicCustomer)
  const [productCodeInput, setProductCodeInput] = useState('')
  const [discountsByProduct, setDiscountsByProduct] = useState<ProductDiscount>()
  const [quantity, setQuantity] = useState('1')
  const [cartItems, setCartItems] = useState<CartItems>({})
  const [productUnitPrices, setProductUnitPrices] = useState<ProductUnitPrices>({})
  const [productsWithIeps, setProductsWithIeps] = useState<{[key: string]: boolean}>({})
  const [total, setTotal] = useState(0)
  const [tax1, setTax1] = useState(0)
  const [subtotal, setSubtotal] = useState(0)
  const [selectedProductOnTable, setSelectedProductOnTable] = useState<string | null>(null)
  const [selectedFormOfPayments, setSelectedFormOfPayments] = useState<FormOfPayment[]>([
    FormOfPayment.CASH,
  ])
  const [formOfPaymentAmounts, setFormOfPaymentAmounts] = useState<string[]>([''])
  const [transferBankAccounts, setTransferBankAccounts] = useState<TransferBankAccount[]>([])
  const [selectedBankTransferIds, setSelectedBankTransferIds] = useState<Array<number | null>>([
    null,
  ])
  const [printReceipt, setPrintReceipt] = useState(false)
  const [orderIdToPrint, setOrderIdToPrint] = useState<number | null>(null)
  const [orderReceipt, setOrderReceipt] = useState<PurchaseOrderReceipt | null>(null)
  const [processingOrder, setProcessingOrder] = useState(false)

  const quantityInputRef = useRef<HTMLInputElement>(null)
  const productInputRef = useRef<HTMLInputElement>(null)
  const formOfPaymentAmountRef = useRef<HTMLInputElement>(null)

  const getAssignedCashRegister = async () => {
    const response = await cashRegisterClient.getAssignedCashRegister({})
    if (response.cash_register) {
      setCashRegister(response.cash_register)
      setHasOpenReconciliation(response.has_open_reconciliation)
    }
    setCashRegisterLoaded(true)
  }

  const getOrderReceipt = async (orderId: number) => {
    const response = await purchaseOrderClient.getReceipt({
      order_id: orderId,
    })
    if (response.receipt) {
      setOrderReceipt(response.receipt)
    }
  }

  const getTransferBankAccounts = async () => {
    const response = await transferBankAccountClient.list({
      query: '',
      page: 1,
    })
    setTransferBankAccounts(response.transfer_bank_accounts)
  }

  useEffect(() => {
    getAssignedCashRegister().catch(err => {
      console.error('Error getting assigned cash register', err)
    })
    getTransferBankAccounts().catch(err => {
      console.error('Error getting transfer bank accounts', err)
    })
    setTimeout(() => {
      productInputRef.current?.focus()
    }, 100)
  }, [])

  const handleSelectedCustomer = (resultItem: SearchResultItem<Customer>) => {
    handleClean()
    setSelectedCustomer(resultItem.data)

    // Update all products' IEPS state based on new customer's setting
    setProductsWithIeps(prev => {
      const newState = { ...prev }
      Object.keys(cartItems).forEach(productCode => {
        newState[productCode] = resultItem.data.should_add_ieps
      })
      return newState
    })

    // Also update the cart items
    setCartItems(prev => {
      const newCart = { ...prev }
      Object.keys(prev).forEach(productCode => {
        newCart[productCode] = {
          ...prev[productCode],
          should_add_ieps: resultItem.data.should_add_ieps,
          unit_type: prev[productCode].unit_type
        } as CartItemDetail
      })
      return newCart
    })
  }

  const handleProductInputFocus = () => {
    productInputRef?.current?.select()
  }

  const handleQuantityInputKeyUp = async (event: any) => {
    if (event.keyCode === 13) {
      if (productCodeInput) {
        await handleAdd()
      } else {
        productInputRef?.current?.select()
      }
    }
  }

  const handleProductInputKeyUp = async (event: any) => {
    if (event.keyCode === 13) {
      await handleAdd()
    }
  }

  const getProductFromCode = async (code: string) => {
    const response = await productClient.getByCode({ code })
    return response.product as ProductWithFinishedProducts
  }

  const onQuantityInputChanged = (val: string) => {
    setQuantity(val)
  }

  const onProductInputChanged = (val: string) => {
    setProductCodeInput(val)
  }

  useEffect(() => {
    if (Object.keys(cartItems).length === 0) {
      return
    }
    if (Object.keys(productUnitPrices).length === 0) {
      return
    }
    let subtotal = Object.keys(cartItems).reduce((acc, productCode) => {
      const quantity = cartItems[productCode].quantity
      acc += productUnitPrices[productCode] * quantity
      return acc
    }, 0)

    const tax1 = Object.keys(cartItems).reduce((acc, productCode) => {
      if (productsWithIeps[productCode]) {
        const quantity = cartItems[productCode].quantity
        const itemTotal = productUnitPrices[productCode] * quantity
        acc += itemTotal * 0.08
      }
      return acc
    }, 0)

    const total = subtotal + tax1
    setTotal(total)
    setTax1(tax1)
    setSubtotal(subtotal)
    if (selectedFormOfPayments.length === 1 && selectedFormOfPayments[0] !== FormOfPayment.CASH) {
      setFormOfPaymentAmounts([total.toString()])
    } else {
      setFormOfPaymentAmounts([''])
    }
  }, [cartItems, discountsByProduct, productUnitPrices])

  const getProductsUnitPricesForCart = async () => {
    const response = await productClient.getUnitPricesForCart({
      customer_id: selectedCustomer.id,
      cart: {
        items: cartItems,
      } as Cart,
    })
    setProductUnitPrices(response.unit_prices)
  }

  const handleAdd = async (productCodeInputParam: string = productCodeInput) => {
    const productToAdd = await getProductFromCode(productCodeInputParam)
    if (!productToAdd) {
      return
    }
    let quantityNumber = Number(quantity)
    if (!quantity || isNaN(quantityNumber) || quantityNumber <= 0) {
      toast.error('Cantidad inválida')
      return
    }
    setCartItems((prev: CartItems) => {
      const existingProduct = prev[productToAdd.code]

      if (existingProduct) {
        quantityNumber += existingProduct.quantity
      }
      return {
        ...prev,
        [productToAdd.code]: {
          product_name: productToAdd.name,
          quantity: quantityNumber,
          wholesale_unit_price: productToAdd.wholesale_unit_price,
          retail_unit_price: productToAdd?.retail_unit_price,
          should_add_ieps: selectedCustomer?.should_add_ieps || false,
          unit_type: productToAdd.finished_products?.[0]?.unit_type || FinishedProductUnitType.PIECE,
        } as CartItemDetail,
      }
    })

    // Initialize IEPS for new product with customer's default
    setProductsWithIeps(prev => ({
      ...prev,
      [productToAdd.code]: selectedCustomer?.should_add_ieps || false
    }))
    setProductCodeInput('')
    if (cashRegister?.quantity_input_type === CashRegisterQuantityInputType.PRODUCT_SCAN) {
      setQuantity('1')
      productInputRef.current?.focus()
    } else {
      setQuantity('')
      quantityInputRef.current?.focus()
      quantityInputRef.current?.select()
    }

    setOrderReceipt(null)
    setOrderIdToPrint(null)
  }

  useEffect(() => {
    getProductsUnitPricesForCart().catch(err => {
      console.error('Error getting unit prices', err)
    })
  }, [cartItems])

  const handleSelectedProductOnTable = (rowId: string) => {
    if (rowId === selectedProductOnTable) {
      setSelectedProductOnTable(null)
      return
    }
    setSelectedProductOnTable(rowId)
  }

  const handleClean = () => {
    setCartItems({})
    setTotal(0)
    setDiscountsByProduct({})
    setProductUnitPrices({})
    setProductsWithIeps({})
    setSelectedFormOfPayments([FormOfPayment.CASH])
    setFormOfPaymentAmounts([''])
    setOrderReceipt(null)
    setOrderIdToPrint(null)
    setSelectedBankTransferIds([null])
  }

  const handleRemoveProduct = () => {
    if (selectedProductOnTable) {
      setCartItems(prevState => {
        let { [selectedProductOnTable]: omit, ...newCart } = prevState
        return newCart
      })
    }
    setSelectedProductOnTable(null)
  }

  const productListForTable =
    cartItems &&
    Object.keys(cartItems).map((productCode: string, index: number) => {
      const cartItem = cartItems[productCode]
      const itemTotal = productUnitPrices[productCode] * cartItem.quantity
      const customerPrice = discountsByProduct?.[productCode]?.fixed_price
      const unitPrice = customerPrice ? customerPrice : productUnitPrices[productCode]
      const retailUnitPrice = cartItem.retail_unit_price

      return {
        id: productCode,
        cells: [
          {
            value: index + 1,
          },
          {
            value: productCode,
          },
          {
            value: cartItem.product_name,
          },
          {
            value: formatQuantity(cartItem.quantity, cartItem.unit_type),
          },
          {
            element: (
              <div>
                {unitPrice < retailUnitPrice ? (
                  <div>
                    <small>
                      <i>
                        <s>{formatMonetary(retailUnitPrice)}</s>
                      </i>
                    </small>
                    <span>{` ${formatMonetary(unitPrice)}`}</span>
                  </div>
                ) : (
                  <div>{formatMonetary(unitPrice)}</div>
                )}
              </div>
            ),
          },
          {
            element: (
              <input
                type="checkbox"
                checked={productsWithIeps[productCode] || false}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => {
                  setProductsWithIeps(prev => ({
                    ...prev,
                    [productCode]: e.target.checked
                  }))
                  // Update the cart item
                  setCartItems(prev => ({
                    ...prev,
                    [productCode]: {
                      ...prev[productCode],
                      should_add_ieps: e.target.checked
                    }
                  }))
                }}
              />
            ),
          },
          {
            value: formatMonetary(itemTotal),
          },
        ],
      }
    })

  const handleProcessOrder = async () => {
    setProcessingOrder(true)
    try {
      if (!selectedCustomer) {
        toast.error('Error!. No se ha seleccionado un cliente.')
        return
      }
      if (selectedFormOfPayments.length === 1) {
        const fopAmount = Number(formOfPaymentAmounts[0])
        if (Number.isNaN(fopAmount)) {
          toast.error('Error!. Monto inválido.')
          return
        }
        if (fopAmount < total) {
          toast.error('Error!. Monto insuficiente.')
          return
        }
        if (
          selectedFormOfPayments[0].startsWith(FormOfPayment.TRANSFER) &&
          !selectedBankTransferIds[0]
        ) {
          toast.error('Error!. No se ha seleccionado cuenta de transferencia.')
          return
        }
        if (selectedFormOfPayments[0] !== FormOfPayment.CASH && fopAmount !== total) {
          toast.error('Error!. El monto debe ser igual al total.')
          return
        }
      } else {
        const totalMultiFopAmount = formOfPaymentAmounts.reduce((acc, amount) => {
          acc += Number(amount)
          return acc
        }, 0)
        if (totalMultiFopAmount < total) {
          toast.error('Error!. Monto insuficiente.')
          return
        }

        for (let i = 0; i < selectedFormOfPayments.length; i++) {
          const formOfPayment = selectedFormOfPayments[i]
          if (formOfPayment.startsWith(FormOfPayment.TRANSFER) && !selectedBankTransferIds[i]) {
            toast.error('Error!. No se ha seleccionado cuenta de transferencia.')
            return
          }
        }
      }

      const formOfPayments = selectedFormOfPayments.map((formOfPayment, index) => {
        return {
          form_of_payment: formOfPayment,
          amount: Number(formOfPaymentAmounts[index]),
          transfer_bank_account_id: formOfPayment.startsWith(FormOfPayment.TRANSFER)
            ? selectedBankTransferIds[index]
            : null,
          change: 0,
        }
      })

      const result = await purchaseOrderClient.process({
        customer_id: selectedCustomer.id,
        cart: {
          items: cartItems,
        },
        form_of_payments: formOfPayments,
      })
      if (result.success) {
        setOrderIdToPrint(result.order_id)
        setPrintReceipt(true)
        setCartItems({})
        setSelectedCustomer(GeneralPublicCustomer)
        setTotal(0)
        setSelectedFormOfPayments([FormOfPayment.CASH])
        setFormOfPaymentAmounts([''])
        await getOrderReceipt(result.order_id)
      } else {
        toast.dark('Ocurrió un error al procesar la orden')
      }
    } catch (err) {
      toast.dark('Ocurrió un error al procesar la orden')
    } finally {
      setProcessingOrder(false)
    }
  }

  const handleAfterPrint = () => {
    setPrintReceipt(false)
    productInputRef.current?.focus()
  }

  const handleFormOfPaymentChange = (index: number, fopString: string) => {
    if (fopString.startsWith(FormOfPayment.TRANSFER)) {
      const [formOfPayment, bankAccountId] = fopString.split('-')
      setSelectedFormOfPayments((prev: FormOfPayment[]) => {
        const newFops = [...prev]
        newFops[index] = formOfPayment as FormOfPayment
        return newFops
      })
      setSelectedBankTransferIds((prev: Array<number | null>) => {
        const newBankTransferIds = [...prev]
        newBankTransferIds[index] = Number(bankAccountId)
        return newBankTransferIds
      })
    } else {
      setSelectedFormOfPayments((prev: FormOfPayment[]) => {
        const newFops = [...prev]
        newFops[index] = fopString as FormOfPayment
        return newFops
      })
    }
    if (selectedFormOfPayments.length === 1) {
      if (fopString === FormOfPayment.CASH) {
        setFormOfPaymentAmounts([''])
      } else {
        setFormOfPaymentAmounts([total.toString()])
      }
    }
    formOfPaymentAmountRef.current?.focus()
  }

  const handleFormOfPaymentAmountChange = (index: number, amount: string) => {
    setFormOfPaymentAmounts((prev: string[]) => {
      const newAmounts = [...prev]
      newAmounts[index] = amount
      return newAmounts
    })
  }

  const enableProcessButton =
    !processingOrder &&
    !!Object.keys(cartItems).length &&
    !!selectedCustomer &&
    selectedFormOfPayments.every(fop => !!fop) &&
    formOfPaymentAmounts.every(amount => !!amount)

  if (!cashRegisterLoaded) {
    return <div>Cargando...</div>
  }

  if (cashRegisterLoaded && !cashRegister) {
    return <div>No se ha asignado Caja Registradora.</div>
  }

  if (cashRegisterLoaded && !hasOpenReconciliation) {
    return <CashRegisterOpening cashRegister={cashRegister} />
  }

  const handleIncreaseFormOfPaymentCount = () => {
    setSelectedFormOfPayments((prev: FormOfPayment[]) => {
      const newFops = [...prev]
      newFops.push(FormOfPayment.CASH)
      return newFops
    })
  }

  const handleDecreaseFormOfPaymentCount = () => {
    setSelectedFormOfPayments((prev: FormOfPayment[]) => {
      const newFops = [...prev]
      newFops.pop()
      return newFops
    })
  }

  const getFormOfPaymentOptions = (formOfPayment: FormOfPayment) => {
    const formOfPaymentOptions: JSX.Element[] = []
    formOfPaymentOptions.push(
      <option
        key={FormOfPayment.CASH}
        value={FormOfPayment.CASH}
        selected={formOfPayment === FormOfPayment.CASH}
      >
        {FormOfPaymentTranslation[FormOfPayment.CASH]}
      </option>,
    )
    if (selectedCustomer?.id !== GeneralPublicCustomer.id) {
      formOfPaymentOptions.push(
        <option
          key={FormOfPayment.CREDIT}
          value={FormOfPayment.CREDIT}
          selected={formOfPayment === FormOfPayment.CREDIT}
        >
          {FormOfPaymentTranslation[FormOfPayment.CREDIT]}
        </option>,
      )
    }
    transferBankAccounts.forEach((bankAccount, index) => {
      formOfPaymentOptions.push(
        <option
          key={bankAccount.id}
          value={`${FormOfPayment.TRANSFER}-${bankAccount.id}`}
          selected={
            formOfPayment === FormOfPayment.TRANSFER &&
            selectedBankTransferIds[index] === bankAccount.id
          }
        >
          {FormOfPaymentTranslation[FormOfPayment.TRANSFER]} - {bankAccount.name}
        </option>,
      )
    })
    return formOfPaymentOptions
  }

  return (
    <ViewContainer title={getCashRegisterName(cashRegister)}>
      <div className={styles.container}>
        <div>
          <ViewHeader flexDirection={'column'}>
            <div>
              <CustomerSearchBox
                onCustomerSelected={handleSelectedCustomer}
                defaultValue={selectedCustomer.name}
              />
            </div>
          </ViewHeader>
          <ViewHeader flexDirection={'column'}>
            <div>
              <div className={styles.cashier_container}>
                <div className={styles.cashier_item}>
                  <label className={styles.input_label}>Cantidad</label>
                  <input
                    className={styles.input_field}
                    onKeyUp={handleQuantityInputKeyUp}
                    onChange={e => onQuantityInputChanged(e.target.value)}
                    value={quantity}
                    ref={quantityInputRef}
                  />
                </div>

                <div className={styles.cashier_item}>
                  <label className={styles.input_label}>Producto</label>
                  <input
                    className={styles.input_field}
                    onFocus={handleProductInputFocus}
                    onKeyUp={handleProductInputKeyUp}
                    onChange={e => onProductInputChanged(e.target.value.toUpperCase())}
                    value={productCodeInput}
                    ref={productInputRef}
                    placeholder={"Código del producto"}
                  />
                  <div>
                    <ProductSearchBox
                      label={' '}
                      onProductSelected={async product => {
                        await handleAdd(product.data.code)
                      }}
                      placeholderText="Buscar producto por nombre..."
                      clearAfterSelection={true}
                    />
                  </div>
                </div>
                <div className={styles.cashier_item}>
                  <label className={styles.input_label}>Agregar IEPS</label>
                  <input
                    type={'checkbox'}
                    readOnly={true}
                    onClick={() => false}
                    checked={selectedCustomer.should_add_ieps}
                  />
                </div>
              </div>
            </div>
          </ViewHeader>
        </div>
        <div className={styles.bottom_container}>
          <div>
            <div className={styles.table_container}>
              <Table
                selectedRowId={selectedProductOnTable || ''}
                columnNames={[
                  '#',
                  'Código',
                  'Descripcion',
                  'Cantidad',
                  'Precio Unitario',
                  'IEPS',
                  'Importe',
                ]}
                rows={productListForTable}
                onSelectedRow={handleSelectedProductOnTable}
              />
            </div>
            <div className={styles.table_buttons_container}>
              <button
                className={clsx({
                  [viewStyles.secondary_button]: !!Object.keys(cartItems).length,
                  [viewStyles.disabled_button]: !Object.keys(cartItems).length,
                })}
                onClick={handleClean}
              >
                Limpiar
              </button>
              <button
                className={clsx({
                  [viewStyles.secondary_button]: !!selectedProductOnTable,
                  [viewStyles.disabled_button]: !selectedProductOnTable,
                })}
                onClick={handleRemoveProduct}
              >
                Eliminar producto
              </button>
            </div>
          </div>
          <div className={styles.totals_container}>
            <div>
              <label>Subtotal:</label> <span>{formatMonetary(subtotal)}</span>
            </div>
            <div>
              <label>IEPS:</label> <span>{formatMonetary(tax1)}</span>
            </div>
            <div className={styles.totals_container_item}>
              <label>Total:</label> <span className={styles.total}>{formatMonetary(total)}</span>
            </div>

            {Array.from({ length: selectedFormOfPayments.length }).map((_, index) => {
              return (
                <div className={styles.form_of_payment_container}>
                  <div
                    className={styles.remove_form_of_payment_link}
                    title={'Eliminar forma de pago'}
                    onClick={handleDecreaseFormOfPaymentCount}
                  >
                    {index > 0 && index === selectedFormOfPayments.length - 1 ? 'x' : ''}
                  </div>
                  <div className={styles.form_of_payment_item}>
                    <select
                      className={viewStyles.select}
                      onChange={event => handleFormOfPaymentChange(index, event.target.value)}
                    >
                      {getFormOfPaymentOptions(selectedFormOfPayments[index])}
                    </select>
                  </div>
                  <div className={styles.form_of_payment_item}>
                    <input
                      hidden={
                        selectedFormOfPayments.length === 1 &&
                        selectedFormOfPayments[0] !== FormOfPayment.CASH
                      }
                      className={styles.payment_amount_input}
                      value={formOfPaymentAmounts[index]}
                      placeholder={'$ Introduzca monto'}
                      onChange={event => handleFormOfPaymentAmountChange(index, event.target.value)}
                      ref={formOfPaymentAmountRef}
                    />
                  </div>
                </div>
              )
            })}
            <div
              className={styles.add_form_of_payment_link}
              onClick={handleIncreaseFormOfPaymentCount}
            >
              + Agregar forma de pago
            </div>
            <div className={styles.purchase_order_button_container}>
              <button
                onClick={handleProcessOrder}
                className={clsx({
                  [viewStyles.primary_button]: enableProcessButton,
                  [viewStyles.disabled_button]: !enableProcessButton,
                })}
                disabled={!enableProcessButton}
              >
                {processingOrder ? 'Procesando...' : 'Procesar Orden'}
              </button>
              <div className={styles.totals_container_item}>
                <label>Cambio:</label> <span>{formatMonetary(orderReceipt?.change)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <OrderReceipt print={printReceipt} orderId={orderIdToPrint} onAfterPrint={handleAfterPrint} />
    </ViewContainer>
  )
}

export default CashRegister
