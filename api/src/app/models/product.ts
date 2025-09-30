import { Ctx } from 'api/src/app/context'
import {
  ProductDisableRS,
  ProductEnableRS,
  ProductGetByCodeRS,
  ProductGetSalesReportRS,
  ProductGetUnitPricesForCartRS,
  ProductListRS,
  ProductSearchRS,
} from 'interface/responses/product'
import {
  ProductAddRQ,
  ProductDisableRQ,
  ProductEnableRQ,
  ProductGetByCodeRQ,
  ProductGetSalesReportRQ,
  ProductGetUnitPricesForCartRQ,
  ProductListRQ,
  ProductModifyRQ,
  ProductSearchRQ,
} from 'interface/requests/product'
import {
  ProductFinishedProduct,
  ProductUnitPrices,
  ProductWithFinishedProducts,
} from 'interface/entities/product'
import { SystemClient } from 'interface/entities/system'
import { Cart, CartPriceType } from 'interface/entities/cart'
import { GeneralPublicCustomer } from 'interface/entities/customer'
import { AddRS, ModifyRS } from 'interface/responses/common'
import * as discountModel from './discount'
import * as customerModel from './customer'
import { CustomerSQLRow } from './customer'
import { FinishedProductUnitType } from 'interface/entities/finished_product'
import { getAssignedCashRegister } from './cash_register'

type ProductSQLRow = {
  code: string
  name: string
  finished_products: ProductFinishedProduct[]
  wholesale_unit_price: string
  wholesale_20k_unit_price: string
  wholesale_100k_unit_price: string
  retail_unit_price: string
  enabled: boolean
}

type ProductSalesReportSQLRow = {
  date: string
  product_code: string
  product_name: string
  product_kilograms_per_unit: string
  finished_products: string[]
  quantity: string
  total_sales: string
  cash_register_name: string
}

type KeyedProduct = {
  [productCode: string]: ProductWithFinishedProducts
}

export async function search(
  ctx: Ctx,
  req: ProductSearchRQ,
): Promise<ProductSearchRS> {
  const { query } = req
  const result = await ctx
    .knex('product')
    .select(
      'code',
      'name',
      'wholesale_unit_price',
      'wholesale_20k_unit_price',
      'wholesale_100k_unit_price',
      'retail_unit_price',
      'enabled',
    )
    .where('enabled', true)
    .andWhereILike('name', `%${query}%`)

  const sortedResult = result.sort((a, b) => {
    if (a.code === query) return -1
    if (b.code === query) return 1
    return 0
  })

  const data = sortedResult.map((r: ProductSQLRow) => ({
    id: r.code,
    name: `(${r.code}) ${r.name}`,
    data: {
      code: r.code,
      name: r.name,
      wholesale_unit_price: Number(r.wholesale_unit_price),
      wholesale_20k_unit_price: r.wholesale_20k_unit_price
        ? Number(r.wholesale_20k_unit_price)
        : null,
      wholesale_100k_unit_price: r.wholesale_100k_unit_price
        ? Number(r.wholesale_100k_unit_price)
        : null,
      retail_unit_price: Number(r.retail_unit_price),
      enabled: r.enabled,
    },
  }))

  return {
    data,
  }
}

export async function add(ctx: Ctx, req: ProductAddRQ): Promise<AddRS> {
  const {
    code,
    name,
    finished_products,
    wholesale_unit_price,
    wholesale_20k_unit_price,
    wholesale_100k_unit_price,
    retail_unit_price,
  } = req

  const existingCode = await ctx.knex('product').where('code', code).first()
  if (existingCode) {
    return {
      success: false,
      internal_error_message: 'Product code already exists',
      user_error_message: 'El código de producto ya existe',
    }
  }

  try {
    await ctx.knex.transaction(async trx => {
      await trx('product').insert({
        code,
        name,
        wholesale_unit_price,
        wholesale_20k_unit_price,
        wholesale_100k_unit_price,
        retail_unit_price,
      })
      await trx('product_finished_product').insert(
        finished_products.map(finished_product => ({
          product_code: code,
          finished_product_code: finished_product.finished_product_code,
          unit_quantity: finished_product.unit_quantity,
        })),
      )
    })
    return {
      success: true,
    }
  } catch (e) {
    return {
      success: false,
      internal_error_message: (e as Error).message,
    }
  }
}

