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

if (process.env.OTEL_ENABLED === 'true') {
  const {
    diag,
    DiagConsoleLogger,
    DiagLogLevel,
  } = require('@opentelemetry/api')
  diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG)

  const { NodeSDK } = require('@opentelemetry/sdk-node')
  const {
    OTLPTraceExporter,
  } = require('@opentelemetry/exporter-trace-otlp-http')
  const {
    OTLPMetricExporter,
  } = require('@opentelemetry/exporter-metrics-otlp-http')
  const {
    PeriodicExportingMetricReader,
    ConsoleMetricExporter,
  } = require('@opentelemetry/sdk-metrics')
  const { resourceFromAttributes } = require('@opentelemetry/resources')
  const {
    ATTR_SERVICE_NAME,
    ATTR_SERVICE_VERSION,
  } = require('@opentelemetry/semantic-conventions')
  const { PgInstrumentation } = require('@opentelemetry/instrumentation-pg')

  const traceExporter = new OTLPTraceExporter({
    url: 'http://host.docker.internal:4318/v1/traces',
  })

  const sdk = new NodeSDK({
    resource: resourceFromAttributes({
      [ATTR_SERVICE_NAME]: 'farmcommerce-api',
      [ATTR_SERVICE_VERSION]: '1.0',
    }),
    traceExporter,
    instrumentations: [
      new PgInstrumentation({
        requireParentSpan: true,
        addSqlCommenterCommentToQueries: true,
      }),
    ],
    metricReaders: [
      new PeriodicExportingMetricReader({
        exporter: new ConsoleMetricExporter(),
        exportIntervalMillis: 10000,
      }),
      new PeriodicExportingMetricReader({
        exporter: new OTLPMetricExporter({
          url: 'http://host.docker.internal:4318/v1/metrics',
        }),
      }),
    ],
  })
  sdk.start()
}

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
