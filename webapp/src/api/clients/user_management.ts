import { UserManagementEndpoints } from 'interface/endpoints/user_management'
import {
  UserManagementCreateUserRQ,
  UserManagementListUsersRQ,
  UserManagementResetUserPasswordRQ,
  UserManagementEnableUserRQ,
  UserManagementDisableUserRQ,
} from 'interface/requests/user_management'
import {
  UserManagementCreateUserRS,
  UserManagementListUsersRS,
  UserManagementResetUserPasswordRS,
  UserManagementEnableUserRS,
  UserManagementDisableUserRS,
} from 'interface/responses/user_management'
import { sendRequest } from 'webapp/src/api/request'

export class UserManagementClient implements UserManagementEndpoints {
  path(): 'user_management' {
    return 'user_management'
  }

  createUser(req: UserManagementCreateUserRQ): Promise<UserManagementCreateUserRS> {
    return sendRequest('/user_management/createUser', req)
  }

  listUsers(req: UserManagementListUsersRQ): Promise<UserManagementListUsersRS> {
    return sendRequest('/user_management/listUsers', req)
  }

  resetUserPassword(
    req: UserManagementResetUserPasswordRQ,
  ): Promise<UserManagementResetUserPasswordRS> {
    return sendRequest('/user_management/resetUserPassword', req)
  }

  enableUser(req: UserManagementEnableUserRQ): Promise<UserManagementEnableUserRS> {
    return sendRequest('/user_management/enableUser', req)
  }

  disableUser(req: UserManagementDisableUserRQ): Promise<UserManagementDisableUserRS> {
    return sendRequest('/user_management/disableUser', req)
  }
}
