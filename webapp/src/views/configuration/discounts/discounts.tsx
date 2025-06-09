import ViewContainer from 'src/components/views/container/container'
import React, { useEffect, useRef, useState } from 'react'
import ViewHeader from 'src/components/views/header/header'
import Table from 'src/components/table/table'
import {
  DiscountType,
  DiscountWithCustomerAndProduct,
} from 'interface/entities/discount'
import { DiscountClient } from 'src/api/clients/discount'
import styles from './discounts.module.css'
import viewStyles from 'src/views/views.module.css'
import CustomerSearchBox from 'src/components/customer_search_box/customer_search_box'
import { SearchResultItem } from 'interface/entities/common'
import { Customer } from 'interface/entities/customer'
import { DiscountAddFailRS } from 'interface/responses/discount'
import ProductSearchBox from 'src/components/product_search_box/product_search_box'
import { Product } from 'interface/entities/product'
import { toast } from 'react-toastify'
import { formatMonetary } from 'src/components/functions/formatting'
import clsx from 'clsx'

const discountClient = new DiscountClient()

type DiscountById = {
  [id: string]: DiscountWithCustomerAndProduct
}

const Discounts = () => {
  const [discounts, setDiscounts] = useState<DiscountWithCustomerAndProduct[]>([])
  const [discountsById, setDiscountsById] = useState<DiscountById>({})
  const [addEnabled, setAddEnabled] = useState(false)
  const [modifyEnabled, setModifyEnabled] = useState(false)
  const [selectedCustomerForSearch, setSelectedCustomerForSearch] = useState<Customer | null>()
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>()
  const [selectedProduct, setSelectedProduct] = useState<Product | null>()
  const [newSelectedDiscountType, setNewSelectedDiscountType] = useState<DiscountType>(
    DiscountType.FIXED_PRICE,
  )
  const [modifiedSelectedDiscountType, setModifiedSelectedDiscountType] = useState<DiscountType>(
    DiscountType.FIXED_PRICE,
  )
  const [newDiscountPercentage, setNewDiscountPercentage] = useState('')
  const [modifiedDiscountPercentage, setModifiedDiscountPercentage] = useState('')
  const [newDiscountFlatAmount, setNewDiscountFlatAmount] = useState('')
  const [modifiedDiscountFlatAmount, setModifiedDiscountFlatAmount] = useState('')
  const [newFixedPrice, setNewFixedPrice] = useState('')
  const [modifiedFixedPrice, setModifiedFixedPrice] = useState('')
  const [selectedDiscountId, setSelectedDiscountId] = useState<string | null>()
  const [customerNameForDiscountModification, setCustomerNameForDiscountModification] =
    useState<string>('')
  const [productNameForDiscountModification, setProductNameForDiscountModification] =
    useState<string>('')
  const newCustomerInputRef = useRef<HTMLInputElement>(null)
  const addPercentageInputRef = useRef<HTMLInputElement>(null)
  const modifiedPercentageInputRef = useRef<HTMLInputElement>(null)
  const addFlatAmountInputRef = useRef<HTMLInputElement>(null)
  const modifiedFlatAmountInputRef = useRef<HTMLInputElement>(null)
  const addFixedPriceInputRef = useRef<HTMLInputElement>(null)
  const modifiedFixedPriceInputRef = useRef<HTMLInputElement>(null)
  const modifyPercentageInputRef = useRef<HTMLInputElement>(null)

  const getDiscounts = async (customerId?: number) => {
    const response = await discountClient.list({
      customer_id: customerId ?? null,
      product_code: null,
    })
    setDiscounts(response.discounts)
    const byId = response.discounts.reduce((acc, discount) => {
      acc[discount.id] = discount
      return acc
    }, {} as DiscountById)
    setDiscountsById(byId)
  }

  useEffect(() => {
    getDiscounts().catch(error => {
      console.error(error)
    })
  }, [])

  const handleSelectedForSearchCustomer = async (resultItem: SearchResultItem<Customer>) => {
    setSelectedCustomerForSearch(resultItem.data)
    await getDiscounts(resultItem.data.id)
  }

  const handleSelectedCustomer = async (resultItem: SearchResultItem<Customer>) => {
    setSelectedCustomer(resultItem.data)
    await handleSelectedForSearchCustomer(resultItem)
  }

  const handleSelectedProduct = (resultItem: SearchResultItem<Product>) => {
    setSelectedProduct(resultItem.data)
  }

  const handleNewDiscountPercentageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewDiscountPercentage(event.target.value)
  }

  const handleNewDiscountFlatAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewDiscountFlatAmount(event.target.value)
  }

  const handleModifiedDiscountFlatAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setModifiedDiscountFlatAmount(event.target.value)
  }

  const handleNewFixedPriceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewFixedPrice(event.target.value)
  }

  const handleModifiedFixedPriceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setModifiedFixedPrice(event.target.value)
  }

  const handleModifiedDiscountPercentageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setModifiedDiscountPercentage(event.target.value)
  }

  const handleSubmitNewDiscount = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selectedCustomer) {
      return
    }
    if (!selectedProduct) {
      return
    }
    let discountPercentage = Number(newDiscountPercentage.replace('%', ''))
    if (newSelectedDiscountType === DiscountType.PERCENTAGE) {
      if (!newDiscountPercentage || isNaN(discountPercentage)) {
        toast.error('Por favor ingrese un porcentaje válido')
        return
      }
      if (discountPercentage < 0 || discountPercentage > 100) {
        toast.error('Por favor ingrese un porcentaje entre 0 y 100')
        return
      }
    } else {
      discountPercentage = 0
    }

    let discountFlatAmount = Number(newDiscountFlatAmount)
    if (newSelectedDiscountType === DiscountType.FLAT_AMOUNT) {
      if (!newDiscountFlatAmount || isNaN(discountFlatAmount)) {
        toast.error('Por favor ingrese un monto válido')
        return
      }
    } else {
      discountFlatAmount = 0
    }

    let fixedPrice = Number(newFixedPrice)
    if (newSelectedDiscountType === DiscountType.FIXED_PRICE) {
      if (!newFixedPrice || isNaN(fixedPrice)) {
        toast.error('Por favor ingrese un monto válido')
        return
      }
    } else {
      fixedPrice = 0
    }
    const response = await discountClient.add({
      customer_id: selectedCustomer.id,
      product_code: selectedProduct.code,
      type: newSelectedDiscountType,
      discount_percentage: discountPercentage / 100,
      discount_flat_amount: discountFlatAmount,
      fixed_price: fixedPrice,
    })
    if ((response as DiscountAddFailRS).error) {
      const errorResponse = response as DiscountAddFailRS
      console.error(errorResponse.error)
      toast.error('Ocurrió un error al agregar el descuento')
      return
    }
    setAddEnabled(false)
    setSelectedProduct(null)
    setSelectedCustomer(null)
    setNewDiscountPercentage('')
    await getDiscounts(selectedCustomerForSearch?.id)
  }

  const handleSubmitModifyDiscount = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selectedDiscountId) {
      return
    }
    let discountPercentage = Number(modifiedDiscountPercentage.replace('%', ''))
    if (modifiedSelectedDiscountType === DiscountType.PERCENTAGE) {
      if (!modifiedDiscountPercentage || isNaN(discountPercentage)) {
        toast.error('Por favor ingrese un porcentaje válido')
        return
      }
      if (discountPercentage < 0 || discountPercentage > 100) {
        toast.error('Por favor ingrese un porcentaje entre 0 y 100')
        return
      }
    } else {
      discountPercentage = 0
    }

    let discountFlatAmount = Number(modifiedDiscountFlatAmount)
    if (modifiedSelectedDiscountType === DiscountType.FLAT_AMOUNT) {
      if (!modifiedDiscountFlatAmount || isNaN(discountFlatAmount)) {
        toast.error('Por favor ingrese un monto válido')
        return
      }
    } else {
      discountFlatAmount = 0
    }

    let fixedPrice = Number(modifiedFixedPrice)
    if (modifiedSelectedDiscountType === DiscountType.FIXED_PRICE) {
      if (!modifiedFixedPrice || isNaN(fixedPrice)) {
        toast.error('Por favor ingrese un monto válido')
        return
      }
    } else {
      fixedPrice = 0
    }

    const response = await discountClient.modify({
      id: Number(selectedDiscountId),
      type: modifiedSelectedDiscountType,
      discount_percentage: discountPercentage / 100,
      discount_flat_amount: discountFlatAmount,
      fixed_price: fixedPrice,
    })
    if ((response as DiscountAddFailRS).error) {
      const errorResponse = response as DiscountAddFailRS
      console.error(errorResponse.error)
      toast.error('Ocurrió un error al modificar el descuento')
      return
    }
    setModifyEnabled(false)
    setSelectedProduct(null)
    setSelectedCustomer(null)
    setNewDiscountPercentage('')
    await getDiscounts()
  }

  const handleEnableAdd = () => {
    setAddEnabled(true)
    handleCancelModify()
    setSelectedDiscountId(null)
    setNewDiscountPercentage('')
    setNewDiscountFlatAmount('')
    setNewFixedPrice('')
    if (selectedCustomerForSearch) {
      setSelectedCustomer(selectedCustomerForSearch)
    }
    setTimeout(() => {
      newCustomerInputRef.current?.focus()
    }, 100)
  }

  const handleEnableModify = () => {
    setModifyEnabled(true)
    const discount = discountsById[selectedDiscountId ?? '']
    setCustomerNameForDiscountModification(discount.customer_name)
    setProductNameForDiscountModification(discount.product_name)
    setModifiedSelectedDiscountType(discount.type)
    setModifiedDiscountPercentage((discount.discount_percentage * 100).toString())
    setModifiedDiscountFlatAmount(discount.discount_flat_amount.toString())
    setModifiedFixedPrice(discount.fixed_price.toString())
  }

  const handleDeleteDiscount = async () => {
    if (!selectedDiscountId) {
      return
    }
    if (!confirm('Desea eliminar el descuento?')) {
      return
    }
    const response = await discountClient.delete({
      id: Number(selectedDiscountId),
    })
    if ((response as DiscountAddFailRS).error) {
      const errorResponse = response as DiscountAddFailRS
      console.error(errorResponse.error)
      toast.error('Ocurrió un error al eliminar el descuento')
      return
    }
    setModifyEnabled(false)
    setSelectedProduct(null)
    setSelectedCustomer(null)
    setNewDiscountPercentage('')
    await getDiscounts()
  }

  const handleShowAllDiscounts = async () => {
    setSelectedCustomer(null)
    setSelectedCustomerForSearch(null)
    await getDiscounts()
  }

  useEffect(() => {
    if (modifyEnabled) {
      modifyPercentageInputRef.current?.focus()
      modifyPercentageInputRef.current?.select()
    }
  }, [modifyEnabled])

  const handleCancelAdd = () => {
    setAddEnabled(false)
    setSelectedProduct(null)
    setSelectedCustomer(null)
    setNewDiscountPercentage('')
  }

  const handleCancelModify = () => {
    setModifyEnabled(false)
    setSelectedProduct(null)
    setSelectedCustomer(null)
    setNewDiscountPercentage('')
  }

  const handleNewSelectedDiscountTypePercentage = () => {
    setNewSelectedDiscountType(DiscountType.PERCENTAGE)
    setTimeout(() => {
      addPercentageInputRef.current?.focus()
    }, 50)
  }

  const handleModifiedSelectedDiscountTypePercentage = () => {
    setModifiedSelectedDiscountType(DiscountType.PERCENTAGE)
    setTimeout(() => {
      modifiedPercentageInputRef.current?.focus()
    }, 50)
  }

  const handleNewSelectedDiscountTypeFlatAmount = () => {
    setNewSelectedDiscountType(DiscountType.FLAT_AMOUNT)
    setTimeout(() => {
      addFlatAmountInputRef.current?.focus()
    }, 50)
  }

  const handleModifiedSelectedDiscountTypeFlatAmount = () => {
    setModifiedSelectedDiscountType(DiscountType.FLAT_AMOUNT)
    setTimeout(() => {
      modifiedFlatAmountInputRef.current?.focus()
    }, 50)
  }

  const handleNewSelectedDiscountTypeFixedPrice = () => {
    setNewSelectedDiscountType(DiscountType.FIXED_PRICE)
    setTimeout(() => {
      addFixedPriceInputRef.current?.focus()
    }, 50)
  }

  const handleModifiedSelectedDiscountTypeFixedPrice = () => {
    setModifiedSelectedDiscountType(DiscountType.FIXED_PRICE)
    setTimeout(() => {
      modifiedFixedPriceInputRef.current?.focus()
    }, 50)
  }

  const handleSelectedDiscount = (id: string) => {
    if (id === selectedDiscountId) {
      setSelectedDiscountId(null)
    } else {
      setSelectedDiscountId(id)
      handleCancelModify()
      handleCancelAdd()
    }
  }

  const getNameForSelectedCustomer = (customer: Customer | null | undefined) => {
    if (!customer) {
      return ''
    }
    if (!customer.city) {
      return customer.name
    }
    return `${customer.name} (${customer.city})`
  }

  const discountRows = discounts
    ? discounts?.map(discount => {
        const wholesaleUnitPriceNumber = Number(discount.product_wholesale_unit_price)
        const retailUnitPriceNumber = Number(discount.product_retail_unit_price)
        let wholesaleUnitPriceAfterDiscount = wholesaleUnitPriceNumber
        let retailUnitPriceAfterDiscount = retailUnitPriceNumber
        if (discount.type === DiscountType.PERCENTAGE) {
          wholesaleUnitPriceAfterDiscount =
            wholesaleUnitPriceNumber - wholesaleUnitPriceNumber * discount.discount_percentage
          retailUnitPriceAfterDiscount =
            retailUnitPriceNumber - retailUnitPriceNumber * discount.discount_percentage
        }
        if (discount.type === DiscountType.FLAT_AMOUNT) {
          wholesaleUnitPriceAfterDiscount = wholesaleUnitPriceNumber - discount.discount_flat_amount
          retailUnitPriceAfterDiscount = retailUnitPriceNumber - discount.discount_flat_amount
        }
        if (discount.type === DiscountType.FIXED_PRICE) {
          wholesaleUnitPriceAfterDiscount = discount.fixed_price
          retailUnitPriceAfterDiscount = discount.fixed_price
        }
        return {
          id: String(discount.id),
          cells: [
            {
              value: discount.customer_name,
            },
            {
              value: `(${discount.product_code}) ${discount.product_name}`,
            },
            {
              value: `${formatMonetary(wholesaleUnitPriceNumber)} / ${formatMonetary(
                retailUnitPriceNumber,
              )}`,
            },
            {
              value: `${discount.discount_percentage * 100}%`,
              fontWeight: discount.type === DiscountType.PERCENTAGE ? 'bold' : 'normal',
            },
            {
              value: `${formatMonetary(discount.discount_flat_amount)}`,
              fontWeight: discount.type === DiscountType.FLAT_AMOUNT ? 'bold' : 'normal',
            },
            {
              value: `${formatMonetary(discount.fixed_price)}`,
              fontWeight: discount.type === DiscountType.FIXED_PRICE ? 'bold' : 'normal',
            },
            {
              value: `${formatMonetary(wholesaleUnitPriceAfterDiscount)} / ${formatMonetary(
                retailUnitPriceAfterDiscount,
              )}`,
            },
          ],
        }
      })
    : []
  return (
    <ViewContainer title={'Descuentos'}>
      <ViewHeader flexDirection={'column'}>
        <div>
          <CustomerSearchBox
            onCustomerSelected={handleSelectedForSearchCustomer}
            defaultValue={getNameForSelectedCustomer(selectedCustomerForSearch)}
          />
        </div>
      </ViewHeader>
      <ViewHeader flexDirection={'column'}>
        <div>
          <button disabled={addEnabled} className={styles.header_button} onClick={handleEnableAdd}>
            Agregar nuevo descuento
          </button>
          <button
            disabled={addEnabled || modifyEnabled || !selectedDiscountId}
            className={clsx(styles.header_button, {
              [styles.header_button_disabled]: !selectedDiscountId,
            })}
            onClick={handleEnableModify}
          >
            Modificar descuento
          </button>
          <button
            disabled={addEnabled || modifyEnabled || !selectedDiscountId}
            className={clsx(styles.header_button, {
              [styles.header_button_disabled]: !selectedDiscountId,
            })}
            onClick={handleDeleteDiscount}
          >
            Eliminar descuento
          </button>
          <button
            disabled={!selectedCustomerForSearch}
            className={clsx(styles.header_button, {
              [styles.header_button_disabled]: !selectedCustomerForSearch,
            })}
            onClick={handleShowAllDiscounts}
          >
            Mostrar todos los descuentos
          </button>
        </div>
        <>
          {addEnabled && (
            <form onSubmit={handleSubmitNewDiscount}>
              <div className={styles.form_item}>
                <CustomerSearchBox
                  onCustomerSelected={handleSelectedCustomer}
                  defaultValue={getNameForSelectedCustomer(selectedCustomer)}
                  ref={newCustomerInputRef}
                />
              </div>
              <ProductSearchBox onProductSelected={handleSelectedProduct} />
              <div className={styles.form_item} hidden={!selectedProduct}>
                <label>Precio (Mayoreo/Menudeo): </label>
                <div className={styles.product_prices}>{`${formatMonetary(
                  selectedProduct?.wholesale_unit_price,
                )} / ${formatMonetary(selectedProduct?.retail_unit_price)}`}</div>
              </div>
              <fieldset className={styles.radio_container}>
                <legend>Selecciona el tipo de descuento:</legend>
                <div className={styles.form_item}>
                  <input
                    type={'radio'}
                    name={'add_discount_type'}
                    checked={newSelectedDiscountType === DiscountType.PERCENTAGE}
                    onChange={handleNewSelectedDiscountTypePercentage}
                  />
                  <label className={styles.label}>Descuento (%) </label>
                  <input
                    ref={addPercentageInputRef}
                    className={styles.discount_input}
                    type={'text'}
                    value={newDiscountPercentage}
                    onChange={handleNewDiscountPercentageChange}
                    disabled={newSelectedDiscountType !== DiscountType.PERCENTAGE}
                  />
                </div>
                <div className={styles.form_item}>
                  <input
                    type={'radio'}
                    name={'add_discount_type'}
                    checked={newSelectedDiscountType === DiscountType.FLAT_AMOUNT}
                    onChange={handleNewSelectedDiscountTypeFlatAmount}
                  />
                  <label className={styles.label}>Descuento ($) </label>
                  <input
                    ref={addFlatAmountInputRef}
                    className={styles.discount_input}
                    type={'text'}
                    value={newDiscountFlatAmount}
                    onChange={handleNewDiscountFlatAmountChange}
                    disabled={newSelectedDiscountType !== DiscountType.FLAT_AMOUNT}
                  />
                </div>
                <div className={styles.form_item}>
                  <input
                    type={'radio'}
                    name={'add_discount_type'}
                    checked={newSelectedDiscountType === DiscountType.FIXED_PRICE}
                    onChange={handleNewSelectedDiscountTypeFixedPrice}
                  />
                  <label className={styles.label}>Precio Fijo </label>
                  <input
                    ref={addFixedPriceInputRef}
                    className={styles.discount_input}
                    type={'text'}
                    value={newFixedPrice}
                    onChange={handleNewFixedPriceChange}
                    disabled={newSelectedDiscountType !== DiscountType.FIXED_PRICE}
                  />
                </div>
              </fieldset>
              <input className={viewStyles.primary_button} type={'submit'} value={'Agregar'} />
              <button className={viewStyles.secondary_button} onClick={handleCancelAdd}>
                Cancelar
              </button>
            </form>
          )}
        </>
        <>
          {modifyEnabled && (
            <form onSubmit={handleSubmitModifyDiscount}>
              <div className={styles.form_item}>
                <label className={styles.label}>Cliente </label>
                <input
                  className={styles.customer_input_modify}
                  value={customerNameForDiscountModification}
                  disabled={true}
                />
              </div>
              <div className={styles.form_item}>
                <label className={styles.label}>Producto </label>
                <input
                  className={styles.product_input_modify}
                  value={productNameForDiscountModification}
                  disabled={true}
                />
              </div>
              <fieldset className={styles.radio_container}>
                <legend>Selecciona el tipo de descuento:</legend>
                <div className={styles.form_item}>
                  <input
                    type={'radio'}
                    name={'modified_discount_type'}
                    checked={modifiedSelectedDiscountType === DiscountType.PERCENTAGE}
                    onChange={handleModifiedSelectedDiscountTypePercentage}
                  />
                  <label className={styles.label}>Descuento (%) </label>
                  <input
                    ref={modifiedPercentageInputRef}
                    className={styles.discount_input}
                    type={'text'}
                    value={modifiedDiscountPercentage}
                    onChange={handleModifiedDiscountPercentageChange}
                    disabled={modifiedSelectedDiscountType !== DiscountType.PERCENTAGE}
                  />
                </div>
                <div className={styles.form_item}>
                  <input
                    type={'radio'}
                    name={'modified_discount_type'}
                    checked={modifiedSelectedDiscountType === DiscountType.FLAT_AMOUNT}
                    onChange={handleModifiedSelectedDiscountTypeFlatAmount}
                  />
                  <label className={styles.label}>Descuento ($) </label>
                  <input
                    ref={modifiedFlatAmountInputRef}
                    className={styles.discount_input}
                    type={'text'}
                    value={modifiedDiscountFlatAmount}
                    onChange={handleModifiedDiscountFlatAmountChange}
                    disabled={modifiedSelectedDiscountType !== DiscountType.FLAT_AMOUNT}
                  />
                </div>
                <div className={styles.form_item}>
                  <input
                    type={'radio'}
                    name={'modified_discount_type'}
                    checked={modifiedSelectedDiscountType === DiscountType.FIXED_PRICE}
                    onChange={handleModifiedSelectedDiscountTypeFixedPrice}
                  />
                  <label className={styles.label}>Precio Fijo </label>
                  <input
                    ref={modifiedFixedPriceInputRef}
                    className={styles.discount_input}
                    type={'text'}
                    value={modifiedFixedPrice}
                    onChange={handleModifiedFixedPriceChange}
                    disabled={modifiedSelectedDiscountType !== DiscountType.FIXED_PRICE}
                  />
                </div>
              </fieldset>

              <input className={viewStyles.primary_button} type={'submit'} value={'Modificar'} />
              <button className={viewStyles.secondary_button} onClick={handleCancelModify}>
                Cancelar
              </button>
            </form>
          )}
        </>
      </ViewHeader>
      <div className={styles.table_container}>
        <Table
          selectedRowId={selectedDiscountId ?? ''}
          columnNames={[
            'Cliente',
            'Producto',
            'Precio Unitario (Mayoreo/Menudeo)',
            'Descuento (%)',
            'Descuento ($)',
            'Precio Fijo',
            'Precio Unitario Despues de Descuento (Mayoreo/Menudeo)',
          ]}
          rows={discountRows}
          onSelectedRow={handleSelectedDiscount}
        />
      </div>
    </ViewContainer>
  )
}

export default Discounts
