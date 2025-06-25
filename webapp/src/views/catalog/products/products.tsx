import clsx from 'clsx'
import { ProductClient } from 'webapp/src/api/clients/product'
import React, { useEffect, useRef, useState } from 'react'
import Table from 'webapp/src/components/table/table'
import ViewContainer from 'webapp/src/components/views/container/container'
import ViewHeader from 'webapp/src/components/views/header/header'
import styles from './products.module.css'
import viewStyles from 'webapp/src/views/views.module.css'
import { formatMonetary } from 'webapp/src/components/functions/formatting'
import { toast } from 'react-toastify'
import { FinishedProductUnitTranslation } from 'webapp/src/components/functions/translations'
import FinishedProductSearchBox from 'webapp/src/components/finished_product_search_box/finished_product_search_box'
import { SearchResultItem } from 'interface/entities/common'
import { FinishedProduct } from 'interface/entities/finished_product'
import { ProductWithFinishedProducts } from 'interface/entities/product'
import { FinishedProductUnitType } from 'interface/entities/finished_product'

const productClient = new ProductClient()

const Products = () => {
  const [query, setQuery] = useState('')
  const [enableSearchButton, setEnableSearchButton] = useState(true)
  const [products, setProducts] = useState<ProductWithFinishedProducts[]>([])
  const [selectedProduct, setSelectedProduct] = useState<
    ProductWithFinishedProducts | null | undefined
  >(null)
  const [addFormEnabled, setAddFormEnabled] = useState(false)
  const [modifyFormEnabled, setModifyFormEnabled] = useState(false)
  const [addingProductFinishedProduct, setAddingProductFinishedProduct] =
    useState<FinishedProduct | null>(null)
  const [addingProductCode, setAddingProductCode] = useState<string | null>(null)
  const [addingProductName, setAddingProductName] = useState<string | null>(null)
  const [addingProductWholesaleUnitPrice, setAddingProductWholesaleUnitPrice] = useState<string>('')
  const [addingProductRetailUnitPrice, setAddingProductRetailUnitPrice] = useState<string>('')
  const [addingProductQuantityInUnit, setAddingProductQuantityInUnit] = useState<string>('')
  const [modifyingFinishedProduct, setModifyingFinishedProduct] = useState<FinishedProduct | null>(
    null,
  )
  const [modifyingProductCode, setModifyingProductCode] = useState<string | null>(null)
  const [modifyingProductName, setModifyingProductName] = useState<string>('')
  const [modifyingProductWholesaleUnitPrice, setModifyingProductWholesaleUnitPrice] =
    useState<string>('')
  const [modifyingProductRetailUnitPrice, setModifyingProductRetailUnitPrice] = useState<string>('')
  const [modifyingProductQuantityInUnit, setModifyingProductQuantityInUnit] = useState<string>('')

  const addingProductCodeInputRef = useRef<HTMLInputElement>(null)
  const searchProductInputRef = useRef<HTMLInputElement>(null)

  const getProducts = async (queryParam?: string) => {
    const response = await productClient.list({
      query: queryParam ?? query,
      page: 1,
    })
    setSelectedProduct(null)
    setProducts(response.products)
  }

  useEffect(() => {
    searchProductInputRef.current?.focus()
  }, [])

  const handleChangeQuery = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value)
    setEnableSearchButton(true)
  }

  const handleGetProducts = async () => {
    await getProducts()
    setEnableSearchButton(false)
  }

  const handleSearchInputKeyDown = async (event: any) => {
    if (event.keyCode === 13) {
      await getProducts()
      setEnableSearchButton(false)
    }
  }

  const handleSelectedProduct = (rowId: string) => {
    const product = products?.find(product => product.code === rowId)
    if (product === selectedProduct && !modifyFormEnabled) {
      setSelectedProduct(null)
      return
    }
    setSelectedProduct(product)
    setModifyingProductCode(product?.code ?? null)
    setModifyingProductName(product?.name ?? '')
    setModifyingProductWholesaleUnitPrice(String(product?.wholesale_unit_price ?? ''))
    setModifyingProductRetailUnitPrice(String(product?.retail_unit_price ?? ''))
    setModifyingProductQuantityInUnit(String(product?.finished_products[0]?.unit_quantity ?? ''))
  }

  const onEnableAddForm = () => {
    setAddFormEnabled(true)
    setSelectedProduct(null)
    setAddingProductCode('')
    setAddingProductName('')
    setAddingProductWholesaleUnitPrice('')
    setAddingProductRetailUnitPrice('')
    setAddingProductQuantityInUnit('')
    setTimeout(() => {
      addingProductCodeInputRef.current?.focus()
    }, 100)
  }

  const onEnableModifyForm = () => {
    setModifyFormEnabled(true)
  }

  const handleDisableProduct = async () => {
    if (!selectedProduct) {
      return
    }
    const result = await productClient.disable({ code: selectedProduct.code })
    if (result.success) {
      toast.dark('Producto deshabilitado correctamente.')
      await getProducts()
      setSelectedProduct(null)
    } else {
      toast.error('Ocurrió un error al deshabilitar el producto. Intente de nuevo.')
    }
  }

  const handleEnableProduct = async () => {
    if (!selectedProduct) {
      return
    }
    const result = await productClient.enable({ code: selectedProduct.code })
    if (result.success) {
      toast.dark('Producto habilitado correctamente.')
      await getProducts()
      setSelectedProduct(null)
    } else {
      toast.error('Ocurrió un error al habilitar el producto. Intente de nuevo.')
    }
  }

  const onDisableAddForm = () => {
    setAddFormEnabled(false)
    setAddingProductCode('')
    setAddingProductName('')
    setAddingProductWholesaleUnitPrice('')
    setAddingProductRetailUnitPrice('')
    setAddingProductQuantityInUnit('')
  }

  const onDisableModifyForm = () => {
    setModifyFormEnabled(false)
  }

  const onAddProduct = async (e: any) => {
    e.preventDefault()
    if (!addingProductCode) {
      toast.error('Error!. Favor de indicar un código de producto.')
      return
    }
    if (!addingProductName) {
      toast.error('Error!. Favor de indicar un nombre de producto.')
      return
    }
    const wholesaleUnitPriceNumber = Number(addingProductWholesaleUnitPrice)
    if (isNaN(wholesaleUnitPriceNumber)) {
      toast.error('Error!. Precio unitario de mayoreo incorrecto.')
      return
    }
    const retailUnitPriceNumber = Number(addingProductRetailUnitPrice)
    if (isNaN(retailUnitPriceNumber)) {
      toast.error('Error!. Precio unitario de menudeo incorrecto.')
      return
    }
    if (!addingProductQuantityInUnit) {
      toast.error('Error!. Favor de indicar la cantidad por unidad.')
      return
    }
    const quantityInUnit = Number(addingProductQuantityInUnit)
    if (isNaN(quantityInUnit)) {
      toast.error('Error!. KG por unidad incorrecto.')
      return
    }
    const product = {
      code: addingProductCode,
      name: addingProductName,
      finished_products: [
        {
          finished_product_code: addingProductFinishedProduct?.code ?? '',
          unit_quantity: quantityInUnit,
        },
      ],
      wholesale_unit_price: wholesaleUnitPriceNumber,
      retail_unit_price: retailUnitPriceNumber,
    }
    const result = await productClient.add(product)
    if (result.success) {
      toast.dark('Producto agregado correctamente.')
      await getProducts(addingProductCode)
      setAddFormEnabled(false)
    } else {
      if (result.user_error_message) {
        toast.error(result.user_error_message)
      } else {
        toast.error('Ocurrió un error al agregar el producto. Intente de nuevo.')
      }
    }
  }

  const onModifyProduct = async (e: any) => {
    e.preventDefault()
    if (!selectedProduct || !modifyingProductCode) {
      toast.error('Error!. No se ha seleccionado un producto.')
      return
    }
    if (!modifyingProductName) {
      toast.error('Error!. Favor de indicar un nombre de producto.')
      return
    }
    const wholesaleUnitPriceNumber = Number(modifyingProductWholesaleUnitPrice)
    if (isNaN(wholesaleUnitPriceNumber)) {
      toast.error('Error!. Precio unitario de mayoreo incorrecto.')
      return
    }
    const retailUnitPriceNumber = Number(modifyingProductRetailUnitPrice)
    if (isNaN(retailUnitPriceNumber)) {
      toast.error('Error!. Precio unitario de menudeo incorrecto.')
      return
    }
    if (!modifyingProductQuantityInUnit) {
      toast.error('Error!. Favor de indicar la cantidad por unidad.')
      return
    }
    const quantityInUnitNumber = Number(modifyingProductQuantityInUnit)
    if (isNaN(quantityInUnitNumber)) {
      toast.error('Error!. KG por unidad incorrecto.')
      return
    }
    const finishedProduct =
      modifyingFinishedProduct ||
      selectedProduct.finished_products[0]?.unit_quantity !== quantityInUnitNumber
        ? [
            {
              finished_product_code:
                modifyingFinishedProduct?.code ?? selectedProduct.finished_products[0].code ?? '',
              unit_quantity: quantityInUnitNumber,
            },
          ]
        : selectedProduct.finished_products.map(finishedProduct => {
            return {
              finished_product_code: finishedProduct.code ?? '',
              unit_quantity: finishedProduct.unit_quantity,
            }
          })

    const product = {
      code: modifyingProductCode,
      name: modifyingProductName,
      finished_products: finishedProduct,
      wholesale_unit_price: wholesaleUnitPriceNumber,
      retail_unit_price: retailUnitPriceNumber,
    }
    const result = await productClient.modify(product)
    if (result.success) {
      toast.dark('Producto modificado correctamente.')
      await getProducts(modifyingProductCode)
      setModifyFormEnabled(false)
    } else {
      toast.dark('Ocurrió un error al modificar el producto. Intente de nuevo.')
    }
  }

  const productsForTable = products
    ? products.map((product, index) => {
        const finishedProduct = product.finished_products[0] ?? {}
        return {
          id: product.code,
          cells: [
            {
              value: index + 1,
            },
            {
              value: product.code,
            },
            {
              value: product.name,
            },
            {
              value: formatMonetary(product.wholesale_unit_price),
            },
            {
              value: formatMonetary(product.retail_unit_price),
            },
            {
              value: finishedProduct.unit_quantity,
            },
            {
              value: FinishedProductUnitTranslation[finishedProduct.unit_type],
            },
            {
              value: product.finished_products
                .map(finishedProduct => finishedProduct.name)
                .join(', '),
            },
            {
              value: product.enabled ? 'Habilitado' : 'Deshabilitado',
            },
          ],
        }
      })
    : []

  return (
    <ViewContainer title={'Productos'}>
      <ViewHeader flexDirection={'column'}>
        <div>
          <div>
            <input
              value={query}
              ref={searchProductInputRef}
              className={viewStyles.search_input}
              onChange={handleChangeQuery}
              onKeyDown={handleSearchInputKeyDown}
              placeholder={'Introduzca (parte del) código o nombre del producto'}
            />
            <button
              onClick={handleGetProducts}
              disabled={!enableSearchButton}
              className={clsx({
                [viewStyles.disabled_button]: !enableSearchButton,
                [viewStyles.primary_button]: enableSearchButton,
              })}
            >
              Buscar producto
            </button>
          </div>
          <div>
            <button
              className={clsx({
                [viewStyles.secondary_button]: !addFormEnabled && !modifyFormEnabled,
                [viewStyles.disabled_button]: addFormEnabled || modifyFormEnabled,
              })}
              disabled={addFormEnabled || modifyFormEnabled}
              onClick={onEnableAddForm}
            >
              Agregar Producto
            </button>
            <button
              disabled={!selectedProduct || modifyFormEnabled || addFormEnabled}
              className={clsx({
                [viewStyles.secondary_button]:
                  selectedProduct && !modifyFormEnabled && !addFormEnabled,
                [viewStyles.disabled_button]:
                  !selectedProduct || modifyFormEnabled || addFormEnabled,
              })}
              onClick={onEnableModifyForm}
            >
              Modificar Producto
            </button>
            <button
              disabled={
                !selectedProduct || modifyFormEnabled || addFormEnabled || !selectedProduct.enabled
              }
              className={clsx({
                [viewStyles.secondary_button]:
                  selectedProduct &&
                  !modifyFormEnabled &&
                  !addFormEnabled &&
                  selectedProduct.enabled,
                [viewStyles.disabled_button]:
                  !selectedProduct ||
                  modifyFormEnabled ||
                  addFormEnabled ||
                  !selectedProduct.enabled,
              })}
              onClick={handleDisableProduct}
            >
              Deshabilitar Producto
            </button>
            <button
              disabled={
                !selectedProduct || modifyFormEnabled || addFormEnabled || selectedProduct.enabled
              }
              className={clsx({
                [viewStyles.secondary_button]:
                  selectedProduct &&
                  !modifyFormEnabled &&
                  !addFormEnabled &&
                  !selectedProduct.enabled,
                [viewStyles.disabled_button]:
                  !selectedProduct ||
                  modifyFormEnabled ||
                  addFormEnabled ||
                  selectedProduct.enabled,
              })}
              onClick={handleEnableProduct}
            >
              Habilitar Producto
            </button>
          </div>
          {addFormEnabled && (
            <form className={styles.form_container} onSubmit={onAddProduct}>
              <div>
                <div className={styles.form_container_input_container}>
                  <label className={styles.form_container_input_label}>Código</label>
                  <input
                    ref={addingProductCodeInputRef}
                    className={styles.form_container_input}
                    value={addingProductCode || ''}
                    onChange={event => setAddingProductCode(event.target.value.toUpperCase())}
                  />
                </div>
                <div className={styles.form_container_input_container}>
                  <label className={styles.form_container_input_label}>Nombre</label>
                  <input
                    className={clsx(styles.form_container_input, styles.form_container_input_name)}
                    value={addingProductName || ''}
                    onChange={event => setAddingProductName(event.target.value.toUpperCase())}
                  />
                </div>
                <div className={styles.form_container_input_container}>
                  <label className={styles.form_container_input_label}>
                    {`Precio Mayoreo ${
                      selectedProduct?.finished_products[0]?.unit_type ===
                      FinishedProductUnitType.KILOGRAM
                        ? '(por KG)'
                        : ''
                    }`}
                  </label>
                  <input
                    className={styles.form_container_input}
                    value={addingProductWholesaleUnitPrice ?? ''}
                    onChange={event => setAddingProductWholesaleUnitPrice(event.target.value)}
                  />
                </div>
                <div className={styles.form_container_input_container}>
                  <label className={styles.form_container_input_label}>
                    {`Precio Menudeo ${
                      selectedProduct?.finished_products[0]?.unit_type ===
                      FinishedProductUnitType.KILOGRAM
                        ? '(por KG)'
                        : ''
                    }`}
                  </label>
                  <input
                    className={styles.form_container_input}
                    value={addingProductRetailUnitPrice ?? ''}
                    onChange={event => setAddingProductRetailUnitPrice(event.target.value)}
                  />
                </div>
                <div className={styles.form_container_input_container}>
                  <FinishedProductSearchBox
                    onFinishedProductSelected={(
                      finishedProduct: SearchResultItem<FinishedProduct>,
                    ) => setAddingProductFinishedProduct(finishedProduct.data)}
                  />
                </div>
                <div className={styles.form_container_input_container}>
                  <label className={styles.form_container_input_label}>Cantidad por Unidad</label>
                  <input
                    className={styles.form_container_input}
                    onChange={event => {
                      setAddingProductQuantityInUnit(event.target.value)
                    }}
                    value={addingProductQuantityInUnit}
                  />
                  <span>
                    {' '}
                    {addingProductFinishedProduct
                      ? `${
                          modifyingFinishedProduct?.unit_type
                            ? FinishedProductUnitTranslation[modifyingFinishedProduct?.unit_type] +
                              's'
                            : ''
                        } `
                      : ''}
                  </span>
                </div>
                <div className={styles.form_container_buttons}>
                  <input type={'submit'} className={viewStyles.primary_button} value={'Guardar'} />
                  <button className={viewStyles.secondary_button} onClick={onDisableAddForm}>
                    Cancelar
                  </button>
                </div>
              </div>
            </form>
          )}
          {modifyFormEnabled && (
            <form className={styles.form_container} onSubmit={onModifyProduct}>
              <div>
                <div className={styles.form_container_input_container}>
                  <label className={styles.form_container_input_label}>Código</label>
                  <input
                    className={styles.form_container_input}
                    value={modifyingProductCode || ''}
                    disabled={true}
                  />
                </div>
                <div className={styles.form_container_input_container}>
                  <label className={styles.form_container_input_label}>Nombre</label>
                  <input
                    className={clsx(styles.form_container_input, styles.form_container_input_name)}
                    value={modifyingProductName}
                    onChange={event => setModifyingProductName(event.target.value)}
                  />
                </div>
                <div className={styles.form_container_input_container}>
                  <label className={styles.form_container_input_label}>
                    {' '}
                    {`Precio Mayoreo ${
                      selectedProduct?.finished_products[0]?.unit_type ===
                      FinishedProductUnitType.KILOGRAM
                        ? '(por KG)'
                        : ''
                    }`}
                  </label>
                  <input
                    className={styles.form_container_input}
                    value={modifyingProductWholesaleUnitPrice ?? ''}
                    onChange={event => setModifyingProductWholesaleUnitPrice(event.target.value)}
                  />
                </div>
                <div className={styles.form_container_input_container}>
                  <label className={styles.form_container_input_label}>
                    {`Precio Menudeo ${
                      selectedProduct?.finished_products[0]?.unit_type ===
                      FinishedProductUnitType.KILOGRAM
                        ? '(por KG)'
                        : ''
                    }`}
                  </label>
                  <input
                    className={styles.form_container_input}
                    value={modifyingProductRetailUnitPrice ?? ''}
                    onChange={event => setModifyingProductRetailUnitPrice(event.target.value)}
                  />
                </div>
                <div className={styles.form_container_input_container}>
                  <FinishedProductSearchBox
                    defaultValue={selectedProduct?.finished_products[0]?.name}
                    onFinishedProductSelected={(
                      finishedProduct: SearchResultItem<FinishedProduct>,
                    ) => setModifyingFinishedProduct(finishedProduct.data)}
                  />
                </div>
                <div className={styles.form_container_input_container}>
                  <label className={styles.form_container_input_label}>Cantidad por Unidad</label>
                  <input
                    className={styles.form_container_input}
                    onChange={event => {
                      setModifyingProductQuantityInUnit(event.target.value)
                    }}
                    value={modifyingProductQuantityInUnit}
                  />
                  <span>
                    {' '}
                    {modifyingFinishedProduct
                      ? `${
                          modifyingFinishedProduct?.unit_type
                            ? FinishedProductUnitTranslation[modifyingFinishedProduct?.unit_type] +
                              's'
                            : ''
                        }`
                      : `${
                          selectedProduct?.finished_products[0]?.unit_type
                            ? FinishedProductUnitTranslation[
                                selectedProduct?.finished_products[0]?.unit_type
                              ] + 's'
                            : ''
                        }`}
                  </span>
                </div>
              </div>
              <div className={styles.form_container_buttons}>
                <input type={'submit'} className={viewStyles.primary_button} value={'Guardar'} />
                <button className={viewStyles.secondary_button} onClick={onDisableModifyForm}>
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </div>
      </ViewHeader>
      <Table
        selectedRowId={selectedProduct?.code ?? ''}
        columnNames={[
          '#',
          'Código',
          'Nombre',
          'Precio Mayoreo',
          'Precio Menudeo',
          'Cantidad por Unidad',
          'Tipo de Unidad',
          'Producto Terminado',
          'Estado',
        ]}
        rows={productsForTable}
        onSelectedRow={handleSelectedProduct}
      />
    </ViewContainer>
  )
}

export default Products
