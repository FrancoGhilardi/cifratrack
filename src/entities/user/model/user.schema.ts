import { z } from 'zod';
import { emailSchema, passwordSchema, nonEmptyStringSchema } from '@/shared/lib/validation';

/**
 * Schema para registro de usuario
 */
export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: nonEmptyStringSchema
    .max(100, 'El nombre no puede superar los 100 caracteres')
    .optional()
    .nullable(),
});

/**
 * Schema para login
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'La contraseña es requerida'),
});

/**
 * Schema para actualizar perfil
 */
export const updateProfileSchema = z.object({
  name: nonEmptyStringSchema
    .max(100, 'El nombre no puede superar los 100 caracteres')
    .optional()
    .nullable(),
  email: emailSchema.optional(),
});

/**
 * Schema para cambio de contraseña
 */
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'La contraseña actual es requerida'),
  newPassword: passwordSchema,
  confirmPassword: z.string().min(1, 'Confirmar contraseña es requerido'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

/**
 * Types inferidos de los schemas
 */
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
