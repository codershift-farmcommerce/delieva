import { SearchBox } from 'src/components/search_box/search_box'
import React, { ForwardedRef } from 'react'
import { SearchResultItem } from 'interface/entities/common'
import { FinishedProduct } from 'interface/entities/finished_product'
import { FinishedProductClient } from 'src/api/clients/finished_product'

const finishedProductClient = new FinishedProductClient()

export type FinishedProductSearchBoxProps = {
  label?: string
  onFinishedProductSelected: (finishProduct: SearchResultItem<FinishedProduct>) => void
  placeholderText?: string | null
  defaultValue?: string | null
  onQueryChanged?: () => void
  disabled?: boolean
}

const FinishedProductSearchBox = React.forwardRef(
  (props: FinishedProductSearchBoxProps, ref: ForwardedRef<any>) => {
    const {
      label,
      onFinishedProductSelected,
      placeholderText,
      defaultValue,
      onQueryChanged,
      disabled,
    } = props
    return (
      <SearchBox
        searchEndpoint={finishedProductClient.search}
        onItemSelected={itemId => onFinishedProductSelected(itemId)}
        label={'Producto terminado'}
        placeholderText={placeholderText || 'Seleccione un producto terminado'}
        defaultValue={defaultValue}
        onQueryChanged={onQueryChanged}
        disabled={disabled}
      />
    )
  },
)

export default FinishedProductSearchBox
