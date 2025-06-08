import { CashRegisterEndpoints } from 'interface/endpoints/cash_register'
import { ClientConfigurationEndpoints } from 'interface/endpoints/client_configuration'
import { ClientConfigurationListRQ } from 'interface/requests/client_configuration'
import { ClientConfigurationListRS } from 'interface/responses/client_configuration'
import { sendRequest } from '../request'

export class ClientConfigurationClient implements ClientConfigurationEndpoints {
  path(): 'client_configuration' {
    return 'client_configuration'
  }

  list(req: ClientConfigurationListRQ): Promise<ClientConfigurationListRS> {
    return sendRequest('/client_configuration/list', req)
  }
}
