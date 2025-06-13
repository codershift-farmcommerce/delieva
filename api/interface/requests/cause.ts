import { CauseAction } from '../entities/cause'
import { SearchRQ } from '../entities/common'

export type CauseAddRQ = {
  cause_action: CauseAction
  description: string
}

export type CauseListRQ = {
  query: string
  page: number
}

export type CauseFilter = {
  cause_action: CauseAction
}

export type CauseSearchRQ = SearchRQ<CauseFilter>
