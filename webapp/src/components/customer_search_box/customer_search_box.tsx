import { SearchBox } from 'src/components/search_box/search_box'
import React, { ForwardedRef } from 'react'
import { CustomerClient } from 'src/api/clients/customer'
import { SearchResultItem } from 'codershift-farmcommerce-api/entities/common'
import { Customer } from 'codershift-farmcommerce-api/entities/customer'

const customerClient = new CustomerClient()

export type CustomerSearchBoxProps = {
  label?: string
  onCustomerSelected: (resultItem: SearchResultItem<Customer>) => void
  placeholderText?: string | null
  defaultValue?: string | null
  onQueryChanged?: () => void
  disabled?: boolean
}

const CustomerSearchBox = React.forwardRef(
  (props: CustomerSearchBoxProps, ref: ForwardedRef<any>) => {
    const { label, onCustomerSelected, placeholderText, defaultValue, onQueryChanged, disabled } =
      props
    return (
      <SearchBox
        searchEndpoint={customerClient.search}
        onItemSelected={itemId => onCustomerSelected(itemId)}
        label={'Cliente'}
        placeholderText={placeholderText || 'Seleccione un cliente'}
        defaultValue={defaultValue}
        onQueryChanged={onQueryChanged}
        disabled={disabled}
      />
    )
  },
)

export default CustomerSearchBox
