import { CustomerCreditEndpoints } from 'interface/endpoints/customer_credit'
import {
  CustomerCreditAddPaymentRQ,
  CustomerCreditCancelPaymentRQ,
  CustomerCreditGetCustomerCreditPurchaseOrdersReportRQ,
  CustomerCreditGetForCustomerRQ,
  CustomerCreditGetPaymentReceiptRQ,
  CustomerCreditGetPaymentRQ,
  CustomerCreditGetPaymentsByCustomerRQ,
  CustomerCreditGetPaymentsOfCurrentOpenReconciliationRQ,
  CustomerCreditGetUnpaidPurchaseOrdersRQ,
  CustomerCreditListRQ,
} from 'interface/requests/customer_credit'
import {
  CustomerCreditAddPaymentRS,
  CustomerCreditCancelPaymentRS,
  CustomerCreditGetCustomerCreditPurchaseOrdersReportRS,
  CustomerCreditGetForCustomerRS,
  CustomerCreditGetPaymentReceiptRS,
  CustomerCreditGetPaymentRS,
  CustomerCreditGetPaymentsGetByCustomerRS,
  CustomerCreditGetPaymentsOfCurrentOpenReconciliationRS,
  CustomerCreditGetUnpaidPurchaseOrdersRS,
  CustomerCreditListRS,
} from 'interface/responses/customer_credit'
import { sendRequest } from '../request'

export class CustomerCreditClient implements CustomerCreditEndpoints {
  path(): 'customer_credit' {
    return 'customer_credit'
  }

  getForCustomer(req: CustomerCreditGetForCustomerRQ): Promise<CustomerCreditGetForCustomerRS> {
    return sendRequest('/customer_credit/getForCustomer', req)
  }

  addPayment(req: CustomerCreditAddPaymentRQ): Promise<CustomerCreditAddPaymentRS> {
    return sendRequest('/customer_credit/addPayment', req)
  }

  list(req: CustomerCreditListRQ): Promise<CustomerCreditListRS> {
    return sendRequest('/customer_credit/list', req)
  }

  getPaymentReceipt(
    req: CustomerCreditGetPaymentReceiptRQ,
  ): Promise<CustomerCreditGetPaymentReceiptRS> {
    return sendRequest('/customer_credit/getPaymentReceipt', req)
  }

  getUnpaidPurchaseOrders(
    req: CustomerCreditGetUnpaidPurchaseOrdersRQ,
  ): Promise<CustomerCreditGetUnpaidPurchaseOrdersRS> {
    return sendRequest('/customer_credit/getUnpaidPurchaseOrders', req)
  }

  getPaymentsByCustomer(
    req: CustomerCreditGetPaymentsByCustomerRQ,
  ): Promise<CustomerCreditGetPaymentsGetByCustomerRS> {
    return sendRequest('/customer_credit/getPaymentsByCustomer', req)
  }

  getCustomerCreditPurchaseOrdersReport(
    req: CustomerCreditGetCustomerCreditPurchaseOrdersReportRQ,
  ): Promise<CustomerCreditGetCustomerCreditPurchaseOrdersReportRS> {
    return sendRequest('/customer_credit/getCustomerCreditPurchaseOrdersReport', req)
  }

  getCustomerCreditPurchaseOrdersReportAsExcelSheet(
    req: CustomerCreditGetCustomerCreditPurchaseOrdersReportRQ,
  ): Promise<import('stream/web').ReadableStream<any> | import('fs').ReadStream> {
    return sendRequest('/customer_credit/getCustomerCreditPurchaseOrdersReportAsExcelSheet', req)
  }

  getPaymentsOfCurrentOpenReconciliation(
    req: CustomerCreditGetPaymentsOfCurrentOpenReconciliationRQ,
  ): Promise<CustomerCreditGetPaymentsOfCurrentOpenReconciliationRS> {
    return sendRequest('/customer_credit/getPaymentsOfCurrentOpenReconciliation', req)
  }

  cancelPayment(req: CustomerCreditCancelPaymentRQ): Promise<CustomerCreditCancelPaymentRS> {
    return sendRequest('/customer_credit/cancelPayment', req)
  }

  getPayment(req: CustomerCreditGetPaymentRQ): Promise<CustomerCreditGetPaymentRS> {
    return sendRequest('/customer_credit/getPayment', req)
  }
}
