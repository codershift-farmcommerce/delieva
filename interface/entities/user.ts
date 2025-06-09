import { Application } from '../index'

export type User = {
  id: number
  name: string
  email: string
  must_change_password: string
  enabled: boolean
}

export type UserWithRoles = User & {
  roles: UserRole[]
}

export enum UserRole {
  ADMIN = 'ADMIN',
  CASHIER = 'CASHIER',
  SUDO = 'SUDO',
}

//TODO move this to an API call
export const UserRoleApplications: Record<UserRole, Application[]> = {
  [UserRole.SUDO]: [
    Application.ADMIN,
    Application.SYSTEM_MANAGEMENT,
    Application.POS,
    Application.CUSTOMER_CREDIT,
  ],
  [UserRole.ADMIN]: [
    Application.ADMIN,
    Application.POS,
    Application.CUSTOMER_CREDIT,
  ],
  [UserRole.CASHIER]: [Application.POS, Application.CUSTOMER_CREDIT],
}
