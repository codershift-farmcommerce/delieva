import { ApiErrorCode } from 'lib/entities/api_error_code'

export type MissingInfoProperties = {
}

export type AppErrorProperties<T> = T extends ApiErrorCode.MissingInfo
  ? MissingInfoProperties
  : T extends ApiErrorCode.NotFound
  ? {}
  : T extends ApiErrorCode.Unauthorized
  ? {}
  : never

export type CodeType =
  | ApiErrorCode.NotFound
  | ApiErrorCode.Unauthorized
  | ApiErrorCode.MissingInfo
