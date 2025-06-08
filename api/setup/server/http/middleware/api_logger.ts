import { Ctx } from 'api/src/app/context'
import { LogLevel } from 'api/src/util/logging/logger'
import { LogType } from 'api/src/util/logging/logType'

export default async (ctx: Ctx, next: Function) => {
  ctx.log({
    level: LogLevel.INFO,
    type: LogType.API_IN_REQUEST,
    message: { path: ctx.request?.path, body: ctx.request?.body },
  })
  await next()
  ctx.log({
    level: LogLevel.INFO,
    type: LogType.API_OUT_RESPONSE,
    message: ctx.response?.body ?? ctx.response
  })
}
