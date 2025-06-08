import { DiscountEndpoints } from 'lib/endpoints/discount'
import {
  DiscountAddRQ,
  DiscountDeleteRQ,
  DiscountGetForCustomerAndProductRQ,
  DiscountGetForCustomerAndProductsRQ,
  DiscountListRQ,
  DiscountModifyRQ,
} from 'lib/requests/discount'
import {
  DiscountAddFailRS,
  DiscountAddSuccessRS,
  DiscountDeleteFailRS,
  DiscountDeleteSuccessRS,
  DiscountGetForCustomerAndProductRS,
  DiscountGetForCustomerAndProductsRS,
  DiscountListRS,
} from 'lib/responses/discount'
import { Ctx } from 'src/app/context'
import * as discount from 'src/app/models/discount'
import { action } from '../context/decorators/endpoint_actions'
import { Application } from 'lib'
import { ModifyRS } from '../../../lib/responses/common'

export class DiscountServices implements DiscountEndpoints {
  private ctx: Ctx
  path(): 'discount' {
    return 'discount'
  }

  @action({ forApps: [Application.ADMIN] })
  add(req: DiscountAddRQ): Promise<DiscountAddSuccessRS | DiscountAddFailRS> {
    return discount.add(this.ctx, req)
  }

  @action({ forApps: [Application.ADMIN] })
  list(req: DiscountListRQ): Promise<DiscountListRS> {
    return discount.list(this.ctx, req)
  }

  @action({ forApps: [Application.ADMIN] })
  modify(req: DiscountModifyRQ): Promise<ModifyRS> {
    return discount.modify(this.ctx, req)
  }

  @action({ forApps: [Application.ADMIN] })
  delete(
    req: DiscountDeleteRQ,
  ): Promise<DiscountDeleteSuccessRS | DiscountDeleteFailRS> {
    return discount.deleteDiscount(this.ctx, req)
  }

  @action({ forApps: [Application.ADMIN, Application.POS] })
  getForCustomerAndProduct(
    req: DiscountGetForCustomerAndProductRQ,
  ): Promise<DiscountGetForCustomerAndProductRS> {
    return discount.getForCustomerAndProduct(this.ctx, req)
  }

  @action({ forApps: [Application.ADMIN, Application.POS] })
  getForCustomerAndProducts(
    req: DiscountGetForCustomerAndProductsRQ,
  ): Promise<DiscountGetForCustomerAndProductsRS> {
    return discount.getForCustomerAndProducts(this.ctx, req)
  }
}
