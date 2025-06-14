import {
  Cashier,
  CashRegister,
  CashRegisterAssignation,
  CashRegisterWithdrawalReceipt,
  CashRegisterReconciliation,
  OpenedCashRegisterReconciliation,
  CashRegisterOtherIncomeReceipt,
} from '../entities/cash_register'
import { ApiErrorCode } from '../entities/api_error_code'
import { CashRegisterGetCashWithdrawalsOfCurrentOpenReconciliationRQ } from '../requests/cash_register'
import {ModifyRS} from "./common";

export type CashRegisterAddRS = {
  success: boolean
}

export type CashRegisterListRS = {
  cash_registers: CashRegister[]
}

export type CashRegisterListCashiersRS = {
  cashiers: Cashier[]
}

export type CashRegisterListAssignationsRS = {
  assignations: CashRegisterAssignation[]
}

export type CashRegisterAssignCashierRS = {
  success: boolean
}

export type CashRegisterUnassignCashierRS = {
  success: boolean
}

export type CashRegisterGetAssignedCashRegisterRS = {
  cash_register: CashRegister
  has_open_reconciliation: boolean
}

export type CashRegisterOpenReconciliationRS = {
  success: boolean
}

export type CashRegisterCloseReconciliationRS = {
  success: boolean
}

export type CashRegisterGetOpenedReconciliationsRS = {
  opened_reconciliations: {
    [cashRegisterId: number]: OpenedCashRegisterReconciliation
  }
}

export type CashRegisterGetClosedReconciliationRS = {
  reconciliation: CashRegisterReconciliation
}

export type CashRegisterWithdrawSuccessRS = {
  id: number
  success: true
}
export type CashRegisterWithdrawFailRS = {
  success: false
  errorCode: ApiErrorCode
}

export type CashRegisterEnterOtherIncomeSuccessRS = {
  id: number
  success: true
}
export type CashRegisterEnterOtherIncomeFailRS = {
  success: false
  errorCode: ApiErrorCode
}

export type CashRegisterWithdrawRS =
  | CashRegisterWithdrawSuccessRS
  | CashRegisterWithdrawFailRS

export type CashRegisterEnterOtherIncomeRS =
  | CashRegisterEnterOtherIncomeSuccessRS
  | CashRegisterEnterOtherIncomeFailRS

export type CashRegisterGetWithdrawCashReceiptRS = CashRegisterWithdrawalReceipt

export type CashRegisterGetCashWithdrawalsOfCurrentOpenReconciliationRS = {
  receipts: CashRegisterWithdrawalReceipt[]
}

export type CashRegisterGetCashWithdrawalsForCurrentCashierOpenReconciliationRS = {
  receipts: CashRegisterWithdrawalReceipt[]
  cash_register_name: string
}

export type CashRegisterGetOtherIncomeReceiptRS = CashRegisterOtherIncomeReceipt

export type CashRegisterReconciliationGetReportRS = {
  reconciliations: CashRegisterReconciliation[]
}

export type CashRegisterCancelCashWithdrawalRS = ModifyRS

export type CashRegisterGetCashWithdrawalsForAllCashiersOpenReconciliationRS = {
  receipts: CashRegisterWithdrawalReceipt[]
  cash_register_name: string
}
