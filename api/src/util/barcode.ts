export enum BarcodeType {
  PURCHASE_ORDER = '001',
  PRODUCT = '002',
}

const BarcodeTypeLength: Record<BarcodeType, number> = {
  [BarcodeType.PURCHASE_ORDER]: 8,
  [BarcodeType.PRODUCT]: 8,
}

export function generateBarcode(codeType: BarcodeType) {
  const randomString = randomNumber(BarcodeTypeLength[codeType])
  return `${codeType}${randomString}`
}

function randomNumber(length: number) {
  return Math.floor(
    Math.pow(10, length - 1) +
      Math.random() * (Math.pow(10, length) - Math.pow(10, length - 1) - 1),
  )
}
