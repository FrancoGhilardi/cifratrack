import type { RegisterInput } from '@/entities/user/model/user.schema';
import type { UserDTO } from '@/entities/user/model/user.entity';
import { apiFetch } from '@/shared/lib/api-client';

/**
 * API client para autenticación
 */
export class AuthApi {
  /**
   * Registrar nuevo usuario
   */
  async register(data: RegisterInput): Promise<UserDTO> {
    const result = await apiFetch<{ data: UserDTO }>('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      skipAuthRedirect: true, // ruta pública
    });
    return result.data;
  }
}

// Singleton
export const authApi = new AuthApi();
