import Koa, { Context } from 'koa'
import { trace } from '@opentelemetry/api'
import sessionHandler from './middleware/session_handler'
import fileUploadHandler from './middleware/file_upload_handler'
import loggingHandler from './middleware/logging_handler'
import apiLogger from './middleware/api_logger'
import dbHandler from './middleware/db_handler'
import cachingHandler from './middleware/caching_handler'
import auditHandler from './middleware/audit_handler'
import errorHandler from './middleware/error_handler'

const Router = require('@koa/router')
const bodyParser = require('koa-bodyparser')
const cors = require('koa-cors')

const PORT = 3003
const app = new Koa()
const router = Router()

export type Endpoint = {
  method: 'get' | 'post'
  path: string
  action: Function
}

export class HttpServer {
  private server: any

  constructor(endpoints: Array<Endpoint>) {
    this.server = require('http').createServer(app.callback())
    router.get('/', async (ctx: Context) => {
      ctx.body = { success: true }
    })

    endpoints.forEach(({ method, path, action }) => {
      const tracer = trace.getTracer(path)
      router[method]('/' + path, async (ctx: Context) => {
        ctx.tracer = tracer
        ctx.body = await action.call({ ctx }, ctx.request.body)
      })
    })
    app.use(bodyParser())
    app.use(loggingHandler)
    app.use(cachingHandler)
    app.use(errorHandler)
    app.use(dbHandler)
    app.use(sessionHandler)
    app.use(apiLogger)
    app.use(auditHandler)
    app.use(fileUploadHandler)
    app.use(
      cors({
        origin: () => '*',
        credentials: true,
        allowHeaders: ['x-session-token', 'x-trace-id'],
      }),
    )
  }
  start() {
    app.use(router.routes())
    this.server.listen(PORT, () => {
      console.log(`API is now running on port ${PORT}`)
    })
  }
}
