import {
  UserManagementCreateUserRQ,
  UserManagementListUsersRQ,
  UserManagementResetUserPasswordRQ,
  UserManagementEnableUserRQ,
  UserManagementDisableUserRQ,
} from '../requests/user_management'
import {
  UserManagementCreateUserRS,
  UserManagementListUsersRS,
  UserManagementResetUserPasswordRS,
  UserManagementEnableUserRS,
  UserManagementDisableUserRS,
} from '../responses/user_management'

export interface UserManagementEndpoints {
  path(): 'user_management'

  listUsers(req: UserManagementListUsersRQ): Promise<UserManagementListUsersRS>

  createUser(
    req: UserManagementCreateUserRQ,
  ): Promise<UserManagementCreateUserRS>

  resetUserPassword(
    req: UserManagementResetUserPasswordRQ,
  ): Promise<UserManagementResetUserPasswordRS>

  enableUser(
    req: UserManagementEnableUserRQ,
  ): Promise<UserManagementEnableUserRS>

  disableUser(
    req: UserManagementDisableUserRQ,
  ): Promise<UserManagementDisableUserRS>
}
