import { ClientConfigurationListRQ } from 'interface/requests/client_configuration'
import { ClientConfigurationListRS } from 'interface/responses/client_configuration'
import { Ctx } from '../context'
import {
  Configuration,
  ConfigurationKey,
} from 'interface/entities/client_configuration'

type ClientConfigurationSQLRow = {
  key: string
  value: string
}
export async function list(
  ctx: Ctx,
  req: ClientConfigurationListRQ,
): Promise<ClientConfigurationListRS> {
  const result: ClientConfigurationSQLRow[] = await ctx
    .knex('client_configuration')
    .select('key', 'value')

  const configuration = result.reduce((acc, row) => {
    acc[row.key as ConfigurationKey] = {
      value: row.value,
    }
    return acc
  }, {} as Configuration)

  return {
    configuration,
  }
}

export async function get(ctx: Ctx, key: ConfigurationKey): Promise<string> {
  const result: ClientConfigurationSQLRow = await ctx
    .knex('client_configuration')
    .select('key', 'value')
    .where('key', key)
    .first()

  return result.value
}
