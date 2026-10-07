import {
  CustomerAddRQ,
  CustomerDisableRQ,
  CustomerEnableRQ,
  CustomerListRQ,
  CustomerModifyRQ,
  CustomerSearchRQ,
  CustomerGetMovementsReportRQ,
} from '../requests/customer'
import {
  CustomerAddFailRS,
  CustomerAddSuccessRS,
  CustomerListRS,
  CustomerSearchRS,
} from '../responses/customer'
import { ModifyRS } from '../responses/common'

export interface CustomerEndpoints {
  path(): 'customer'

  add(req: CustomerAddRQ): Promise<CustomerAddSuccessRS | CustomerAddFailRS>

  search(req: CustomerSearchRQ): Promise<CustomerSearchRS>

  list(req: CustomerListRQ): Promise<CustomerListRS>

  modify(req: CustomerModifyRQ): Promise<ModifyRS>

  enable(req: CustomerEnableRQ): Promise<ModifyRS>

  disable(req: CustomerDisableRQ): Promise<ModifyRS>

  getMovementsReportAsExcelSheet(req: CustomerGetMovementsReportRQ): Promise<import('stream/web').ReadableStream<any> | import('fs').ReadStream>
}
