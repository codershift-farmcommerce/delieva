import { ApiErrorCode } from 'interface/entities/api_error_code'
import { buildUIMessage, defaultUIMessage, Language } from './message_builder'
import { AppErrorProperties, CodeType } from './types'

const defaultUILanguage = Language.es

type AppErrorProps = {
  code: ApiErrorCode
  uiMessage: string
  statusCode: number
  properties?: Record<string, any>
}

export class ApiError extends Error {
  private readonly _code: ApiErrorCode
  private readonly _uiMessage: string
  private readonly _statusCode: number
  private readonly _properties?: Record<string, any>

  constructor(message: string, props: AppErrorProps) {
    super(message)
    const { code, uiMessage, statusCode, properties } = props
    this._code = code
    this._uiMessage = uiMessage
    this._statusCode = statusCode
    this._properties = properties
  }

  get code(): ApiErrorCode {
    return this._code
  }

  get uiMessage(): string {
    return this._uiMessage
  }

  get statusCode(): number {
    return this._statusCode
  }

  get properties(): Record<string, any> | undefined {
    return this._properties
  }
}

export function throwApiError<T extends CodeType>(
  code: T,
  properties: AppErrorProperties<T>,
  statusCode: number = 500,
) {
  const message = code
  const uiMessage =
    buildUIMessage[defaultUILanguage][code]?.(properties) ??
    defaultUIMessage[defaultUILanguage]
  throw new ApiError(message, {
    code,
    uiMessage,
    statusCode,
    properties,
  })
}
