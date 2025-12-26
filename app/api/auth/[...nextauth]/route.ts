import { handlers } from '@/shared/lib/auth';

/**
 * Route handler para Auth.js
 * Maneja automáticamente:
 * - POST /api/auth/signin
 * - POST /api/auth/signout
 * - GET /api/auth/session
 * - GET /api/auth/csrf
 * - GET /api/auth/providers
 */
export const { GET, POST } = handlers;
