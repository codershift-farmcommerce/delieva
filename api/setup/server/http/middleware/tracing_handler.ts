import { Ctx } from 'api/src/app/context'
import { trace, metrics } from '@opentelemetry/api'

export default async (ctx: Ctx, next: Function): Promise<void> => {
  const path = ctx.path.replace('/', '')
  ctx.tracer = trace.getTracer(path)
  ctx.meter = metrics.getMeter(path)
  await next()
}
