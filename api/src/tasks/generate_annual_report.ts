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
    console.error('Usage: yarn generate:annual-report <year>')
    process.exit(1)
  }

  const knex = getClient(DATABASE.DELIEVA)!
  const ctx = { knex } as unknown as Ctx

  console.log(`Fetching purchase orders for year ${year}...`)
  const report = await getAnnualReport(ctx, { year, withDetails: false })
  console.log(`Found ${report.entries.length} entries`)

  const outputPath = path.join(process.cwd(), `ordenes_de_compra_${year}.xlsx`)

  const workbook = new Excel.Workbook()
  await workbook.xlsx.readFile(InputFilePaths[FileType.YEARLY_PURCHASE_ORDERS_TEMPLATE])
  const worksheet = workbook.getWorksheet(1)

  if (worksheet) {
    for (let i = 0; i < report.entries.length; i++) {
      const row = worksheet.getRow(2 + i)
      const entry = report.entries[i]
      row.getCell(1).value = entry.order_id
      row.getCell(2).value = moment(entry.created_at).format('DD/MM/YYYY hh:mm a')
      row.getCell(3).value = entry.cash_register_name
      row.getCell(4).value = entry.customer.name
      row.getCell(5).value = Number(entry.total)
      row.getCell(5).numFmt = '0.00'
      row.getCell(6).value = entry.form_of_payments
        .map(fop => fop.form_of_payment)
        .join(', ')
      row.getCell(7).value = entry.status
      row.getCell(8).value = entry.returned_cause
      row.getCell(9).value = entry.returned_at ? moment(entry.returned_at).format('DD/MM/YYYY hh:mm a') : null
      row.commit()
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
