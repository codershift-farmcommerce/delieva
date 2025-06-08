import { Application } from 'lib'
import * as logger from 'src/util/logging/logger'
import { LogLevel } from 'src/util/logging/logger'
import { LogType } from 'src/util/logging/logType'

const log = logger.getChildLogger({})

export const actionApplications: { [actionPath: string]: Application[] } = {}
export const actions: { [actionPath: string]: Function } = {}
export const unsecuredActions: string[] = []

type SingleAppAction = {
  forApp: Application
  forApps?: []
}
type MultipleAppAction = {
  forApp?: null
  forApps: Application[]
}

export function action(params: SingleAppAction | MultipleAppAction) {
  return (
    target: any,
    propertyKey: string,
    _descriptor: PropertyDescriptor,
  ) => {
    if (!target.path) {
      log({
        type: LogType.APP_ERROR,
        level: LogLevel.ERROR,
        message: {
          text:
            'The path has not been set for service ' + target.constructor.name,
        },
      })
      return
    }
    const actionPath = target.path() + '/' + propertyKey
    actions[actionPath] = target[propertyKey]
    if (!actionApplications[actionPath]) {
      actionApplications[actionPath] = []
    }
    if (params.forApp) {
      actionApplications[actionPath].push(params.forApp)
    }
    if (params?.forApps?.length) {
      actionApplications[actionPath].push(...params.forApps)
    }
  }
}

export function unsecured_action() {
  return (
    target: any,
    propertyKey: string,
    _descriptor: PropertyDescriptor,
  ) => {
    const actionPath = getActionPath(target, propertyKey)
    actions[actionPath] = target[propertyKey]
    unsecuredActions.push(actionPath)
  }
}

function getActionPath(target: any, propertyKey: string) {
  return target.path() + '/' + propertyKey
}
