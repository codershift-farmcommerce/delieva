import * as Bluebird from 'bluebird'
import knex, { Knex } from 'knex'
import { getKnexConfig } from 'api/setup/db/knexfile'
import { DATABASE } from './types'
import ConnectionConfig = Knex.ConnectionConfig

const databases = [DATABASE.DELIEVA]
if (process.env.NODE_ENV !== 'production') {
  databases.push(DATABASE.TEST)
}

let adminKnex: Knex

let readonlyUser = {
  username: 'readonly',
  password: 'P4$$w0rd',
}
if (process.env.READONLY_DATABASE_CREDENTIALS) {
  const { username, password } = JSON.parse(
    process.env.READONLY_DATABASE_CREDENTIALS,
  )
  readonlyUser = {
    username,
    password,
  }
}

const main = async () => {
  try {
    const adminKnexConfig = await getKnexConfig(DATABASE.ADMIN)
    adminKnex = knex(adminKnexConfig)
    await createReadOnlyUser()
    await createDatabases()
  } catch (error) {
    console.error(error)
  }
  process.exit(0)
}

async function createReadOnlyUser() {
  const password = readonlyUser.password
  if (!isValidPassword(password)) {
    throw new Error('This password is invalid.')
  }
  const results = await adminKnex
    .select('*')
    .from('pg_catalog.pg_roles')
    .where('rolname', readonlyUser.username)
  if (!results.length) {
    await adminKnex.raw(
      `
          CREATE USER :user: WITH ENCRYPTED password '${password}';
          ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO :user:;`,
      { user: readonlyUser.username },
    )
    console.log('\u2713', `Role ${readonlyUser.username} created.`)
  } else {
    console.log('\u2713', `Role ${readonlyUser.username} was already created.`)
  }
}

async function createDatabases() {
  await Bluebird.each(databases, async (database: DATABASE) => {
    const knexConfig = await getKnexConfig(database)
    const connection = knexConfig.connection as ConnectionConfig
    if (!connection) {
      throw new Error('Connection info not found!')
    }
    const results = await adminKnex
      .select('*')
      .from('pg_database')
      .where('datname', connection.database)
    if (!results.length) {
      try {
        await createDatabase(connection)
        await grantPermissionsToReadonlyUser(knexConfig)
        console.log('\u2713', `Database ${connection.database} initialized.`)
      } catch (error) {
        throw new Error(
          `\u26A0 Database ${connection.database} could not get initialized. ${error}`,
        )
      }
    } else {
      console.log(
        '\u2713',
        `Database ${connection.database} was already initialized.`,
      )
    }
  })
}

async function createDatabase(connection: ConnectionConfig) {
  const { database, user, password } = connection

  if (!isValidPassword(password)) {
    throw new Error('This password is invalid.')
  }
  await adminKnex.raw('CREATE DATABASE :database:;', {
    database,
  })
  await adminKnex.raw('CREATE EXTENSION "uuid-ossp";', {
    database,
  })
  const results = await adminKnex
    .select('*')
    .from('pg_user')
    .where('usename', user)

  if (!results.length) {
    await adminKnex.raw(
      `
          CREATE USER :user: WITH ENCRYPTED password '${password}';
        `,
      {
        user,
      },
    )
    console.log('\u2713', `User ${user} has been created.`)
  } else {
    console.log('\u2713', `User ${user} was already created.`)
  }
  await adminKnex.raw(
    `
          GRANT ALL PRIVILEGES ON DATABASE :database: to :user:;
        `,
    {
      user,
      database: database,
    },
  )
}

async function grantPermissionsToReadonlyUser(knexfile: Knex.Config) {
  const userKnex = knex(knexfile)
  await userKnex.raw(
    `
      ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO :user:;`,
    {
      user: readonlyUser.username,
    },
  )
}

function isValidPassword(password: string) {
  // List of unsafe characters to check against
  const unsafeChars = /['";:()\\]/

  // Check if password contains any unsafe characters
  if (unsafeChars.test(password)) {
    console.log('The password contains any unsafe characters')
    return false
  }

  // Check if password contains any unsafe keywords
  const unsafeKeywords = ['SELECT', 'UPDATE', 'DELETE', 'DROP']
  if (
    unsafeKeywords.find(keyword => password.toUpperCase().includes(keyword))
  ) {
    console.log('The password contains any unsafe keywords')
    return false
  }

  // Check if password is too short
  if (password.length < 8) {
    console.log('The password is too short')
    return false
  }

  // Check if password is too simple
  if (
    !/[A-Z]/.test(password) ||
    !/[a-z]/.test(password) ||
    !/[0-9]/.test(password)
  ) {
    console.log('The password is too simple')
    return false
  }

  // Password passed all checks
  return true
}

if (module === require.main) {
  main().catch(console.log)
}
