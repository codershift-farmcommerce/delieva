import { FinishedProductUnitType } from 'interface/entities/finished_product'

export const formatMonetary = (val: number | string | undefined) => {
  if (val == undefined || Number.isNaN(val)) {
    return ''
  }
  if (typeof val === 'string') {
    val = parseFloat(val)
  }
  const formatter = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  })
  return formatter.format(val)
}

export const formatQuantity = (
  val: number | string | undefined,
  unitType?: FinishedProductUnitType,
) => {
  if (val == undefined || Number.isNaN(val)) {
    return ''
  }
  if (typeof val === 'string') {
    val = parseFloat(val)
  }
  if (unitType === FinishedProductUnitType.KILOGRAM) {
    return val + ' kg'
  }
  return val.toFixed(2)
}
