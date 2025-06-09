import { Ctx } from 'api/src/app/context'
import { getClient } from 'api/setup/db/client'
import { LogLevel } from 'api/src/util/logging/logger'
import { LogType } from 'api/src/util/logging/logType'
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
  ctx.knex.on('query', function (query: any) {
    let bindings = query.bindings
    if (query.sql.includes('users')) {
      bindings = null
    }
    ctx.log({
      level: LogLevel.INFO,
      type: LogType.SQL_QUERY,
      message: {
        id: query.__knexQueryUid,
        database: ctx.knex.client.database(),
        query: query.sql.replaceAll('"', ''),
        bindings,
      },
    })
  })
  ctx.knex.on('query-response', function (result: any, query: any) {
    let bindings = query.bindings
    if (query.sql.includes('users')) {
      bindings = null
    }
    ctx.log({
      level: LogLevel.INFO,
      type: LogType.SQL_RESPONSE,
      message: {
        id: query.__knexQueryUid,
        database: ctx.knex.client.database(),
        query: query.sql.replaceAll('"', ''),
        bindings,
        result: result?.rows || result,
      },
    })
  })
  ctx.knex.on('query-error', function (error: any, query: any) {
    ctx.log({
      level: LogLevel.ERROR,
      type: LogType.SQL_ERROR,
      message: {
        id: query.__knexQueryUid,
        database: ctx.knex.client.database(),
        error,
        query,
      },
    })
  })
  await next()
  ctx.knex.removeAllListeners('query')
  ctx.knex.removeAllListeners('query-response')
  ctx.knex.removeAllListeners('query-error')
}
