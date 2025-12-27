import type { RegisterInput, LoginInput } from '@/entities/user/model/user.schema';
import type { UserDTO } from '@/entities/user/model/user.entity';

/**
 * API client para autenticación
 */
export class AuthApi {
  /**
   * Registrar nuevo usuario
   */
  async register(data: RegisterInput): Promise<UserDTO> {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Error al registrar usuario');
    }

    const result = await response.json();
    return result.data;
  }
}

// Singleton
export const authApi = new AuthApi();
