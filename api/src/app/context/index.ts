import { Context as KoaContext } from 'koa'
import { Knex } from 'knex'
import { UserRole } from 'interface/entities/user'
import { DATABASE } from 'api/setup/db/types'
import { Tracer } from '@opentelemetry/api'

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
export type WithKnex = { knex: Knex }
export type WithAudit = { audit: (entry: AuditEntry) => void }
export type WithUploadData = { uploadFilePath: string; uploadData: any }
export type WithDatabaseName = { dbName: DATABASE }
export type WithTracer = { tracer: Tracer }

export type Ctx = KoaContext &
  WithSession &
  WithKnex &
  WithAudit &
  WithUploadData &
  WithDatabaseName &
  WithTracer
