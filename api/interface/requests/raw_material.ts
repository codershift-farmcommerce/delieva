import { SearchRQ } from '../entities/common'

export type RawMaterialAddRQ = {
  code: string
  name: string
}

export type RawMaterialModifyRQ = {
  code: string
  name: string
}

export type RawMaterialListRQ = {
  query: string
  page: number
}

export type RawMaterialSearchRQ = SearchRQ
