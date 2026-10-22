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
    return Promise.resolve(new ReadableStream())
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
