import { Ctx } from 'api/src/app/context'
import { AddNoteRequest } from 'interface/entities/note'
import { AddRS } from 'interface/responses/common'

export async function addNote(ctx: Ctx, req: AddNoteRequest): Promise<AddRS> {

  await ctx.knex('note').insert({
    entity_type: req.entity_type,
    entity_id: req.entity_id,
    value: req.value,
  })

  return {
    success: true,
  }
}
