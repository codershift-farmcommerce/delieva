import * as bcrypt from 'bcrypt'
import { Ctx } from 'api/src/app/context'
import { UserRole, UserWithRoles } from 'interface/entities/user'
import {
  UserManagementCreateUserRS,
  UserManagementDisableUserRS,
  UserManagementEnableUserRS,
  UserManagementListUsersRS,
  UserManagementResetUserPasswordRS,
} from 'interface/responses/user_management'
import {
  UserManagementCreateUserRQ,
  UserManagementDisableUserRQ,
  UserManagementEnableUserRQ,
  UserManagementResetUserPasswordRQ,
} from 'interface/requests/user_management'
import { AuthChangePasswordRQ } from 'interface/requests/auth'
import { AuthChangePasswordRS } from 'interface/responses/auth'
import { Knex } from 'knex'
import Transaction = Knex.Transaction
import { getUserEmailByAuthorizationCodeAndRemoveCode } from './user_authorization_code'

export type UserWithPassword = {
  id: number
  name: string
  email: string
  must_change_password: string
  enabled: boolean
  password: string
}

const TABLE_NAME = 'users'

export async function create(
  ctx: Ctx,
  req: UserManagementCreateUserRQ,
): Promise<UserManagementCreateUserRS> {
  const { name, email, temporaryPassword, role } = req
  const password = await bcrypt.hash(temporaryPassword, 12)

  await ctx.knex.transaction(async function (trx: Transaction) {
    await trx(TABLE_NAME).insert({
      name,
      email,
      password,
      must_change_password: true,
    })
    await trx('assigned_role').insert({
      user_email: email,
      role_code: role,
    })
    ctx.audit({ description: 'User created.', newValue: email })
  })

  return {
    success: true,
  }
}

export async function getByEmail(
  ctx: Ctx,
  email: string,
): Promise<UserWithPassword | null> {
  const results = await ctx
    .knex(TABLE_NAME)
    .select(
      'id',
      'name',
      'email',
      'password',
      'must_change_password',
      'enabled',
    )
    .where({
      email,
    })
  if (!results.length) {
    return null
  }
  const user = results[0] as UserWithPassword

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    password: user.password,
    must_change_password: user.must_change_password,
    enabled: user.enabled,
  }
}

export async function getAssignedRoles(
  ctx: Ctx,
  email: string,
): Promise<UserRole[]> {
  const results = await ctx.knex('assigned_role').select('role_code').where({
    user_email: email,
  })

  return results.map(result => result.role_code)
}

export async function getAll(ctx: Ctx): Promise<UserManagementListUsersRS> {
  const { rows } = await ctx.knex.raw(`
    SELECT 
        users.id AS id,
        name, 
        email, 
        must_change_password, 
        enabled, 
        ARRAY_TO_JSON(ARRAY_AGG(ar.role_code))  as roles
    FROM users
    INNER JOIN assigned_role ar ON users.email = ar.user_email
    GROUP BY users.id, name, email, must_change_password, enabled;
  `)
  const users: UserWithRoles[] = rows.map((row: any) => {
    const user: UserWithRoles = {
      id: row.id,
      name: row.name,
      email: row.email,
      roles: row.roles,
      must_change_password: row.must_change_password,
      enabled: row.enabled,
    }
    return user
  })

  return {
    data: users,
  }
}

export async function resetPassword(
  ctx: Ctx,
  req: UserManagementResetUserPasswordRQ,
): Promise<UserManagementResetUserPasswordRS> {
  const { email, temporaryPassword } = req
  const password = await bcrypt.hash(temporaryPassword, 12)

  await ctx
    .knex(TABLE_NAME)
    .update({
      password,
      must_change_password: true,
    })
    .where({
      email,
    })

  return {
    success: true,
  }
}

export async function changePassword(
  ctx: Ctx,
  req: AuthChangePasswordRQ,
): Promise<AuthChangePasswordRS> {
  const { email, newPassword } = req
  const password = await bcrypt.hash(newPassword, 12)

  await ctx
    .knex(TABLE_NAME)
    .update({
      password,
      must_change_password: false,
    })
    .where({
      email,
    })

  return {
    success: true,
  }
}

export async function enable(
  ctx: Ctx,
  req: UserManagementEnableUserRQ,
): Promise<UserManagementEnableUserRS> {
  const { email } = req

  await ctx
    .knex(TABLE_NAME)
    .update({
      enabled: true,
    })
    .where({
      email,
    })
  ctx.audit({
    description: 'User enabled.',
    previousValue: 'disabled',
    newValue: 'enabled',
  })

  return {
    success: true,
  }
}

export async function disable(
  ctx: Ctx,
  req: UserManagementDisableUserRQ,
): Promise<UserManagementDisableUserRS> {
  const { email } = req

  await ctx
    .knex(TABLE_NAME)
    .update({
      enabled: false,
    })
    .where({
      email,
    })

  ctx.audit({
    description: 'User disabled.',
    previousValue: 'enabled',
    newValue: 'disabled',
  })

  return {
    success: true,
  }
}

export async function getAuthorizingAdminUserEmail(
  ctx: Ctx,
  authorizationCode: string,
): Promise<string | null> {
  let authorizedByUserEmail
  const isUserAdmin = ctx.session.roles.includes(UserRole.ADMIN)
  if (!isUserAdmin) {
    authorizedByUserEmail = await getUserEmailByAuthorizationCodeAndRemoveCode(
      ctx,
      authorizationCode,
    )
    if (!authorizedByUserEmail) {
      return null
    }
  }
  return ctx.session.user_email
}
