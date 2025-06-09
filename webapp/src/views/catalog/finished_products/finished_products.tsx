import clsx from 'clsx'
import React, { useEffect, useRef, useState } from 'react'
import Table from 'webapp//components/table/table'
import ViewContainer from 'webapp//components/views/container/container'
import ViewHeader from 'webapp//components/views/header/header'
import styles from './finished_products.module.css'
import viewStyles from 'webapp//views/views.module.css'
import { toast } from 'react-toastify'
import {
  FinishedProduct,
  FinishedProductUnitType,
} from 'interface/entities/finished_product'
import { FinishedProductClient } from 'webapp//api/clients/finished_product'
import { FinishedProductUnitTranslation } from 'webapp//components/functions/translations'
import {
  FinishedProductAddRQ,
  FinishedProductModifyRQ,
} from 'interface/requests/finished_product'
import POSITION = toast.POSITION

const finishedProductClient = new FinishedProductClient()

const FinishedProducts = () => {
  const [query, setQuery] = useState('')
  const [enableSearchButton, setEnableSearchButton] = useState(true)
  const [finishedProducts, setFinishedProducts] = useState<FinishedProduct[]>([])
  const [selectedFinishedProduct, setSelectedFinishedProduct] = useState<
    FinishedProduct | null | undefined
  >(null)
  const [addFormEnabled, setAddFormEnabled] = useState(false)
  const [modifyFormEnabled, setModifyFormEnabled] = useState(false)
  const [addingFinishedProductCode, setAddingFinishedProductCode] = useState<string | null>(null)
  const [addingFinishedProductName, setAddingFinishedProductName] = useState<string | null>(null)
  const [addingFinishedProductUnitType, setAddingFinishedProductUnitType] = useState<string | null>(
    null,
  )
  const [modifyingFinishedProductUnitType, setModifyingFinishedProductUnitType] = useState<
    string | null
  >(null)
  const [modifyingFinishedProductCode, setModifyingFinishedProductCode] = useState<string | null>(
    null,
  )
  const [modifyingFinishedProductName, setModifyingFinishedProductName] = useState<string>('')

  const addingFinishedProductCodeInputRef = useRef<HTMLInputElement>(null)
  const searchFinishedProductInputRef = useRef<HTMLInputElement>(null)

  const getFinishedProduct = async (queryParam?: string) => {
    const response = await finishedProductClient.list({
      query: queryParam ?? query,
      page: 1,
    })
    setSelectedFinishedProduct(null)
    setFinishedProducts(response.finished_products)
  }

  useEffect(() => {
    searchFinishedProductInputRef.current?.focus()
  }, [])

  const handleChangeQuery = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value)
    setEnableSearchButton(true)
  }

  const handleGetFinishedProducts = async () => {
    await getFinishedProduct()
    setEnableSearchButton(false)
  }

  const handleSearchInputKeyDown = async (event: any) => {
    if (event.keyCode === 13) {
      await getFinishedProduct()
      setEnableSearchButton(false)
    }
  }

  const handleSelectedFinishedProduct = (rowId: string) => {
    const product = finishedProducts?.find(product => product.code === rowId)
    if (product === selectedFinishedProduct && !modifyFormEnabled) {
      setSelectedFinishedProduct(null)
      return
    }
    setSelectedFinishedProduct(product)
    setModifyingFinishedProductCode(product?.code ?? null)
    setModifyingFinishedProductName(product?.name ?? '')
    setModifyingFinishedProductUnitType(product?.unit_type ?? null)
  }

  const onEnableAddForm = () => {
    setAddFormEnabled(true)
    setSelectedFinishedProduct(null)
    setAddingFinishedProductCode('')
    setAddingFinishedProductName('')
    setTimeout(() => {
      addingFinishedProductCodeInputRef.current?.focus()
    }, 100)
  }

  const onEnableModifyForm = () => {
    setModifyFormEnabled(true)
  }

  const onDisableAddForm = () => {
    setAddFormEnabled(false)
    setAddingFinishedProductCode('')
    setAddingFinishedProductName('')
  }

  const onDisableModifyForm = () => {
    setModifyFormEnabled(false)
  }

  const onAddFinishedProduct = async (e: any) => {
    e.preventDefault()
    if (!addingFinishedProductCode) {
      toast.error('Error!. Favor de indicar un código.')
      return
    }
    if (!addingFinishedProductName) {
      toast.error('Error!. Favor de indicar un nombre.')
      return
    }
    if (!addingFinishedProductUnitType) {
      toast.error('Error!. Favor de indicar la unidad de medida.', {
        position: POSITION.TOP_LEFT,
      })
      return
    }
    const finishedProduct: FinishedProductAddRQ = {
      code: addingFinishedProductCode,
      name: addingFinishedProductName,
      unit_type: addingFinishedProductUnitType as FinishedProductUnitType,
    }
    const result = await finishedProductClient.add(finishedProduct)
    if (result.success) {
      toast.dark('Producto terminado agregado correctamente.')
      await getFinishedProduct(addingFinishedProductCode)
      setAddFormEnabled(false)
    } else {
      if (result.user_error_message) {
        toast.error(result.user_error_message)
      } else {
        toast.error('Ocurrió un error al agregar el producto terminado. Intente de nuevo.')
      }
    }
  }

  const onModifyFinishProduct = async (e: any) => {
    e.preventDefault()
    if (!selectedFinishedProduct || !modifyingFinishedProductCode) {
      toast.error('Error!. No se ha seleccionado un producto terminado.')
      return
    }
    if (!modifyingFinishedProductName) {
      toast.error('Error!. Favor de indicar un nombre de producto terminado.')
      return
    }
    const finishedProduct: FinishedProductModifyRQ = {
      code: modifyingFinishedProductCode,
      name: modifyingFinishedProductName,
      unit_type: modifyingFinishedProductUnitType as FinishedProductUnitType,
    }
    const result = await finishedProductClient.modify(finishedProduct)
    if (result.success) {
      toast.dark('Producto terminado modificado correctamente.')
      await getFinishedProduct(modifyingFinishedProductCode)
      setModifyFormEnabled(false)
    } else {
      toast.dark('Ocurrió un error al modificar el producto terminado. Intente de nuevo.')
    }
  }

  const finishedProductsForTable = finishedProducts
    ? finishedProducts.map(finishedProduct => {
        return {
          id: finishedProduct.code,
          cells: [
            {
              value: finishedProduct.code,
            },
            {
              value: finishedProduct.name,
            },
            {
              value: FinishedProductUnitTranslation[finishedProduct.unit_type],
            },
          ],
        }
      })
    : []

  return (
    <ViewContainer title={'Productos Terminados'}>
      <ViewHeader flexDirection={'column'}>
        <div>
          <div>
            <input
              value={query}
              ref={searchFinishedProductInputRef}
              className={viewStyles.search_input}
              onChange={handleChangeQuery}
              onKeyDown={handleSearchInputKeyDown}
              placeholder={'Introduzca (parte del) código o nombre del producto terminado'}
            />
            <button
              onClick={handleGetFinishedProducts}
              disabled={!enableSearchButton}
              className={clsx({
                [viewStyles.disabled_button]: !enableSearchButton,
                [viewStyles.primary_button]: enableSearchButton,
              })}
            >
              Buscar producto terminado
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
              Agregar Producto Terminado
            </button>
            <button
              disabled={!selectedFinishedProduct || modifyFormEnabled || addFormEnabled}
              className={clsx({
                [viewStyles.secondary_button]:
                  selectedFinishedProduct && !modifyFormEnabled && !addFormEnabled,
                [viewStyles.disabled_button]:
                  !selectedFinishedProduct || modifyFormEnabled || addFormEnabled,
              })}
              onClick={onEnableModifyForm}
            >
              Modificar Producto Terminado
            </button>
          </div>
          {addFormEnabled && (
            <form className={styles.form_container} onSubmit={onAddFinishedProduct}>
              <div>
                <div className={styles.form_container_input_container}>
                  <label className={styles.form_container_input_label}>Código</label>
                  <input
                    ref={addingFinishedProductCodeInputRef}
                    className={styles.form_container_input}
                    value={addingFinishedProductCode || ''}
                    onChange={event =>
                      setAddingFinishedProductCode(event.target.value.toUpperCase())
                    }
                  />
                </div>
                <div className={styles.form_container_input_container}>
                  <label className={styles.form_container_input_label}>Nombre</label>
                  <input
                    className={clsx(styles.form_container_input, styles.form_container_input_name)}
                    value={addingFinishedProductName || ''}
                    onChange={event =>
                      setAddingFinishedProductName(event.target.value.toUpperCase())
                    }
                  />
                </div>
                <div className={styles.form_container_input_container}>
                  <label className={styles.form_container_input_label}>Unidad de Medida</label>
                  <select
                    className={viewStyles.select}
                    onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
                      setAddingFinishedProductUnitType(
                        event.target.value as FinishedProductUnitType,
                      )
                    }}
                  >
                    <option value={''}>--</option>
                    {Object.values(FinishedProductUnitType).map(unitType => (
                      <option key={unitType} value={unitType}>
                        {FinishedProductUnitTranslation[unitType]}
                      </option>
                    ))}
                  </select>
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
            <form className={styles.form_container} onSubmit={onModifyFinishProduct}>
              <div>
                <div className={styles.form_container_input_container}>
                  <label className={styles.form_container_input_label}>Código</label>
                  <input
                    className={styles.form_container_input}
                    value={modifyingFinishedProductCode || ''}
                    disabled={true}
                  />
                </div>
                <div className={styles.form_container_input_container}>
                  <label className={styles.form_container_input_label}>Nombre</label>
                  <input
                    className={clsx(styles.form_container_input, styles.form_container_input_name)}
                    value={modifyingFinishedProductName}
                    onChange={event => setModifyingFinishedProductName(event.target.value)}
                  />
                </div>
              </div>
              <div className={styles.form_container_input_container}>
                <label className={styles.form_container_input_label}>Unidad de Medida</label>
                <select
                  className={viewStyles.select}
                  onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
                    setModifyingFinishedProductUnitType(
                      event.target.value as FinishedProductUnitType,
                    )
                  }}
                >
                  <option value={''}>--</option>
                  {Object.values(FinishedProductUnitType).map(unitType => (
                    <option
                      key={unitType}
                      value={unitType}
                      selected={modifyingFinishedProductUnitType === unitType}
                    >
                      {FinishedProductUnitTranslation[unitType]}
                    </option>
                  ))}
                </select>
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
        selectedRowId={selectedFinishedProduct?.code ?? ''}
        columnNames={['Código', 'Nombre', 'Unidad de Medida']}
        rows={finishedProductsForTable}
        onSelectedRow={handleSelectedFinishedProduct}
      />
    </ViewContainer>
  )
}

export default FinishedProducts
