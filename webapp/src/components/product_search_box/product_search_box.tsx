import { SearchBox } from 'src/components/search_box/search_box'
import React, { ForwardedRef } from 'react'
import { ProductClient } from 'src/api/clients/product'
import { SearchResultItem } from 'codershift-farmcommerce-api/entities/common'
import { Product } from 'codershift-farmcommerce-api/entities/product'

const productClient = new ProductClient()

export type ProductSearchBoxProps = {
  label?: string
  onProductSelected: (product: SearchResultItem<Product>) => void
  placeholderText?: string | null
  defaultValue?: string | null
  onQueryChanged?: () => void
  disabled?: boolean
  clearAfterSelection?: boolean
}

const ProductSearchBox = React.forwardRef(
  (props: ProductSearchBoxProps, ref: ForwardedRef<any>) => {
    const {
      label,
      onProductSelected,
      placeholderText,
      defaultValue,
      onQueryChanged,
      disabled,
      clearAfterSelection,
    } = props
    return (
      <SearchBox
        searchEndpoint={productClient.search}
        onItemSelected={itemId => onProductSelected(itemId)}
        label={label || 'Producto'}
        placeholderText={placeholderText || 'Seleccione un producto'}
        defaultValue={defaultValue}
        onQueryChanged={onQueryChanged}
        disabled={disabled}
        clearAfterSelection={clearAfterSelection}
      />
    )
  },
)

export default ProductSearchBox
