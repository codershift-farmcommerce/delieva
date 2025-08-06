import { DiscountEndpoints } from 'interface/endpoints/discount'
import {
  DiscountAddRQ, DiscountDeleteManyRQ,
  DiscountDeleteRQ,
  DiscountGetForCustomerAndProductRQ,
  DiscountGetForCustomerAndProductsRQ,
  DiscountListRQ,
  DiscountModifyRQ,
} from 'interface/requests/discount'
import {
  DiscountAddSuccessRS,
  DiscountAddFailRS,
  DiscountListRS,
  DiscountDeleteSuccessRS,
  DiscountDeleteFailRS,
  DiscountGetForCustomerAndProductsRS,
  DiscountGetForCustomerAndProductRS,
} from 'interface/responses/discount'
import { sendRequest } from '../request'
import { ModifyRS } from 'interface/responses/common'

export class DiscountClient implements DiscountEndpoints {
  path(): 'discount' {
    return 'discount'
  }
  add(req: DiscountAddRQ): Promise<DiscountAddSuccessRS | DiscountAddFailRS> {
    return sendRequest('/discount/add', req)
  }

  list(req: DiscountListRQ): Promise<DiscountListRS> {
    return sendRequest('/discount/list', req)
  }

  modify(req: DiscountModifyRQ): Promise<ModifyRS> {
    return sendRequest('/discount/modify', req)
  }

  delete(req: DiscountDeleteRQ): Promise<DiscountDeleteSuccessRS | DiscountDeleteFailRS> {
    return sendRequest('/discount/delete', req)
  }

  deleteMany(req: DiscountDeleteManyRQ): Promise<DiscountDeleteSuccessRS | DiscountDeleteFailRS> {
    return sendRequest('/discount/deleteMany', req)
  }

  getForCustomerAndProduct(
    req: DiscountGetForCustomerAndProductRQ,
  ): Promise<DiscountGetForCustomerAndProductRS> {
    return sendRequest('/discount/getForCustomerAndProduct', req)
  }

  getForCustomerAndProducts(
    req: DiscountGetForCustomerAndProductsRQ,
  ): Promise<DiscountGetForCustomerAndProductsRS> {
    return sendRequest('/discount/getForCustomerAndProducts', req)
  }
}
