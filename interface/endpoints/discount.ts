import {
  DiscountAddRQ, DiscountDeleteManyRQ,
  DiscountDeleteRQ, DiscountGetForCustomerAndProductRQ,
  DiscountGetForCustomerAndProductsRQ,
  DiscountListRQ,
  DiscountModifyRQ,
} from '../requests/discount'
import {
  DiscountAddFailRS,
  DiscountAddSuccessRS,
  DiscountDeleteFailRS,
  DiscountDeleteSuccessRS, DiscountGetForCustomerAndProductRS,
  DiscountGetForCustomerAndProductsRS,
  DiscountListRS,
} from '../responses/discount'
import { ModifyRS } from '../responses/common'

export interface DiscountEndpoints {
  path(): 'discount'

  add(req: DiscountAddRQ): Promise<DiscountAddSuccessRS | DiscountAddFailRS>

  list(req: DiscountListRQ): Promise<DiscountListRS>

  modify(req: DiscountModifyRQ): Promise<ModifyRS>

  delete(
    req: DiscountDeleteRQ,
  ): Promise<DiscountDeleteSuccessRS | DiscountDeleteFailRS>

  deleteMany(
    req: DiscountDeleteManyRQ,
  ): Promise<DiscountDeleteSuccessRS | DiscountDeleteFailRS>

  getForCustomerAndProduct(
      req: DiscountGetForCustomerAndProductRQ,
  ): Promise<DiscountGetForCustomerAndProductRS>

  getForCustomerAndProducts(
    req: DiscountGetForCustomerAndProductsRQ,
  ): Promise<DiscountGetForCustomerAndProductsRS>
}
