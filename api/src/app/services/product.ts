import * as fs from 'node:fs'
import * as excel from 'api/src/util/excel'
import { ProductEndpoints } from 'interface/endpoints/product'
import { Ctx } from 'api/src/app/context'
import * as moment from 'moment'
import { action } from 'api/src/app/context/decorators/endpoint_actions'
import { Application } from 'interface'
import * as product from 'api/src/app/models/product'
import {
  ProductListRS,
  ProductGetByCodeRS,
  ProductSearchRS,
  ProductGetUnitPricesForCartRS,
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
import { FileType } from 'api/src/util/excel'
import { attachFile } from 'api/src/util/files'
import { Worksheet } from 'exceljs'

export class ProductService implements ProductEndpoints {
  private ctx: Ctx

  path(): 'product' {
    return 'product'
  }

  @action({ forApps: [Application.POS, Application.ADMIN] })
  search(req: ProductSearchRQ): Promise<ProductSearchRS> {
    return product.search(this.ctx, req)
  }

  @action({ forApps: [Application.ADMIN] })
  add(req: ProductAddRQ): Promise<AddRS> {
    return product.add(this.ctx, req)
  }

  @action({ forApps: [Application.POS, Application.ADMIN] })
  getByCode(req: ProductGetByCodeRQ): Promise<ProductGetByCodeRS> {
    return product.getByCode(this.ctx, req)
  }

  @action({ forApps: [Application.ADMIN] })
  list(req: ProductListRQ): Promise<ProductListRS> {
    return product.list(this.ctx, req)
  }

  @action({ forApps: [Application.ADMIN] })
  modify(req: ProductModifyRQ): Promise<ModifyRS> {
    return product.modify(this.ctx, req)
  }

  @action({ forApps: [Application.ADMIN] })
  enable(req: ProductEnableRQ): Promise<ProductEnableRS> {
    return product.enable(this.ctx, req)
  }

  @action({ forApps: [Application.ADMIN] })
  disable(req: ProductDisableRQ): Promise<ProductDisableRS> {
    return product.disable(this.ctx, req)
  }

  @action({ forApps: [Application.ADMIN] })
  getSalesReport(
    req: ProductGetSalesReportRQ,
  ): Promise<ProductGetSalesReportRS> {
    return product.getSalesReport(this.ctx, req)
  }

  @action({ forApps: [Application.ADMIN] })
  async getSalesReportAsExcelSheet(
    req: ProductGetSalesReportRQ,
  ): Promise<ReadableStream> {
    const report = await product.getSalesReport(this.ctx, req)
    const { outputFilePath } = await excel.writeOnFile(
      FileType.PRODUCT_SALES_TEMPLATE,
      (worksheet: Worksheet) => {
        // const row = worksheet.getRow(2)
        // row.getCell(1).value = `${moment(req.start_date).format(
        //   'DD MMM YYYY',
        // )} - ${moment(req.end_date).format('DD MMM YYYY')}`

        for (let i = 0; i < report.entries.length; i++) {
          const row = worksheet.getRow(2 + i)
          const entry = report.entries[i]
          const unitQuantity = entry.finished_products.reduce(
            (acc, product) => acc + product.unit_quantity,
            0,
          )
          row.getCell(1).value = moment(entry.date).format('DD/MM/yyyy')
          row.getCell(2).value = entry.product_code
          row.getCell(3).value = entry.product_name
          row.getCell(4).value = entry.finished_products
            .map(p => p.name)
            .join(',')
          row.getCell(5).value = Number(entry.quantity)
          row.getCell(6).value = Number(entry.quantity * unitQuantity)
          row.getCell(7).value = entry.total_sales
          row.getCell(8).value = entry.cash_register_name

          row.getCell(6).numFmt = '0.00'
          row.getCell(5).numFmt = '0.00'
          row.getCell(7).numFmt = '0.00'
          row.commit()
        }
      },
    )
    attachFile(
      this.ctx,
      outputFilePath,
      `product_sales_${req.start_date}-${req.end_date}.xlsx`,
    )
    return Promise.resolve(fs.createReadStream(outputFilePath))
  }

  @action({ forApps: [Application.POS, Application.ADMIN] })
  getUnitPricesForCart(
    req: ProductGetUnitPricesForCartRQ,
  ): Promise<ProductGetUnitPricesForCartRS> {
    return product.getUnitPricesForCart(this.ctx, req)
  }
}
