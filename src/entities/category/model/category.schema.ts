import { z } from 'zod';
import { nonEmptyStringSchema } from '@/shared/lib/validation';

/**
 * Schema para crear categoría
 */
export const createCategorySchema = z.object({
  kind: z.enum(['income', 'expense']),
  name: nonEmptyStringSchema
    .max(60, 'El nombre no puede superar los 60 caracteres')
    .min(2, 'El nombre debe tener al menos 2 caracteres'),
});

/**
 * Schema para actualizar categoría
 */
export const updateCategorySchema = z.object({
  name: nonEmptyStringSchema
    .max(60, 'El nombre no puede superar los 60 caracteres')
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .optional(),
  isActive: z.boolean().optional(),
});

/**
 * Schema para filtrar categorías
 */
export const listCategoriesSchema = z.object({
  kind: z.enum(['income', 'expense']).optional(),
  isActive: z.boolean().optional(),
});

/**
 * Types inferidos
 */
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type ListCategoriesInput = z.infer<typeof listCategoriesSchema>;
