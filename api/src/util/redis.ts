import { Application } from 'lib'

export function redisKeysForSession(
  sessionToken: string,
  application: Application,
) {
  return `${sessionToken}-${application}`
}
