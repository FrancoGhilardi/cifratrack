import type { Transaction } from './model/transaction.entity';
import type { CreateTransactionInput, UpdateTransactionInput } from './model/transaction.schema';

/**
 * Contrato del repositorio de transacciones
 */
export interface ITransactionRepository {
  /**
   * Listar transacciones del usuario con filtros
   */
  list(
    userId: string,
    filters?: {
      kind?: 'income' | 'expense';
      status?: 'pending' | 'paid';
      month?: string;
      paymentMethodId?: string;
      categoryId?: string;
    }
  ): Promise<Transaction[]>;

  /**
   * Buscar transacción por ID
   */
  findById(id: string, userId: string): Promise<Transaction | null>;

  /**
   * Crear nueva transacción
   */
  create(userId: string, data: CreateTransactionInput): Promise<Transaction>;

  /**
   * Actualizar transacción
   */
  update(id: string, userId: string, data: UpdateTransactionInput): Promise<Transaction>;

  /**
   * Eliminar transacción
   */
  delete(id: string, userId: string): Promise<void>;

  /**
   * Obtener transacciones de un mes específico
   */
  getByMonth(userId: string, month: string): Promise<Transaction[]>;

  /**
   * Obtener resumen mensual
   */
  getMonthlySummary(
    userId: string,
    month: string
  ): Promise<{
    totalIncome: number;
    totalExpenses: number;
    balance: number;
    transactionsCount: number;
  }>;
}
