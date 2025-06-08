import { Ctx } from '../context'
import { TransferBankAccountListRQ } from 'lib/requests/transfer_bank_account'
import { TransferBankAccountListRS } from 'lib/responses/transfer_bank_account'

type TransferBankAccountSQLRow = {
  id: number
  name: string
}
export async function list(
  ctx: Ctx,
  req: TransferBankAccountListRQ,
): Promise<TransferBankAccountListRS> {
  const result: TransferBankAccountSQLRow[] = await ctx
    .knex('transfer_bank_account')
    .select('id', 'name')
    .where('enabled', true)

  const bankAccounts = result.map(row => ({
    id: Number(row.id),
    name: row.name,
  }))

  return { transfer_bank_accounts: bankAccounts }
}
