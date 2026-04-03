import { Ctx } from 'api/src/app/context'
import { ApiError } from 'api/src/app/context/api_error'
import { ApiErrorCode } from 'interface/entities/api_error_code'
import { ApiErrorRS } from 'interface/entities/common'

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
  })
}
