import {
  RawMaterialAddRQ,
  RawMaterialListRQ,
  RawMaterialModifyRQ,
  RawMaterialSearchRQ,
} from '../requests/raw_material'
import {
  RawMaterialListRS,
  RawMaterialSearchRS,
} from '../responses/raw_material'
import { AddRS, ModifyRS } from '../responses/common'

export interface RawMaterialEndpoints {
  path(): 'raw_material'

  add(req: RawMaterialAddRQ): Promise<AddRS>

  modify(req: RawMaterialModifyRQ): Promise<ModifyRS>

  list(req: RawMaterialListRQ): Promise<RawMaterialListRS>

  search(req: RawMaterialSearchRQ): Promise<RawMaterialSearchRS>
}
