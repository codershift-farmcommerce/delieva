import { Ctx } from 'api/src/app/context'
import { CashRegisterEndpoints } from 'interface/endpoints/cash_register'
import {
  CashRegisterAddRQ,
  CashRegisterAssignCashierRQ,
  CashRegisterCancelCashWithdrawalRQ,
  CashRegisterCloseReconciliationRQ,
  CashRegisterEnterOtherIncomeRQ,
  CashRegisterGetAssignedCashRegisterRQ,
  CashRegisterGetCashWithdrawalsByUserRQ,
  CashRegisterGetCashWithdrawalsOfCurrentOpenReconciliationRQ,
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
  CashRegisterGetCashWithdrawalsByUserRS,
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
} from 'interface/responses/cash_register'
import { action } from '../context/decorators/endpoint_actions'
import { Application } from 'interface'
import * as cash_register from 'api/src/app/models/cash_register'
import * as userModel from 'api/src/app/models/user'
import { ModifyRS } from 'interface/responses/common'

export class CashRegisterService implements CashRegisterEndpoints {
  private ctx: Ctx
  path(): 'cash_register' {
    return 'cash_register'
  }

  @action({ forApps: [Application.ADMIN] })
  add(req: CashRegisterAddRQ): Promise<CashRegisterAddRS> {
    return cash_register.add(this.ctx, req)
  }

  @action({ forApps: [Application.ADMIN] })
  list(req: CashRegisterListRQ): Promise<CashRegisterListRS> {
    return cash_register.list(this.ctx, req)
  }

  @action({ forApps: [Application.ADMIN] })
  modify(req: CashRegisterModifyRQ): Promise<ModifyRS> {
    return cash_register.modify(this.ctx, req)
  }

  @action({ forApps: [Application.ADMIN] })
  listCashiers(
    req: CashRegisterListCashiersRQ,
  ): Promise<CashRegisterListCashiersRS> {
    return cash_register.listCashiers(this.ctx, req)
  }

  @action({ forApps: [Application.ADMIN] })
  listAssignations(
    req: CashRegisterListAssignationsRQ,
  ): Promise<CashRegisterListAssignationsRS> {
    return cash_register.listAssignations(this.ctx, req)
  }

  @action({ forApps: [Application.ADMIN] })
  assignCashier(
    req: CashRegisterAssignCashierRQ,
  ): Promise<CashRegisterAssignCashierRS> {
    return cash_register.assignCashier(this.ctx, req)
  }

  @action({ forApps: [Application.ADMIN] })
  unassignCashier(
    req: CashRegisterUnassignCashierRQ,
  ): Promise<CashRegisterUnassignCashierRS> {
    return cash_register.unassignCashier(this.ctx, req)
  }

  @action({ forApps: [Application.POS, Application.ADMIN] })
  getAssignedCashRegister(
    req: CashRegisterGetAssignedCashRegisterRQ,
  ): Promise<CashRegisterGetAssignedCashRegisterRS> {
    return cash_register.getAssignedCashRegister(this.ctx, req)
  }

  @action({ forApps: [Application.POS, Application.ADMIN] })
  openReconciliation(
    req: CashRegisterOpenReconciliationRQ,
  ): Promise<CashRegisterOpenReconciliationRS> {
    return cash_register.openReconciliation(this.ctx, req)
  }

  @action({ forApps: [Application.ADMIN] })
  closeReconciliation(
    req: CashRegisterCloseReconciliationRQ,
  ): Promise<CashRegisterCloseReconciliationRS> {
    return cash_register.closeReconciliation(this.ctx, req)
  }

  @action({ forApps: [Application.ADMIN] })
  getOpenedReconciliations(
    req: CashRegisterGetOpenedReconciliationsRQ,
  ): Promise<CashRegisterGetOpenedReconciliationsRS> {
    return cash_register.getOpenedReconciliations(this.ctx, req)
  }

  @action({ forApps: [Application.ADMIN] })
  getClosedReconciliation(
    req: CashRegisterGetClosedReconciliationRQ,
  ): Promise<CashRegisterGetClosedReconciliationRS> {
    return cash_register.getClosedReconciliation(this.ctx, req)
  }

  @action({ forApps: [Application.ADMIN, Application.POS] })
  withdrawCash(req: CashRegisterWithdrawRQ): Promise<CashRegisterWithdrawRS> {
    return cash_register.withdrawCash(this.ctx, req)
  }

  @action({ forApps: [Application.ADMIN, Application.POS] })
  getWithdrawCashReceipt(
    req: CashRegisterGetWithdrawCashReceiptRQ,
  ): Promise<CashRegisterGetWithdrawCashReceiptRS> {
    return cash_register.getWithdrawCashReceipt(this.ctx, req)
  }

  @action({ forApps: [Application.ADMIN, Application.POS] })
  enterOtherIncome(
    req: CashRegisterEnterOtherIncomeRQ,
  ): Promise<CashRegisterEnterOtherIncomeRS> {
    return cash_register.enterOtherIncome(this.ctx, req)
  }

  @action({ forApps: [Application.ADMIN, Application.POS] })
  getOtherIncomeReceipt(
    req: CashRegisterGetOtherIncomeReceiptRQ,
  ): Promise<CashRegisterGetOtherIncomeReceiptRS> {
    return cash_register.getOtherIncomeReceipt(this.ctx, req)
  }

  @action({ forApps: [Application.ADMIN] })
  getReconciliationsReport(
    req: CashRegisterReconciliationGetReportRQ,
  ): Promise<CashRegisterReconciliationGetReportRS> {
    return cash_register.getReconciliationsReport(this.ctx, req)
  }

  @action({ forApps: [Application.POS, Application.ADMIN] })
  getCashWithdrawalsOfCurrentOpenReconciliation(
    req: CashRegisterGetCashWithdrawalsOfCurrentOpenReconciliationRQ,
  ): Promise<CashRegisterGetCashWithdrawalsOfCurrentOpenReconciliationRS> {
    return cash_register.getCashWithdrawalsOfCurrentOpenReconciliation(
      this.ctx,
      req,
    )
  }

  @action({ forApps: [Application.POS, Application.ADMIN] })
  getCashWithdrawalsByUser(
    req: CashRegisterGetCashWithdrawalsByUserRQ,
  ): Promise<CashRegisterGetCashWithdrawalsByUserRS> {
    return cash_register.getCashWithdrawalsByUser(
      this.ctx,
      req,
    )
  }

  @action({ forApps: [Application.POS, Application.ADMIN] })
  async cancelCashWithdrawal(
    req: CashRegisterCancelCashWithdrawalRQ,
  ): Promise<ModifyRS> {
    const { user_authorization_code } = req
    const authorizedByUserEmail = await userModel.getAuthorizingAdminUserEmail(
      this.ctx,
      user_authorization_code,
    )
    if (!authorizedByUserEmail) {
      return {
        success: false,
        error: 'unauthorized',
      }
    }
    return cash_register.cancelCashWithdrawal(
      this.ctx,
      req,
      authorizedByUserEmail,
    )
  }
}
