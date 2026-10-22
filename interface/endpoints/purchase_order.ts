import {
  PurchaseOrderProcessRQ,
  PurchaseOrderGetReportRQ,
  PurchaseOrderGetReceiptRQ,
  PurchaseOrderGetAnnualReportRQ,
  PurchaseOrderReturnOrderRQ,
  PurchaseOrderReturnOrderDetailsRQ,
} from '../requests/purchase_order'
import {
  PurchaseOrderProcessSuccessRS,
  PurchaseOrderProcessFailRS,
  PurchaseOrderGetReportRS,
  PurchaseOrderGetReceiptRS,
  PurchaseOrderReturnOrderRS,
  PurchaseOrderReturnOrderDetailsRS,
} from '../responses/purchase_order'

export interface PurchaseOrderEndpoints {
  path(): 'purchase_order'

  process(
    req: PurchaseOrderProcessRQ,
  ): Promise<PurchaseOrderProcessSuccessRS | PurchaseOrderProcessFailRS>

  getReceipt(req: PurchaseOrderGetReceiptRQ): Promise<PurchaseOrderGetReceiptRS>

  getReport(req: PurchaseOrderGetReportRQ): Promise<PurchaseOrderGetReportRS>

  getAnnualReportAsExcelSheet(
    req: PurchaseOrderGetAnnualReportRQ,
  ): Promise<import('stream/web').ReadableStream<any> | import('fs').ReadStream>

  returnOrder(
    req: PurchaseOrderReturnOrderRQ,
  ): Promise<PurchaseOrderReturnOrderRS>

  returnOrderDetails(
    req: PurchaseOrderReturnOrderDetailsRQ,
  ): Promise<PurchaseOrderReturnOrderDetailsRS>
}
