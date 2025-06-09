import { Context } from 'koa'
import * as logger from 'api/src/util/logging/logger'
import { AuthLoginRQ } from 'interface/requests/auth'

export default async (ctx: Context, next: Function) => {
  ctx.log = logger.getChildLogger({
    trace_id: String(ctx.request.headers['x-trace-id']),
    request_id: String(ctx.request.headers['x-request-id']),
    user_email: getUserEmail(ctx),
  })
  await next()
}

function getUserEmail(ctx: Context) {
  if (ctx.session?.user_email) {
    return ctx.session?.user_email
  }
  if (ctx.path.slice(1).includes('login')) {
    const req = ctx.request?.body as AuthLoginRQ
    return req.email
  }
  return 'unknown'
}
