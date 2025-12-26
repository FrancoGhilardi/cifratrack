import bcrypt from 'bcryptjs';
import type { IUserRepository } from '@/entities/user/repo';
import type { LoginInput } from '@/entities/user/model/user.schema';
import type { User } from '@/entities/user/model/user.entity';
import { AuthenticationError } from '@/shared/lib/errors';

/**
 * Caso de uso: Autenticar usuario con credenciales
 *
 * Responsabilidades:
 * 1. Buscar usuario por email
 * 2. Verificar que el usuario exista
 * 3. Comparar password con hash almacenado
 * 4. Retornar usuario si las credenciales son válidas
 */
export class AuthenticateUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(input: LoginInput): Promise<User> {
    // Buscar usuario por email
    const user = await this.userRepository.findByEmail(input.email);

    if (!user) {
      throw new AuthenticationError('Credenciales inválidas');
    }

    // Verificar password
    const isValidPassword = await this.verifyPassword(
      input.password,
      user.hashedPassword
    );

    if (!isValidPassword) {
      throw new AuthenticationError('Credenciales inválidas');
    }

    return user;
  }

  /**
   * Verificar password con bcrypt
   */
  private async verifyPassword(
    plainPassword: string,
    hashedPassword: string
  ): Promise<boolean> {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}
