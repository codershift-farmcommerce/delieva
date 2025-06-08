import { CashRegisterEndpoints } from 'codershift-farmcommerce-api/endpoints/cash_register'
import { ClientConfigurationEndpoints } from 'codershift-farmcommerce-api/endpoints/client_configuration'
import { ClientConfigurationListRQ } from 'codershift-farmcommerce-api/requests/client_configuration'
import { ClientConfigurationListRS } from 'codershift-farmcommerce-api/responses/client_configuration'
import { sendRequest } from '../request'

export class ClientConfigurationClient implements ClientConfigurationEndpoints {
  path(): 'client_configuration' {
    return 'client_configuration'
  }

  list(req: ClientConfigurationListRQ): Promise<ClientConfigurationListRS> {
    return sendRequest('/client_configuration/list', req)
  }
}
