import { z } from 'zod';
import { nonEmptyStringSchema, amountSchema, dayOfMonthSchema, monthSchema } from '@/shared/lib/validation';

export const recurringRuleCategorySchema = z.object({
  categoryId: z.string().uuid('ID de categoría inválido'),
  allocatedAmount: amountSchema,
});

export const createRecurringRuleSchema = z.object({
  title: nonEmptyStringSchema.max(120, 'El título no puede superar 120 caracteres'),
  description: z.string().max(500, 'La descripción no puede superar 500 caracteres').optional().nullable(),
  amount: amountSchema,
  kind: z.enum(['income', 'expense']),
  dayOfMonth: dayOfMonthSchema,
  status: z.enum(['pending', 'paid']).default('pending'),
  paymentMethodId: z.string().uuid().optional().nullable(),
  activeFromMonth: monthSchema,
  activeToMonth: monthSchema.optional().nullable(),
  categories: z.array(recurringRuleCategorySchema).optional(),
});

export const updateRecurringRuleSchema = createRecurringRuleSchema.partial();

export type CreateRecurringRuleInput = z.infer<typeof createRecurringRuleSchema>;
export type UpdateRecurringRuleInput = z.infer<typeof updateRecurringRuleSchema>;
export type RecurringRuleCategoryInput = z.infer<typeof recurringRuleCategorySchema>;
