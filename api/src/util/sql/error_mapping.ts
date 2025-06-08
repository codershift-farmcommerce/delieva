export function getSQLErrorMapper(domain: string) {
  return (errorMessage: string) => {
    if (/duplicate key value violates unique constraint/.test(errorMessage)) {
      return `${domain} existente.`
    }
    return errorMessage
  }
}
