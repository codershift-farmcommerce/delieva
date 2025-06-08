import { Ctx } from '../context'
import { CauseAddRQ, CauseFilter } from 'lib/requests/cause'
import { CauseAddRS, CauseSearchRS } from 'lib/responses/cause'
import { SearchRQ } from 'lib/entities/common'

export async function add(ctx: Ctx, req: CauseAddRQ): Promise<CauseAddRS> {
  const results = await ctx
    .knex('cause')
    .insert({
      description: req.description.toUpperCase(),
      cause_action_code: req.cause_action,
    })
    .returning('id')

  return {
    success: true,
    cause: {
      id: results[0].id,
      description: req.description,
      cause_action: req.cause_action,
    },
  }
}

export async function search(
  ctx: Ctx,
  req: SearchRQ<CauseFilter>,
): Promise<CauseSearchRS> {
  const { query, filters } = req

  const results = await ctx
    .knex('cause')
    .select('id', 'description')
    .whereILike('description', `%${query}%`)
    .andWhere('cause_action_code', filters?.cause_action ?? '')

  return {
    data: results.map(result => ({
      id: result.id,
      name: result.description,
      data: result,
    })),
  }
}
