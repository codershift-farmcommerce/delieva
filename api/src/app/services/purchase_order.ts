import { PurchaseOrderEndpoints } from 'interface/endpoints/purchase_order'
import { Ctx } from 'api/src/app/context'
import {
  PurchaseOrderGetReceiptRQ,
  PurchaseOrderGetReportRQ,
  PurchaseOrderProcessRQ,
  PurchaseOrderReturnOrderDetailsRQ,
  PurchaseOrderGetAnnualReportRQ,
  PurchaseOrderReturnOrderRQ,
} from 'interface/requests/purchase_order'
import {
  PurchaseOrderGetReceiptRS,
  PurchaseOrderGetReportRS,
  PurchaseOrderProcessFailRS,
  PurchaseOrderProcessSuccessRS,
  PurchaseOrderReturnOrderDetailsRS,
  PurchaseOrderReturnOrderRS,
} from 'interface/responses/purchase_order'
import * as purchase_order from 'api/src/app/models/purchase_order'
import { action } from '../context/decorators/endpoint_actions'
import { Application } from 'interface'
import { ReadableStream } from 'stream/web'
import * as fs from 'node:fs'
import * as excel from 'api/src/util/excel'
import { attachFile } from 'api/src/util/files'
import * as moment from 'moment'

export class PurchaseOrderService implements PurchaseOrderEndpoints {
  private ctx: Ctx
  path(): 'purchase_order' {
    return 'purchase_order'
  }

  @action({ forApps: [Application.POS, Application.ADMIN] })
  process(
    req: PurchaseOrderProcessRQ,
  ): Promise<PurchaseOrderProcessSuccessRS | PurchaseOrderProcessFailRS> {
    return purchase_order.process(this.ctx, req)
  }

  @action({ forApps: [Application.POS, Application.ADMIN] })
  getReceipt(
    req: PurchaseOrderGetReceiptRQ,
  ): Promise<PurchaseOrderGetReceiptRS> {
    return purchase_order.getReceipt(this.ctx, req)
  }

  @action({ forApps: [Application.ADMIN, Application.POS] })
  getReport(req: PurchaseOrderGetReportRQ): Promise<PurchaseOrderGetReportRS> {
    return purchase_order.getReport(this.ctx, req)
  }

  @action({ forApps: [Application.ADMIN] })
  async getAnnualReportAsExcelSheet(
    req: PurchaseOrderGetAnnualReportRQ,
  ): Promise<import('stream/web').ReadableStream<any> | import('fs').ReadStream> {
    const report = await purchase_order.getAnnualReport(this.ctx, req)
    const { outputFilePath } = await excel.writeOnFile(
      excel.FileType.YEARLY_PURCHASE_ORDERS_TEMPLATE,
      (worksheet) => {
        for (let i = 0; i < report.entries.length; i++) {
          const row = worksheet.getRow(2 + i)
          const entry = report.entries[i]
          row.getCell(1).value = entry.order_id
          row.getCell(2).value = moment(entry.created_at).format('DD/MM/YYYY')
          row.getCell(3).value = entry.cash_register_name
          row.getCell(4).value = entry.customer.name
          row.getCell(5).value = Number(entry.total)
          row.getCell(6).value = entry.form_of_payments
            .map(fop => fop.form_of_payment)
            .join(', ')
          row.getCell(7).value = entry.status
          row.getCell(5).numFmt = '0.00'
          row.commit()
        }
      },
    )
    attachFile(this.ctx, outputFilePath, `ordenes_de_compra_${req.year}.xlsx`)
    return fs.createReadStream(outputFilePath)
  }

  @action({ forApps: [Application.ADMIN] })
  returnOrder(
    req: PurchaseOrderReturnOrderRQ,
  ): Promise<PurchaseOrderReturnOrderRS> {
    return purchase_order.returnOrder(this.ctx, req)
  }

  @action({ forApps: [Application.ADMIN] })
  returnOrderDetails(
    req: PurchaseOrderReturnOrderDetailsRQ,
  ): Promise<PurchaseOrderReturnOrderDetailsRS> {
    return purchase_order.returnOrderDetails(this.ctx, req)
  }
}
