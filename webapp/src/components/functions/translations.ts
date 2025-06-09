import {
  FormOfPayment,
  PurchaseOrderStatus,
} from 'interface/entities/purchase_order'
import { FinishedProductUnitType } from 'interface/entities/finished_product'
import {
  CashRegisterQuantityInputType,
  CashRegisterWithdrawalStatus,
} from 'interface/entities/cash_register'
import { ApiErrorCode } from 'interface/entities/api_error_code'
import { CustomerCreditPaymentStatus } from 'interface/entities/customer_credit'

export const ApiErrorCodeTranslation: Partial<Record<ApiErrorCode, string>> = {
  [ApiErrorCode.WithdrawalAmountIsGreaterThanClosingCashBalance]:
    'No hay dinero suficiente en caja.',
}

export const FormOfPaymentTranslation: Record<FormOfPayment, string> = {
  [FormOfPayment.CASH]: 'Efectivo',
  [FormOfPayment.TRANSFER]: 'Transferencia',
  [FormOfPayment.CREDIT_CARD]: 'Tarjeta de crédito',
  [FormOfPayment.CREDIT]: 'Crédito',
}

export const FinishedProductUnitTranslation: Record<FinishedProductUnitType, string> = {
  [FinishedProductUnitType.KILOGRAM]: 'Kilogramo',
  [FinishedProductUnitType.LITER]: 'Litro',
  [FinishedProductUnitType.PIECE]: 'Pieza',
}

export const CashRegisterQuantityInputTypeTranslation: Record<
  CashRegisterQuantityInputType,
  string
> = {
  [CashRegisterQuantityInputType.MANUAL]: 'Manual',
  [CashRegisterQuantityInputType.PRODUCT_SCAN]: 'Escaneo de producto',
}

export const PurchaseOrderStatusTranslation: Record<PurchaseOrderStatus, string> = {
  [PurchaseOrderStatus.PROCESSED]: 'Procesada',
  [PurchaseOrderStatus.RETURNED]: 'Cancelada',
}

export const PurchaseOrderDetailStatusTranslation: Record<PurchaseOrderStatus, string> = {
  [PurchaseOrderStatus.PROCESSED]: 'Procesado',
  [PurchaseOrderStatus.RETURNED]: 'Devuelto',
}

export const CashRegisterWithdrawalStatusTranslation: Record<CashRegisterWithdrawalStatus, string> =
  {
    [CashRegisterWithdrawalStatus.PROCESSED]: 'Procesado',
    [CashRegisterWithdrawalStatus.CANCELED]: 'Cancelado',
  }

export const CustomerCreditPaymentStatusTranslation: Record<CustomerCreditPaymentStatus, string> = {
  [CustomerCreditPaymentStatus.PROCESSED]: 'Procesado',
  [CustomerCreditPaymentStatus.CANCELED]: 'Cancelado',
}
