import {
  ProductSearchRQ,
  ProductGetByCodeRQ,
  ProductListRQ,
  ProductModifyRQ,
  ProductGetUnitPricesForCartRQ,
  ProductAddRQ,
  ProductEnableRQ,
  ProductDisableRQ,
  ProductGetSalesReportRQ,
} from '../requests/product'
import {
  ProductSearchRS,
  ProductGetByCodeRS,
  ProductListRS,
  ProductGetUnitPricesForCartRS,
  ProductEnableRS,
  ProductDisableRS,
  ProductGetSalesReportRS,
} from '../responses/product'
import { AddRS, ModifyRS } from '../responses/common'

export interface ProductEndpoints {
  path(): 'product'

  add(req: ProductAddRQ): Promise<AddRS>

  search(req: ProductSearchRQ): Promise<ProductSearchRS>

  getByCode(req: ProductGetByCodeRQ): Promise<ProductGetByCodeRS>

  list(req: ProductListRQ): Promise<ProductListRS>

  modify(req: ProductModifyRQ): Promise<ModifyRS>

  enable(req: ProductEnableRQ): Promise<ProductEnableRS>

  disable(req: ProductDisableRQ): Promise<ProductDisableRS>

  getSalesReport(req: ProductGetSalesReportRQ): Promise<ProductGetSalesReportRS>

  getSalesReportAsExcelSheet(
    req: ProductGetSalesReportRQ,
  ): Promise<import('stream/web').ReadableStream<any> | import('fs').ReadStream>

  getUnitPricesForCart( //TODO: Move to cart endpoint file.
    req: ProductGetUnitPricesForCartRQ,
  ): Promise<ProductGetUnitPricesForCartRS>
}
