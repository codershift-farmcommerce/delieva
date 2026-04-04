import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api'
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG)

import { NodeSDK } from '@opentelemetry/sdk-node'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http'
import { ConsoleSpanExporter } from '@opentelemetry/sdk-trace-node'
import {
  PeriodicExportingMetricReader,
  ConsoleMetricExporter,
} from '@opentelemetry/sdk-metrics'
import { resourceFromAttributes } from '@opentelemetry/resources'
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from '@opentelemetry/semantic-conventions'
import { Endpoint, HttpServer } from 'api/setup/server/http'
import { actions } from 'api/src/app/context/decorators/endpoint_actions'
import { AuthService } from 'api/src/app/services/auth'
import { ProductService } from 'api/src/app/services/product'
import { CustomerService } from 'api/src/app/services/customer'
import { PurchaseOrderService } from 'api/src/app/services/purchase_order'
import { DiscountServices } from 'api/src/app/services/discount'
import { UserManagementService } from 'api/src/app/services/user_management'
import { DataSnapshotService } from 'api/src/app/services/data_snapshot'
import { CashRegisterService } from 'api/src/app/services/cash_register'
import { CustomerCreditService } from 'api/src/app/services/customer_credit'
import { RawMaterialService } from 'api/src/app/services/raw_material'
import { TransferBankAccountService } from 'api/src/app/services/transfer_bank_account'
import { ClientConfigurationService } from 'api/src/app/services/client_configuration'
import { FinishedProductService } from 'api/src/app/services/finished_product'
import { CauseService } from 'api/src/app/services/cause'
import { NoteService } from 'api/src/app/services/note'

const traceExporter = new OTLPTraceExporter({
  url: 'http://host.docker.internal:4318/v1/traces',
})
// const traceExporter = new ConsoleSpanExporter()

const sdk = new NodeSDK({
  resource: resourceFromAttributes({
    [ATTR_SERVICE_NAME]: 'farmcommerceAPI',
    [ATTR_SERVICE_VERSION]: '1.0',
  }),
  traceExporter,
  metricReaders: [
    new PeriodicExportingMetricReader({
      exporter: new ConsoleMetricExporter(),
    }),
    new PeriodicExportingMetricReader({
      exporter: new OTLPMetricExporter({
        url: 'http://host.docker.internal:4318/v1/metrics',
      }),
    }),
  ],
})
sdk.start()

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
new CauseService()
new NoteService()

const httpServer = new HttpServer(getActions())

function getActions(): Endpoint[] {
  return Object.keys(actions).map(actionPath => ({
    method: 'post',
    path: actionPath,
    action: actions[actionPath] as Function,
  })) as Endpoint[]
}

httpServer.start()
