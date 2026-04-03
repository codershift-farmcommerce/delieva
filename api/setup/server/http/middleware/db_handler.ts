import { Ctx } from 'api/src/app/context'
import { getClient } from 'api/setup/db/client'
import { DATABASE, DatabaseTimezone } from 'api/setup/db/types'
import { throwApiError } from 'api/src/app/context/api_error'
import { ApiErrorCode } from 'interface/entities/api_error_code'

export default async (ctx: Ctx, next: Function): Promise<void> => {
  ctx.dbName = ctx.request.headers['x-tenant'] as DATABASE
  if (Object.values(DATABASE).indexOf(ctx.dbName) === -1) {
    throwApiError(ApiErrorCode.Unauthorized, {}, 401)
    return
  }
  const knexClient = getClient(ctx.dbName || DATABASE.DELIEVA)
  if (!knexClient) {
    throwApiError(ApiErrorCode.Unauthorized, {}, 401)
    return
  }
  const clientTimezone = DatabaseTimezone[ctx.dbName]
  await knexClient?.raw(`SET timezone TO '${clientTimezone}';`)
  ctx.knex = knexClient
  await next()
}
