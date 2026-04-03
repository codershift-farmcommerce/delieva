import * as fs from 'node:fs'
import * as moment from 'moment/moment'
import { Ctx } from '../context'
import { FinishedProductEndpoints } from 'interface/endpoints/finished_product'
import {
  FinishedProductAddRQ,
  FinishedProductGetSalesReportRQ,
  FinishedProductListRQ,
  FinishedProductSearchRQ,
} from 'interface/requests/finished_product'
import {
  FinishedProductGetSalesReportRS,
  FinishedProductListRS,
  FinishedProductSearchRS,
} from 'interface/responses/finished_product'
import * as finished_product from 'api/src/app/models/finished_product'
import { action } from 'api/src/app/context/decorators/endpoint_actions'
import { Application } from 'interface'
import { AddRS, ModifyRS } from 'interface/responses/common'
import { Promise } from 'bluebird'
import * as excel from 'api/src/util/excel'
import { FileType } from 'api/src/util/excel'
import { Worksheet } from 'exceljs'
import { attachFile } from 'api/src/util/files'

export class FinishedProductService implements FinishedProductEndpoints {
  private ctx: Ctx

  path(): 'finished_product' {
    return 'finished_product'
  }

  @action({ forApps: [Application.ADMIN] })
  add(req: FinishedProductAddRQ): Promise<AddRS> {
    return finished_product.add(this.ctx, req)
  }

  @action({ forApps: [Application.ADMIN] })
  modify(req: FinishedProductAddRQ): Promise<ModifyRS> {
    return finished_product.modify(this.ctx, req)
  }

  @action({ forApps: [Application.ADMIN] })
  list(req: FinishedProductListRQ): Promise<FinishedProductListRS> {
    return finished_product.list(this.ctx, req)
  }

  @action({ forApps: [Application.ADMIN] })
  search(req: FinishedProductSearchRQ): Promise<FinishedProductSearchRS> {
    return finished_product.search(this.ctx, req)
  }

  @action({ forApps: [Application.ADMIN] })
  getSalesReport(
    req: FinishedProductGetSalesReportRQ,
  ): Promise<FinishedProductGetSalesReportRS> {
    return finished_product.getSalesReport(this.ctx, req)
  }

  @action({ forApps: [Application.ADMIN] })
  async getSalesReportAsExcelSheet(
    req: FinishedProductGetSalesReportRQ,
  ): Promise<fs.ReadStream> {
    const report = await finished_product.getSalesReport(this.ctx, req)

    const { outputFilePath } = await excel.writeOnFile(
      FileType.FINISHED_PRODUCT_SALES_TEMPLATE,
      (worksheet: Worksheet) => {
        for (let i = 0; i < report.entries.length; i++) {
          const row = worksheet.getRow(2 + i)
          const entry = report.entries[i]
          row.getCell(1).value = moment(entry.date).format('DD/MM/yyyy')
          row.getCell(2).value = entry.finished_product_code
          row.getCell(3).value = entry.finished_product_name
          row.getCell(4).value = Number(entry.quantity)
          row.getCell(5).value = entry.total_sales
          row.getCell(6).value =
            Number(entry.total_sales) / Number(entry.quantity)
          row.getCell(7).value = entry.cash_register_name
          row.getCell(8).value = entry.customer_name || '-'

          row.getCell(4).numFmt = '0.00'
          row.getCell(5).numFmt = '0.00'
          row.getCell(6).numFmt = '0.00'
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
}
