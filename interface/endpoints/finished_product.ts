import {
  FinishedProductAddRQ,
  FinishedProductGetSalesReportRQ,
  FinishedProductListRQ,
  FinishedProductModifyRQ,
  FinishedProductSearchRQ,
} from '../requests/finished_product'
import {
  FinishedProductGetSalesReportRS,
  FinishedProductListRS,
  FinishedProductSearchRS,
} from '../responses/finished_product'
import { AddRS, ModifyRS } from '../responses/common'
import { ProductGetSalesReportRQ } from '../requests/product'

export interface FinishedProductEndpoints {
  path(): 'finished_product'

  add(req: FinishedProductAddRQ): Promise<AddRS>

  modify(req: FinishedProductModifyRQ): Promise<ModifyRS>

  list(req: FinishedProductListRQ): Promise<FinishedProductListRS>

  search(req: FinishedProductSearchRQ): Promise<FinishedProductSearchRS>

  getSalesReport(
    req: FinishedProductGetSalesReportRQ,
  ): Promise<FinishedProductGetSalesReportRS>

  getSalesReportAsExcelSheet(
    req: FinishedProductGetSalesReportRQ,
  ): Promise<import('stream/web').ReadableStream<any> | import('fs').ReadStream>
}
