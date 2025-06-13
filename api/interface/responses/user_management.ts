import { UserWithRoles } from '../entities/user'

export type UserManagementListUsersRS = {
  data: UserWithRoles[]
}

export type UserManagementResetUserPasswordRS = {
  success: boolean
}

export type UserManagementCreateUserRS = {
  success: boolean
}

export type UserManagementEnableUserRS = {
  success: boolean
}

export type UserManagementDisableUserRS = {
  success: boolean
}
