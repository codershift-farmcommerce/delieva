import { DiscountEndpoints } from 'codershift-farmcommerce-api/endpoints/discount'
import {
  DiscountAddRQ,
  DiscountDeleteRQ,
  DiscountGetForCustomerAndProductRQ,
  DiscountGetForCustomerAndProductsRQ,
  DiscountListRQ,
  DiscountModifyRQ,
} from 'codershift-farmcommerce-api/requests/discount'
import {
  DiscountAddSuccessRS,
  DiscountAddFailRS,
  DiscountListRS,
  DiscountDeleteSuccessRS,
  DiscountDeleteFailRS,
  DiscountGetForCustomerAndProductsRS,
  DiscountGetForCustomerAndProductRS,
} from 'codershift-farmcommerce-api/responses/discount'
import { sendRequest } from '../request'
import { ModifyRS } from 'codershift-farmcommerce-api/responses/common'

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
