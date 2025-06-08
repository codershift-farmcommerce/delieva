import { AuditEntry, Ctx } from 'src/app/context'

export default async (ctx: Ctx, next: Function) => {
  ctx.audit = async (entry: AuditEntry) => {
    await ctx.knex('audit').insert({
      user_email: ctx.session.user_email,
      action_path: ctx.path.slice(1),
      description: entry.description,
      previous_value: entry.previousValue,
      new_value: entry.newValue,
      ip: ctx.request.ip,
    })
  }
  await next()
}
