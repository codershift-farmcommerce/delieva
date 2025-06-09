import { SearchBox } from 'src/components/search_box/search_box'
import React, { ForwardedRef } from 'react'
import { SearchResultItem } from 'interface/entities/common'
import { Cause, CauseAction } from 'interface/entities/cause'
import { CauseClient } from 'src/api/clients/cause_client'

const cashRegisterWithdrawalCauseClient = new CauseClient()

export type CauseSearchBoxProps = {
  cause_action: CauseAction
  label?: string
  onCauseSelected: (resultItem: SearchResultItem<Cause>) => void
  placeholderText?: string | null
  defaultValue?: string | null
  onQueryChanged?: (value?: string) => void
  disabled?: boolean
}

const CauseSearchBox = React.forwardRef((props: CauseSearchBoxProps, ref: ForwardedRef<any>) => {
  const {
    cause_action,
    label,
    onCauseSelected,
    placeholderText,
    defaultValue,
    onQueryChanged,
    disabled,
  } = props
  return (
    <SearchBox
      searchEndpoint={cashRegisterWithdrawalCauseClient.search}
      filters={{ cause_action }}
      onItemSelected={itemId => onCauseSelected(itemId)}
      label={'Causa:'}
      placeholderText={placeholderText || 'Ingrese o seleccione una causa'}
      defaultValue={defaultValue}
      onQueryChanged={value => onQueryChanged && onQueryChanged(value)}
      disabled={disabled}
      leaveDefaultValueOnBlur={true}
    />
  )
})

export default CauseSearchBox
