import { SearchRQ } from 'lib/entities/common'
import {
  CauseAddRQ,
  CauseFilter,
  CauseListRQ,
  CauseSearchRQ,
} from 'lib/requests/cause'
import { CauseAddRS, CauseListRS, CauseSearchRS } from 'lib/responses/cause'
import { CauseEndpoints } from 'lib/endpoints/cause'
import { Ctx } from 'src/app/context'
import { action } from 'src/app/context/decorators/endpoint_actions'
import { Application } from 'lib'
import * as cause from '../models/cause'

export class Cause implements CauseEndpoints {
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
