/**
 * Formas de pago por defecto para nuevos usuarios
 * Se insertan automáticamente al registrarse
 */

export const DEFAULT_PAYMENT_METHODS = [
  { name: 'Efectivo', isDefault: true },
  { name: 'Transferencia', isDefault: true },
  { name: 'Débito', isDefault: true },
  { name: 'Crédito Visa', isDefault: true },
  { name: 'Crédito Mastercard', isDefault: true },
  { name: 'Otros', isDefault: true },
] as const;
