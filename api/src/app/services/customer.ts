import * as fs from 'node:fs'
import * as moment from 'moment'
import { SearchRQ } from 'interface/entities/common'
import {
  CustomerAddFailRS,
  CustomerAddSuccessRS,
  CustomerListRS,
  CustomerSearchRS,
  CustomerGetMovementsReportRS,
} from 'interface/responses/customer'
import { CustomerGetMovementsReportRQ } from 'interface/requests/customer'
import { CustomerEndpoints } from 'interface/endpoints/customer'
import { Ctx } from 'api/src/app/context'
import * as customer from 'api/src/app/models/customer'
import { action } from '../context/decorators/endpoint_actions'
import { Application } from 'interface'
import {
  CustomerAddRQ,
  CustomerDisableRQ,
  CustomerEnableRQ,
  CustomerListRQ,
  CustomerModifyRQ,
} from 'interface/requests/customer'
import { ModifyRS } from 'interface/responses/common'
import * as excel from 'api/src/util/excel'
import { FileType } from 'api/src/util/excel'
import { Worksheet } from 'exceljs'
import { attachFile } from 'api/src/util/files'

export class CustomerService implements CustomerEndpoints {
  private ctx: Ctx

  path(): 'customer' {
    return 'customer'
  }

  @action({ forApps: [Application.ADMIN] })
  add(req: CustomerAddRQ): Promise<CustomerAddSuccessRS | CustomerAddFailRS> {
    return customer.add(this.ctx, req)
  }

  @action({ forApps: [Application.POS, Application.ADMIN] })
  search(req: SearchRQ): Promise<CustomerSearchRS> {
    return customer.search(this.ctx, req)
  }

  @action({ forApps: [Application.ADMIN] })
  list(req: CustomerListRQ): Promise<CustomerListRS> {
    return customer.list(this.ctx, req)
  }

  @action({ forApps: [Application.ADMIN] })
  modify(req: CustomerModifyRQ): Promise<ModifyRS> {
    return customer.modify(this.ctx, req)
  }

  @action({ forApps: [Application.ADMIN] })
  enable(req: CustomerEnableRQ): Promise<ModifyRS> {
    return customer.enable(this.ctx, req)
  }

  @action({ forApps: [Application.ADMIN] })
  disable(req: CustomerDisableRQ): Promise<ModifyRS> {
    return customer.disable(this.ctx, req)
  }

