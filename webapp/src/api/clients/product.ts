import { ProductEndpoints } from 'interface/endpoints/product'
import { sendRequest } from '../request'
import {
  ProductListRS,
  ProductGetByCodeRS,
  ProductSearchRS,
  ProductGetUnitPricesForCartRS,
  ProductAddSuccessRS,
  ProductAddFailRS,
  ProductDisableRS,
  ProductEnableRS,
  ProductGetSalesReportRS,
} from 'interface/responses/product'
import {
  ProductListRQ,
  ProductGetByCodeRQ,
  ProductSearchRQ,
  ProductModifyRQ,
  ProductGetUnitPricesForCartRQ,
  ProductAddRQ,
  ProductDisableRQ,
  ProductEnableRQ,
  ProductGetSalesReportRQ,
} from 'interface/requests/product'
import { AddRS, ModifyRS } from 'interface/responses/common'

export class ProductClient implements ProductEndpoints {
  path(): 'product' {
    return 'product'
  }

  search(req: ProductSearchRQ): Promise<ProductSearchRS> {
    return sendRequest('/product/search', req)
  }

  add(req: ProductAddRQ): Promise<AddRS> {
    return sendRequest('/product/add', req)
  }

  getByCode(req: ProductGetByCodeRQ): Promise<ProductGetByCodeRS> {
    return sendRequest('/product/getByCode', req)
  }

  list(req: ProductListRQ): Promise<ProductListRS> {
    return sendRequest('/product/list', req)
  }

  async modify(req: ProductModifyRQ): Promise<ModifyRS> {
    return sendRequest('/product/modify', req)
  }

  getUnitPricesForCart(req: ProductGetUnitPricesForCartRQ): Promise<ProductGetUnitPricesForCartRS> {
    return sendRequest('/product/getUnitPricesForCart', req)
  }

  disable(req: ProductDisableRQ): Promise<ProductDisableRS> {
    return sendRequest('/product/disable', req)
  }

  enable(req: ProductEnableRQ): Promise<ProductEnableRS> {
    return sendRequest('/product/enable', req)
  }

  getSalesReport(req: ProductGetSalesReportRQ): Promise<ProductGetSalesReportRS> {
    return sendRequest('/product/getSalesReport', req)
  }

  getSalesReportAsExcelSheet(req: ProductGetSalesReportRQ): Promise<import('stream/web').ReadableStream<any> | import('fs').ReadStream> {
    return sendRequest('/product/getSalesReportAsExcelSheet', req)
  }
}
