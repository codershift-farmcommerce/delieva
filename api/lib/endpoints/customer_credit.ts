import {
  CustomerCreditAddPaymentRQ,
  CustomerCreditCancelPaymentRQ,
  CustomerCreditGetCustomerCreditPurchaseOrdersReportRQ,
  CustomerCreditGetForCustomerRQ,
  CustomerCreditGetPaymentReceiptRQ,
  CustomerCreditGetPaymentsByCustomerRQ,
  CustomerCreditGetPaymentsOfCurrentOpenReconciliationRQ,
  CustomerCreditGetUnpaidPurchaseOrdersRQ,
  CustomerCreditListRQ,
} from '../requests/customer_credit'
import {
  CustomerCreditAddPaymentRS,
  CustomerCreditCancelPaymentRS,
  CustomerCreditGetCustomerCreditPurchaseOrdersReportRS,
  CustomerCreditGetForCustomerRS,
  CustomerCreditGetPaymentReceiptRS,
  CustomerCreditGetPaymentsGetByCustomerRS,
  CustomerCreditGetPaymentsOfCurrentOpenReconciliationRS,
  CustomerCreditGetUnpaidPurchaseOrdersRS,
  CustomerCreditListRS,
} from '../responses/customer_credit'
import { ProductGetSalesReportRQ } from '../requests/product'

export interface CustomerCreditEndpoints {
  path(): 'customer_credit'

  getForCustomer(
    req: CustomerCreditGetForCustomerRQ,
  ): Promise<CustomerCreditGetForCustomerRS>

  list(req: CustomerCreditListRQ): Promise<CustomerCreditListRS>

  addPayment(
    req: CustomerCreditAddPaymentRQ,
  ): Promise<CustomerCreditAddPaymentRS>

  cancelPayment(
    req: CustomerCreditCancelPaymentRQ,
  ): Promise<CustomerCreditCancelPaymentRS>

  getPaymentReceipt(
    req: CustomerCreditGetPaymentReceiptRQ,
  ): Promise<CustomerCreditGetPaymentReceiptRS>

  getUnpaidPurchaseOrders(
    req: CustomerCreditGetUnpaidPurchaseOrdersRQ,
  ): Promise<CustomerCreditGetUnpaidPurchaseOrdersRS>

  getPaymentsByCustomer(
    req: CustomerCreditGetPaymentsByCustomerRQ,
  ): Promise<CustomerCreditGetPaymentsGetByCustomerRS>

  getCustomerCreditPurchaseOrdersReport(
    req: CustomerCreditGetCustomerCreditPurchaseOrdersReportRQ,
  ): Promise<CustomerCreditGetCustomerCreditPurchaseOrdersReportRS>

  getCustomerCreditPurchaseOrdersReportAsExcelSheet(
    req: CustomerCreditGetCustomerCreditPurchaseOrdersReportRQ,
  ): Promise<ReadableStream>

  getPaymentsOfCurrentOpenReconciliation(
    req: CustomerCreditGetPaymentsOfCurrentOpenReconciliationRQ,
  ): Promise<CustomerCreditGetPaymentsOfCurrentOpenReconciliationRS>
}
