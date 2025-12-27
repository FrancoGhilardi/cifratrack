import { z } from 'zod';
import { nonEmptyStringSchema } from '@/shared/lib/validation';

/**
 * Schema para crear forma de pago
 */
export const createPaymentMethodSchema = z.object({
  name: nonEmptyStringSchema
    .max(60, 'El nombre no puede superar los 60 caracteres')
    .min(2, 'El nombre debe tener al menos 2 caracteres'),
  isActive: z.boolean().default(true),
});

/**
 * Schema para actualizar forma de pago
 */
export const updatePaymentMethodSchema = z.object({
  name: nonEmptyStringSchema
    .max(60, 'El nombre no puede superar los 60 caracteres')
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .optional(),
  isActive: z.boolean().optional(),
});

/**
 * Schema para filtrar formas de pago
 */
export const listPaymentMethodsSchema = z.object({
  isActive: z.boolean().optional(),
});

/**
 * Types inferidos
 */
export type CreatePaymentMethodInput = z.infer<typeof createPaymentMethodSchema>;
export type UpdatePaymentMethodInput = z.infer<typeof updatePaymentMethodSchema>;
export type ListPaymentMethodsInput = z.infer<typeof listPaymentMethodsSchema>;
