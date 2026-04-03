import { CloudWatchLogs } from '@aws-sdk/client-cloudwatch-logs'
import axios from 'axios'
import * as winston from 'winston'
import { trace } from '@opentelemetry/api'
import redact from './redacter'
import { LogType } from './logType'

const cloudwatchlogs = new CloudWatchLogs({})
const logGroupName = 'services'
const logStreamName = 'api'
const LOKI_URL = process.env.LOKI_URL || 'http://host.docker.internal:3100'

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
      logToLoki(logEntry, logGroupData)
      loggerChild[logEntry.level]({
        type: type.name,
        parentType: type.parentLogType,
        message,
      })
    }
  }
}

function logToLoki(logEntry: LogEntry, logGroupData: LogGroupData) {
  const { message, type } = logEntry
  const span = trace.getActiveSpan()
  const traceId = span?.spanContext().traceId
  const lokiMessage = {
    ...message,
    ...logGroupData,
    traceId,
    type: type.name,
    parentType: type.parentLogType,
  }
  const payload = {
    streams: [
      {
        stream: {
          service: 'farmcommerce-api',
          level: logEntry.level,
        },
        values: [
          [String(Date.now() * 1_000_000), JSON.stringify(redact(lokiMessage))],
        ],
      },
    ],
  }
  axios.post(`${LOKI_URL}/loki/api/v1/push`, payload, {
    headers: { 'Content-Type': 'application/json' },
  }).catch((err) => {
    console.log('Failed to send logs to Loki. ' + err)
  })
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
