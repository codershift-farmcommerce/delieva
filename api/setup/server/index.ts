import { Endpoint, HttpServer } from 'setup/server/http'
import { actions } from 'src/app/context/decorators/endpoint_actions'
import { AuthService } from 'src/app/services/auth'
import { ProductService } from 'src/app/services/product'
import { CustomerService } from 'src/app/services/customer'
import { PurchaseOrderService } from 'src/app/services/purchase_order'
import { DiscountServices } from 'src/app/services/discount'
import { UserManagementService } from 'src/app/services/user_management'
import { DataSnapshotService } from 'src/app/services/data_snapshot'
import { CashRegisterService } from 'src/app/services/cash_register'
import { CustomerCreditService } from 'src/app/services/customer_credit'
import { RawMaterialService } from 'src/app/services/raw_material'
import { TransferBankAccountService } from 'src/app/services/transfer_bank_account'
import { ClientConfigurationService } from 'src/app/services/client_configuration'
import { FinishedProductService } from 'src/app/services/finished_product'
import { Cause } from 'src/app/services/cause'

// Activate action decorators
new AuthService()
new ProductService()
new CustomerService()
new PurchaseOrderService()
new DiscountServices()
new UserManagementService()
new DataSnapshotService()
new CashRegisterService()
new CustomerCreditService()
new RawMaterialService()
new TransferBankAccountService()
new ClientConfigurationService()
new FinishedProductService()
new Cause()

const httpServer = new HttpServer(getActions())

function getActions(): Endpoint[] {
  return Object.keys(actions).map(actionPath => ({
    method: 'post',
    path: actionPath,
    action: actions[actionPath] as Function,
  })) as Endpoint[]
}

httpServer.start()
