import { Ctx } from 'src/app/context'
import { LogLevel } from 'src/util/logging/logger'
import { LogType } from 'src/util/logging/logType'

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
