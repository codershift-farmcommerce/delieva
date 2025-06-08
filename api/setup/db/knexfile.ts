import * as fs from 'node:fs'
import { DATABASE, KnexCredentials, ProductionCredentials } from './types'
import { Knex } from 'knex'

export function getKnexConfig(database: DATABASE): Knex.Config {
  const { host, username, password, port, ssl } = getConnectionInfo(database)
  return {
    client: 'postgresql',
    searchPath: 'public',
    connection: {
      database,
      host,
      user: username,
      password,
      port,
      ssl,
    },
  }
}

function getConnectionInfo(database: DATABASE) {
  if (database === DATABASE.ADMIN) {
    return getAdminConnectionInfo(database)
  } else {
    return getApiUserConnectionInfo(database)
  }
}

function getApiUserConnectionInfo(database: DATABASE) {
  let credentials: KnexCredentials = {
    username: 'api',
    password: 'P4$$w0rd',
    host: 'database',
    port: 5432,
    database,
  }
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.API_USER_DATABASE_CREDENTIALS) {
      throw new Error('Env var not set!: API_USER_DATABASE_CREDENTIALS')
    }
    const apiUserCredentials: ProductionCredentials = JSON.parse(
      process.env.API_USER_DATABASE_CREDENTIALS,
    )
    const { username, password, host, port, useSSLCert } = apiUserCredentials
    credentials = {
      username,
      password,
      host,
      port,
      database,
      ssl: useSSLCert
        ? {
            ca: fs
              .readFileSync('/etc/ssl/certs/rds-ca-2019-root.pem')
              .toString(),
          }
        : false,
    }
  }
  return credentials
}

function getAdminConnectionInfo(database: DATABASE) {
  let credentials: KnexCredentials = {
    username: 'postgres',
    password: 'postgres',
    host: 'database',
    port: 5432,
    database,
  }
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.ADMIN_DATABASE_CREDENTIALS) {
      throw new Error('Env var not set!: ADMIN_DATABASE_CREDENTIALS')
    }
    const adminCredentials: ProductionCredentials = JSON.parse(
      process.env.ADMIN_DATABASE_CREDENTIALS,
    )
    const { username, password, host, port, useSSLCert } = adminCredentials
    credentials = {
      username,
      password,
      host,
      port,
      database,
      ssl: useSSLCert
        ? {
            ca: fs
              .readFileSync('/etc/ssl/certs/rds-ca-2019-root.pem')
              .toString(),
          }
        : false,
    }
  }
  return credentials
}
