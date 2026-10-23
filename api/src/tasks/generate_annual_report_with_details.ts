import * as path from 'node:path'
import * as Excel from 'exceljs'
import * as moment from 'moment'
import { getClient } from 'api/setup/db/client'
import { DATABASE } from 'api/setup/db/types'
import { getAnnualReport } from 'api/src/app/models/purchase_order'
import { InputFilePaths, FileType } from 'api/src/util/excel'
import { Ctx } from 'api/src/app/context'

async function run() {
  const year = Number(process.argv[2])
  if (!year) {
    console.error('Usage: yarn generate:annual-report-with-details <year>')
    process.exit(1)
  }

  const knex = getClient(DATABASE.DELIEVA)!
  const ctx = { knex } as unknown as Ctx

  console.log(`Fetching purchase orders with details for year ${year}...`)
  const report = await getAnnualReport(ctx, { year, withDetails: true })
  console.log(`Found ${report.entries.length} orders`)

  const outputPath = path.join(process.cwd(), `ordenes_de_compra_con_detalles_${year}.xlsx`)

  const workbook = new Excel.Workbook()
  await workbook.xlsx.readFile(InputFilePaths[FileType.YEARLY_PURCHASE_ORDERS_WITH_DETAILS_TEMPLATE])
  const worksheet = workbook.getWorksheet(1)

  if (worksheet) {
    let rowIndex = 2
    for (const entry of report.entries) {
      for (const detail of entry.detail) {
        const row = worksheet.getRow(rowIndex)
        row.getCell(1).value = entry.order_id
        row.getCell(2).value = moment(entry.created_at).format('DD/MM/YYYY')
        row.getCell(3).value = entry.cash_register_name
        row.getCell(4).value = entry.customer.name
        row.getCell(5).value = Number(entry.total)
        row.getCell(5).numFmt = '0.00'
        row.getCell(6).value = entry.form_of_payments
          .map(fop => fop.form_of_payment)
          .join(', ')
        row.getCell(7).value = entry.status
        row.getCell(8).value = detail.product.code
        row.getCell(9).value = detail.product.name
        row.getCell(10).value = Number(detail.unit_price)
        row.getCell(10).numFmt = '0.00'
        row.getCell(11).value = Number(detail.quantity)
        row.getCell(11).numFmt = '0.00'
        row.getCell(12).value = Number(detail.detail_total)
        row.getCell(12).numFmt = '0.00'
        row.commit()
        rowIndex++
      }
    }
  }

  await workbook.xlsx.writeFile(outputPath)
  console.log(`Report saved to: ${outputPath}`)

  await knex.destroy()
}

run().catch(err => {
  console.error(err)
  process.exit(1)
})
