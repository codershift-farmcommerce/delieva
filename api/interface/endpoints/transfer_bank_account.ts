import { TransferBankAccountListRQ } from '../requests/transfer_bank_account'
import { TransferBankAccountListRS } from '../responses/transfer_bank_account'

export interface TransferBankAccountEndpoints {
  path(): 'transfer_bank_account'

  list(req: TransferBankAccountListRQ): Promise<TransferBankAccountListRS>
}