export async function getByCode(
  ctx: Ctx,
  req: ProductGetByCodeRQ,
): Promise<ProductGetByCodeRS> {
  const { code } = req

  const result: ProductSQLRow = await ctx
    .knex('product')
    .select(
      'code',
      'name',
      'wholesale_unit_price',
      'wholesale_20k_unit_price',
      'wholesale_100k_unit_price',
      'retail_unit_price',
      'enabled',
    )
    .where('code', code)
    .andWhere('enabled', true)
    .first()

  if (!result) {
    return {
      product: null,
    }
  }

  return {
    product: {
      code: result.code,
      name: result.name,
      wholesale_unit_price: Number(result.wholesale_unit_price),
      wholesale_20k_unit_price: result.wholesale_20k_unit_price
        ? Number(result.wholesale_20k_unit_price)
        : null,
      wholesale_100k_unit_price: result.wholesale_100k_unit_price
        ? Number(result.wholesale_100k_unit_price)
        : null,
      retail_unit_price: Number(result.retail_unit_price),
      enabled: result.enabled,
    },
  }
}

export async function getKeyedByCodes(
  ctx: Ctx,
  productCodes: string[],
): Promise<KeyedProduct> {
  const result = await ctx
    .knex('product')
    .select(
      'product.code AS code',
      'product.name AS name',
      'wholesale_unit_price',
      'wholesale_20k_unit_price',
      'wholesale_100k_unit_price',
      'retail_unit_price',
      ctx.knex.raw(
        `(SELECT JSON_AGG(JSON_BUILD_OBJECT(
            'code', finished_product.code, 
            'name', finished_product.name,
            'unit_type', finished_product.unit_type,
            'unit_quantity', product_finished_product.unit_quantity
          ))
           FROM product_finished_product
             INNER JOIN finished_product
              ON finished_product.code = product_finished_product.finished_product_code
           WHERE product_finished_product.product_code = product.code
           ) AS finished_products`,
      ),
    )
    .whereIn('product.code', productCodes)

  return result.reduce((acc, r: ProductSQLRow) => {
    acc[r.code] = {
      code: r.code,
      name: r.name,
      wholesale_unit_price: Number(r.wholesale_unit_price),
      wholesale_20k_unit_price: r.wholesale_20k_unit_price
        ? Number(r.wholesale_20k_unit_price)
        : null,
      wholesale_100k_unit_price: r.wholesale_100k_unit_price
        ? Number(r.wholesale_100k_unit_price)
        : null,
      retail_unit_price: Number(r.retail_unit_price),
      finished_products: r.finished_products ?? [],
    }
    return acc
  }, {} as KeyedProduct)
}

const pageSize = 1000

export async function list(
  ctx: Ctx,
  req: ProductListRQ,
): Promise<ProductListRS> {
  const page = req.page || 1
  const query = req.query
  const countResult = await ctx.knex('product').count('id')
  const numberOfProducts = Number(countResult?.[0]?.count ?? 0)
  const numberOfPages = Math.ceil(numberOfProducts / pageSize)
  const offset = (page - 1) * pageSize

  const sqlQuery = ctx
    .knex('product')
    .select(
      'product.code AS code',
      'product.name AS name',
      ctx.knex.raw(
        `(SELECT JSON_AGG(JSON_BUILD_OBJECT(
            'code', finished_product.code, 
            'name', finished_product.name,
            'unit_type', finished_product.unit_type,
            'unit_quantity', product_finished_product.unit_quantity
          ))
           FROM product_finished_product
             INNER JOIN finished_product
              ON finished_product.code = product_finished_product.finished_product_code
           WHERE product_finished_product.product_code = product.code
           ) AS finished_products`,
      ),
      'wholesale_unit_price',
      'wholesale_20k_unit_price',
      'wholesale_100k_unit_price',
      'retail_unit_price',
      'enabled',
    )
    .whereILike('product.code', `%${query}%`)
    .orWhereILike('product.name', `%${query}%`)
    .groupBy(
      'product.code',
      'product.name',
      'wholesale_unit_price',
      'wholesale_20k_unit_price',
      'wholesale_100k_unit_price',
      'retail_unit_price',
      'enabled',
    )
    .orderBy('product.code')
    .offset(offset)
    .limit(pageSize)

  const productsResult: ProductSQLRow[] = await sqlQuery

  const sortedResult = productsResult.sort((a, b) => {
    if (a.code === query) return -1
    if (b.code === query) return 1
    return 0
  })

  return {
    numberOfPages,
    products: sortedResult.map(productResult => ({
      code: productResult.code,
      name: productResult.name,
      finished_products: productResult.finished_products ?? [],
      wholesale_unit_price: Number(productResult.wholesale_unit_price),
      wholesale_20k_unit_price: productResult.wholesale_20k_unit_price
        ? Number(productResult.wholesale_20k_unit_price)
        : null,
      wholesale_100k_unit_price: productResult.wholesale_100k_unit_price
        ? Number(productResult.wholesale_100k_unit_price)
        : null,
      retail_unit_price: Number(productResult.retail_unit_price),
      enabled: productResult.enabled,
    })),
  }
}

