import bcrypt from 'bcryptjs';
import { db, type DbTransaction } from '@/shared/db/client';
import { categories, paymentMethods, users } from '@/shared/db/schema';
import type { IUserRepository } from '@/entities/user/repo';
import type { RegisterInput } from '@/entities/user/model/user.schema';
import { User } from '@/entities/user/model/user.entity';
import { ConflictError } from '@/shared/lib/errors';
import { DEFAULT_CATEGORIES } from '../seeds/default-categories';
import { DEFAULT_PAYMENT_METHODS } from '../seeds/default-payment-methods';

/** Código SQLSTATE de Postgres para violación de constraint único */
const UNIQUE_VIOLATION_CODE = '23505';

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: unknown }).code === UNIQUE_VIOLATION_CODE
  );
}

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

    try {
      return await db.transaction(async (tx) => {
        // Crear usuario
        const user = await this.createUser(tx, {
          email: input.email,
          hashedPassword,
          name: input.username || null,
        });

        // Insertar categorías y formas de pago por defecto
        await this.insertDefaultCategories(tx, user.id);
        await this.insertDefaultPaymentMethods(tx, user.id);

        return user;
      });
    } catch (error) {
      // Red de seguridad ante race condition en el check emailExists
      if (isUniqueViolation(error)) {
        throw new ConflictError('El email ya está registrado');
      }
      throw error;
    }
  }

  /**
   * Crear usuario dentro de la transacción
   */
  private async createUser(
    tx: DbTransaction,
    data: { email: string; hashedPassword: string; name?: string | null }
  ): Promise<User> {
    const now = new Date();

    const [row] = await tx
      .insert(users)
      .values({
        email: data.email.toLowerCase(),
        password: data.hashedPassword,
        name: data.name || null,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return User.fromPersistence({
      id: row.id,
      email: row.email,
      name: row.name,
      hashedPassword: row.password,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
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
  private async insertDefaultCategories(tx: DbTransaction, userId: string): Promise<void> {
    const now = new Date();

    await tx.insert(categories).values(
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
  private async insertDefaultPaymentMethods(tx: DbTransaction, userId: string): Promise<void> {
    const now = new Date();

    await tx.insert(paymentMethods).values(
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
