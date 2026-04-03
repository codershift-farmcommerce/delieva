import * as fs from 'node:fs'
import { CustomerCreditEndpoints } from 'interface/endpoints/customer_credit'
import { Ctx } from '../context'
import {
  CustomerCreditAddPaymentRQ,
  CustomerCreditCancelPaymentRQ,
  CustomerCreditGetCustomerCreditPurchaseOrdersReportRQ,
  CustomerCreditGetForCustomerRQ,
  CustomerCreditGetPaymentReceiptRQ,
  CustomerCreditGetPaymentRQ,
  CustomerCreditGetPaymentsByCustomerRQ,
  CustomerCreditGetPaymentsOfCurrentOpenReconciliationRQ,
  CustomerCreditGetUnpaidPurchaseOrdersRQ,
  CustomerCreditListRQ,
} from 'interface/requests/customer_credit'
import {
  CustomerCreditAddPaymentRS,
  CustomerCreditCancelPaymentRS,
  CustomerCreditGetCustomerCreditPurchaseOrdersReportRS,
  CustomerCreditGetForCustomerRS,
  CustomerCreditGetPaymentReceiptRS,
  CustomerCreditGetPaymentRS,
  CustomerCreditGetPaymentsGetByCustomerRS,
  CustomerCreditGetPaymentsOfCurrentOpenReconciliationRS,
  CustomerCreditGetUnpaidPurchaseOrdersRS,
  CustomerCreditListRS,
} from 'interface/responses/customer_credit'
import { action } from '../context/decorators/endpoint_actions'
import { Application } from 'interface'
import * as customer_credit from 'api/src/app/models/customer_credit'
import * as customerModel from 'api/src/app/models/customer'
import { attachFile } from 'api/src/util/files'
import * as excel from 'api/src/util/excel'
import { FileType } from 'api/src/util/excel'
import { Worksheet } from 'exceljs'
import * as moment from 'moment/moment'
import * as userModel from '../models/user'
import { withSpan } from '../../util/tracing/tracer'

export class CustomerCreditService implements CustomerCreditEndpoints {
  private ctx: Ctx

  path(): 'customer_credit' {
    return 'customer_credit'
  }

  @action({ forApps: [Application.ADMIN, Application.CUSTOMER_CREDIT] })
  getForCustomer(
    req: CustomerCreditGetForCustomerRQ,
  ): Promise<CustomerCreditGetForCustomerRS> {
    return customer_credit.getForCustomer(this.ctx, req)
  }

  @action({ forApps: [Application.ADMIN] })
  list(req: CustomerCreditListRQ): Promise<CustomerCreditListRS> {
    return customer_credit.list(this.ctx, req)
  }

  @action({ forApps: [Application.ADMIN, Application.CUSTOMER_CREDIT] })
  addPayment(
    req: CustomerCreditAddPaymentRQ,
  ): Promise<CustomerCreditAddPaymentRS> {
    return customer_credit.addPayment(this.ctx, req)
  }

  @action({ forApps: [Application.ADMIN, Application.CUSTOMER_CREDIT] })
  async cancelPayment(
    req: CustomerCreditCancelPaymentRQ,
  ): Promise<CustomerCreditCancelPaymentRS> {
    const { user_authorization_code } = req
    const authorizedByUserEmail = await userModel.getAuthorizingAdminUserEmail(
      this.ctx,
      user_authorization_code,
    )
    if (!authorizedByUserEmail) {
      return {
        success: false,
        error: {
          message: 'unauthorized',
        },
      }
    }
    return customer_credit.cancelPayment(this.ctx, req, authorizedByUserEmail)
  }

  @action({ forApps: [Application.ADMIN, Application.CUSTOMER_CREDIT] })
  getPaymentReceipt(
    req: CustomerCreditGetPaymentReceiptRQ,
  ): Promise<CustomerCreditGetPaymentReceiptRS> {
    return customer_credit.getPaymentReceipt(this.ctx, req)
  }

  @action({ forApps: [Application.ADMIN, Application.CUSTOMER_CREDIT] })
  getUnpaidPurchaseOrders(
    req: CustomerCreditGetUnpaidPurchaseOrdersRQ,
  ): Promise<CustomerCreditGetUnpaidPurchaseOrdersRS> {
    return customer_credit.getUnpaidPurchaseOrders(this.ctx, req)
  }

