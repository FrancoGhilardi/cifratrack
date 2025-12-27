import { eq, and, ne } from 'drizzle-orm';
import { db } from '@/shared/db/client';
import { users } from '@/shared/db/schema';
import { User } from '@/entities/user/model/user.entity';
import type { IUserRepository } from '@/entities/user/repo';
import type { UpdateProfileInput } from '@/entities/user/model/user.schema';
import { NotFoundError } from '@/shared/lib/errors';

/**
 * Implementación del repositorio de usuarios con Drizzle ORM
 */
export class UserRepository implements IUserRepository {
  async findByEmail(email: string): Promise<User | null> {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    if (result.length === 0) return null;

    return User.fromPersistence({
      id: result[0].id,
      email: result[0].email,
      name: result[0].name,
      hashedPassword: result[0].password,
      createdAt: result[0].createdAt,
      updatedAt: result[0].updatedAt,
    });
  }

  async findById(id: string): Promise<User | null> {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (result.length === 0) return null;

    return User.fromPersistence({
      id: result[0].id,
      email: result[0].email,
      name: result[0].name,
      hashedPassword: result[0].password,
      createdAt: result[0].createdAt,
      updatedAt: result[0].updatedAt,
    });
  }

  async create(data: {
    email: string;
    hashedPassword: string;
    name?: string | null;
  }): Promise<User> {
    const now = new Date();
    
    const result = await db
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
      id: result[0].id,
      email: result[0].email,
      name: result[0].name,
      hashedPassword: result[0].password,
      createdAt: result[0].createdAt,
      updatedAt: result[0].updatedAt,
    });
  }

  async updateProfile(userId: string, data: UpdateProfileInput): Promise<User> {
    const updateData: { name?: string | null; email?: string; updatedAt: Date } = {
      updatedAt: new Date(),
    };

    if (data.name !== undefined) {
      updateData.name = data.name;
    }

    if (data.email !== undefined) {
      updateData.email = data.email.toLowerCase();
    }

    const result = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning();

    if (result.length === 0) {
      throw new NotFoundError('Usuario', userId);
    }

    return User.fromPersistence({
      id: result[0].id,
      email: result[0].email,
      name: result[0].name,
      hashedPassword: result[0].password,
      createdAt: result[0].createdAt,
      updatedAt: result[0].updatedAt,
    });
  }

  async updatePassword(userId: string, hashedPassword: string): Promise<User> {
    const result = await db
      .update(users)
      .set({
        password: hashedPassword,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();

    if (result.length === 0) {
      throw new NotFoundError('Usuario', userId);
    }

    return User.fromPersistence({
      id: result[0].id,
      email: result[0].email,
      name: result[0].name,
      hashedPassword: result[0].password,
      createdAt: result[0].createdAt,
      updatedAt: result[0].updatedAt,
    });
  }

  async emailExists(email: string, excludeUserId?: string): Promise<boolean> {
    const baseCondition = eq(users.email, email.toLowerCase());
    const whereClause = excludeUserId ? and(baseCondition, ne(users.id, excludeUserId)) : baseCondition;

    const result = await db
      .select({ id: users.id })
      .from(users)
      .where(whereClause)
      .limit(1);

    return result.length > 0;
  }
}
