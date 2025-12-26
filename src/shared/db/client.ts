import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '../config/env';
import * as schema from './schema';

/**
 * Cliente de conexión a PostgreSQL
 * Usa pooling de conexiones para mejor performance
 */
const connectionString = env.DATABASE_URL;

/**
 * Cliente SQL de postgres.js
 * Configurado con opciones óptimas para producción
 */
export const sql = postgres(connectionString, {
  max: env.NODE_ENV === 'production' ? 10 : 1,
  idle_timeout: 20,
  connect_timeout: 10,
});

/**
 * Instancia de Drizzle ORM con schema completo
 * Exportar como singleton para reusar conexiones
 */
export const db = drizzle(sql, { schema });

/**
 * Type helper para transacciones
 */
export type DbTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0];
