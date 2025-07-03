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

export async function getNoteForPurchaseOrder(ctx: Ctx, orderId: number): Promise<string> {
  const result = await ctx.knex.raw(
    `
    SELECT value
    FROM note
    WHERE entity_type = 'purchase_order'
    AND entity_id = :order_id
    ORDER BY created_at ASC
    LIMIT 1;
    `,
    { order_id: orderId },
  )
  return result.rows[0]?.value || ''
}
