import { Ctx } from 'src/app/context'
import { ApiError } from 'src/app/context/api_error'
import { ApiErrorCode } from 'lib/entities/api_error_code'
import { LogLevel } from 'src/util/logging/logger'
import { LogType } from 'src/util/logging/logType'
import { ApiErrorRS } from 'lib/entities/common'

export default async (ctx: Ctx, next: Function) => {
  return next().catch((err: Error | ApiError) => {
    let code = ApiErrorCode.Unknown
    let statusCode = 500
    let message = err.message
    let properties
    if (err instanceof ApiError) {
      code = err.code
      statusCode = err.statusCode
      message = err.uiMessage
      properties = err.properties
    }
    ctx.type = 'json'
    ctx.status = statusCode || 500
    const response: ApiErrorRS = {
      success: false,
      error: {
        code,
        message,
        properties,
      },
    }
    ctx.body = response
    ctx.log({
      level: LogLevel.INFO,
      type: LogType.API_OUT_RESPONSE,
      message: response,
    })
  })
}
