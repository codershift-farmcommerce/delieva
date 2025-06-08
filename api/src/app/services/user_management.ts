import { UserManagementEndpoints } from 'interface/endpoints/user_management'
import {
  UserManagementCreateUserRQ,
  UserManagementDisableUserRQ,
  UserManagementEnableUserRQ,
  UserManagementListUsersRQ,
  UserManagementResetUserPasswordRQ,
} from 'interface/requests/user_management'
import {
  UserManagementCreateUserRS,
  UserManagementDisableUserRS,
  UserManagementEnableUserRS,
  UserManagementListUsersRS,
  UserManagementResetUserPasswordRS,
} from 'interface/responses/user_management'
import { action } from 'api/src/app/context/decorators/endpoint_actions'
import * as user from 'api/src/app/models/user'
import { Ctx } from 'api/src/app/context'
import { Application } from 'interface'

export class UserManagementService implements UserManagementEndpoints {
  private ctx: Ctx

  path(): 'user_management' {
    return 'user_management'
  }

  @action({ forApp: Application.SYSTEM_MANAGEMENT })
  listUsers(
    req: UserManagementListUsersRQ,
  ): Promise<UserManagementListUsersRS> {
    return user.getAll(this.ctx)
  }

  @action({ forApp: Application.SYSTEM_MANAGEMENT })
  createUser(
    req: UserManagementCreateUserRQ,
  ): Promise<UserManagementCreateUserRS> {
    return user.create(this.ctx, req)
  }

  @action({ forApp: Application.SYSTEM_MANAGEMENT })
  resetUserPassword(
    req: UserManagementResetUserPasswordRQ,
  ): Promise<UserManagementResetUserPasswordRS> {
    return user.resetPassword(this.ctx, req)
  }

  @action({ forApp: Application.SYSTEM_MANAGEMENT })
  enableUser(
    req: UserManagementEnableUserRQ,
  ): Promise<UserManagementEnableUserRS> {
    return user.enable(this.ctx, req)
  }

  @action({ forApp: Application.SYSTEM_MANAGEMENT })
  disableUser(
    req: UserManagementDisableUserRQ,
  ): Promise<UserManagementDisableUserRS> {
    return user.disable(this.ctx, req)
  }
}
