import { TransferBankAccountEndpoints } from 'interface/endpoints/transfer_bank_account'
import { TransferBankAccountListRQ } from 'interface/requests/transfer_bank_account'
import { TransferBankAccountListRS } from 'interface/responses/transfer_bank_account'
import { sendRequest } from '../request'

export class TransferBankAccountClient implements TransferBankAccountEndpoints {
  path(): 'transfer_bank_account' {
    return 'transfer_bank_account'
  }

  list(req: TransferBankAccountListRQ): Promise<TransferBankAccountListRS> {
    return sendRequest('/transfer_bank_account/list', req)
  }
}
