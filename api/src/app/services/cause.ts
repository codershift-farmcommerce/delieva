import { SearchRQ } from 'interface/entities/common'
import {
  CauseAddRQ,
  CauseFilter,
  CauseListRQ,
  CauseSearchRQ,
} from 'interface/requests/cause'
import { CauseAddRS, CauseListRS, CauseSearchRS } from 'interface/responses/cause'
import { CauseEndpoints } from 'interface/endpoints/cause'
import { Ctx } from 'api/src/app/context'
import { action } from 'api/src/app/context/decorators/endpoint_actions'
import { Application } from 'interface'
import * as cause from '../models/cause'

export class CauseService implements CauseEndpoints {
  private ctx: Ctx

  path(): 'cause' {
    return 'cause'
  }

  @action({ forApps: [Application.ADMIN, Application.POS] })
  add(req: CauseAddRQ): Promise<CauseAddRS> {
    return cause.add(this.ctx, req)
  }

  @action({ forApps: [Application.ADMIN, Application.POS] })
  list(req: CauseListRQ): Promise<CauseListRS> {
    throw new Error('Method not implemented.')
  }

  @action({ forApps: [Application.ADMIN, Application.POS] })
  search(req: SearchRQ<CauseFilter>): Promise<CauseSearchRS> {
    return cause.search(this.ctx, req)
  }
}