  @action({ forApps: [Application.ADMIN] })
  getPaymentsByCustomer(
    req: CustomerCreditGetPaymentsByCustomerRQ,
  ): Promise<CustomerCreditGetPaymentsGetByCustomerRS> {
    return customer_credit.getPaymentsByCustomer(this.ctx, req)
  }

  @action({ forApps: [Application.ADMIN] })
  getCustomerCreditPurchaseOrdersReport(
    req: CustomerCreditGetCustomerCreditPurchaseOrdersReportRQ,
  ): Promise<CustomerCreditGetCustomerCreditPurchaseOrdersReportRS> {
    return withSpan(this.ctx, 'getCustomerCreditPurchaseOrdersReport', () => {
      return customer_credit.getCustomerCreditPurchaseOrdersReport(
        this.ctx,
        req,
      )
    })
  }

  @action({ forApps: [Application.ADMIN] })
  async getCustomerCreditPurchaseOrdersReportAsExcelSheet(
    req: CustomerCreditGetCustomerCreditPurchaseOrdersReportRQ,
  ): Promise<fs.ReadStream> {
    const customer = await customerModel.get(this.ctx, req.customer_id)
    const report = await customer_credit.getCustomerCreditPurchaseOrdersReport(
      this.ctx,
      req,
    )

    const { outputFilePath } = await excel.writeOnFile(
      FileType.CUSTOMER_CREDIT_BALANCE_TEMPLATE,
      (worksheet: Worksheet) => {
        const clientNameRow = worksheet.getRow(2)
        clientNameRow.getCell(2).value = customer?.name ?? ''
        clientNameRow.commit()

        const pendingBalanceRow = worksheet.getRow(3)
        pendingBalanceRow.getCell(2).value = report.credit_balance
        pendingBalanceRow.getCell(2).numFmt = '0.00'
        pendingBalanceRow.commit()

        const dateRow = worksheet.getRow(3)
        dateRow.getCell(8).value = moment().format('DD/MM/yyyy')

        const outOfSystemRow = worksheet.getRow(5)
        outOfSystemRow.getCell(2).numFmt = '0.00'
        outOfSystemRow.getCell(2).value =
          report.credit_purchases_amount_not_in_system

        outOfSystemRow.getCell(7).numFmt = '0.00'
        outOfSystemRow.getCell(7).value =
          report.credit_payments_amount_not_in_system

        for (let i = 0; i < report.purchase_orders.length; i++) {
          const row = worksheet.getRow(8 + i)
          const purchaseOrder = report.purchase_orders[i]
          row.getCell(1).value = purchaseOrder.order_id
          row.getCell(2).value = moment(purchaseOrder.created_at).format(
            'DD/MM/yyyy',
          )
          row.getCell(3).value = purchaseOrder.total
          row.getCell(4).value = purchaseOrder.total - purchaseOrder.paid

          row.getCell(3).numFmt = '0.00'
          row.getCell(4).numFmt = '0.00'
        }

        for (let i = 0; i < report.payments.length; i++) {
          const row = worksheet.getRow(8 + i)
          const payment = report.payments[i]
          row.getCell(6).value = payment.id
          row.getCell(7).value = moment(payment.created_at).format('DD/MM/yyyy')
          row.getCell(8).value = payment.payment_amount

          row.getCell(8).numFmt = '0.00'
          row.commit()
        }
      },
    )
    attachFile(this.ctx, outputFilePath, `customer_credit_report.xlsx`)
    return Promise.resolve(fs.createReadStream(outputFilePath))
  }

  @action({ forApps: [Application.POS, Application.ADMIN] })
  async getPaymentsOfCurrentOpenReconciliation(
    req: CustomerCreditGetPaymentsOfCurrentOpenReconciliationRQ,
  ): Promise<CustomerCreditGetPaymentsOfCurrentOpenReconciliationRS> {
    return customer_credit.getPaymentsOfCurrentOpenReconciliation(this.ctx, req)
  }

  @action({ forApps: [Application.POS, Application.ADMIN] })
  async getPayment(
    req: CustomerCreditGetPaymentRQ,
  ): Promise<CustomerCreditGetPaymentRS> {
    return customer_credit.getPayment(this.ctx, req)
  }
}
