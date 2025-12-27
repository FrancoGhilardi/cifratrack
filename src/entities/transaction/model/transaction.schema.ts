import { z } from 'zod';
import { nonEmptyStringSchema } from '@/shared/lib/validation';

/**
 * Schema para el split de categorías
 */
export const categorySplitSchema = z.object({
  categoryId: z.string().uuid('ID de categoría inválido'),
  allocatedAmount: z
    .number()
    .int('El monto debe ser un número entero')
    .positive('El monto debe ser mayor a cero'),
});

/**
 * Schema para crear transacción
 */
export const createTransactionSchema = z.object({
  kind: z.enum(['income', 'expense']),
  title: nonEmptyStringSchema
    .max(120, 'El título no puede superar los 120 caracteres')
    .min(2, 'El título debe tener al menos 2 caracteres'),
  description: z.string().max(500, 'La descripción no puede superar los 500 caracteres').optional().nullable(),
  amount: z
    .number()
    .int('El monto debe ser un número entero (centavos)')
    .positive('El monto debe ser mayor a cero'),
  currency: z.string().length(3).default('ARS').optional(),
  paymentMethodId: z.string().uuid('ID de forma de pago inválido').optional().nullable(),
  isFixed: z.boolean().default(false).optional(),
  status: z.enum(['pending', 'paid']),
  occurredOn: z.coerce.date(),
  occurredMonth: z.string().regex(/^\d{4}-\d{2}$/, 'El mes debe estar en formato YYYY-MM'),
  dueOn: z.coerce.date().optional().nullable(),
  paidOn: z.coerce.date().optional().nullable(),
  sourceRecurringRuleId: z.string().uuid().optional().nullable(),
  split: z.array(categorySplitSchema).min(1, 'Debe haber al menos una categoría asignada'),
});

/**
 * Schema para actualizar transacción
 */
export const updateTransactionSchema = z.object({
  title: nonEmptyStringSchema
    .max(120, 'El título no puede superar los 120 caracteres')
    .min(2, 'El título debe tener al menos 2 caracteres')
    .optional(),
  description: z.string().max(500, 'La descripción no puede superar los 500 caracteres').optional().nullable(),
  amount: z
    .number()
    .int('El monto debe ser un número entero (centavos)')
    .positive('El monto debe ser mayor a cero')
    .optional(),
  paymentMethodId: z.string().uuid('ID de forma de pago inválido').optional().nullable(),
  isFixed: z.boolean().optional(),
  status: z.enum(['pending', 'paid']).optional(),
  occurredOn: z.coerce.date().optional(),
  occurredMonth: z.string().regex(/^\d{4}-\d{2}$/, 'El mes debe estar en formato YYYY-MM').optional(),
  dueOn: z.coerce.date().optional().nullable(),
  paidOn: z.coerce.date().optional().nullable(),
  split: z.array(categorySplitSchema).min(1, 'Debe haber al menos una categoría asignada').optional(),
});

/**
 * Schema para filtrar transacciones
 */
export const listTransactionsSchema = z.object({
  kind: z.enum(['income', 'expense']).optional(),
  status: z.enum(['pending', 'paid']).optional(),
  month: z.string().regex(/^\d{4}-\d{2}$/, 'El mes debe estar en formato YYYY-MM').optional(),
  paymentMethodId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
});

/**
 * Types inferidos
 */
export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
export type ListTransactionsInput = z.infer<typeof listTransactionsSchema>;
export type CategorySplit = z.infer<typeof categorySplitSchema>;
