import { Context } from 'koa'

const response = (
  success: boolean,
  status: number,
  ctx: Context,
  body = {},
) => {
  ctx.status = status
  ctx.body = {
    ...body,
    success,
  }
  return ctx
}

const success = (status: number, ctx: Context, body = {}) =>
  response(true, status, ctx, body)
const error = (status: number, ctx: Context, body = {}) =>
  response(false, status, ctx, body)

// Success functions
const ok = (ctx: Context, body = {}) => success(200, ctx, body)
const created = (ctx: Context, body = {}) => success(201, ctx, body)

// Error functions
const badRequest = (ctx: Context, body = {}) => error(400, ctx, body)
const unauthorized = (ctx: Context, body = {}) => error(401, ctx, body)
const forbidden = (ctx: Context, body = {}) => error(403, ctx, body)
const notFound = (ctx: Context, body = {}) => error(404, ctx, body)
const unprocessable = (ctx: Context, body = {}) => error(422, ctx, body)
const conflict = (ctx: Context, body = {}) => error(409, ctx, body)
const serverError = (ctx: Context, body = {}) => error(500, ctx, body)

export const respondWith = {
  ok,
  created,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  unprocessable,
  serverError,
  conflict,
}
