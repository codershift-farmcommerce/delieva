import {
  CauseAddRQ,
  CauseFilter,
  CauseListRQ,
  CauseSearchRQ,
} from '../requests/cause'
import { CauseAddRS, CauseListRS, CauseSearchRS } from '../responses/cause'
import { SearchRQ } from '../entities/common'

export interface CauseEndpoints {
  path(): 'cause'

  add(req: CauseAddRQ): Promise<CauseAddRS>

  list(req: CauseListRQ): Promise<CauseListRS>

  search(req: SearchRQ<CauseFilter>): Promise<CauseSearchRS>
}
