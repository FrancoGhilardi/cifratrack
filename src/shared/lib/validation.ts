import { z } from 'zod';

/**
 * Schema común para email
 */
export const emailSchema = z.string().email('Email inválido').toLowerCase();

/**
 * Schema común para password
 * Mínimo 8 caracteres
 */
export const passwordSchema = z
  .string()
  .min(8, 'La contraseña debe tener al menos 8 caracteres')
  .max(100, 'La contraseña no puede superar los 100 caracteres');

/**
 * Schema para password con requisitos más estrictos
 * Al menos 1 mayúscula, 1 minúscula, 1 número
 */
export const strongPasswordSchema = passwordSchema.regex(
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
  'La contraseña debe contener al menos una mayúscula, una minúscula y un número'
);

/**
 * Schema para montos en centavos (entero positivo)
 */
export const amountSchema = z.number().int('El monto debe ser un entero').min(1, 'El monto debe ser mayor a 0');

/**
 * Schema para montos en pesos (decimal positivo)
 */
export const amountPesosSchema = z.number().positive('El monto debe ser positivo');

/**
 * Schema para fecha ISO (YYYY-MM-DD)
 */
export const dateISOSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida. Usar formato YYYY-MM-DD');

/**
 * Schema para mes (YYYY-MM)
 */
export const monthSchema = z.string().regex(/^\d{4}-\d{2}$/, 'Mes inválido. Usar formato YYYY-MM');

/**
 * Schema para strings no vacíos
 */
export const nonEmptyStringSchema = z.string().trim().min(1, 'Este campo no puede estar vacío');

/**
 * Schema para título/nombre (entre 1 y 100 caracteres)
 */
export const titleSchema = nonEmptyStringSchema.max(100, 'El título no puede superar los 100 caracteres');

/**
 * Schema para descripción opcional (máximo 500 caracteres)
 */
export const descriptionSchema = z
  .string()
  .trim()
  .max(500, 'La descripción no puede superar los 500 caracteres')
  .optional();

/**
 * Schema para ID numérico positivo
 */
export const idSchema = z.number().int().positive('ID inválido');

/**
 * Schema para porcentaje (0-100)
 */
export const percentageSchema = z
  .number()
  .min(0, 'El porcentaje debe ser mayor o igual a 0')
  .max(100, 'El porcentaje no puede superar 100');

/**
 * Schema para TNA (tasa nominal anual)
 * Permitir valores entre 0 y 1000% (casos extremos)
 */
export const tnaSchema = z
  .number()
  .min(0, 'La TNA debe ser mayor o igual a 0')
  .max(1000, 'La TNA no puede superar 1000%');

/**
 * Schema para días de inversión (positivo)
 */
export const daysSchema = z.number().int().min(1, 'Los días deben ser al menos 1');

/**
 * Schema para día del mes (1-31)
 */
export const dayOfMonthSchema = z
  .number()
  .int()
  .min(1, 'El día debe ser al menos 1')
  .max(31, 'El día no puede superar 31');

/**
 * Helper para transformar string a número
 */
export const stringToNumber = z.string().transform((val, ctx) => {
  const parsed = parseFloat(val);
  if (isNaN(parsed)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Debe ser un número válido',
    });
    return z.NEVER;
  }
  return parsed;
});

/**
 * Helper para transformar string a boolean
 */
export const stringToBoolean = z
  .string()
  .transform((val) => val === 'true' || val === '1')
  .pipe(z.boolean());

/**
 * Helper para arrays de IDs desde string separado por comas
 */
export const commaSeparatedIds = z
  .string()
  .transform((val) =>
    val
      .split(',')
      .map((id) => parseInt(id.trim(), 10))
      .filter((id) => !isNaN(id))
  )
  .pipe(z.array(z.number().int().positive()));
