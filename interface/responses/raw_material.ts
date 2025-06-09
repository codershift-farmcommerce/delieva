import { RawMaterial } from '../entities/raw_material'
import { SearchRS } from '../entities/common'

export type RawMaterialListRS = {
  numberOfPages: number
  raw_materials: RawMaterial[]
}

export type RawMaterialSearchRS = SearchRS<RawMaterial>
