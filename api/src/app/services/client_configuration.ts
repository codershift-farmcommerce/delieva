import { Ctx } from '../context'
import { ClientConfigurationEndpoints } from 'lib/endpoints/client_configuration'
import { ClientConfigurationListRQ } from 'lib/requests/client_configuration'
import { ClientConfigurationListRS } from 'lib/responses/client_configuration'
import { Application } from 'lib'
import { action } from '../context/decorators/endpoint_actions'
import * as client_configuration from 'src/app/models/client_configuration'

export class ClientConfigurationService
  implements ClientConfigurationEndpoints
{
  private ctx: Ctx

  path(): 'client_configuration' {
    return 'client_configuration'
  }

  @action({
    forApps: [Application.ADMIN, Application.POS, Application.CUSTOMER_CREDIT],
  })
  list(req: ClientConfigurationListRQ): Promise<ClientConfigurationListRS> {
    return client_configuration.list(this.ctx, req)
  }
}
