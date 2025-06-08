import * as path from 'path'
import * as knexLib from 'knex'
import { getKnexConfig } from 'setup/db/knexfile'
import * as Bluebird from 'bluebird'
import { DATABASE } from './types'

const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')

const argv = yargs(hideBin(process.argv)).argv
const command = argv._[0] as 'latest' | 'up' | 'down'

const databases = [DATABASE.DELIEVA]
if (process.env.NODE_ENV !== 'production') {
  databases.push(DATABASE.TEST)
}

const main = async () => {
  await Bluebird.each(databases, async (database: DATABASE) => {
    try {
      const knexConfig = await getKnexConfig(database)
      const knex = knexLib.knex(knexConfig)
      const response = await knex.migrate[command]({
        directory: path.join(__dirname, 'migrations'),
        loadExtensions: ['.js'],
      })
      console.log(`(${database}) migrations executed successfully:`)
      console.log(response[1])
    } catch (error) {
      console.error(`(${database}) an error occurred: `, error)
    }
  })
}

if (module === require.main) {
  main()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error)
      process.exit(1)
    })
}
