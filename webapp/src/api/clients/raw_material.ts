import { RawMaterialEndpoints } from 'interface/endpoints/raw_material'
import {
  RawMaterialAddRQ,
  RawMaterialListRQ,
  RawMaterialModifyRQ,
  RawMaterialSearchRQ,
} from 'interface/requests/raw_material'
import {
  RawMaterialListRS,
  RawMaterialSearchRS,
} from 'interface/responses/raw_material'
import { sendRequest } from '../request'
import { AddRS, ModifyRS } from 'interface/responses/common'

export class RawMaterialClient implements RawMaterialEndpoints {
  path(): 'raw_material' {
    return 'raw_material'
  }

  add(req: RawMaterialAddRQ): Promise<AddRS> {
    return sendRequest('/raw_material/add', req)
  }

  modify(req: RawMaterialModifyRQ): Promise<ModifyRS> {
    return sendRequest('/raw_material/modify', req)
  }

  list(req: RawMaterialListRQ): Promise<RawMaterialListRS> {
    return sendRequest('/raw_material/list', req)
  }

  search(req: RawMaterialSearchRQ): Promise<RawMaterialSearchRS> {
    return sendRequest('/raw_material/search', req)
  }
}
