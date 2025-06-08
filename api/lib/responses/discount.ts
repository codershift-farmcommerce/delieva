import {
  Discount,
  DiscountByProduct,
  DiscountWithCustomerAndProduct,
} from '../entities/discount'

export type DiscountAddSuccessRS = {
  success: true
}

export type DiscountAddFailRS = {
  success: false
  error: string
}

export type DiscountListRS = {
  discounts: DiscountWithCustomerAndProduct[]
}

export type DiscountDeleteSuccessRS = {
  success: true
}

export type DiscountDeleteFailRS = {
  success: false
  error: string
}

export type DiscountGetForCustomerAndProductRS = {
  discount: Discount | null
}

export type DiscountGetForCustomerAndProductsRS = {
  discounts_by_product: DiscountByProduct
}
