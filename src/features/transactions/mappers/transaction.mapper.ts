import { Transaction } from '@/entities/transaction/model/transaction.entity';
import type { TransactionWithRelations } from '../repo.impl';

/**
 * Transaction enriquecida con nombres de relaciones para el DTO
 */
export interface TransactionWithNames {
  transaction: Transaction;
  paymentMethodName: string | null;
  categoryNames: Array<{
    categoryId: string;
    categoryName: string;
    allocatedAmount: number;
  }>;
}

/**
 * DTO para transacciones con sus relaciones
 */
export interface TransactionDTO {
  id: string;
  userId: string;
  kind: 'income' | 'expense';
  title: string;
  description: string | null;
  amount: number;
  currency: string;
  paymentMethodId: string | null;
  paymentMethodName: string | null;
  isFixed: boolean;
  status: 'pending' | 'paid';
  occurredOn: string; // ISO date
  dueOn: string | null; // ISO date
  paidOn: string | null; // ISO date
  occurredMonth: string; // YYYY-MM
  sourceRecurringRuleId: string | null;
  categories: Array<{
    categoryId: string;
    categoryName: string;
    allocatedAmount: number;
  }>;
  createdAt: string; // ISO date
  updatedAt: string; // ISO date
}

/**
 * Mapper para transacciones
 * Flujo: DB Row → Domain Entity → DTO
 */
export class TransactionMapper {
  /**
   * Convierte de row de DB (con relaciones) a entidad de dominio enriquecida
   */
  static rowToDomain(data: TransactionWithRelations): TransactionWithNames {
    try {
      // Crear la entidad Transaction del dominio usando fromPersistence
      const transaction = Transaction.fromPersistence({
        id: data.transaction.id,
        userId: data.transaction.userId,
        kind: data.transaction.kind,
        title: data.transaction.title,
        description: data.transaction.description,
        amount: data.transaction.amount,
        currency: data.transaction.currency,
        paymentMethodId: data.transaction.paymentMethodId,
        isFixed: data.transaction.isFixed,
        status: data.transaction.status,
        occurredOn: new Date(data.transaction.occurredOn),
        dueOn: data.transaction.dueOn ? new Date(data.transaction.dueOn) : null,
        paidOn: data.transaction.paidOn ? new Date(data.transaction.paidOn) : null,
        // occurredMonth viene de la DB como char(7) en formato YYYY-MM
        occurredMonth: data.transaction.occurredMonth || '',
        sourceRecurringRuleId: data.transaction.sourceRecurringRuleId,
        split: data.categories.map((c) => ({
          categoryId: c.categoryId,
          allocatedAmount: c.allocatedAmount,
        })),
        createdAt: data.transaction.createdAt instanceof Date 
          ? data.transaction.createdAt 
          : new Date(data.transaction.createdAt),
        updatedAt: data.transaction.updatedAt instanceof Date
          ? data.transaction.updatedAt
          : new Date(data.transaction.updatedAt),
      });

      // Enriquecer con nombres de relaciones
      const result = {
        transaction,
        paymentMethodName: data.paymentMethod?.name ?? null,
        categoryNames: data.categories.map((c) => ({
          categoryId: c.categoryId,
          categoryName: c.categoryName,
          allocatedAmount: c.allocatedAmount,
        })),
      };
      
      return result;
    } catch (error) {
      console.error('Error in rowToDomain:', error);
      throw error;
    }
  }

  /**
   * Convierte de entidad de dominio enriquecida a DTO
   */
  static domainToDTO(data: TransactionWithNames): TransactionDTO {
    const transaction = data.transaction;
    
    try {
      return {
        id: transaction.id,
        userId: transaction.userId,
        kind: transaction.kind,
        title: transaction.title,
        description: transaction.description,
        amount: transaction.amount,
        currency: transaction.currency,
        paymentMethodId: transaction.paymentMethodId,
        paymentMethodName: data.paymentMethodName,
        isFixed: transaction.isFixed,
        status: transaction.status,
        occurredOn: transaction.occurredOn.toISOString(),
        dueOn: transaction.dueOn?.toISOString() ?? null,
        paidOn: transaction.paidOn?.toISOString() ?? null,
        occurredMonth: transaction.occurredMonth,
        sourceRecurringRuleId: transaction.sourceRecurringRuleId,
        categories: data.categoryNames,
        createdAt: transaction.createdAt.toISOString(),
        updatedAt: transaction.updatedAt.toISOString(),
      };
    } catch (error) {
      console.error('Error mapping domain to DTO:', error);
      console.error('Transaction object:', JSON.stringify(transaction, null, 2));
      console.error('Types:', {
        occurredOn: typeof transaction.occurredOn,
        occurredOnIsDate: transaction.occurredOn instanceof Date,
        dueOn: typeof transaction.dueOn,
        dueOnIsDate: transaction.dueOn instanceof Date,
        paidOn: typeof transaction.paidOn,
        paidOnIsDate: transaction.paidOn instanceof Date,
        createdAt: typeof transaction.createdAt,
        createdAtIsDate: transaction.createdAt instanceof Date,
        updatedAt: typeof transaction.updatedAt,
        updatedAtIsDate: transaction.updatedAt instanceof Date,
      });
      throw error;
    }
  }

  /**
   * Convierte de row de DB directamente a DTO (flujo completo)
   */
  static toDTO(data: TransactionWithRelations): TransactionDTO {
    const domain = this.rowToDomain(data);
    return this.domainToDTO(domain);
  }

  /**
   * Convierte múltiples rows a DTOs
   */
  static toDTOs(data: TransactionWithRelations[]): TransactionDTO[] {
    return data.map((item) => this.toDTO(item));
  }

  /**
   * Convierte múltiples entities de dominio a DTOs
   */
  static domainsToDTOs(transactions: TransactionWithNames[]): TransactionDTO[] {
    return transactions.map((transaction) => this.domainToDTO(transaction));
  }
}
