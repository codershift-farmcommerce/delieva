import { Cause } from '../entities/cause'
import { SearchRS } from '../entities/common'

export type CauseAddRS = {
  success: boolean
  cause: Cause
}

export type CauseListRS = {
  causes: Cause[]
}

export type CauseSearchRS = SearchRS<Cause>
