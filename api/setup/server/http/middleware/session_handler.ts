import { Ctx } from 'src/app/context'
import { Application } from 'lib'
import { redisKeysForSession } from 'src/util/redis'
import {
  actionApplications,
  unsecuredActions,
} from 'src/app/context/decorators/endpoint_actions'
import { throwApiError } from 'src/app/context/api_error'
import { ApiErrorCode } from 'lib/entities/api_error_code'

export default async (ctx: Ctx, next: Function) => {
  const path = ctx.path.slice(1)
  if (unsecuredActions.includes(path) || path === '') {
    return await next()
  }
  if (!actionApplications?.[path]) {
    throwApiError(ApiErrorCode.NotFound, {}, 404)
  }
  const sessionToken = ctx.request.headers['x-session-token'] as string

  if (sessionToken) {
    const activeApplications: Application[] = []
    let rawSessionData
    const allowedApplications = actionApplications?.[path] ?? []
    for await (const application of allowedApplications) {
      const data = await ctx.redis.get(
        redisKeysForSession(sessionToken, application),
      )
      if (data) {
        rawSessionData = data
        activeApplications.push(application)
      }
    }
    if (!activeApplications.length) {
      throwApiError(ApiErrorCode.Unauthorized, {}, 401)
    }
    ctx.session = JSON.parse(rawSessionData)
    await next()
  } else {
    throwApiError(ApiErrorCode.Unauthorized, {}, 401)
  }
}
