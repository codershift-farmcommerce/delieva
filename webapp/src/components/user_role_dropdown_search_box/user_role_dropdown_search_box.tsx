import DropdownSearchBox from 'src/components/dropdown_search_box/dropdown_search_box'
import { UserRole } from 'interface/entities/user'

export type UserRoleDropdownSearchBoxProps = {
  label: string
  onRoleSelected: (roleCode: string) => void
  placeholderText?: string | null
}

const UserRoleDropdownSearchBox = (props: UserRoleDropdownSearchBoxProps) => {
  const { label, onRoleSelected, placeholderText } = props
  const userRoles = Object.values(UserRole).map(role => ({
    id: role,
    name: role,
  }))
  const fixedItems = [{ id: '', name: '' }, ...userRoles]
  return (
    <DropdownSearchBox
      fixedItems={fixedItems}
      onItemSelected={itemId => onRoleSelected(itemId)}
      label={label || 'Rol'}
      placeholderText={placeholderText || 'Seleccione un rol'}
    />
  )
}

export default UserRoleDropdownSearchBox