export async function modify(
  ctx: Ctx,
  req: ProductModifyRQ,
): Promise<ModifyRS> {
  const {
    code,
    name,
    wholesale_unit_price,
    wholesale_20k_unit_price,
    wholesale_100k_unit_price,
    retail_unit_price,
  } = req

  try {
    await ctx.knex.transaction(async trx => {
      await trx('product')
        .update({
          name,
          wholesale_unit_price,
          wholesale_20k_unit_price,
          wholesale_100k_unit_price,
          retail_unit_price,
        })
        .where('code', code)

      await trx('product_finished_product').delete().where('product_code', code)
      await trx('product_finished_product').insert(
        req.finished_products.map(finished_product => ({
          product_code: code,
          finished_product_code: finished_product.finished_product_code,
          unit_quantity: finished_product.unit_quantity,
        })),
      )
    })
  } catch (e) {
    return {
      success: false,
      error: (e as Error).message,
    }
  }

  return {
    success: true,
  }
}

export async function enable(
  ctx: Ctx,
  req: ProductEnableRQ,
): Promise<ProductEnableRS> {
  const { code } = req
  try {
    await ctx.knex('product').update({ enabled: true }).where('code', code)
    return { success: true }
  } catch (e) {
    console.log(e)
    return { success: false }
  }
}

export async function disable(
  ctx: Ctx,
  req: ProductDisableRQ,
): Promise<ProductDisableRS> {
  const { code } = req
  try {
    await ctx.knex('product').update({ enabled: false }).where('code', code)
    return { success: true }
  } catch (e) {
    console.log(e)
    return { success: false }
  }
}

export async function getSalesReport(
  ctx: Ctx,
  req: ProductGetSalesReportRQ,
): Promise<ProductGetSalesReportRS> {
  const { start_date, end_date } = req
  const result = await ctx.knex.raw(
    `
        SELECT
            (purchase_order.created_at AT TIME ZONE 'America/Chihuahua')::date AS date,
            product.code AS product_code,
            product.name AS product_name,
            (SELECT JSON_AGG(JSON_BUILD_OBJECT(
                  'code', finished_product.code, 
                  'name', finished_product.name,
                  'unit_type', finished_product.unit_type,
                  'unit_quantity', product_finished_product.unit_quantity
                ))
                 FROM product_finished_product
                   INNER JOIN finished_product
                    ON finished_product.code = product_finished_product.finished_product_code
                 WHERE product_finished_product.product_code = product.code
                 ) AS finished_products,
            SUM(purchase_order_detail.quantity) AS quantity,
            SUM(purchase_order_detail.quantity * purchase_order_detail.unit_price) AS total_sales,
            cash_register.name AS cash_register_name
        FROM purchase_order_detail
            INNER JOIN product ON purchase_order_detail.product_code = product.code
            INNER JOIN purchase_order ON purchase_order_detail.purchase_order_id = purchase_order.id
            INNER JOIN cash_register ON purchase_order.cash_register_id = cash_register.id
        WHERE (purchase_order.created_at AT TIME ZONE 'America/Chihuahua')::date BETWEEN :start_date AND :end_date
        AND purchase_order.status != 'RETURNED'
        GROUP BY (purchase_order.created_at AT TIME ZONE 'America/Chihuahua')::date, product.code, product.name, cash_register.name
        ORDER BY (purchase_order.created_at AT TIME ZONE 'America/Chihuahua')::date, product.code;
    `,
    {
      start_date,
      end_date,
    },
  )

  const data = (result.rows || []).map((r: ProductSalesReportSQLRow) => ({
    date: r.date,
    product_code: r.product_code,
    product_name: r.product_name,
    finished_products: r.finished_products,
    quantity: r.quantity,
    total_sales: r.total_sales,
    cash_register_name: r.cash_register_name,
  }))

  return {
    entries: data,
  }
}

