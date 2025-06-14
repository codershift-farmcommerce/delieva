import { CashRegisterEndpoints } from 'interface/endpoints/cash_register'
import {
  CashRegisterAddRQ,
  CashRegisterAssignCashierRQ,
  CashRegisterCancelCashWithdrawalRQ,
  CashRegisterCloseReconciliationRQ,
  CashRegisterEnterOtherIncomeRQ,
  CashRegisterGetAssignedCashRegisterRQ,
  CashRegisterGetCashWithdrawalsOfCurrentOpenReconciliationRQ,
  CashRegisterGetCashWithdrawalsForCurrentCashierOpenReconciliationRQ,
  CashRegisterGetCashWithdrawalsForAllCashiersOpenReconciliationRQ,
  CashRegisterGetClosedReconciliationRQ,
  CashRegisterGetOpenedReconciliationsRQ,
  CashRegisterGetOtherIncomeReceiptRQ,
  CashRegisterGetWithdrawCashReceiptRQ,
  CashRegisterListAssignationsRQ,
  CashRegisterListCashiersRQ,
  CashRegisterListRQ,
  CashRegisterModifyRQ,
  CashRegisterOpenReconciliationRQ,
  CashRegisterReconciliationGetReportRQ,
  CashRegisterUnassignCashierRQ,
  CashRegisterWithdrawRQ,
} from 'interface/requests/cash_register'
import {
  CashRegisterAddRS,
  CashRegisterAssignCashierRS,
  CashRegisterCloseReconciliationRS,
  CashRegisterEnterOtherIncomeRS,
  CashRegisterGetAssignedCashRegisterRS,
  CashRegisterGetCashWithdrawalsOfCurrentOpenReconciliationRS,
  CashRegisterGetCashWithdrawalsForCurrentCashierOpenReconciliationRS,
  CashRegisterGetCashWithdrawalsForAllCashiersOpenReconciliationRS,
  CashRegisterGetClosedReconciliationRS,
  CashRegisterGetOpenedReconciliationsRS,
  CashRegisterGetWithdrawCashReceiptRS,
  CashRegisterListAssignationsRS,
  CashRegisterListCashiersRS,
  CashRegisterListRS,
  CashRegisterOpenReconciliationRS,
  CashRegisterReconciliationGetReportRS,
  CashRegisterUnassignCashierRS,
  CashRegisterWithdrawRS,
} from 'interface/responses/cash_register'
import { sendRequest } from '../request'
import { ModifyRS } from 'interface/responses/common'
import { CashRegisterOtherIncomeReceipt } from 'interface/entities/cash_register'

export class CashRegisterClient implements CashRegisterEndpoints {
  path(): 'cash_register' {
    return 'cash_register'
  }

  add(req: CashRegisterAddRQ): Promise<CashRegisterAddRS> {
    return sendRequest('/cash_register/add', req)
  }

  modify(req: CashRegisterModifyRQ): Promise<ModifyRS> {
    return sendRequest('/cash_register/modify', req)
  }

  list(req: CashRegisterListRQ): Promise<CashRegisterListRS> {
    return sendRequest('/cash_register/list', req)
  }

  listCashiers(req: CashRegisterListCashiersRQ): Promise<CashRegisterListCashiersRS> {
    return sendRequest('/cash_register/listCashiers', req)
  }

  listAssignations(req: CashRegisterListAssignationsRQ): Promise<CashRegisterListAssignationsRS> {
    return sendRequest('/cash_register/listAssignations', req)
  }

  assignCashier(req: CashRegisterAssignCashierRQ): Promise<CashRegisterAssignCashierRS> {
    return sendRequest('/cash_register/assignCashier', req)
  }

  unassignCashier(req: CashRegisterUnassignCashierRQ): Promise<CashRegisterUnassignCashierRS> {
    return sendRequest('/cash_register/unassignCashier', req)
  }

  getAssignedCashRegister(
    req: CashRegisterGetAssignedCashRegisterRQ,
  ): Promise<CashRegisterGetAssignedCashRegisterRS> {
    return sendRequest('/cash_register/getAssignedCashRegister', req)
  }

  openReconciliation(
    req: CashRegisterOpenReconciliationRQ,
  ): Promise<CashRegisterOpenReconciliationRS> {
    return sendRequest('/cash_register/openReconciliation', req)
  }

  getOpenedReconciliations(
    req: CashRegisterGetOpenedReconciliationsRQ,
  ): Promise<CashRegisterGetOpenedReconciliationsRS> {
    return sendRequest('/cash_register/getOpenedReconciliations', req)
  }

  closeReconciliation(
    req: CashRegisterCloseReconciliationRQ,
  ): Promise<CashRegisterCloseReconciliationRS> {
    return sendRequest('/cash_register/closeReconciliation', req)
  }

  getClosedReconciliation(
    req: CashRegisterGetClosedReconciliationRQ,
  ): Promise<CashRegisterGetClosedReconciliationRS> {
    return sendRequest('/cash_register/getClosedReconciliation', req)
  }

  withdrawCash(req: CashRegisterWithdrawRQ): Promise<CashRegisterWithdrawRS> {
    return sendRequest('/cash_register/withdrawCash', req)
  }

  getWithdrawCashReceipt(
    req: CashRegisterGetWithdrawCashReceiptRQ,
  ): Promise<CashRegisterGetWithdrawCashReceiptRS> {
    return sendRequest('/cash_register/getWithdrawCashReceipt', req)
  }

  getReconciliationsReport(
    req: CashRegisterReconciliationGetReportRQ,
  ): Promise<CashRegisterReconciliationGetReportRS> {
    return sendRequest('/cash_register/getReconciliationsReport', req)
  }

  enterOtherIncome(req: CashRegisterEnterOtherIncomeRQ): Promise<CashRegisterEnterOtherIncomeRS> {
    return sendRequest('/cash_register/enterOtherIncome', req)
  }

  getOtherIncomeReceipt(
    req: CashRegisterGetOtherIncomeReceiptRQ,
  ): Promise<CashRegisterOtherIncomeReceipt> {
    return sendRequest(`/${this.path()}/getOtherIncomeReceipt`, req)
  }

  getCashWithdrawalsOfCurrentOpenReconciliation(
    req: CashRegisterGetCashWithdrawalsOfCurrentOpenReconciliationRQ,
  ): Promise<CashRegisterGetCashWithdrawalsOfCurrentOpenReconciliationRS> {
    return sendRequest(`/${this.path()}/getCashWithdrawalsOfCurrentOpenReconciliation`, req)
  }

  getCashWithdrawalsForCurrentCashierOpenReconciliation(
    req: CashRegisterGetCashWithdrawalsForCurrentCashierOpenReconciliationRQ,
  ): Promise<CashRegisterGetCashWithdrawalsForCurrentCashierOpenReconciliationRS> {
    return sendRequest(`/${this.path()}/getCashWithdrawalsForCurrentCashierOpenReconciliation`, req)
  }

  getCashWithdrawalsForAllCashiersOpenReconciliation(
    req: CashRegisterGetCashWithdrawalsForAllCashiersOpenReconciliationRQ,
  ): Promise<CashRegisterGetCashWithdrawalsForAllCashiersOpenReconciliationRS> {
    return sendRequest(`/${this.path()}/getCashWithdrawalsForAllCashiersOpenReconciliation`, req)
  }

  cancelCashWithdrawal(req: CashRegisterCancelCashWithdrawalRQ): Promise<ModifyRS> {
    return sendRequest(`/${this.path()}/cancelCashWithdrawal`, req)
  }
}
