import { eq, and } from "drizzle-orm";
import { db } from "@/shared/db/client";
import { paymentMethods, transactions } from "@/shared/db/schema";
import type { IPaymentMethodRepository } from "@/entities/payment-method/repo";
import { PaymentMethod } from "@/entities/payment-method/model/payment-method.entity";
import type {
  CreatePaymentMethodInput,
  UpdatePaymentMethodInput,
} from "@/entities/payment-method/model/payment-method.schema";

/**
 * Implementación del repositorio de Payment Methods con Drizzle ORM
 */
export class PaymentMethodRepository implements IPaymentMethodRepository {
  async list(
    userId: string,
    options?: { isActive?: boolean }
  ): Promise<PaymentMethod[]> {
    const conditions = [eq(paymentMethods.userId, userId)];

    if (options?.isActive !== undefined) {
      conditions.push(eq(paymentMethods.isActive, options.isActive));
    }

    const rows = await db
      .select()
      .from(paymentMethods)
      .where(and(...conditions))
      .orderBy(paymentMethods.name);

    return rows.map((row) => PaymentMethod.fromPersistence(row));
  }

  async findById(id: string, userId: string): Promise<PaymentMethod | null> {
    const rows = await db
      .select()
      .from(paymentMethods)
      .where(and(eq(paymentMethods.id, id), eq(paymentMethods.userId, userId)))
      .limit(1);

    if (rows.length === 0) return null;

    return PaymentMethod.fromPersistence(rows[0]);
  }

  async findByName(
    name: string,
    userId: string
  ): Promise<PaymentMethod | null> {
    const rows = await db
      .select()
      .from(paymentMethods)
      .where(
        and(eq(paymentMethods.name, name), eq(paymentMethods.userId, userId))
      )
      .limit(1);

    if (rows.length === 0) return null;

    return PaymentMethod.fromPersistence(rows[0]);
  }

  async create(
    userId: string,
    data: CreatePaymentMethodInput
  ): Promise<PaymentMethod> {
    const [row] = await db
      .insert(paymentMethods)
      .values({
        userId,
        name: data.name,
        isActive: data.isActive ?? true,
        isDefault: false, // Los métodos de pago creados por usuarios no son default
      })
      .returning();

    return PaymentMethod.fromPersistence(row);
  }

  async update(
    id: string,
    userId: string,
    data: UpdatePaymentMethodInput
  ): Promise<PaymentMethod> {
    const [row] = await db
      .update(paymentMethods)
      .set({
        name: data.name,
        isActive: data.isActive,
        updatedAt: new Date(),
      })
      .where(and(eq(paymentMethods.id, id), eq(paymentMethods.userId, userId)))
      .returning();

    if (!row) {
      throw new Error("Payment method not found");
    }

    return PaymentMethod.fromPersistence(row);
  }

  async delete(id: string, userId: string): Promise<void> {
    const result = await db
      .delete(paymentMethods)
      .where(and(eq(paymentMethods.id, id), eq(paymentMethods.userId, userId)))
      .returning();

    if (result.length === 0) {
      throw new Error("Payment method not found");
    }
  }

  async hasTransactions(id: string, userId: string): Promise<boolean> {
    const rows = await db
      .select({ id: transactions.id })
      .from(transactions)
      .where(
        and(
          eq(transactions.paymentMethodId, id),
          eq(transactions.userId, userId)
        )
      )
      .limit(1);

    return rows.length > 0;
  }
}
