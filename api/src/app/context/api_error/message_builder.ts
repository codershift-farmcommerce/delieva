import {AppErrorProperties, MissingInfoProperties} from './types'
import { ApiErrorCode } from 'interface/entities/api_error_code'

export enum Language {
  es = 'es',
}

export const buildUIMessage: Record<
  Language,
  Partial<Record<ApiErrorCode, (params: any) => string>>
> = {
  [Language.es]: {
    [ApiErrorCode.Unauthorized]: () => {
      return 'Acceso no autorizado'
    },
    [ApiErrorCode.MissingInfo]: (
      params: MissingInfoProperties,
    ) => {
      return `Información no encontrada.`
    },
  },
}

export const defaultUIMessage: Record<Language, string> = {
  [Language.es]: 'Ha ocurrido un error.',
}
