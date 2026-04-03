import { Ctx } from 'api/src/app/context'
import { Span } from '@opentelemetry/api'

export function withSpan<T>(ctx: Ctx, name: string, fn: () => Promise<T>): Promise<T> {
  return ctx.tracer.startActiveSpan(name, async (span: Span) => {
    try {
      return await fn()
    } finally {
      span.end()
    }
  })
}
