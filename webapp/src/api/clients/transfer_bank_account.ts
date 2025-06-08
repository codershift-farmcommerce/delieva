import { TransferBankAccountEndpoints } from 'codershift-farmcommerce-api/endpoints/transfer_bank_account'
import { TransferBankAccountListRQ } from 'codershift-farmcommerce-api/requests/transfer_bank_account'
import { TransferBankAccountListRS } from 'codershift-farmcommerce-api/responses/transfer_bank_account'
import { sendRequest } from '../request'

export class TransferBankAccountClient implements TransferBankAccountEndpoints {
  path(): 'transfer_bank_account' {
    return 'transfer_bank_account'
  }

  list(req: TransferBankAccountListRQ): Promise<TransferBankAccountListRS> {
    return sendRequest('/transfer_bank_account/list', req)
  }
}
