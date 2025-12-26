import { defineConfig } from 'drizzle-kit';

/**
 * Configuración de Drizzle Kit para migraciones y generación de tipos
 * @see https://orm.drizzle.team/kit-docs/config-reference
 */
export default defineConfig({
  schema: './src/shared/db/schema.ts',
  out: './src/shared/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
});
