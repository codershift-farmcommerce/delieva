import * as fs from 'fs'
import * as path from 'path'
import * as util from 'util'
import * as knexLib from 'knex'
import { getKnexConfig } from 'setup/db/knexfile'
import * as Bluebird from 'bluebird'
import { Knex } from 'knex'
import { DATABASE } from './types'
import withoutForeignKeys from './helpers/withoutForeignKeys'
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')

const argv = yargs(hideBin(process.argv)).argv
const readdirAwait = util.promisify(fs.readdir)

export enum SeedSet {
  DEV = 'dev',
  FUNCTIONAL_TEST = 'functional_test',
  PERFORMANCE_TEST = 'performance_test',
  PROD = 'prod',
  SNAPSHOT = 'snapshot',
}

const SEED_SET_TO_DB: Record<SeedSet, DATABASE> = {
  [SeedSet.DEV]: DATABASE.DELIEVA,
  [SeedSet.FUNCTIONAL_TEST]: DATABASE.TEST,
  [SeedSet.PERFORMANCE_TEST]: DATABASE.TEST,
  [SeedSet.PROD]: DATABASE.DELIEVA,
  [SeedSet.SNAPSHOT]: DATABASE.DELIEVA,
}

const FORCE_ORDER = [
  'users',
  'user_role',
  'assigned_role',
  'product',
  'raw_material',
  'product_raw_material',
  'purchase_order_payment',
  'cause',
  'cash_register_withdrawal',
  'returned_purchase_order',
]

export const seed = async (seedSet: SeedSet, verbose: boolean = true) => {
  try {
    const seedsFolder = path.join(__dirname, 'seeds', seedSet)
    const database = SEED_SET_TO_DB[seedSet as SeedSet]
    const knexConfig = await getKnexConfig(database)
    const knex = knexLib.knex(knexConfig)
    const seeds = await getSeeds(seedsFolder)

    await Bluebird.each(seeds, async (seed: string) => {
      await seedTable(
        knex,
        database,
        seed,
        require(path.join(seedsFolder, `${seed}.json`)),
        verbose,
      )
    })
    await knex.destroy()
  } catch (err) {
    console.log(err)
  }
}

async function getSeeds(seedsFolder: string) {
  const seedFiles = await readdirAwait(path.join(seedsFolder))
  const seeds = seedFiles.map(seed => seed.replace('.json', ''))

  return seeds.sort((a, b) => {
    const orderOfA = FORCE_ORDER.indexOf(a)
    const orderOfB = FORCE_ORDER.indexOf(b)
    const indexOfA = orderOfA >= 0 ? orderOfA : Number.MAX_SAFE_INTEGER
    const indexOfB = orderOfB >= 0 ? orderOfB : Number.MAX_SAFE_INTEGER
    return indexOfA - indexOfB
  })
}

async function seedTable(
  knex: Knex,
  dbName: string,
  tableName: string,
  rows: Record<string, string>[],
  verbose: boolean = true,
) {
  const dataExists = (await knex.raw(`SELECT 1 FROM ${tableName}`)).rowCount > 0

  if (dataExists) {
    if (!process.env.FORCE_SEED) {
      verbose &&
        console.warn(
          '\u26A0',
          `(${dbName}) Table ${tableName} NOT seeded: FORCE_SEED is off and data exists.`,
        )
      return
    }
  }
  console.log('processing table: ', tableName)
  await withoutForeignKeys(knex, tableName, knex => {
    return knex(tableName).del()
  })
  if (rows.length) {
    if (rows[0].id) {
      const lastId = Math.max(...rows.map(row => Number(row.id)))
      await knex.raw(`SELECT SETVAL('${tableName}_id_seq', ${lastId})`)
    }
    for (let i = 0; i < rows.length; i += 1000) {
      await knex(tableName).insert(rows.slice(i, i + 1000))
    }
  }
  console.log('\u2713', `(${dbName}) Table ${tableName} seeded.`)
}

if (module === require.main) {
  seed(argv._[0])
    .then(() => process.exit(0))
    .catch(console.log)
}
