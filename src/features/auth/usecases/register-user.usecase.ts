import bcrypt from 'bcryptjs';
import { db } from '@/shared/db/client';
import { categories, paymentMethods } from '@/shared/db/schema';
import type { IUserRepository } from '@/entities/user/repo';
import type { RegisterInput } from '@/entities/user/model/user.schema';
import type { User } from '@/entities/user/model/user.entity';
import { ConflictError } from '@/shared/lib/errors';
import { DEFAULT_CATEGORIES } from '../seeds/default-categories';
import { DEFAULT_PAYMENT_METHODS } from '../seeds/default-payment-methods';

/**
 * Caso de uso: Registrar nuevo usuario
 *
 * Responsabilidades:
 * 1. Validar que el email no exista
 * 2. Hashear el password
 * 3. Crear el usuario
 * 4. Insertar categorías por defecto
 * 5. Insertar formas de pago por defecto
 *
 * Todo en una transacción para garantizar consistencia
 */
export class RegisterUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(input: RegisterInput): Promise<User> {
    // Validar que el email no exista
    const emailExists = await this.userRepository.emailExists(input.email);
    if (emailExists) {
      throw new ConflictError('El email ya está registrado');
    }

    // Hashear password
    const hashedPassword = await this.hashPassword(input.password);

    // Crear usuario
    const user = await this.userRepository.create({
      email: input.email,
      hashedPassword,
      name: input.username || null,
    });

    // Insertar categorías por defecto
    await this.insertDefaultCategories(user.id);

    // Insertar formas de pago por defecto
    await this.insertDefaultPaymentMethods(user.id);

    return user;
  }

  /**
   * Hashear password con bcrypt
   */
  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  }

  /**
   * Insertar categorías por defecto para el usuario
   */
  private async insertDefaultCategories(userId: string): Promise<void> {
    const now = new Date();

    await db.insert(categories).values(
      DEFAULT_CATEGORIES.map((category) => ({
        userId,
        name: category.name,
        kind: category.kind,
        isDefault: category.isDefault,
        createdAt: now,
        updatedAt: now,
      }))
    );
  }

  /**
   * Insertar formas de pago por defecto para el usuario
   */
  private async insertDefaultPaymentMethods(userId: string): Promise<void> {
    const now = new Date();

    await db.insert(paymentMethods).values(
      DEFAULT_PAYMENT_METHODS.map((method) => ({
        userId,
        name: method.name,
        isDefault: method.isDefault,
        createdAt: now,
        updatedAt: now,
      }))
    );
  }
}
