import knex, { Knex } from 'knex'
import { getKnexConfig } from './knexfile'
import { DATABASE } from './types'

const clients: Partial<Record<DATABASE, Knex>> = {}

export function getClient(database: DATABASE): Knex | undefined {
  if (!clients[database]) {
    clients[database] = knex(getKnexConfig(database))
  }
  return clients[database]
}
