import styles from './product_unit_price.module.css'
import clsx from 'clsx'
import { FinishedProductUnitType } from 'interface/entities/finished_product'
import { formatMonetary } from '../functions/formatting'

export enum AppliedPriceType {
  CUSTOMER_FIXED = 'customer_fixed',
  WHOLESALE = 'wholesale',
  RETAIL = 'retail',
}
type ProductPriceProps = {
  applied_price_type: AppliedPriceType | null
  unit_type: FinishedProductUnitType
  customer_fixed_unit_price: number | null
  wholesale_unit_price: number
  retail_unit_price: number
}
const ProductUnitPrice = ({
  applied_price_type,
  unit_type,
  customer_fixed_unit_price,
  wholesale_unit_price,
  retail_unit_price,
}: ProductPriceProps) => {
  const unitString = unit_type === FinishedProductUnitType.KILOGRAM ? '/kg' : ''
  return (
    <div className={styles.container}>
      <fieldset>
        <legend>Precio</legend>
        <div
          hidden={!customer_fixed_unit_price}
          className={clsx({
            [styles.active]: applied_price_type === AppliedPriceType.CUSTOMER_FIXED,
          })}
        >
          Para cliente: {formatMonetary(customer_fixed_unit_price!)}
          {unitString}
        </div>
        <div
          className={clsx({
            [styles.active]: applied_price_type === AppliedPriceType.WHOLESALE,
          })}
        >
          Mayoreo: {formatMonetary(wholesale_unit_price)}
          {unitString}
        </div>
        <div
          className={clsx({
            [styles.active]: applied_price_type === AppliedPriceType.RETAIL,
          })}
        >
          Menudeo: {formatMonetary(retail_unit_price)}
          {unitString}
        </div>
      </fieldset>
    </div>
  )
}

export default ProductUnitPrice
