import * as path from 'node:path'
import * as knexLib from 'knex'
import { getKnexConfig } from 'api/setup/db/knexfile'
import { DATABASE } from './types'

const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')

const argv = yargs(hideBin(process.argv)).argv
const name = argv._[0] as string

const database = DATABASE.DELIEVA
const main = async () => {
  try {
    const knexConfig = await getKnexConfig(database)
    const knex = knexLib.knex(knexConfig)
    const response = await knex.migrate.make(name, {
      directory: path.join(__dirname, 'migrations'),
      extension: 'ts',
    })
    console.log('Migration file created.')
    console.log(response)
  } catch (error) {
    console.error('An error occurred: ', error)
  }
}

if (module === require.main) {
  main()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error)
      process.exit(1)
    })
}
