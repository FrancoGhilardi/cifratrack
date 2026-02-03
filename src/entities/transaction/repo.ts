import type { Transaction } from "./model/transaction.entity";
import type { TransactionSummaryDTO } from "./model/transaction-summary.dto";
import type {
  CreateTransactionInput,
  UpdateTransactionInput,
} from "./model/transaction.schema";

/**
 * Parámetros para listar transacciones con paginación
 */
export interface ListTransactionsParams {
  userId: string;
  month?: string;
  kind?: "income" | "expense";
  status?: "pending" | "paid";
  paymentMethodId?: string;
  categoryIds?: string[];
  q?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  pageSize?: number;
  cursor?: string;
  cursorId?: string;
}

/**
 * Transaction con información enriquecida (nombres de relaciones)
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
 * Resultado paginado de transacciones
 */
export interface PaginatedTransactions {
  data: TransactionWithNames[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  nextCursor?: string;
  nextCursorId?: string;
}

/**
 * Contrato del repositorio de transacciones
 */
export interface ITransactionRepository {
  /**
   * Listar transacciones del usuario con filtros, paginación y ordenamiento
   */
  list(params: ListTransactionsParams): Promise<PaginatedTransactions>;

  /**
   * Buscar transacción por ID
   */
  findById(id: string, userId: string): Promise<TransactionWithNames | null>;

  /**
   * Crear nueva transacción
   */
  create(
    userId: string,
    data: CreateTransactionInput
  ): Promise<TransactionWithNames>;

  /**
   * Actualizar transacción
   */
  update(
    id: string,
    userId: string,
    data: UpdateTransactionInput
  ): Promise<TransactionWithNames>;

  /**
   * Eliminar transacción
   */
  delete(id: string, userId: string): Promise<void>;

  /**
   * Obtener transacciones de un mes específico
   */
  getByMonth(userId: string, month: string): Promise<Transaction[]>;

  /**
   * Obtener resumen de egresos por estado (paid/pending) en un mes
   */
  getExpenseStatusSummary(
    userId: string,
    month: string
  ): Promise<TransactionSummaryDTO>;

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
