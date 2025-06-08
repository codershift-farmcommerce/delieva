import { CashRegister } from 'interface/entities/cash_register'

export function getCashRegisterName(cashRegister: CashRegister | null | undefined) {
  return `Caja ${cashRegister?.name}`
}
