import { PurchaseOrderEndpoints } from 'lib/endpoints/purchase_order'
import { Ctx } from 'src/app/context'
import {
  PurchaseOrderGetReceiptRQ,
  PurchaseOrderGetReportRQ,
  PurchaseOrderReturnOrderDetailsRQ,
  PurchaseOrderReturnOrderRQ,
  PurchaseOrderProcessRQ,
} from 'lib/requests/purchase_order'
import {
  PurchaseOrderGetReportRS,
  PurchaseOrderProcessSuccessRS,
  PurchaseOrderProcessFailRS,
  PurchaseOrderGetReceiptRS,
  PurchaseOrderReturnOrderRS,
  PurchaseOrderReturnOrderDetailsRS,
} from 'lib/responses/purchase_order'
import * as purchase_order from 'src/app/models/purchase_order'
import { action } from '../context/decorators/endpoint_actions'
import { Application } from 'lib'
import { Promise } from 'bluebird'

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

  @action({ forApp: Application.ADMIN })
  getReport(req: PurchaseOrderGetReportRQ): Promise<PurchaseOrderGetReportRS> {
    return purchase_order.getReport(this.ctx, req)
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
