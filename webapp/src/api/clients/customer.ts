import { CustomerEndpoints } from 'interface/endpoints/customer'
import {
  CustomerAddRQ,
  CustomerDisableRQ,
  CustomerEnableRQ,
  CustomerGetMovementsReportRQ,
  CustomerListRQ,
  CustomerModifyRQ,
  CustomerSearchRQ,
} from 'interface/requests/customer'
import {
  CustomerAddFailRS,
  CustomerAddSuccessRS,
  CustomerListRS,
  CustomerSearchRS,
} from 'interface/responses/customer'
import { sendRequest } from '../request'
import { ModifyRS } from 'interface/responses/common'

export class CustomerClient implements CustomerEndpoints {
  path(): 'customer' {
    return 'customer'
  }

  add(req: CustomerAddRQ): Promise<CustomerAddSuccessRS | CustomerAddFailRS> {
    return sendRequest('/customer/add', req)
  }

  search(req: CustomerSearchRQ): Promise<CustomerSearchRS> {
    return sendRequest('/customer/search', req)
  }

  list(req: CustomerListRQ): Promise<CustomerListRS> {
    return sendRequest('/customer/list', req)
  }

  modify(req: CustomerModifyRQ): Promise<ModifyRS> {
    return sendRequest('/customer/modify', req)
  }

  enable(req: CustomerEnableRQ): Promise<ModifyRS> {
    return sendRequest('/customer/enable', req)
  }

  disable(req: CustomerDisableRQ): Promise<ModifyRS> {
    return sendRequest('/customer/disable', req)
  }

  getMovementsReportAsExcelSheet(req: CustomerGetMovementsReportRQ): Promise<ReadableStream<any>> {
    return sendRequest('/customer/getMovementsReportAsExcelSheet', req)
  }
}
