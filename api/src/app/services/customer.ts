import * as fs from 'node:fs'
import * as moment from 'moment'
import { SearchRQ } from 'interface/entities/common'
import {
  CustomerAddFailRS,
  CustomerAddSuccessRS,
  CustomerListRS,
  CustomerSearchRS,
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
  ): Promise<fs.ReadStream> {
    const report = await customer.getMovementsReport(this.ctx, req)
    const Excel = require('exceljs')
    const workbook = new Excel.Workbook()
    const worksheet = workbook.addWorksheet('Customer Movements')

    // Add title
    worksheet.getCell('A1').value = 'AUXILIAR MOVIMIENTOS DE CLIENTES'
    worksheet.getCell('A1').font = { bold: false, size: 14 }
    worksheet.getCell('A1').alignment = { horizontal: 'center' }
    worksheet.mergeCells('A1:G1')

    worksheet.getCell('A2').value = 'DOMICILIO FISCAL'
    worksheet.getCell('A2').font = { bold: true, size: 12 }
    worksheet.getCell('A2').alignment = { horizontal: 'center' }
    worksheet.mergeCells('A2:G2')

    worksheet.getCell('A3').value =
      'CALLE ANGELINA 113, LAS PUENTES, MEOQUI, CHIH.'
    worksheet.getCell('A3').font = { size: 12 }
    worksheet.getCell('A3').alignment = { horizontal: 'center' }
    worksheet.mergeCells('A3:G3')

    worksheet.getCell('A4').value = 'RFC OEGE550225LC0'
    worksheet.getCell('A4').font = { size: 12 }
    worksheet.getCell('A4').alignment = { horizontal: 'center' }
    worksheet.mergeCells('A4:G4')

    // Add date range in Spanish
    moment.locale('es')
    const startDate = moment(req.start_date)
    const endDate = moment(req.end_date)
    const dateRange = `DEL ${startDate.format('DD')} DE ${startDate
      .format('MMMM')
      .toUpperCase()} AL ${endDate.format('DD')} DE ${endDate
      .format('MMMM')
      .toUpperCase()}`
    worksheet.getCell('A5').value = dateRange
    worksheet.getCell('A5').font = { bold: false }
    worksheet.getCell('A5').alignment = { horizontal: 'center' }
    worksheet.mergeCells('A5:G5')

    // Set column widths
    worksheet.columns = [
      { width: 15 }, // Date
      { width: 30 }, // Customer / Concept
      { width: 20 }, // Description
      { width: 20 }, // Bank
      {
        width: 20,
        style: { numFmt: '_($* #,##0.00_);_($* (#,##0.00);_($* "-"??_);_(@_)' },
      }, // Sell
      {
        width: 20,
        style: { numFmt: '_($* #,##0.00_);_($* (#,##0.00);_($* "-"??_);_(@_)' },
      }, // Payment
      {
        width: 20,
        style: { numFmt: '_($* #,##0.00_);_($* (#,##0.00);_($* "-"??_);_(@_)' },
      }, // New Balance
    ]

    // Add data starting from row 7
    const reportCustomerNames = Object.keys(report.customerReportInfo)
    let currentRow = 7

    for (const customerName of reportCustomerNames) {
      // Add customer name row
      const customerRow = worksheet.getRow(currentRow)
      customerRow.getCell(2).value = customerName
      customerRow.getCell(2).font = { bold: true }
      customerRow.getCell(2).alignment = { horizontal: 'center' }
      customerRow.commit()
      currentRow++

      // Add headers for this customer
      const customerHeaders = worksheet.getRow(currentRow)
      customerHeaders.values = [
        'Fecha',
        'Cliente/Concepto',
        'Descripción',
        'Forma de Pago/Banco',
        'Total Compra',
        'Abono',
        'Saldo',
      ]
      customerHeaders.font = { bold: true }
      customerHeaders.commit()
      currentRow++

      const customerEntries = report.customerReportInfo[customerName]

      // Add initial balance row
      const initialBalanceRow = worksheet.getRow(currentRow)
      initialBalanceRow.getCell(2).value = 'Saldo Anterior'
      const initialBalanceCell = initialBalanceRow.getCell(7)
      initialBalanceCell.value = Number(
        customerEntries.movements[0]?.initial_balance || 0,
      )
      initialBalanceCell.numFmt =
        '_($* #,##0.00_);_($* (#,##0.00);_($* "-"??_);_(@_)'
      initialBalanceRow.font = { bold: true }
      initialBalanceRow.commit()
      currentRow++

      // Add customer entries
      let totalPurchases = 0
      let totalPayments = 0
      let lastBalance = 0

      for (const entry of customerEntries.movements) {
        const row = worksheet.getRow(currentRow)
        row.getCell(1).value = entry.date
        row.getCell(2).value = entry.description
        row.getCell(4).value = entry.payment_method
        if (entry.movement_type === 'PURCHASE') {
          const cellE = row.getCell(5)
          cellE.value = Number(entry.amount) // Column E for purchase total
          cellE.numFmt = '_($* #,##0.00_);_($* (#,##0.00);_($* "-"??_);_(@_)'
          const cellF = row.getCell(6)
          cellF.value = ''

          const cellG = row.getCell(7)
          cellG.value = Number(entry.new_balance) // Column G for new balance
          cellG.numFmt = '_($* #,##0.00_);_($* (#,##0.00);_($* "-"??_);_(@_)'

          totalPurchases += Number(entry.amount)
        } else {
          const cellE = row.getCell(5)
          cellE.value = ''

          const cellF = row.getCell(6)
          cellF.value = Number(entry.amount) // Column F for credit payment
          cellF.numFmt = '_($* #,##0.00_);_($* (#,##0.00);_($* "-"??_);_(@_)'

          const cellG = row.getCell(7)
          cellG.value = Number(entry.new_balance) // Column G for new balance
          cellG.numFmt = '_($* #,##0.00_);_($* (#,##0.00);_($* "-"??_);_(@_)'

          lastBalance = entry.new_balance

          totalPayments += Number(entry.amount)
        }

        row.commit()
        currentRow++
      }

      // Add empty row
      currentRow++

      // Add totals row
      const totalsRow = worksheet.getRow(currentRow)
      totalsRow.getCell(4).value = 'TOTAL'
      totalsRow.getCell(5).value = totalPurchases
      totalsRow.getCell(6).value = totalPayments

      totalsRow.font = { bold: true }
      totalsRow.getCell(5).numFmt =
        '_($* #,##0.00_);_($* (#,##0.00);_($* "-"??_);_(@_)'
      totalsRow.getCell(6).numFmt =
        '_($* #,##0.00_);_($* (#,##0.00);_($* "-"??_);_(@_)'

      totalsRow.commit()
      currentRow++

      // Add global totals row
      const globalTotalsRow = worksheet.getRow(currentRow)
      globalTotalsRow.getCell(4).value = 'TOTAL DE CLIENTE'
      globalTotalsRow.getCell(5).value = customerEntries.customerGlobalTotalPurchases
      globalTotalsRow.getCell(6).value = customerEntries.customerGlobalTotalCreditPayments
      globalTotalsRow.getCell(7).value = customerEntries.customerGlobalTotalCreditBalance
      globalTotalsRow.font = { bold: true }
      globalTotalsRow.getCell(5).numFmt = '_($* #,##0.00_);_($* (#,##0.00);_($* "-"??_);_(@_)'
      globalTotalsRow.getCell(6).numFmt = '_($* #,##0.00_);_($* (#,##0.00);_($* "-"??_);_(@_)'
      globalTotalsRow.getCell(7).numFmt = '_($* #,##0.00_);_($* (#,##0.00);_($* "-"??_);_(@_)'
      globalTotalsRow.commit()
      currentRow++

      // Add empty row after totals
      currentRow++

      // Add empty row for separation
      currentRow++
    }

    // Add period totals row at the bottom
    currentRow += 2 // Add some spacing
    const periodTotalsRow = worksheet.getRow(currentRow)
    periodTotalsRow.getCell(4).value = 'TOTAL GENERAL DE CLIENTES POR PERIODO'
    periodTotalsRow.getCell(5).value = report.inDateRangeTotalPurchases
    periodTotalsRow.getCell(6).value = report.inDateRangeTotalCreditPayments
    periodTotalsRow.font = { bold: true }
    periodTotalsRow.getCell(5).numFmt = '_($* #,##0.00_);_($* (#,##0.00);_($* "-"??_);_(@_)'
    periodTotalsRow.getCell(6).numFmt = '_($* #,##0.00_);_($* (#,##0.00);_($* "-"??_);_(@_)'
    periodTotalsRow.commit()

    // Add empty row for separation
    currentRow++

    // Add general totals row
    const generalTotalsRow = worksheet.getRow(currentRow)
    generalTotalsRow.getCell(4).value = 'TOTAL GENERAL DE CLIENTES'
    generalTotalsRow.getCell(5).value = report.globalTotalPurchases
    generalTotalsRow.getCell(6).value = report.globalTotalCreditPayments
    generalTotalsRow.getCell(7).value = report.globalTotalCreditBalance
    generalTotalsRow.font = { bold: true }
    generalTotalsRow.getCell(5).numFmt = '_($* #,##0.00_);_($* (#,##0.00);_($* "-"??_);_(@_)'
    generalTotalsRow.getCell(6).numFmt = '_($* #,##0.00_);_($* (#,##0.00);_($* "-"??_);_(@_)'
    generalTotalsRow.getCell(7).numFmt = '_($* #,##0.00_);_($* (#,##0.00);_($* "-"??_);_(@_)'
    generalTotalsRow.commit()

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
