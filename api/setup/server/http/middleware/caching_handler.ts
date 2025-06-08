import Redis from 'ioredis'
import { Ctx } from 'src/app/context'

const redisUri =
  process.env.NODE_ENV === 'production'
    ? process.env.REDIS_URI ?? ''
    : 'caching'
const client = new Redis(redisUri, { lazyConnect: true })

export default async (ctx: Ctx, next: Function): Promise<void> => {
  ctx.redis = client
  return next()
}
