import { TransferBankAccountEndpoints } from 'interface/endpoints/transfer_bank_account'
import { Ctx } from '../context'
import { TransferBankAccountListRQ } from 'interface/requests/transfer_bank_account'
import { TransferBankAccountListRS } from 'interface/responses/transfer_bank_account'
import * as transferBankAccount from 'api/src/app/models/transfer_bank_account'
import { action } from '../context/decorators/endpoint_actions'
import { Application } from 'interface'

export class TransferBankAccountService
  implements TransferBankAccountEndpoints
{
  private ctx: Ctx
  path(): 'transfer_bank_account' {
    return 'transfer_bank_account'
  }

  @action({
    forApps: [Application.ADMIN, Application.POS, Application.CUSTOMER_CREDIT],
  })
  list(req: TransferBankAccountListRQ): Promise<TransferBankAccountListRS> {
    return transferBankAccount.list(this.ctx, req)
  }
}
