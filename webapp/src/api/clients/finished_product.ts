import { FinishedProductEndpoints } from 'interface/endpoints/finished_product'
import {
  FinishedProductAddRQ,
  FinishedProductGetSalesReportRQ,
  FinishedProductListRQ,
  FinishedProductModifyRQ,
  FinishedProductSearchRQ,
} from 'interface/requests/finished_product'
import {
  FinishedProductGetSalesReportRS,
  FinishedProductListRS,
  FinishedProductSearchRS,
} from 'interface/responses/finished_product'
import { sendRequest } from '../request'
import { AddRS, ModifyRS } from 'interface/responses/common'

export class FinishedProductClient implements FinishedProductEndpoints {
  path(): 'finished_product' {
    return 'finished_product'
  }

  add(req: FinishedProductAddRQ): Promise<AddRS> {
    return sendRequest('/finished_product/add', req)
  }

  modify(req: FinishedProductModifyRQ): Promise<ModifyRS> {
    return sendRequest('/finished_product/modify', req)
  }

  list(req: FinishedProductListRQ): Promise<FinishedProductListRS> {
    return sendRequest('/finished_product/list', req)
  }

  search(req: FinishedProductSearchRQ): Promise<FinishedProductSearchRS> {
    return sendRequest('/finished_product/search', req)
  }

  getSalesReport(req: FinishedProductGetSalesReportRQ): Promise<FinishedProductGetSalesReportRS> {
    return sendRequest('/finished_product/getSalesReport', req)
  }

  getSalesReportAsExcelSheet(req: FinishedProductGetSalesReportRQ): Promise<import('stream/web').ReadableStream<any> | import('fs').ReadStream> {
    return sendRequest('/finished_product/getSalesReportAsExcelSheet', req)
  }
}
