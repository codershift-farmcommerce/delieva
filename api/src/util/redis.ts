import { Application } from 'interface'

export function redisKeysForSession(
  sessionToken: string,
  application: Application,
) {
  return `${sessionToken}-${application}`
}