const UnitPriceTypeFn: Partial<
  Record<
    SystemClient,
    (
      ctx: Ctx,
      customer: CustomerSQLRow,
      cart: Cart,
      products: KeyedProduct,
    ) => Promise<CartPriceType>
  >
> = {
  [SystemClient.DELIEVA]: async (ctx: Ctx, customer, cart, products) => {
    if (customer.id == GeneralPublicCustomer.id) {
      return CartPriceType.RETAIL
    }
    if (customer.fixed_wholesale_price_kg) {
      if (customer.fixed_wholesale_price_kg == 10) {
        return CartPriceType.WHOLESALE_10KG
      }
      if (customer.fixed_wholesale_price_kg == 20) {
        return CartPriceType.WHOLESALE_20KG
      }
      if (customer.fixed_wholesale_price_kg == 100) {
        return CartPriceType.WHOLESALE_100KG
      }
    }
    const assignedCashRegister = await getAssignedCashRegister(ctx, {})
    const totalKG = Object.keys(cart.items).reduce((acc, productCode) => {
      const cartItem = cart.items[productCode]
      const product = products[productCode]
      const kilograms = product.finished_products.reduce(
        (acc, finishedProduct) => {
          if (finishedProduct.unit_type !== FinishedProductUnitType.KILOGRAM) {
            return acc
          }
          return acc + finishedProduct.unit_quantity
        },
        0,
      )
      if (!product) return acc
      return acc + kilograms * cartItem.quantity
    }, 0)

    if (totalKG > 100) {
      return CartPriceType.WHOLESALE_100KG
    }
    if (totalKG > 20) {
      return CartPriceType.WHOLESALE_20KG
    }
    if (totalKG > 10) {
      return CartPriceType.WHOLESALE_10KG
    }

    return CartPriceType.RETAIL
  },
}

function getProductUnitPrice(
  cartPriceType: CartPriceType,
  product: ProductWithFinishedProducts,
) {
  if (cartPriceType === CartPriceType.WHOLESALE_100KG) {
    return (
      product.wholesale_100k_unit_price ??
      product.wholesale_20k_unit_price ??
      product.wholesale_unit_price ??
      product.retail_unit_price
    )
  }
  if (cartPriceType === CartPriceType.WHOLESALE_20KG) {
    return (
      product.wholesale_20k_unit_price ??
      product.wholesale_unit_price ??
      product.retail_unit_price
    )
  }
  if (cartPriceType === CartPriceType.WHOLESALE_10KG) {
    return product.wholesale_unit_price ?? product.retail_unit_price
  }
  return product.retail_unit_price
}

export async function getUnitPricesForCart(
  ctx: Ctx,
  req: ProductGetUnitPricesForCartRQ,
): Promise<ProductGetUnitPricesForCartRS> {
  const { cart, customer_id } = req
  const unitPriceTypeFn = UnitPriceTypeFn[SystemClient.DELIEVA] //TODO Get client from ctx
  const productCodes = Object.keys(cart.items)

  const products = await getKeyedByCodes(ctx, productCodes)
  const customer = await customerModel.get(ctx, customer_id)
  if (!customer) {
    throw new Error('Customer not found')
  }
  let unitPriceType = unitPriceTypeFn
    ? await unitPriceTypeFn(ctx, customer, cart, products)
    : CartPriceType.RETAIL

  const discountsByProducts = (
    await discountModel.getForCustomerAndProducts(ctx, {
      customer_id,
      product_codes: productCodes,
    })
  ).discounts_by_product

  const unitPrices = Object.keys(products).reduce((acc, productCode) => {
    const product = products[productCode]
    if (discountsByProducts?.[productCode]?.fixed_price) {
      acc[product.code] = discountsByProducts[productCode].fixed_price
    } else {
      acc[product.code] = getProductUnitPrice(unitPriceType, product)

      if (discountsByProducts?.[productCode]?.discount_percentage) {
        acc[product.code] =
          acc[product.code] *
          (1 - discountsByProducts[productCode].discount_percentage)
      }
      if (discountsByProducts?.[productCode]?.discount_flat_amount) {
        acc[product.code] =
          acc[product.code] -
          discountsByProducts[productCode].discount_flat_amount
      }
    }

    return acc
  }, {} as ProductUnitPrices)

  return {
    unit_prices: unitPrices,
    unit_price_type: unitPriceType,
  }
}
