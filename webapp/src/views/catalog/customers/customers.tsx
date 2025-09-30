import ViewContainer from 'webapp/src/components/views/container/container'
import Table from 'webapp/src/components/table/table'
import { CustomerClient } from 'webapp/src/api/clients/customer'
import React, { useEffect, useRef, useState } from 'react'
import { Customer } from 'interface/entities/customer'
import ViewHeader from 'webapp/src/components/views/header/header'
import clsx from 'clsx'
import styles from './customers.module.css'
import viewStyles from 'webapp/src/views/views.module.css'
import { toast } from 'react-toastify'

const customerClient = new CustomerClient()
const Customers = () => {
  const [query, setQuery] = useState('')
  const [enableSearchButton, setEnableSearchButton] = useState(true)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null | undefined>(null)
  const [addFormEnabled, setAddFormEnabled] = useState(false)
  const [addingCustomerEmail, setAddingCustomerEmail] = useState<string | null>(null)
  const [addingCustomerName, setAddingCustomerName] = useState<string | null>(null)
  const [addingCustomerAddress, setAddingCustomerAddress] = useState<string | null>(null)
  const [addingCustomerCity, setAddingCustomerCity] = useState<string | null>(null)
  const [addingCustomerPhoneNumber, setAddingCustomerPhoneNumber] = useState<string | null>(null)
  const [addingCustomerShouldAddIEPS, setAddingCustomerShouldAddIEPS] = useState<boolean>(false)
  const [addingCustomerFixedWholesalePriceKG, setAddingCustomerFixedWholesalePriceKG] = useState<
    number | null
  >(null)

  const [modifyFormEnabled, setModifyFormEnabled] = useState(false)
  const [modifyingCustomerEmail, setModifyingCustomerEmail] = useState<string | null>(null)
  const [modifyingCustomerName, setModifyingCustomerName] = useState<string | null>(null)
  const [modifyingCustomerAddress, setModifyingCustomerAddress] = useState<string | null>(null)
  const [modifyingCustomerCity, setModifyingCustomerCity] = useState<string | null>(null)
  const [modifyingCustomerPhoneNumber, setModifyingCustomerPhoneNumber] = useState<string | null>(
    null,
  )
  const [modifyingCustomerShouldAddIEPS, setModifyingCustomerShouldAddIEPS] =
    useState<boolean>(false)
  const [modifyingCustomerFixedWholesalePriceKG, setModifyingCustomerFixedWholesalePriceKG] =
    useState<number | null>(null)

  const searchCustomerInputRef = useRef<HTMLInputElement>(null)
  const addingCustomerNameInputRef = useRef<HTMLInputElement>(null)
  const modifyingCustomerNameInputRef = useRef<HTMLInputElement>(null)

  const getCustomers = async (queryParam?: string) => {
    const response = await customerClient.list({ query: queryParam ?? query, page: 1 })
    setCustomers(response.customers)
  }

  useEffect(() => {
    searchCustomerInputRef.current?.focus()
  }, [])

  const handleGetCustomers = async () => {
    await getCustomers()
    setEnableSearchButton(false)
  }

  const handleChangeQuery = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value)
    setEnableSearchButton(true)
  }

  const handleSearchInputKeyDown = async (event: any) => {
    if (event.keyCode === 13) {
      await getCustomers()
      setEnableSearchButton(false)
    }
  }

  const onEnableAddForm = () => {
    setAddFormEnabled(true)
    setAddingCustomerEmail(null)
    setAddingCustomerName(null)
    setAddingCustomerAddress(null)
    setAddingCustomerCity(null)
    setAddingCustomerPhoneNumber(null)
    setTimeout(() => {
      addingCustomerNameInputRef.current?.focus()
    }, 100)
  }

  const onEnableModifyForm = () => {
    setModifyFormEnabled(true)

    setTimeout(() => {
      modifyingCustomerNameInputRef.current?.focus()
    }, 100)
  }

  const onEnableCustomer = async () => {
    if (!selectedCustomer) {
      return
    }
    if (!confirm('Desea habilitar el cliente?')) {
      return
    }
    const response = await customerClient.enable({ id: selectedCustomer.id })

    if (response.success) {
      await getCustomers()
      selectedCustomer.enabled = true
    } else {
      toast.error('Error al habilitar el cliente')
    }
  }

  const onDisableCustomer = async () => {
    if (!selectedCustomer) {
      return
    }
    if (!confirm('Desea deshabilitar el cliente?')) {
      return
    }
    const response = await customerClient.disable({ id: selectedCustomer.id })

    if (response.success) {
      await getCustomers()
      selectedCustomer.enabled = false
    } else {
      toast.error('Error al deshabilitar el cliente')
    }
  }

  const handleSelectedCustomer = (id: string) => {
    const customer = customers?.find(customer => String(customer.id) === id)
    if (customer === selectedCustomer && !modifyFormEnabled) {
      setSelectedCustomer(null)
      return
    }
    setSelectedCustomer(customer)
    setModifyingCustomerEmail(customer?.email ?? null)
    setModifyingCustomerName(customer?.name ?? null)
    setModifyingCustomerAddress(customer?.address ?? null)
    setModifyingCustomerCity(customer?.city ?? null)
    setModifyingCustomerPhoneNumber(customer?.phone_number ?? null)
    setModifyingCustomerShouldAddIEPS(customer?.should_add_ieps ?? false)
  }

  const onDisableAddForm = () => {
    setAddFormEnabled(false)
  }

  const onDisableModifyForm = () => {
    setModifyFormEnabled(false)
  }

  const handleChangeAddingCustomerFixedWholesalePriceKG = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const value = Number(event.target.value) ?? null
    setAddingCustomerFixedWholesalePriceKG(value)
  }

  const handleChangeModifyingCustomerFixedWholesalePriceKG = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const value = Number(event.target.value) ?? null
    setModifyingCustomerFixedWholesalePriceKG(value)
  }

  const onAddCustomer = async () => {
    const response = await customerClient.add({
      email: addingCustomerEmail ?? '',
      name: addingCustomerName ?? '',
      address: addingCustomerAddress ?? '',
      city: addingCustomerCity ?? '',
      phone_number: addingCustomerPhoneNumber ?? '',
      should_add_ieps: addingCustomerShouldAddIEPS,
      fixed_wholesale_price_kg: addingCustomerFixedWholesalePriceKG ?? null,
    })

    if (response.success) {
      await getCustomers(addingCustomerName ?? '')
      setAddFormEnabled(false)
    } else {
      toast.error('Error al agregar el cliente')
    }
  }

  const onModifyCustomer = async () => {
    if (!selectedCustomer) {
      return
    }

    const response = await customerClient.modify({
      id: selectedCustomer.id,
      email: modifyingCustomerEmail ?? '',
      name: modifyingCustomerName ?? '',
      address: modifyingCustomerAddress ?? '',
      city: modifyingCustomerCity ?? '',
      phone_number: modifyingCustomerPhoneNumber ?? '',
      should_add_ieps: modifyingCustomerShouldAddIEPS,
      fixed_wholesale_price_kg: modifyingCustomerFixedWholesalePriceKG ?? null,
    })

    if (response.success) {
      await getCustomers(modifyingCustomerName ?? '')
      setModifyFormEnabled(false)
    } else {
      alert('Error al modificar el cliente')
    }
  }

  const customersForTable = customers
    ? customers.map((customer, index) => {
        return {
          id: String(customer.id),
          cells: [
            {
              value: index + 1,
            },
            {
              value: customer.enabled ? 'Habilitado' : 'Deshabilitado',
            },
            {
              value: customer.name,
            },
            {
              value: customer.address,
            },
            {
              value: customer.city,
            },
            {
              value: customer.phone_number,
            },
            {
              value: customer.email,
            },
            {
              value: customer.should_add_ieps ? 'Sí' : 'No',
            },
            {
              value:
                `${customer.fixed_wholesale_price_kg} KG` ?? 'Dependiendo del peso en la venta',
            },
          ],
        }
      })
    : []

  return (
    <ViewContainer title={'Clientes'}>
      <ViewHeader flexDirection={'column'}>
        <div>
          <div>
            <input
              value={query}
              ref={searchCustomerInputRef}
              className={viewStyles.search_input}
              onChange={handleChangeQuery}
              onKeyDown={handleSearchInputKeyDown}
              placeholder={'Introduzca (parte del) nombre o dirección del cliente'}
            />
            <button
              onClick={handleGetCustomers}
              disabled={!enableSearchButton}
              className={clsx({
                [viewStyles.disabled_button]: !enableSearchButton,
                [viewStyles.primary_button]: enableSearchButton,
              })}
            >
              Buscar clientes
            </button>
            <div>
              <button
                className={clsx({
                  [viewStyles.secondary_button]: !addFormEnabled && !modifyFormEnabled,
                  [viewStyles.disabled_button]: addFormEnabled || modifyFormEnabled,
                })}
                disabled={addFormEnabled || modifyFormEnabled}
                onClick={onEnableAddForm}
              >
                Agregar Cliente
              </button>
              <button
                disabled={!selectedCustomer || modifyFormEnabled || addFormEnabled}
                className={clsx({
                  [viewStyles.secondary_button]:
                    selectedCustomer && !modifyFormEnabled && !addFormEnabled,
                  [viewStyles.disabled_button]:
                    !selectedCustomer || modifyFormEnabled || addFormEnabled,
                })}
                onClick={onEnableModifyForm}
              >
                Modificar Cliente
              </button>
              <button
                disabled={!selectedCustomer || modifyFormEnabled || addFormEnabled}
                className={clsx({
                  [viewStyles.secondary_button]:
                    selectedCustomer &&
                    !modifyFormEnabled &&
                    !addFormEnabled &&
                    !selectedCustomer.enabled,
                  [viewStyles.disabled_button]:
                    !selectedCustomer ||
                    modifyFormEnabled ||
                    addFormEnabled ||
                    selectedCustomer.enabled,
                })}
                onClick={onEnableCustomer}
              >
                Habilitar Cliente
              </button>
              <button
                disabled={
                  !selectedCustomer ||
                  modifyFormEnabled ||
                  addFormEnabled ||
                  !selectedCustomer.enabled
                }
                className={clsx({
                  [viewStyles.secondary_button]:
                    selectedCustomer &&
                    !modifyFormEnabled &&
                    !addFormEnabled &&
                    selectedCustomer.enabled,
                  [viewStyles.disabled_button]:
                    !selectedCustomer ||
                    modifyFormEnabled ||
                    addFormEnabled ||
                    !selectedCustomer.enabled,
                })}
                onClick={onDisableCustomer}
              >
                Deshabilitar Cliente
              </button>
            </div>
            {addFormEnabled && (
              <div className={styles.form_container}>
                <div className={styles.form_container_input_container}>
                  <label className={styles.form_container_input_label}>Nombre</label>
                  <input
                    ref={addingCustomerNameInputRef}
                    className={styles.form_container_input}
                    value={addingCustomerName || ''}
                    onChange={event => setAddingCustomerName(event.target.value.toUpperCase())}
                  />
                </div>
                <div className={styles.form_container_input_container}>
                  <label className={styles.form_container_input_label}>Dirección</label>
                  <input
                    className={clsx(
                      styles.form_container_input,
                      styles.form_container_input_address,
                    )}
                    value={addingCustomerAddress || ''}
                    onChange={event => setAddingCustomerAddress(event.target.value.toUpperCase())}
                  />
                </div>
                <div className={styles.form_container_input_container}>
                  <label className={styles.form_container_input_label}>Ciudad</label>
                  <input
                    className={styles.form_container_input}
                    value={addingCustomerCity || ''}
                    onChange={event => setAddingCustomerCity(event.target.value.toUpperCase())}
                  />
                </div>
                <div className={styles.form_container_input_container}>
                  <label className={styles.form_container_input_label}>Teléfono</label>
                  <input
                    className={styles.form_container_input}
                    value={addingCustomerPhoneNumber || ''}
                    onChange={event =>
                      setAddingCustomerPhoneNumber(event.target.value.toUpperCase())
                    }
                  />
                </div>
                <div className={styles.form_container_input_container}>
                  <label className={styles.form_container_input_label}>Email</label>
                  <input
                    className={styles.form_container_input}
                    value={addingCustomerEmail || ''}
                    onChange={event => setAddingCustomerEmail(event.target.value.toUpperCase())}
                  />
                </div>
                <div className={styles.form_container_input_container}>
                  <label className={styles.form_container_input_label}>Agregar IEPS</label>
                  <input
                    type={'checkbox'}
                    checked={addingCustomerShouldAddIEPS}
                    onChange={event => setAddingCustomerShouldAddIEPS(event.target.checked)}
                  />
                </div>
                <div className={styles.form_container_input_container}>
                  <label className={styles.form_container_input_label}>Precio Mayoreo</label>
                  <select
                    className={viewStyles.select}
                    onChange={event => handleChangeAddingCustomerFixedWholesalePriceKG(event)}
                  >
                    <option value="">Dependiendo del peso en la venta</option>
                    <option value="10">Fijo a 10KG</option>
                    <option value="20">Fijo a 20KG</option>
                    <option value="100">Fijo a 100KG</option>
                  </select>
                </div>
                <div className={styles.form_container_buttons}>
                  <button className={viewStyles.primary_button} onClick={onAddCustomer}>
                    Guardar
                  </button>
                  <button className={viewStyles.secondary_button} onClick={onDisableAddForm}>
                    Cancelar
                  </button>
                </div>
              </div>
            )}
            {modifyFormEnabled && (
              <div className={styles.form_container}>
                <div className={styles.form_container_input_container}>
                  <label className={styles.form_container_input_label}>Nombre</label>
                  <input
                    ref={modifyingCustomerNameInputRef}
                    className={styles.form_container_input}
                    value={modifyingCustomerName || ''}
                    onChange={event => setModifyingCustomerName(event.target.value.toUpperCase())}
                  />
                </div>
                <div className={styles.form_container_input_container}>
                  <label className={styles.form_container_input_label}>Dirección</label>
                  <input
                    className={clsx(
                      styles.form_container_input,
                      styles.form_container_input_address,
                    )}
                    value={modifyingCustomerAddress || ''}
                    onChange={event =>
                      setModifyingCustomerAddress(event.target.value.toUpperCase())
                    }
                  />
                </div>
                <div className={styles.form_container_input_container}>
                  <label className={styles.form_container_input_label}>Ciudad</label>
                  <input
                    className={styles.form_container_input}
                    value={modifyingCustomerCity || ''}
                    onChange={event => setModifyingCustomerCity(event.target.value.toUpperCase())}
                  />
                </div>
                <div className={styles.form_container_input_container}>
                  <label className={styles.form_container_input_label}>Teléfono</label>
                  <input
                    className={styles.form_container_input}
                    value={modifyingCustomerPhoneNumber || ''}
                    onChange={event =>
                      setModifyingCustomerPhoneNumber(event.target.value.toUpperCase())
                    }
                  />
                </div>
                <div className={styles.form_container_input_container}>
                  <label className={styles.form_container_input_label}>Email</label>
                  <input
                    className={styles.form_container_input}
                    value={modifyingCustomerEmail || ''}
                    onChange={event => setModifyingCustomerEmail(event.target.value.toUpperCase())}
                  />
                </div>
                <div className={styles.form_container_input_container}>
                  <label className={styles.form_container_input_label}>Agregar IEPS</label>
                  <input
                    type={'checkbox'}
                    checked={modifyingCustomerShouldAddIEPS}
                    onChange={event => setModifyingCustomerShouldAddIEPS(event.target.checked)}
                  />
                </div>
                <div className={styles.form_container_input_container}>
                  <label className={styles.form_container_input_label}>Precio Mayoreo</label>
                  <select
                    className={viewStyles.select}
                    onChange={event => handleChangeModifyingCustomerFixedWholesalePriceKG(event)}
                  >
                    <option value="">Dependiendo del peso en la venta</option>
                    <option value="10">Fijo a 10KG</option>
                    <option value="20">Fijo a 20KG</option>
                    <option value="100">Fijo a 100KG</option>
                  </select>
                </div>
                <div className={styles.form_container_buttons}>
                  <button className={viewStyles.primary_button} onClick={onModifyCustomer}>
                    Guardar
                  </button>
                  <button className={viewStyles.secondary_button} onClick={onDisableModifyForm}>
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </ViewHeader>
      <div>
        <Table
          selectedRowId={String(selectedCustomer?.id)}
          columnNames={[
            '#',
            'Status',
            'Nombre',
            'Dirección',
            'Ciudad',
            'Teléfono',
            'Email',
            'IEPS',
            'Precio Mayoreo',
          ]}
          rows={customersForTable}
          onSelectedRow={handleSelectedCustomer}
        />
      </div>
    </ViewContainer>
  )
}

export default Customers
