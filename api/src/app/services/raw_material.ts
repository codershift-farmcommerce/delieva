import { Ctx } from '../context'
import { RawMaterialEndpoints } from 'interface/endpoints/raw_material'
import {
  RawMaterialAddRQ,
  RawMaterialListRQ,
  RawMaterialSearchRQ,
} from 'interface/requests/raw_material'
import {
  RawMaterialListRS,
  RawMaterialSearchRS,
} from 'interface/responses/raw_material'
import * as raw_material from 'api/src/app/models/raw_material'
import { action } from 'api/src/app/context/decorators/endpoint_actions'
import { Application } from 'interface'
import { AddRS, ModifyRS } from 'interface/responses/common'

export class RawMaterialService implements RawMaterialEndpoints {
  private ctx: Ctx

  path(): 'raw_material' {
    return 'raw_material'
  }

  @action({ forApps: [Application.ADMIN] })
  add(req: RawMaterialAddRQ): Promise<AddRS> {
    return raw_material.add(this.ctx, req)
  }

  @action({ forApps: [Application.ADMIN] })
  modify(req: RawMaterialAddRQ): Promise<ModifyRS> {
    return raw_material.modify(this.ctx, req)
  }

  @action({ forApps: [Application.ADMIN] })
  list(req: RawMaterialListRQ): Promise<RawMaterialListRS> {
    return raw_material.list(this.ctx, req)
  }

  @action({ forApps: [Application.ADMIN] })
  search(req: RawMaterialSearchRQ): Promise<RawMaterialSearchRS> {
    return raw_material.search(this.ctx, req)
  }
}
