import { Ctx } from '../context'
import {
  FinishedProductAddRQ,
  FinishedProductGetSalesReportRQ,
  FinishedProductListRQ,
  FinishedProductModifyRQ,
  FinishedProductSearchRQ,
} from 'interface/requests/finished_product'
import {
  FinishedProductGetSalesReportRS,
  FinishedProductListRS,
  FinishedProductSearchRS,
} from 'interface/responses/finished_product'
import { AddRS, ModifyRS } from 'interface/responses/common'
import { FinishedProductUnitType } from 'interface/entities/finished_product'

type FinishedProductSQLRow = {
  code: string
  name: string
  unit_type: FinishedProductUnitType
}

type FinishedProductSalesReportSQLRow = {
  date: string
  finished_product_code: string
  finished_product_name: string
  finished_product_unit_type: string
  quantity: string
  total_sales: string
  cash_register_name: string
  customer_name: string
}

export async function add(ctx: Ctx, req: FinishedProductAddRQ): Promise<AddRS> {
  const { code, name, unit_type } = req
  await ctx.knex('finished_product').insert({ code, name, unit_type })
  return { success: true }
}

export async function modify(
  ctx: Ctx,
  req: FinishedProductModifyRQ,
): Promise<ModifyRS> {
  const { code, name, unit_type } = req
  await ctx.knex('finished_product').where({ code }).update({ name, unit_type })
  return { success: true }
}

const pageSize = 25
export async function list(
  ctx: Ctx,
  req: FinishedProductListRQ,
): Promise<FinishedProductListRS> {
  const page = req.page || 1
  const query = req.query
  const countResult = await ctx.knex('finished_product').count('id')
  const numberOfFinishedProducts = Number(countResult?.[0]?.count ?? 0)
  const numberOfPages = Math.ceil(numberOfFinishedProducts / pageSize)
  const offset = (page - 1) * pageSize

  let sqlResult: FinishedProductSQLRow[]
  if (query.length === 1) {
    sqlResult = await ctx
      .knex('finished_product')
      .select('code', 'name', 'unit_type')
      .where('code', query)
  } else {
    sqlResult = await ctx
      .knex('finished_product')
      .select('code', 'name', 'unit_type')
      .whereILike('code', `%${query}%`)
      .orWhereILike('name', `%${query}%`)
      .orderBy('code')
      .offset(offset)
      .limit(pageSize)
  }

  const sortedResult = sqlResult.sort((a, b) => {
    if (a.code === query) return -1
    if (b.code === query) return 1
    return 0
  })

  return {
    numberOfPages,
    finished_products: sortedResult.map(rawMaterialResult => ({
      code: rawMaterialResult.code,
      name: rawMaterialResult.name,
      unit_type: rawMaterialResult.unit_type,
    })),
  }
}

export async function search(
  ctx: Ctx,
  req: FinishedProductSearchRQ,
): Promise<FinishedProductSearchRS> {
  const { query } = req
  const result = await ctx
    .knex('finished_product')
    .select('code', 'name', 'unit_type')
    .whereILike('code', `%${query}%`)
    .orWhereILike('name', `%${query}%`)

  const sortedResult = result.sort((a, b) => {
    if (a.code === query) return -1
    if (b.code === query) return 1
    return 0
  })

  const data = sortedResult.map((r: FinishedProductSQLRow) => ({
    id: r.code,
    name: `(${r.code}) ${r.name}`,
    data: {
      code: r.code,
      name: r.name,
      unit_type: r.unit_type,
    },
  }))

  return {
    data,
  }
}

export async function getSalesReport(
  ctx: Ctx,
  req: FinishedProductGetSalesReportRQ,
): Promise<FinishedProductGetSalesReportRS> {
  const { start_date, end_date } = req
  const result = await ctx.knex.raw(
    `
        SELECT
            (purchase_order.created_at AT TIME ZONE 'America/Chihuahua')::date AS date,
            finished_product.code AS finished_product_code,
            finished_product.name AS finished_product_name,
            finished_product.unit_type AS finished_product_unit_type,
            SUM(purchase_order_detail.quantity * product_finished_product.unit_quantity) AS quantity,
            SUM(purchase_order_detail.quantity * purchase_order_detail.unit_price) AS total_sales,
            cash_register.name AS cash_register_name,
            customer.name AS customer_name
        FROM purchase_order_detail
                 INNER JOIN product ON purchase_order_detail.product_code = product.code
                 INNER JOIN purchase_order ON purchase_order_detail.purchase_order_id = purchase_order.id
                 INNER JOIN product_finished_product ON product.code = product_finished_product.product_code
                 INNER JOIN finished_product ON finished_product.code = product_finished_product.finished_product_code
                 INNER JOIN cash_register ON purchase_order.cash_register_id = cash_register.id
                 LEFT JOIN customer ON purchase_order.customer_id = customer.id
        WHERE (purchase_order.created_at AT TIME ZONE 'America/Chihuahua')::date BETWEEN :start_date AND :end_date
        AND purchase_order.status != 'RETURNED'
        GROUP BY (purchase_order.created_at AT TIME ZONE 'America/Chihuahua')::date, finished_product.code, finished_product.name, finished_product.unit_type, cash_register.name, customer.name
        ORDER BY (purchase_order.created_at AT TIME ZONE 'America/Chihuahua')::date, finished_product.code;
    `,
    {
      start_date,
      end_date,
    },
  )
  const data = (result.rows || []).map(
    (r: FinishedProductSalesReportSQLRow) => ({
      date: r.date,
      finished_product_code: r.finished_product_code,
      finished_product_name: r.finished_product_name,
      finished_product_unit_type: r.finished_product_unit_type,
      quantity: r.quantity,
      total_sales: r.total_sales,
      cash_register_name: r.cash_register_name,
      customer_name: r.customer_name,
    }),
  )

  return {
    entries: data,
  }
}
