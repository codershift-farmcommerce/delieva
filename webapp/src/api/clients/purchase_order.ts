import { PurchaseOrderEndpoints } from 'interface/endpoints/purchase_order'
import {
  PurchaseOrderGetReceiptRQ,
  PurchaseOrderGetReportRQ,
  PurchaseOrderReturnOrderDetailsRQ,
  PurchaseOrderReturnOrderRQ,
  PurchaseOrderProcessRQ,
  PurchaseOrderGetAnnualReportRQ,
} from 'interface/requests/purchase_order'
import {
  PurchaseOrderGetReceiptRS,
  PurchaseOrderGetReportRS,
  PurchaseOrderReturnOrderDetailsRS,
  PurchaseOrderReturnOrderRS,
  PurchaseOrderProcessFailRS,
  PurchaseOrderProcessSuccessRS,
} from 'interface/responses/purchase_order'
import { sendRequest } from '../request'

export class PurchaseOrderClient implements PurchaseOrderEndpoints {
  path(): 'purchase_order' {
    return 'purchase_order'
  }

  process(req: PurchaseOrderProcessRQ): Promise<PurchaseOrderProcessSuccessRS | PurchaseOrderProcessFailRS> {
    return sendRequest('/purchase_order/process', req)
  }

  getReceipt(req: PurchaseOrderGetReceiptRQ): Promise<PurchaseOrderGetReceiptRS> {
    return sendRequest('/purchase_order/getReceipt', req)
  }

  getReport(req: PurchaseOrderGetReportRQ): Promise<PurchaseOrderGetReportRS> {
    return sendRequest('/purchase_order/getReport', req)
  }

  getAnnualReportAsExcelSheet(
    req: PurchaseOrderGetAnnualReportRQ,
  ): Promise<import('stream/web').ReadableStream<any> | import('fs').ReadStream> {
    return sendRequest('/purchase_order/getAnnualReportAsExcelSheet', req)
  }

  returnOrder(req: PurchaseOrderReturnOrderRQ): Promise<PurchaseOrderReturnOrderRS> {
    return sendRequest('/purchase_order/returnOrder', req)
  }

  returnOrderDetails(
    req: PurchaseOrderReturnOrderDetailsRQ,
  ): Promise<PurchaseOrderReturnOrderDetailsRS> {
    return sendRequest('/purchase_order/returnOrderDetails', req)
  }
}
