import { Ctx } from '../context'
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
import { AddRS, ModifyRS } from 'interface/responses/common'

type RawMaterialSQLRow = {
  code: string
  name: string
}

export async function add(ctx: Ctx, req: RawMaterialAddRQ): Promise<AddRS> {
  const { code, name } = req
  await ctx.knex('raw_material').insert({ code, name })
  return { success: true }
}

export async function modify(
  ctx: Ctx,
  req: RawMaterialModifyRQ,
): Promise<ModifyRS> {
  const { code, name } = req
  await ctx.knex('raw_material').where({ code }).update({ name })
  return { success: true }
}

const pageSize = 25
export async function list(
  ctx: Ctx,
  req: RawMaterialListRQ,
): Promise<RawMaterialListRS> {
  const page = req.page || 1
  const query = req.query
  const countResult = await ctx.knex('raw_material').count('id')
  const numberOfRawMaterials = Number(countResult?.[0]?.count ?? 0)
  const numberOfPages = Math.ceil(numberOfRawMaterials / pageSize)
  const offset = (page - 1) * pageSize

  const rawMaterialsResult: RawMaterialSQLRow[] = await ctx
    .knex('raw_material')
    .select('code', 'name')
    .whereILike('code', `%${query}%`)
    .orWhereILike('name', `%${query}%`)
    .orderBy('code')
    .offset(offset)
    .limit(pageSize)

  const sortedResult = rawMaterialsResult.sort((a, b) => {
    if (a.code === query) return -1
    if (b.code === query) return 1
    return 0
  })

  return {
    numberOfPages,
    raw_materials: sortedResult.map(rawMaterialResult => ({
      code: rawMaterialResult.code,
      name: rawMaterialResult.name,
    })),
  }
}

export async function search(
  ctx: Ctx,
  req: RawMaterialSearchRQ,
): Promise<RawMaterialSearchRS> {
  const { query } = req
  const result = await ctx
    .knex('raw_material')
    .select('code', 'name')
    .whereILike('code', `%${query}%`)
    .orWhereILike('name', `%${query}%`)

  const sortedResult = result.sort((a, b) => {
    if (a.code === query) return -1
    if (b.code === query) return 1
    return 0
  })

  const data = sortedResult.map((r: RawMaterialSQLRow) => ({
    id: r.code,
    name: `(${r.code}) ${r.name}`,
    data: {
      code: r.code,
      name: r.name,
    },
  }))

  return {
    data,
  }
}
