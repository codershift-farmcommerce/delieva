import { UserRole, UserRoleApplications } from 'codershift-farmcommerce-api/entities/user'
import { Application } from 'codershift-farmcommerce-api'

type Option = {
  text: string
  href: string
  application: Application
  hide?: boolean
}

export type Menu = {
  [menuKey: string]: {
    text: string
    options: Option[]
  }
}

const menu: Menu = {
  catalogs: {
    text: 'Catálogos',
    options: [
      {
        text: 'Productos Terminados',
        href: '/catalog/finished_products',
        application: Application.ADMIN,
      },
      {
        text: 'Productos',
        href: '/catalog/products',
        application: Application.ADMIN,
      },
      {
        text: 'Clientes',
        href: '/catalog/customers',
        application: Application.ADMIN,
      },
      {
        text: 'Cajas Registradoras',
        href: '/catalog/cash_registers',
        application: Application.ADMIN,
      },
    ],
  },
  configuration: {
    text: 'Configuración',
    options: [
      {
        text: 'Descuentos',
        href: '/configuration/discounts',
        application: Application.ADMIN,
      },
    ],
  },
  pos: {
    text: 'Punto de Venta',
    options: [
      {
        text: 'Caja',
        href: '/pos/cash_register',
        application: Application.POS,
      },
      {
        text: 'Corte de Caja',
        href: '/pos/cash_register_reconciliation',
        application: Application.ADMIN,
      },
      {
        text: 'Abono a Crédito',
        href: '/pos/customer_credit_payment',
        application: Application.CUSTOMER_CREDIT,
      },
      {
        text: 'Retiro de Efectivo',
        href: '/pos/cash_register_withdrawal',
        application: Application.CUSTOMER_CREDIT,
      },
      {
        text: 'Cancelación de Orden de Compra',
        href: '/pos/return_purchase_order',
        application: Application.ADMIN,
      },
      // {
      //   text: 'Devolución de Producto',
      //   href: '/pos/return_purchase_order_details',
      //   application: Application.ADMIN,
      // },
      {
        text: 'Otros Ingresos',
        href: '/pos/cash_register_other_income',
        application: Application.POS,
      },
      {
        text: 'Cancelación de Retiro de Efectivo',
        href: '/pos/cash_register_withdrawal_cancelling',
        application: Application.POS,
      },
      {
        text: 'Cancelación de Abono a Crédito',
        href: '/pos/customer_credit_payment_cancelling',
        application: Application.POS,
      },
    ],
  },
  reports: {
    text: 'Reportes',
    options: [
      {
        text: 'Órdenes de Compra',
        href: '/reports/purchase_orders',
        application: Application.ADMIN,
      },
      {
        text: 'Cortes de Caja',
        href: '/reports/cash_register_reconciliations',
        application: Application.ADMIN,
      },
      {
        text: 'Abonos a Créditos',
        href: '/reports/customer_credit_payments',
        application: Application.ADMIN,
      },
      {
        text: 'Créditos de Clientes',
        href: '/reports/customer_credits',
        application: Application.ADMIN,
      },
      {
        text: 'Saldo Global de Créditos',
        href: '/reports/customer_credits_global_balance',
        application: Application.ADMIN,
      },
      {
        text: 'Ventas Por Producto',
        href: '/reports/product_sales',
        application: Application.ADMIN,
      },
      {
        text: 'Ventas Por Producto Terminado',
        href: '/reports/raw_material_sales',
        application: Application.ADMIN,
      },
      {
        text: 'Movimientos de Clientes',
        href: '/reports/customer_movements',
        application: Application.ADMIN,
      },
    ],
  },
  systemManagement: {
    text: 'Administración del Sistema',
    options: [
      {
        text: 'Usuarios',
        href: '/system_management/users',
        application: Application.SYSTEM_MANAGEMENT,
      },
      {
        text: 'Respaldo de datos',
        href: '/system_management/data_snapshot',
        application: Application.SYSTEM_MANAGEMENT,
      },
    ],
  },
}

export function getMenuItems(roles: UserRole[]): Menu {
  return Object.keys(menu).reduce((acc, key) => {
    const allowedOptions = menu[key].options.filter(
      option => isOptionAllowed(roles, option.application) && !option.hide,
    )
    if (allowedOptions.length) {
      acc[key] = {
        ...menu[key],
        options: allowedOptions,
      }
    }
    return acc
  }, {} as Menu)
}

function isOptionAllowed(roles: UserRole[], application: Application): boolean {
  return !!roles.find(role => UserRoleApplications?.[role].find(app => app === application))
}
