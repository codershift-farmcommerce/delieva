export type UserManagementListUsersRQ = {}

export type UserManagementCreateUserRQ = {
  name: string
  email: string
  temporaryPassword: string
  role: string
}

export type UserManagementResetUserPasswordRQ = {
  email: string
  temporaryPassword: string
}

export type UserManagementEnableUserRQ = {
  email: string
}

export type UserManagementDisableUserRQ = {
  email: string
}
