import * as fs from 'fs'
import * as path from 'node:path'
import xlsx from 'node-xlsx'
import * as Excel from 'exceljs'
import { Worksheet } from 'exceljs'

export enum FileType {
  PRODUCT_SALES_TEMPLATE = 'PRODUCT_SALES_TEMPLATE',
  FINISHED_PRODUCT_SALES_TEMPLATE = 'FINISHED_PRODUCT_SALES_TEMPLATE',
  CASH_REGISTER_RECONCILIATION_STATEMENT_TEMPLATE = 'CASH_REGISTER_RECONCILIATION_STATEMENT_TEMPLATE',
  CUSTOMER_CREDIT_BALANCE_TEMPLATE = 'CUSTOMER_CREDIT_BALANCE_TEMPLATE',
  CUSTOMER_MOVEMENTS_TEMPLATE = 'CUSTOMER_MOVEMENTS_TEMPLATE',
  YEARLY_PURCHASE_ORDERS_TEMPLATE = 'YEARLY_PURCHASE_ORDERS_TEMPLATE',
  YEARLY_PURCHASE_ORDERS_WITH_DETAILS_TEMPLATE = 'YEARLY_PURCHASE_ORDERS_WITH_DETAILS_TEMPLATE',
}
export const InputFilePaths: Record<FileType, string> = {
  [FileType.PRODUCT_SALES_TEMPLATE]: path.join(
    __dirname,
    'input_files/product_sales_template.xlsx',
  ),
  [FileType.FINISHED_PRODUCT_SALES_TEMPLATE]: path.join(
    __dirname,
    'input_files/finished_product_sales_template.xlsx',
  ),
  [FileType.CASH_REGISTER_RECONCILIATION_STATEMENT_TEMPLATE]: path.join(
    __dirname,
    'input_files/cash_register_reconciliation_statement_template.xlsx',
  ),
  [FileType.CUSTOMER_CREDIT_BALANCE_TEMPLATE]: path.join(
    __dirname,
    'input_files/customer_credit_balance_template.xlsx',
  ),
  [FileType.CUSTOMER_MOVEMENTS_TEMPLATE]: path.join(
    __dirname,
    'input_files/customer_movements_template.xlsx',
  ),
  [FileType.YEARLY_PURCHASE_ORDERS_TEMPLATE]: path.join(
    __dirname,
    'input_files/purchase_orders_template.xlsx',
  ),
  [FileType.YEARLY_PURCHASE_ORDERS_WITH_DETAILS_TEMPLATE]: path.join(
    __dirname,
    'input_files/purchase_orders_with_details_template.xlsx',
  ),
}
export const OutputFilePaths: Record<FileType, () => string> = {
  [FileType.PRODUCT_SALES_TEMPLATE]: () => {
    const timestamp = new Date().getTime()
    return `/tmp/product_sales_template-${timestamp}.xlsx`
  },
  [FileType.FINISHED_PRODUCT_SALES_TEMPLATE]: () => {
    const timestamp = new Date().getTime()
    return `/tmp/finished_product_sales_template-${timestamp}.xlsx`
  },
  [FileType.CASH_REGISTER_RECONCILIATION_STATEMENT_TEMPLATE]: () => {
    const timestamp = new Date().getTime()
    return `/tmp/cash_register_reconciliation_statement_template-${timestamp}.xlsx`
  },
  [FileType.CUSTOMER_CREDIT_BALANCE_TEMPLATE]: () => {
    const timestamp = new Date().getTime()
    return `/tmp/customer_credit_balance_template-${timestamp}.xlsx`
  },
  [FileType.CUSTOMER_MOVEMENTS_TEMPLATE]: () => {
    const timestamp = new Date().getTime()
    return `/tmp/customer_movements_template-${timestamp}.xlsx`
  },
  [FileType.YEARLY_PURCHASE_ORDERS_TEMPLATE]: () => {
    const timestamp = new Date().getTime()
    return `/tmp/purchase_orders_template-${timestamp}.xlsx`
  },
  [FileType.YEARLY_PURCHASE_ORDERS_WITH_DETAILS_TEMPLATE]: () => {
    const timestamp = new Date().getTime()
    return `/tmp/purchase_orders_with_details_template-${timestamp}.xlsx`
  },
}

export function parseSheet(FileType: FileType) {
  const filepath = InputFilePaths[FileType]
  return xlsx.parse(fs.readFileSync(filepath))
}

export async function writeOnFile(
  FileType: FileType,
  fn: (worksheet: Worksheet) => void,
): Promise<{ outputFilePath: string }> {
  const inputFilePath = InputFilePaths[FileType]
  const outputFilePath = OutputFilePaths[FileType]()
  const workbook = new Excel.Workbook()
  await workbook.xlsx.readFile(inputFilePath)
  const worksheet = workbook.getWorksheet(1)
  if (worksheet) {
    fn(worksheet)
  }
  await workbook.xlsx.writeFile(outputFilePath)
  setTimeout(() => fs.rmSync(outputFilePath), 60 * 1000)
  return { outputFilePath }
}
