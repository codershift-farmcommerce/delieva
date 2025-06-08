import { ClientConfigurationListRQ } from '../requests/client_configuration'
import { ClientConfigurationListRS } from '../responses/client_configuration'

export interface ClientConfigurationEndpoints {
  path(): 'client_configuration'

  list(req: ClientConfigurationListRQ): Promise<ClientConfigurationListRS>
}
