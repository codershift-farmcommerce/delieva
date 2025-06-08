import {
  DiscountAddFailRS,
  DiscountAddSuccessRS,
  DiscountDeleteFailRS,
  DiscountDeleteSuccessRS,
  DiscountGetForCustomerAndProductRS,
  DiscountGetForCustomerAndProductsRS,
  DiscountListRS,
} from 'interface/responses/discount'
import {
  DiscountAddRQ,
  DiscountDeleteRQ,
  DiscountGetForCustomerAndProductRQ,
  DiscountGetForCustomerAndProductsRQ,
  DiscountListRQ,
  DiscountModifyRQ,
} from 'interface/requests/discount'
import { Ctx } from 'api/src/app/context'
import { ModifyRS } from 'interface/responses/common'
import { Discount, DiscountType } from 'interface/entities/discount'

export async function add(
  ctx: Ctx,
  req: DiscountAddRQ,
): Promise<DiscountAddSuccessRS | DiscountAddFailRS> {
  try {
    const {
      customer_id,
      product_code,
      type,
      discount_percentage,
      discount_flat_amount,
      fixed_price,
    } = req
    await ctx
      .knex('discount')
      .insert({
        customer_id,
        product_code,
        type,
        discount_percentage,
        discount_flat_amount,
        fixed_price,
      })
      .returning('id')

    return {
      success: true,
    }
  } catch (err: any) {
    return {
      success: false,
      error: err.message,
    }
  }
}

export async function list(
  ctx: Ctx,
  req: DiscountListRQ,
): Promise<DiscountListRS> {
  const { customer_id, product_code } = req
  const query = ctx
    .knex('discount')
    .select(
      'discount.id AS id',
      'customer.id AS customer_id',
      'customer.name AS customer_name',
      'product.code AS product_code',
      'product.name AS product_name',
      'product.wholesale_unit_price AS wholesale_unit_price',
      'product.retail_unit_price AS retail_unit_price',
      'type AS type',
      'discount.discount_percentage AS discount_percentage',
      'discount.discount_flat_amount AS discount_flat_amount',
      'discount.fixed_price AS fixed_price',
    )
    .innerJoin('customer', 'discount.customer_id', 'customer.id')
    .innerJoin('product', 'discount.product_code', 'product.code')
  if (customer_id) {
    query.where('customer_id', customer_id)
  }
  if (product_code) {
    query.where('product_code', product_code)
  }
  const result = await query

  const discounts = result.map(r => ({
    id: r.id,
    customer_id: r.customer_id,
    customer_name: r.customer_name,
    product_code: r.product_code,
    product_name: r.product_name,
    product_wholesale_unit_price: r.wholesale_unit_price,
    product_retail_unit_price: r.retail_unit_price,
    type: r.type,
    discount_percentage: r.discount_percentage,
    discount_flat_amount: r.discount_flat_amount,
    fixed_price: r.fixed_price,
  }))

  return {
    discounts,
  }
}

export async function modify(
  ctx: Ctx,
  req: DiscountModifyRQ,
): Promise<ModifyRS> {
  const { id, type, discount_percentage, discount_flat_amount, fixed_price } =
    req
  try {
    await ctx.knex('discount').where('id', id).update({
      type,
      discount_percentage,
      discount_flat_amount,
      fixed_price,
    })

    return {
      success: true,
    }
  } catch (err: any) {
    return {
      success: false,
      error: err.message,
    }
  }
}

export async function deleteDiscount(
  ctx: Ctx,
  req: DiscountDeleteRQ,
): Promise<DiscountDeleteSuccessRS | DiscountDeleteFailRS> {
  const { id } = req
  try {
    await ctx.knex('discount').where('id', id).delete()
    return {
      success: true,
    }
  } catch (err: any) {
    return {
      success: false,
      error: err.message,
    }
  }
}

export async function getForCustomerAndProduct(
  ctx: Ctx,
  req: DiscountGetForCustomerAndProductRQ,
): Promise<DiscountGetForCustomerAndProductRS> {
  const { customer_id, product_code } = req
  const result = await ctx
    .knex('discount')
    .select(
      'product_code',
      'type',
      'discount_percentage',
      'discount_flat_amount',
      'fixed_price',
    )
    .where('customer_id', customer_id)
    .andWhere('product_code', product_code)
    .first()

  if (!result) {
    return {
      discount: null,
    }
  }

  const discount = {
    id: result.id,
    type: result.discount_percentage,
    discount_percentage: Number(result.discount_percentage),
    discount_flat_amount: Number(result.discount_flat_amount),
    fixed_price: Number(result.fixed_price),
  }

  return {
    discount,
  }
}

export async function getForCustomerAndProducts(
  ctx: Ctx,
  req: DiscountGetForCustomerAndProductsRQ,
): Promise<DiscountGetForCustomerAndProductsRS> {
  const { customer_id, product_codes } = req
  const result = await ctx
    .knex('discount')
    .select(
      'product_code',
      'type',
      'discount_percentage',
      'discount_flat_amount',
      'fixed_price',
    )
    .where('customer_id', customer_id)
    .whereIn('product_code', product_codes)

  const discountsByProduct: Record<string, Discount> = {}
  result.forEach(r => {
    discountsByProduct[r.product_code] = {
      id: r.id,
      type: r.discount_percentage,
      discount_percentage: Number(r.discount_percentage),
      discount_flat_amount: Number(r.discount_flat_amount),
      fixed_price: Number(r.fixed_price),
    }
  })

  return {
    discounts_by_product: discountsByProduct,
  }
}