  @action({ forApps: [Application.ADMIN] })
  async getMovementsReportAsExcelSheet(
    req: CustomerGetMovementsReportRQ,
  ): Promise<ReadableStream> {
    const report = await customer.getMovementsReport(this.ctx, req)
    const Excel = require('exceljs')
    const workbook = new Excel.Workbook()
    const worksheet = workbook.addWorksheet('Customer Movements')

    // Add title, subtitle and fiscal address
    worksheet.getCell('A1').value = 'AUXILIAR MOVIMIENTOS DE CLIENTES'
    worksheet.getCell('A1').font = { bold: false, size: 14 }
    worksheet.getCell('A1').alignment = { horizontal: 'center' }
    worksheet.mergeCells('A1:F1')

    worksheet.getCell('A2').value = 'AUXILIAR DE MOVIMIENTOS'
    worksheet.getCell('A2').font = { bold: false, size: 12 }
    worksheet.getCell('A2').alignment = { horizontal: 'center' }
    worksheet.mergeCells('A2:F2')

    worksheet.getCell('A3').value = 'DOMICILIO FISCAL'
    worksheet.getCell('A3').font = { bold: true, size: 12 }
    worksheet.getCell('A3').alignment = { horizontal: 'center' }
    worksheet.mergeCells('A3:F3')

    worksheet.getCell('A4').value =
      'CALLE ANGELINA 113, LAS PUENTES, MEOQUI, CHIH.'
    worksheet.getCell('A4').font = { size: 12 }
    worksheet.getCell('A4').alignment = { horizontal: 'center' }
    worksheet.mergeCells('A4:F4')

    worksheet.getCell('A5').value = 'RFC OEGE550225LC0'
    worksheet.getCell('A5').font = { size: 12 }
    worksheet.getCell('A5').alignment = { horizontal: 'center' }
    worksheet.mergeCells('A5:F5')

    worksheet.getCell('A6').value = 'AUXILIAR DE MOVIMIENTOS'
    worksheet.getCell('A6').font = { bold: false, size: 12 }
    worksheet.getCell('A6').alignment = { horizontal: 'center' }
    worksheet.mergeCells('A6:F6')

    worksheet.getCell('A7').value = 'CLIENTES'
    worksheet.getCell('A7').font = { bold: true, size: 12 }
    worksheet.getCell('A7').alignment = { horizontal: 'center' }
    worksheet.mergeCells('A7:F7')

    // Add date range in Spanish
    moment.locale('es')
    const startDate = moment(req.start_date)
    const endDate = moment(req.end_date)
    const dateRange = `DEL ${startDate.format('DD')} DE ${startDate
      .format('MMMM')
      .toUpperCase()} AL ${endDate.format('DD')} DE ${endDate
      .format('MMMM')
      .toUpperCase()}`
    worksheet.getCell('A8').value = dateRange
    worksheet.getCell('A8').font = { bold: false }
    worksheet.getCell('A8').alignment = { horizontal: 'center' }
    worksheet.mergeCells('A8:F8')

    // Add headers
    const headers = worksheet.getRow(10)
    headers.values = [
      'Fecha',
      'Cliente/Concepto',
      'Descripción',
      'Banco',
      'Total Compra',
      'Abono',
      'Saldo',
    ]
    worksheet.getRow(10).font = { bold: true }

    // Set column widths
    worksheet.columns = [
      { width: 15 }, // Date
      { width: 30 }, // Customer / Concept
      { width: 20 }, // Description
      { width: 20 }, // Venta
      { width: 15 }, // Amount
      { width: 15 }, // Balance
    ]

    // Add data starting from row 11
    const reportCustomerNames = Object.keys(report.entries)
    let currentRow = 11

    for (const customerName of reportCustomerNames) {
      // Add customer name row
      const customerRow = worksheet.getRow(currentRow)
      customerRow.getCell(2).value = customerName
      customerRow.getCell(2).font = { bold: true }
      customerRow.getCell(2).alignment = { horizontal: 'center' }
      customerRow.commit()
      currentRow++

      // Add customer entries
      let totalPurchases = 0
      let totalPayments = 0
      let lastBalance = 0

      const customerEntries = report.entries[customerName]
      for (const entry of customerEntries) {
        const row = worksheet.getRow(currentRow)
        row.getCell(1).value = entry.date
        row.getCell(2).value = entry.description
        row.getCell(4).value = entry.bank_account_name || '' // Bank account name
        if (entry.movement_type === 'PURCHASE') {
          row.getCell(5).value = entry.amount // Column E for purchase total
          row.getCell(6).value = 0 // Column F for credit payment
          totalPurchases += Number(entry.amount)
        } else {
          row.getCell(5).value = 0 // Column E for purchase total
          row.getCell(6).value = entry.amount // Column F for credit payment
          totalPayments += Number(entry.amount)
        }
        row.getCell(7).value = entry.balance // Column G for credits balance
        lastBalance = entry.balance
        row.commit()
        currentRow++
      }

      // Add totals row for this customer
      const totalsRow = worksheet.getRow(currentRow)
      totalsRow.getCell(2).value = 'Totales'
      totalsRow.getCell(5).value = totalPurchases
      totalsRow.getCell(6).value = totalPayments
      totalsRow.getCell(7).value = lastBalance
      // Style the totals row
      totalsRow.font = { bold: true }
      totalsRow.commit()
      currentRow++

      // Add empty row after totals
      currentRow++

      // Add empty row for separation
      currentRow++
    }

    // Save file
    const outputFilePath = `/tmp/customer_movements_${req.start_date}-${req.end_date}.xlsx`
    await workbook.xlsx.writeFile(outputFilePath)
    attachFile(
      this.ctx,
      outputFilePath,
      `customer_movements_${req.start_date}-${req.end_date}.xlsx`,
    )
    return Promise.resolve(fs.createReadStream(outputFilePath))
  }
}
