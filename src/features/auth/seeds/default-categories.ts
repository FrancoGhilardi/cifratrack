/**
 * Categorías por defecto para nuevos usuarios
 * Se insertan automáticamente al registrarse
 */

export const DEFAULT_EXPENSE_CATEGORIES = [
  { name: 'Alquiler', kind: 'expense' as const, isDefault: true },
  { name: 'Expensas', kind: 'expense' as const, isDefault: true },
  { name: 'Servicios', kind: 'expense' as const, isDefault: true },
  { name: 'Tarjetas', kind: 'expense' as const, isDefault: true },
  { name: 'Supermercado', kind: 'expense' as const, isDefault: true },
  { name: 'Transporte', kind: 'expense' as const, isDefault: true },
  { name: 'Salud', kind: 'expense' as const, isDefault: true },
  { name: 'Educación', kind: 'expense' as const, isDefault: true },
  { name: 'Entretenimiento', kind: 'expense' as const, isDefault: true },
  { name: 'Impuestos', kind: 'expense' as const, isDefault: true },
  { name: 'Suscripciones', kind: 'expense' as const, isDefault: true },
  { name: 'Otros', kind: 'expense' as const, isDefault: true },
] as const;

export const DEFAULT_INCOME_CATEGORIES = [
  { name: 'Sueldo', kind: 'income' as const, isDefault: true },
  { name: 'Freelance', kind: 'income' as const, isDefault: true },
  { name: 'Ingresos Extra', kind: 'income' as const, isDefault: true },
  { name: 'Rendimientos', kind: 'income' as const, isDefault: true },
  { name: 'Otros', kind: 'income' as const, isDefault: true },
] as const;

export const DEFAULT_CATEGORIES = [
  ...DEFAULT_EXPENSE_CATEGORIES,
  ...DEFAULT_INCOME_CATEGORIES,
] as const;
