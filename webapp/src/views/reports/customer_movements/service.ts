import { CustomerClient } from '../../../api/clients/customer'

export interface CustomerMovementsReportRequest {
  start_date: string
  end_date: string
}

export async function downloadCustomerMovementsReport(req: CustomerMovementsReportRequest) {
  const client = new CustomerClient()
  try {
    try {
      const stream = await client.getMovementsReportAsExcelSheet(req)
      const blob = await new Response(stream).blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `customer_movements_${req.start_date}-${req.end_date}.xlsx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      throw new Error('Error downloading customer movements report')
    }
  } catch (error) {
    throw new Error('Error downloading customer movements report')
  }
}

export type { CustomerMovementsReportRequest as CustomerMovementsReportRequestType }
