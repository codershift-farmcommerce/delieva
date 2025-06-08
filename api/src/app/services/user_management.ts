import { UserManagementEndpoints } from 'lib/endpoints/user_management'
import {
  UserManagementCreateUserRQ,
  UserManagementDisableUserRQ,
  UserManagementEnableUserRQ,
  UserManagementListUsersRQ,
  UserManagementResetUserPasswordRQ,
} from 'lib/requests/user_management'
import {
  UserManagementCreateUserRS,
  UserManagementDisableUserRS,
  UserManagementEnableUserRS,
  UserManagementListUsersRS,
  UserManagementResetUserPasswordRS,
} from 'lib/responses/user_management'
import { action } from 'src/app/context/decorators/endpoint_actions'
import * as user from 'src/app/models/user'
import { Ctx } from 'src/app/context'
import { Application } from 'lib'

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
