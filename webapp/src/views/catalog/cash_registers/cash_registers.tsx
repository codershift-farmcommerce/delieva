import ViewContainer from 'src/components/views/container/container'
import Table from 'src/components/table/table'
import { CashRegisterClient } from 'src/api/clients/cash_register'
import {
  Cashier,
  CashRegister,
  CashRegisterAssignation,
  CashRegisterQuantityInputType,
} from 'codershift-farmcommerce-api/entities/cash_register'
import React, { useEffect, useRef, useState } from 'react'
import ViewHeader from 'src/components/views/header/header'
import clsx from 'clsx'
import viewStyles from 'src/views/views.module.css'
import styles from './cash_registers.module.css'
import { CashRegisterQuantityInputTypeTranslation } from 'src/components/functions/translations'

const cashRegisterClient = new CashRegisterClient()

type CashRegisterAssignationByCashRegisterId = {
  [cashRegisterId: string]: CashRegisterAssignation
}

const CashRegisters = () => {
  const [cashRegisters, setCashRegisters] = useState<CashRegister[]>([])
  const [cashiers, setCashiers] = useState<Cashier[]>([])
  const [assignations, setAssignations] = useState<CashRegisterAssignationByCashRegisterId>({})
  const [selectedCashRegister, setSelectedCashRegister] = useState<CashRegister | null>(null)
  const [selectedCashierEmail, setSelectedCashierEmail] = useState('')
  const [addFormEnabled, setAddFormEnabled] = useState(false)
  const [modifyFormEnabled, setModifyFormEnabled] = useState(false)
  const [assignCashierFormEnabled, setAssignCashierFormEnabled] = useState(false)
  const [addingCashRegisterName, setAddingCashRegisterName] = useState('')
  const [addingCashRegisterLocationDescription, setAddingCashRegisterLocationDescription] =
    useState('')
  const [addingCashRegisterQuantityInputType, setAddingCashRegisterQuantityInputType] =
    useState<CashRegisterQuantityInputType>(CashRegisterQuantityInputType.MANUAL)
  const [
    addingCashRegisterApplyWholesalePriceAfterXKG,
    setAddingCashRegisterApplyWholesalePriceAfterXKG,
  ] = useState('10')
  const [modifyingCashRegisterName, setModifyingCashRegisterName] = useState('')
  const [modifyingCashRegisterLocationDescription, setModifyingCashRegisterLocationDescription] =
    useState('')
  const [modifyingCashRegisterQuantityInputType, setModifyingCashRegisterQuantityInputType] =
    useState<CashRegisterQuantityInputType>()
  const [
    modifyingCashRegisterApplyWholesalePriceAfterXKG,
    setModifyingCashRegisterApplyWholesalePriceAfterXKG,
  ] = useState('')

  const addingCashRegisterNameInputRef = useRef<HTMLInputElement>(null)
  const modifyingCashRegisterNameInputRef = useRef<HTMLInputElement>(null)

  const getCashRegisters = async () => {
    const cashRegistersResponse = await cashRegisterClient.list({})
    setCashRegisters(cashRegistersResponse.cash_registers)
  }

  const getCashiers = async () => {
    const cashiersResponse = await cashRegisterClient.listCashiers({})
    setCashiers(cashiersResponse.cashiers)
  }

  const getAssignations = async () => {
    const assignationsResponse = await cashRegisterClient.listAssignations({})
    const assignationsById = assignationsResponse.assignations.reduce(
      (acc: CashRegisterAssignationByCashRegisterId, assignation) => {
        acc[assignation.cash_register_id] = assignation
        return acc
      },
      {},
    )
    setAssignations(assignationsById)
  }

  useEffect(() => {
    getCashRegisters().catch(error => {
      console.error(error)
    })
    getAssignations().catch(error => {
      console.error(error)
    })
  }, [])

  const handleAssignCashier = async () => {
    if (!selectedCashRegister || !selectedCashierEmail) {
      return
    }
    const cashRegisterId = selectedCashRegister?.id
    const assignCashierRequest = {
      cash_register_id: cashRegisterId,
      user_email: selectedCashierEmail,
    }
    await cashRegisterClient.assignCashier(assignCashierRequest)
    await getAssignations()
    setAssignCashierFormEnabled(false)
  }

  const handleUnassignCashier = async () => {
    if (!selectedCashRegister) {
      return
    }
    const cashRegisterId = selectedCashRegister?.id
    const userEmail = assignations[cashRegisterId]?.user_email
    await cashRegisterClient.unassignCashier({
      user_email: userEmail,
    })
    await getAssignations()
  }

  const cleanFields = () => {
    setAddingCashRegisterName('')
    setAddingCashRegisterLocationDescription('')
    setAddingCashRegisterQuantityInputType(CashRegisterQuantityInputType.MANUAL)
    setAddingCashRegisterApplyWholesalePriceAfterXKG('10')
  }

  const onEnableAddForm = () => {
    setAddFormEnabled(true)
    setSelectedCashRegister(null)
    setTimeout(() => {
      addingCashRegisterNameInputRef.current?.focus()
    }, 100)
    cleanFields()
  }

  const onEnableModifyForm = () => {
    setModifyFormEnabled(true)
    setModifyingCashRegisterName(selectedCashRegister?.name ?? '')
    setModifyingCashRegisterLocationDescription(selectedCashRegister?.location_description ?? '')
    setModifyingCashRegisterApplyWholesalePriceAfterXKG(
      selectedCashRegister?.apply_wholesale_price_after_x_kg.toString() ?? '',
    )
    setTimeout(() => {
      modifyingCashRegisterNameInputRef.current?.focus()
    }, 100)
  }

  const onEnableAssignCashierForm = async () => {
    await getCashiers()
    setAssignCashierFormEnabled(true)
  }

  const onDisableAddForm = () => {
    setAddFormEnabled(false)
  }

  const onDisableModifyForm = () => {
    setModifyFormEnabled(false)
  }

  const handleSelectedCashRegister = (cashRegisterId: string) => {
    const cashRegister = cashRegisters?.find(
      cashRegister => String(cashRegister.id) === cashRegisterId,
    )
    if (cashRegister?.id === selectedCashRegister?.id) {
      setSelectedCashRegister(null)
      return
    }
    setSelectedCashRegister(cashRegister || null)
    setAddFormEnabled(false)
    setModifyFormEnabled(false)
  }

  const handleAddCashRegister = async (e: any) => {
    e.preventDefault()
    if (!addingCashRegisterName || !addingCashRegisterLocationDescription) {
      return
    }
    const addCashRegisterRequest = {
      name: addingCashRegisterName,
      location_description: addingCashRegisterLocationDescription,
      quantity_input_type: addingCashRegisterQuantityInputType,
      apply_wholesale_price_after_x_kg: Number(addingCashRegisterApplyWholesalePriceAfterXKG),
    }
    await cashRegisterClient.add(addCashRegisterRequest)
    await getCashRegisters()
    setAddingCashRegisterName('')
    setAddingCashRegisterLocationDescription('')
    onDisableAddForm()
  }

  const handleModifyCashRegister = async (e: any) => {
    e.preventDefault()
    if (!modifyingCashRegisterName || !modifyingCashRegisterLocationDescription) {
      return
    }
    const modifyCashRegisterRequest = {
      id: selectedCashRegister?.id ?? 0,
      name: modifyingCashRegisterName,
      location_description: modifyingCashRegisterLocationDescription,
      quantity_input_type:
        modifyingCashRegisterQuantityInputType ?? CashRegisterQuantityInputType.MANUAL,
      apply_wholesale_price_after_x_kg: Number(modifyingCashRegisterApplyWholesalePriceAfterXKG),
    }
    await cashRegisterClient.modify(modifyCashRegisterRequest)
    await getCashRegisters()
    setModifyingCashRegisterName('')
    setModifyingCashRegisterLocationDescription('')
    onDisableModifyForm()
  }

  const handleAddQuantityInputType = (e: any) => {
    const quantityInputType = e.target.value as CashRegisterQuantityInputType
    setAddingCashRegisterQuantityInputType(quantityInputType)
  }

  const handleModifyQuantityInputType = (e: any) => {
    const quantityInputType = e.target.value as CashRegisterQuantityInputType
    setModifyingCashRegisterQuantityInputType(quantityInputType)
  }

  const cashRegistersForTable = cashRegisters
    ? cashRegisters.map(cashRegister => {
        const cashier = assignations[cashRegister.id]
        return {
          id: String(cashRegister.id),
          cells: [
            {
              value: cashRegister.name,
            },
            {
              value: cashRegister.location_description,
            },
            {
              value: cashier ? `${cashier.user_name} (${cashier.user_email})` : '--',
            },
            {
              value: CashRegisterQuantityInputTypeTranslation[cashRegister.quantity_input_type],
            },
            {
              value: cashRegister.apply_wholesale_price_after_x_kg,
            },
          ],
        }
      })
    : []

  // @ts-ignore
  return (
    <ViewContainer title={'Cajas Registradoras'}>
      <ViewHeader flexDirection={'column'}>
        <div>
          <button
            className={clsx({
              [viewStyles.secondary_button]:
                !addFormEnabled && !modifyFormEnabled && !assignCashierFormEnabled,
              [viewStyles.disabled_button]:
                addFormEnabled || modifyFormEnabled || assignCashierFormEnabled,
            })}
            disabled={addFormEnabled || modifyFormEnabled || assignCashierFormEnabled}
            onClick={onEnableAddForm}
          >
            Agregar Caja
          </button>
          <button
            disabled={
              !selectedCashRegister ||
              modifyFormEnabled ||
              addFormEnabled ||
              assignCashierFormEnabled
            }
            className={clsx({
              [viewStyles.secondary_button]:
                selectedCashRegister &&
                !modifyFormEnabled &&
                !addFormEnabled &&
                !assignCashierFormEnabled,
              [viewStyles.disabled_button]:
                !selectedCashRegister ||
                modifyFormEnabled ||
                addFormEnabled ||
                assignCashierFormEnabled,
            })}
            onClick={onEnableModifyForm}
          >
            Modificar Caja
          </button>
          <button
            disabled={
              !selectedCashRegister ||
              modifyFormEnabled ||
              addFormEnabled ||
              assignCashierFormEnabled ||
              !!assignations[selectedCashRegister?.id]
            }
            className={clsx({
              [viewStyles.secondary_button]:
                selectedCashRegister &&
                !modifyFormEnabled &&
                !addFormEnabled &&
                !assignCashierFormEnabled &&
                !assignations[selectedCashRegister?.id],
              [viewStyles.disabled_button]:
                !selectedCashRegister ||
                modifyFormEnabled ||
                addFormEnabled ||
                assignCashierFormEnabled ||
                !!assignations[selectedCashRegister?.id],
            })}
            onClick={onEnableAssignCashierForm}
          >
            Asignar Cajero
          </button>
          <button
            disabled={
              !selectedCashRegister ||
              modifyFormEnabled ||
              addFormEnabled ||
              assignCashierFormEnabled ||
              !assignations[selectedCashRegister?.id]
            }
            className={clsx({
              [viewStyles.secondary_button]:
                selectedCashRegister &&
                !modifyFormEnabled &&
                !addFormEnabled &&
                !assignCashierFormEnabled &&
                !!assignations[selectedCashRegister?.id],
              [viewStyles.disabled_button]:
                !selectedCashRegister ||
                modifyFormEnabled ||
                addFormEnabled ||
                assignCashierFormEnabled ||
                !assignations[selectedCashRegister?.id],
            })}
            onClick={handleUnassignCashier}
          >
            Desasignar Cajero
          </button>
        </div>

        <div className={styles.form_container} hidden={!addFormEnabled}>
          <form onSubmit={handleAddCashRegister}>
            <div className={styles.form_container_input_container}>
              <label className={styles.form_container_input_label}>Nombre</label>
              <input
                ref={addingCashRegisterNameInputRef}
                className={styles.form_container_input}
                value={addingCashRegisterName}
                onChange={event => setAddingCashRegisterName(event.target.value)}
              />
            </div>
            <div className={styles.form_container_input_container}>
              <label className={styles.form_container_input_label}>Ubicación</label>
              <input
                className={styles.form_container_input}
                value={addingCashRegisterLocationDescription}
                onChange={event => setAddingCashRegisterLocationDescription(event.target.value)}
              />
            </div>
            <div className={styles.form_container_input_container}>
              <label className={styles.form_container_input_label}>
                Tipo de entrada de cantidad
              </label>
              <select className={viewStyles.select} onChange={handleAddQuantityInputType}>
                <option value={CashRegisterQuantityInputType.MANUAL}>Manual</option>
                <option value={CashRegisterQuantityInputType.PRODUCT_SCAN}>
                  Escaneo de producto
                </option>
              </select>
            </div>
            <div className={styles.form_container_input_container}>
              <label className={styles.form_container_input_label}>
                Asignar precio mayoreo despues de x KG
              </label>
              <input
                className={styles.form_container_input}
                value={addingCashRegisterApplyWholesalePriceAfterXKG}
                onChange={event =>
                  setAddingCashRegisterApplyWholesalePriceAfterXKG(event.target.value)
                }
              />
            </div>
            <div>
              <input type={'submit'} className={viewStyles.primary_button} value={'Guardar'} />
              <button className={viewStyles.secondary_button} onClick={onDisableAddForm}>
                Cancelar
              </button>
            </div>
          </form>
        </div>

        <div className={styles.form_container} hidden={!modifyFormEnabled}>
          <form onSubmit={handleModifyCashRegister}>
            <div className={styles.form_container_input_container}>
              <label className={styles.form_container_input_label}>Nombre</label>
              <input
                ref={modifyingCashRegisterNameInputRef}
                className={styles.form_container_input}
                value={modifyingCashRegisterName}
                onChange={event => setModifyingCashRegisterName(event.target.value)}
              />
            </div>
            <div className={styles.form_container_input_container}>
              <label className={styles.form_container_input_label}>Ubicación</label>
              <input
                className={styles.form_container_input}
                value={modifyingCashRegisterLocationDescription}
                onChange={event => setModifyingCashRegisterLocationDescription(event.target.value)}
              />
            </div>
            <div className={styles.form_container_input_container}>
              <label className={styles.form_container_input_label}>
                Tipo de entrada de cantidad
              </label>
              <select className={viewStyles.select} onChange={handleModifyQuantityInputType}>
                <option
                  value={CashRegisterQuantityInputType.MANUAL}
                  selected={
                    selectedCashRegister?.quantity_input_type ===
                    CashRegisterQuantityInputType.MANUAL
                  }
                >
                  Manual
                </option>
                <option
                  value={CashRegisterQuantityInputType.PRODUCT_SCAN}
                  selected={
                    selectedCashRegister?.quantity_input_type ===
                    CashRegisterQuantityInputType.PRODUCT_SCAN
                  }
                >
                  Escaneo de producto
                </option>
              </select>
              <div className={styles.form_container_input_container}>
                <label className={styles.form_container_input_label}>
                  Asignar precio mayoreo despues de x KG
                </label>
                <input
                  className={styles.form_container_input}
                  value={modifyingCashRegisterApplyWholesalePriceAfterXKG}
                  onChange={event =>
                    setModifyingCashRegisterApplyWholesalePriceAfterXKG(event.target.value)
                  }
                />
              </div>
            </div>
            <div>
              <input type={'submit'} className={viewStyles.primary_button} value={'Guardar'} />
              <button className={viewStyles.secondary_button} onClick={onDisableModifyForm}>
                Cancelar
              </button>
            </div>
          </form>
        </div>

        <div className={styles.form_container} hidden={!assignCashierFormEnabled}>
          <div className={styles.form_container_input_container}>
            <label className={styles.form_container_input_label}>Caja</label>
            <input
              className={styles.form_container_input}
              value={selectedCashRegister?.name}
              disabled={true}
            />
          </div>
          <div className={styles.form_container_input_container}>
            <label className={styles.form_container_input_label}>Cajero</label>
            <select
              className={styles.form_container_input}
              onChange={e => setSelectedCashierEmail(e.target.value)}
            >
              <option value={''}>--</option>
              {cashiers.map(cashier => (
                <option key={cashier.user_email} value={cashier.user_email}>
                  {`${cashier.user_name} (${cashier.user_email})`}
                </option>
              ))}
            </select>
          </div>
          <div>
            <input
              type={'submit'}
              className={viewStyles.primary_button}
              onClick={handleAssignCashier}
              disabled={!selectedCashierEmail}
              value={'Guardar'}
            />
            <button
              className={viewStyles.secondary_button}
              onClick={() => setAssignCashierFormEnabled(false)}
            >
              Cancelar
            </button>
          </div>
        </div>
      </ViewHeader>
      <div>
        <Table
          selectedRowId={String(selectedCashRegister?.id) ?? ''}
          columnNames={[
            'Nombre',
            'Ubicación',
            'Cajero asignado',
            'Tipo de Entrada de Cantidad',
            'Min KG para mayoreo',
          ]}
          rows={cashRegistersForTable}
          onSelectedRow={handleSelectedCashRegister}
        />
      </div>
    </ViewContainer>
  )
}

export default CashRegisters
