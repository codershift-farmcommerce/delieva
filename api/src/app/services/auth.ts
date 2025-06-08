import * as bcrypt from 'bcrypt'
import * as crypto from 'crypto'
import * as Bluebird from 'bluebird'
import { AuthEndpoints } from 'interface/endpoints/auth'
import {
  AuthChangePasswordRQ,
  AuthGenerateAuthorizationCodeRQ,
  AuthLoginRQ,
  AuthLogoutRQ,
} from 'interface/requests/auth'
import {
  AuthChangePasswordRS,
  AuthGenerateAuthorizationCodeRS,
  AuthLoginRS,
  AuthLogoutRS,
} from 'interface/responses/auth'
import { Ctx, SessionData } from 'api/src/app/context'
import * as userModel from 'api/src/app/models/user'
import * as userAuthorizationCodeModel from 'api/src/app/models/user_authorization_code'
import { redisKeysForSession } from 'api/src/util/redis'
import {
  action,
  unsecured_action,
} from 'api/src/app/context/decorators/endpoint_actions'
import { LogType } from 'api/src/util/logging/logType'
import { LogLevel } from 'api/src/util/logging/logger'
import { UserRole, UserRoleApplications } from 'interface/entities/user'
import { Application } from 'interface'
import { DATABASE } from 'api/setup/db/types'

export const SessionTimeByApplication: Record<Application, number> = {
  [Application.SYSTEM_MANAGEMENT]: hoursToSeconds(18),
  [Application.ADMIN]: hoursToSeconds(18),
  [Application.POS]: hoursToSeconds(18),
  [Application.CUSTOMER_CREDIT]: hoursToSeconds(18),
}

export class AuthService implements AuthEndpoints {
  private ctx: Ctx

  path(): 'auth' {
    return 'auth'
  }

  @unsecured_action()
  async login(req: AuthLoginRQ): Promise<AuthLoginRS> {
    const { email, password } = req

    const user = await userModel.getByEmail(this.ctx, email)
    if (!user || !user.enabled) {
      return {
        success: false,
      }
    }
    const roles = await userModel.getAssignedRoles(this.ctx, user.email)

    const isSuccessful = await bcrypt.compare(
      password,
      user.password.replace('$2y$', '$2a$'),
    )
    if (!isSuccessful) {
      return {
        success: false,
      }
    }

    const sessionData: SessionData = {
      user_id: user.id,
      user_email: user.email,
      roles,
    }
    const sessionToken = await createSession(this.ctx, sessionData)

    return {
      success: true,
      sessionToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        must_change_password: user.must_change_password,
        enabled: user.enabled,
        roles,
      },
    }
  }

  @action({ forApps: [Application.ADMIN, Application.POS] })
  async logout(req: AuthLogoutRQ): Promise<AuthLogoutRS> {
    const { sessionToken } = req
    try {
      const applicationsForRole = getRoleApplications(this.ctx.session.roles)
      for (const application of applicationsForRole) {
        await this.ctx.redis.del(redisKeysForSession(sessionToken, application))
      }
      return {
        success: true,
      }
    } catch (error: any) {
      this.ctx.log({
        type: LogType.APP_ERROR,
        level: LogLevel.ERROR,
        message: error.message,
      })
      return {
        success: false,
      }
    }
  }

  @unsecured_action()
  async changePassword(
    req: AuthChangePasswordRQ,
  ): Promise<AuthChangePasswordRS> {
    const { email, oldPassword } = req
    const user = await userModel.getByEmail(this.ctx, email)
    if (!user) {
      return {
        success: false,
      }
    }
    const isSuccessful = await bcrypt.compare(
      oldPassword,
      user.password.replace('$2y$', '$2a$'),
    )
    if (!isSuccessful) {
      return {
        success: false,
      }
    }
    return userModel.changePassword(this.ctx, req)
  }

  @action({ forApps: [Application.ADMIN] })
  async generateAuthorizationCode(
    req: AuthGenerateAuthorizationCodeRQ,
  ): Promise<AuthGenerateAuthorizationCodeRS> {
    return userAuthorizationCodeModel.generateAuthorizationCode(this.ctx, req)
  }
}

function makeSessionId() {
  return crypto.randomBytes(20).toString('hex')
}

const UnrestrictedDatabases = [DATABASE.ADMIN, DATABASE.TEST]
const DatabaseAllowedApplications: Partial<Record<DATABASE, Application[]>> = {
  [DATABASE.DELIEVA]: [
    Application.SYSTEM_MANAGEMENT,
    Application.ADMIN,
    Application.POS,
    Application.CUSTOMER_CREDIT,
  ],
}

async function createSession(ctx: Ctx, sessionData: SessionData) {
  const sessionToken = makeSessionId()
  const json = JSON.stringify(sessionData)
  const allowedApplications = Object.values(Application).filter(app =>
    sessionData.roles.find(
      (role: UserRole) =>
        UserRoleApplications[role].includes(app) &&
        (UnrestrictedDatabases.includes(ctx.dbName) ||
          DatabaseAllowedApplications?.[ctx.dbName]?.includes(app)),
    ),
  )
  await Bluebird.each(allowedApplications, async application => {
    const sessionTime = SessionTimeByApplication[application]
    await ctx.redis.setex(
      redisKeysForSession(sessionToken, application),
      sessionTime,
      json,
    )
  })

  return sessionToken
}

function minutesToSeconds(minutes: number) {
  return minutes * 60
}

function hoursToSeconds(hours: number) {
  return hours * 60 * 60
}

function getRoleApplications(roles: UserRole[]): Application[] {
  const applicationSet = new Set<Application>()
  for (const role of roles) {
    for (const app of UserRoleApplications[role]) {
      applicationSet.add(app)
    }
  }
  return Array.from(applicationSet)
}
