export enum DATABASE {
  ADMIN = 'postgres',
  DELIEVA = 'delieva',
  TEST = 'test',
}

export const DatabaseTimezone: Record<DATABASE, string> = {
  [DATABASE.ADMIN]: 'UTC',
  [DATABASE.DELIEVA]: 'America/Chihuahua',
  [DATABASE.TEST]: 'UTC',
}

export type ProductionCredentials = {
  username: string
  password: string
  host: string
  port: number
  useSSLCert: boolean
}

export type KnexCredentials = {
  username: string
  password: string
  host: string
  port: number
  database?: string
  ssl?:
    | boolean
    | {
        rejectUnauthorized?: boolean
        ca: string
      }
}
