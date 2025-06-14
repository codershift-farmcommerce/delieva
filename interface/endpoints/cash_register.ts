import {
  CashRegisterAddRQ,
  CashRegisterAssignCashierRQ,
  CashRegisterCloseReconciliationRQ,
  CashRegisterGetAssignedCashRegisterRQ,
  CashRegisterGetClosedReconciliationRQ,
  CashRegisterGetOpenedReconciliationsRQ,
  CashRegisterListAssignationsRQ,
  CashRegisterListCashiersRQ,
  CashRegisterListRQ,
  CashRegisterModifyRQ,
  CashRegisterOpenReconciliationRQ,
  CashRegisterUnassignCashierRQ,
  CashRegisterWithdrawRQ,
  CashRegisterGetWithdrawCashReceiptRQ,
  CashRegisterReconciliationGetReportRQ,
  CashRegisterEnterOtherIncomeRQ,
  CashRegisterGetOtherIncomeReceiptRQ,
  CashRegisterGetCashWithdrawalsOfCurrentOpenReconciliationRQ,
  CashRegisterCancelCashWithdrawalRQ,
  CashRegisterGetCashWithdrawalsForCurrentCashierOpenReconciliationRQ,
  CashRegisterGetCashWithdrawalsForAllCashiersOpenReconciliationRQ,
} from '../requests/cash_register'
import {
  CashRegisterAddRS,
  CashRegisterAssignCashierRS,
  CashRegisterCancelCashWithdrawalRS,
  CashRegisterCloseReconciliationRS,
  CashRegisterEnterOtherIncomeRS,
  CashRegisterGetAssignedCashRegisterRS,
  CashRegisterGetCashWithdrawalsOfCurrentOpenReconciliationRS,
  CashRegisterGetClosedReconciliationRS,
  CashRegisterGetOpenedReconciliationsRS,
  CashRegisterGetOtherIncomeReceiptRS,
  CashRegisterGetWithdrawCashReceiptRS,
  CashRegisterListAssignationsRS,
  CashRegisterListCashiersRS,
  CashRegisterListRS,
  CashRegisterOpenReconciliationRS,
  CashRegisterReconciliationGetReportRS,
  CashRegisterUnassignCashierRS,
  CashRegisterWithdrawRS,
  CashRegisterGetCashWithdrawalsForCurrentCashierOpenReconciliationRS,
  CashRegisterGetCashWithdrawalsForAllCashiersOpenReconciliationRS,
} from '../responses/cash_register'
import { ModifyRS } from '../responses/common'

export interface CashRegisterEndpoints {
  path(): 'cash_register'

  add(req: CashRegisterAddRQ): Promise<CashRegisterAddRS>

  list(req: CashRegisterListRQ): Promise<CashRegisterListRS>

  modify(req: CashRegisterModifyRQ): Promise<ModifyRS>

  listCashiers(
    req: CashRegisterListCashiersRQ,
  ): Promise<CashRegisterListCashiersRS>

  listAssignations(
    req: CashRegisterListAssignationsRQ,
  ): Promise<CashRegisterListAssignationsRS>

  assignCashier(
    req: CashRegisterAssignCashierRQ,
  ): Promise<CashRegisterAssignCashierRS>

  unassignCashier(
    req: CashRegisterUnassignCashierRQ,
  ): Promise<CashRegisterUnassignCashierRS>

  getAssignedCashRegister(
    req: CashRegisterGetAssignedCashRegisterRQ,
  ): Promise<CashRegisterGetAssignedCashRegisterRS>

  openReconciliation(
    req: CashRegisterOpenReconciliationRQ,
  ): Promise<CashRegisterOpenReconciliationRS>

  closeReconciliation(
    req: CashRegisterCloseReconciliationRQ,
  ): Promise<CashRegisterCloseReconciliationRS>

  getOpenedReconciliations(
    req: CashRegisterGetOpenedReconciliationsRQ,
  ): Promise<CashRegisterGetOpenedReconciliationsRS>

  getClosedReconciliation(
    req: CashRegisterGetClosedReconciliationRQ,
  ): Promise<CashRegisterGetClosedReconciliationRS>

  withdrawCash(req: CashRegisterWithdrawRQ): Promise<CashRegisterWithdrawRS>

  getWithdrawCashReceipt(
    req: CashRegisterGetWithdrawCashReceiptRQ,
  ): Promise<CashRegisterGetWithdrawCashReceiptRS>

  getCashWithdrawalsForCurrentCashierOpenReconciliation(
    req: CashRegisterGetCashWithdrawalsForCurrentCashierOpenReconciliationRQ,
  ): Promise<CashRegisterGetCashWithdrawalsForCurrentCashierOpenReconciliationRS>

  cancelCashWithdrawal(
    req: CashRegisterCancelCashWithdrawalRQ,
  ): Promise<CashRegisterCancelCashWithdrawalRS>

  enterOtherIncome(
    req: CashRegisterEnterOtherIncomeRQ,
  ): Promise<CashRegisterEnterOtherIncomeRS>

  getOtherIncomeReceipt(
    req: CashRegisterGetOtherIncomeReceiptRQ,
  ): Promise<CashRegisterGetOtherIncomeReceiptRS>

  getReconciliationsReport(
    req: CashRegisterReconciliationGetReportRQ,
  ): Promise<CashRegisterReconciliationGetReportRS>

  getCashWithdrawalsForAllCashiersOpenReconciliation(
    req: CashRegisterGetCashWithdrawalsForAllCashiersOpenReconciliationRQ,
  ): Promise<CashRegisterGetCashWithdrawalsForAllCashiersOpenReconciliationRS>
}
