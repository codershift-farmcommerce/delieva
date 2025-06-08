import * as _ from 'lodash'
import * as traverse from 'traverse'
import * as logger from 'api/src/util/logging/logger'
import { LogLevel } from 'api/src/util/logging/logger'
import { LogType } from './logType'

const sensitiveKeys = [
  /cookie/i,
  /passw(or)?d/i,
  /^pw$/,
  /^pass$/i,
  /secret/i,
  /token/i,
  /api[-._]?key/i,
  /session/i,
]

function isSensitiveKey(keyStr: string | undefined) {
  if (keyStr) {
    return sensitiveKeys.some(regex => regex.test(keyStr))
  }
  return false
}

function redactObject(obj: any) {
  traverse(obj).forEach(function redactor() {
    if (isSensitiveKey(this.key)) {
      this.update('[REDACTED]')
    }
  })
}

export default function redact(obj: any) {
  try {
    const copy = _.cloneDeep(obj) // Making a deep copy to prevent side effects
    redactObject(copy)

    const splat = copy[Symbol.for('splat')]
    redactObject(splat) // Specifically redact splat Symbol
    return copy
  } catch (error) {
    logger.getChildLogger({})({
      level: LogLevel.ERROR,
      type: LogType.APP_ERROR,
      message: {
        obj: JSON.stringify(Object.keys(obj)),
        error,
      },
    })
    return obj
  }
}
