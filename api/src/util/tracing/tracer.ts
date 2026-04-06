import { Ctx } from 'api/src/app/context'
import { Span } from '@opentelemetry/api'
import { ATTR_CODE_FUNCTION_NAME } from '@opentelemetry/semantic-conventions'

/**
 * Starts a new active span. Any spans created within `fn` will automatically be children of this span.
 * @param ctx
 * @param name
 * @param fn
 */
export function withActiveSpan<T>(
  ctx: Ctx,
  name: string,
  fn: (span?: Span) => Promise<T>,
): Promise<T> {
  return ctx.tracer.startActiveSpan(name, async (span: Span) => {
    try {
      span.setAttribute(ATTR_CODE_FUNCTION_NAME, fn.name)
      return await fn(span)
    } finally {
      span.end()
    }
  })
}

export function setSpanAttribute(
  span: Span | undefined,
  name: string,
  value: string,
) {
  if (span) {
    span.setAttribute(name, value)
  }
}
