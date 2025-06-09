import { CauseEndpoints } from 'interface/endpoints/cause'
import { CauseAddRQ, CauseFilter, CauseListRQ, CauseSearchRQ } from 'interface/requests/cause'
import { CauseAddRS, CauseListRS, CauseSearchRS } from 'interface/responses/cause'
import { sendRequest } from '../request'
import { SearchRQ } from 'interface/entities/common'

export class CauseClient implements CauseEndpoints {
  path(): 'cause' {
    return 'cause'
  }

  add(req: CauseAddRQ): Promise<CauseAddRS> {
    return sendRequest('/cause/add', req)
  }

  list(req: CauseListRQ): Promise<CauseListRS> {
    return sendRequest('/cause/list', req)
  }

  search(req: SearchRQ<CauseFilter>): Promise<CauseSearchRS> {
    return sendRequest('/cause/search', req)
  }
}
