import { ApiErrorCode } from './api_error_code'

export type SearchRQ<T = null> = {
  query: string
  filters?: T
}

export type SearchResultItem<T> = {
  id: number | string
  name: string
  data: T
}

export type SearchRS<T> = {
  data: SearchResultItem<T>[]
}

type ApiSuccessfulRS<T> = {
  success: true
  data?: T | null
}

export type ApiErrorRS = {
  success: false
  error?: {
    code?: ApiErrorCode
    message: string
    properties?: Record<string, string>
  }
}

export type ApiResponse<T> = ApiSuccessfulRS<T> | ApiErrorRS
