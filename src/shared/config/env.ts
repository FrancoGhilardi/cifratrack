import { z } from 'zod';

/**
 * Schema de validación para variables de entorno
 * Asegura que todas las variables críticas estén presentes y sean válidas
 */
const envSchema = z.object({
  // Base de datos
  DATABASE_URL: z.string().url('DATABASE_URL debe ser una URL válida'),

  // Auth.js (NextAuth)
  NEXTAUTH_SECRET: z.string().min(32, 'NEXTAUTH_SECRET debe tener al menos 32 caracteres'),
  NEXTAUTH_URL: z.string().url('NEXTAUTH_URL debe ser una URL válida'),

  // Node environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

/**
 * Validar y exportar variables de entorno
 * Falla rápidamente si alguna variable requerida falta o es inválida
 */
function validateEnv() {
  try {
    return envSchema.parse({
      DATABASE_URL: process.env.DATABASE_URL,
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      NODE_ENV: process.env.NODE_ENV,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join('\n');
      throw new Error(`Variables de entorno inválidas:\n${missingVars}`);
    }
    throw error;
  }
}

/**
 * Variables de entorno validadas y type-safe
 * Solo se validan una vez al importar este módulo
 */
export const env = validateEnv();

/**
 * Type helper para variables de entorno
 */
export type Env = z.infer<typeof envSchema>;
