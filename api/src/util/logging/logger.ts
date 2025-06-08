import { CloudWatchLogs } from '@aws-sdk/client-cloudwatch-logs'
import * as winston from 'winston'
import redact from './redacter'
import { LogType } from './logType'

const cloudwatchlogs = new CloudWatchLogs({})
const logGroupName = 'services'
const logStreamName = 'api'

const logger = winston.createLogger({
  format: winston.format.combine(
    // Redact any properties
    winston.format(info => redact(info))(),
    // Then make it JSON
    winston.format.json(),
  ),
  defaultMeta: { service: 'scyadmin-api' },
  level: 'info',
  transports: [
    // new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    // new winston.transports.File({ filename: 'logs/api.log' }),
    new winston.transports.Console({
      format: winston.format.json({ space: 2 }),
    }),
  ],
})

export enum LogLevel {
  INFO = 'info',
  ERROR = 'error',
}

export type LogEntry = {
  level: LogLevel
  type: LogType
  message: object | { text: string }
}

export type LogGroupData = {
  trace_id?: string
  request_id?: string
  user_email?: string
}

export function getChildLogger(logGroupData: LogGroupData) {
  const loggerChild = logger.child(logGroupData)
  return (logEntry: LogEntry) => {
    const { message, type } = logEntry
    if (process.env.NODE_ENV === 'production') {
      logToCloudWatchLogs(logEntry, logGroupData)
    } else {
      loggerChild[logEntry.level]({
        type: type.name,
        parentType: type.parentLogType,
        message,
      })
    }
  }
}

function logToCloudWatchLogs(logEntry: LogEntry, logGroupData: LogGroupData) {
  const { message, type } = logEntry
  const cloudWatchMessage = {
    ...message,
    ...logGroupData,
    level: logEntry.level,
    type: type.name,
    parentType: type.parentLogType,
  }
  const logEvents = [
    {
      message: JSON.stringify(redact(cloudWatchMessage)),
      timestamp: Date.now(),
    },
  ]
  const params = {
    logEvents,
    logGroupName,
    logStreamName,
  }
  cloudwatchlogs.putLogEvents(params, (err: any) => {
    if (err) console.log('Failed to send logs to CloudWatch. ' + err, err.stack)
  })
}
