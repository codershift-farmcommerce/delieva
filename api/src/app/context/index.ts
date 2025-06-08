import { Context as KoaContext } from 'koa'
import { LogEntry } from 'src/util/logging/logger'
import { Knex } from 'knex'
import { UserRole } from 'lib/entities/user'
import { DATABASE } from 'setup/db/types'

export type SessionData = {
  user_id: number
  user_email: string
  roles: UserRole[]
}

export type AuditEntry = {
  description: string
  previousValue?: string | null
  newValue?: string | null
}

export type WithSession = { session: SessionData }
export type WithLog = { log: (logEntry: LogEntry) => void }
export type WithKnex = { knex: Knex }
export type WithAudit = { audit: (entry: AuditEntry) => void }
export type WithUploadData = { uploadFilePath: string; uploadData: any }
export type WithDatabaseName = { dbName: DATABASE }

export type Ctx = KoaContext &
  WithSession &
  WithLog &
  WithKnex &
  WithAudit &
  WithUploadData &
  WithDatabaseName
