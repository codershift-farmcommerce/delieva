import { TransferBankAccountEndpoints } from 'lib/endpoints/transfer_bank_account'
import { Ctx } from '../context'
import { Promise } from 'bluebird'
import { TransferBankAccountListRQ } from 'lib/requests/transfer_bank_account'
import { TransferBankAccountListRS } from 'lib/responses/transfer_bank_account'
import * as transferBankAccount from 'src/app/models/transfer_bank_account'
import { action } from '../context/decorators/endpoint_actions'
import { Application } from '../../../lib'

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
