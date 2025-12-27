import type { entryKind, transactionStatus } from '@/shared/db/schema';
import { TransactionSplit } from './transaction-split.vo';
import { ValidationError } from '@/shared/lib/errors';

type EntryKind = typeof entryKind.enumValues[number];
type TransactionStatus = typeof transactionStatus.enumValues[number];

/**
 * Entidad Transaction (dominio)
 * 
 * Representa una transacción (ingreso o egreso)
 */
export class Transaction {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly kind: EntryKind,
    public readonly title: string,
    public readonly description: string | null,
    public readonly amount: number, // en centavos
    public readonly currency: string,
    public readonly paymentMethodId: string | null,
    public readonly isFixed: boolean,
    public readonly status: TransactionStatus,
    public readonly occurredOn: Date,
    public readonly dueOn: Date | null,
    public readonly paidOn: Date | null,
    public readonly occurredMonth: string, // formato YYYY-MM
    public readonly sourceRecurringRuleId: string | null,
    public readonly split: TransactionSplit | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {
    this.validate();
  }

  /**
   * Validaciones del dominio
   */
  private validate(): void {
    if (this.amount <= 0) {
      throw new ValidationError('El monto debe ser mayor a cero');
    }

    if (this.status === 'pending' && !this.dueOn) {
      throw new ValidationError('Una transacción pendiente debe tener fecha de vencimiento');
    }

    if (this.split && !this.split.matchesAmount(this.amount)) {
      throw new ValidationError('La suma del split debe coincidir con el monto total');
    }

    // Validar formato de occurredMonth
    if (!/^\d{4}-\d{2}$/.test(this.occurredMonth)) {
      throw new ValidationError('El mes debe estar en formato YYYY-MM');
    }
  }

  /**
   * Factory method: Crear nueva transacción
   */
  static create(data: {
    userId: string;
    kind: 'income' | 'expense';
    title: string;
    description?: string | null;
    amount: number;
    currency?: string;
    paymentMethodId?: string | null;
    isFixed?: boolean;
    status?: 'pending' | 'paid';
    occurredOn: Date;
    dueOn?: Date | null;
    paidOn?: Date | null;
    sourceRecurringRuleId?: string | null;
    split?: Array<{ categoryId: string; allocatedAmount: number }> | null;
  }): Transaction {
    const occurredMonth = this.formatMonth(data.occurredOn);
    const splitVO = data.split ? new TransactionSplit(data.split) : null;

    return new Transaction(
      crypto.randomUUID(),
      data.userId,
      data.kind,
      data.title,
      data.description ?? null,
      data.amount,
      data.currency ?? 'ARS',
      data.paymentMethodId ?? null,
      data.isFixed ?? false,
      data.status ?? 'paid',
      data.occurredOn,
      data.dueOn ?? null,
      data.paidOn ?? null,
      occurredMonth,
      data.sourceRecurringRuleId ?? null,
      splitVO,
      new Date(),
      new Date()
    );
  }

  /**
   * Crear desde datos de persistencia
   */
  static fromPersistence(data: {
    id: string;
    userId: string;
    kind: 'income' | 'expense';
    title: string;
    description: string | null;
    amount: number;
    currency: string;
    paymentMethodId: string | null;
    isFixed: boolean;
    status: 'pending' | 'paid';
    occurredOn: Date;
    dueOn: Date | null;
    paidOn: Date | null;
    occurredMonth: string;
    sourceRecurringRuleId: string | null;
    split?: Array<{ categoryId: string; allocatedAmount: number }> | null;
    createdAt: Date;
    updatedAt: Date;
  }): Transaction {
    const splitVO = data.split ? TransactionSplit.fromPersistence(data.split) : null;

    return new Transaction(
      data.id,
      data.userId,
      data.kind,
      data.title,
      data.description,
      data.amount,
      data.currency,
      data.paymentMethodId,
      data.isFixed,
      data.status,
      data.occurredOn,
      data.dueOn,
      data.paidOn,
      data.occurredMonth,
      data.sourceRecurringRuleId,
      splitVO,
      data.createdAt,
      data.updatedAt
    );
  }

  /**
   * Convertir a DTO para API
   */
  toDTO() {
    return {
      id: this.id,
      userId: this.userId,
      kind: this.kind,
      title: this.title,
      description: this.description,
      amount: this.amount,
      currency: this.currency,
      paymentMethodId: this.paymentMethodId,
      isFixed: this.isFixed,
      status: this.status,
      occurredOn: this.occurredOn.toISOString().split('T')[0],
      dueOn: this.dueOn?.toISOString().split('T')[0] ?? null,
      paidOn: this.paidOn?.toISOString().split('T')[0] ?? null,
      occurredMonth: this.occurredMonth,
      sourceRecurringRuleId: this.sourceRecurringRuleId,
      split: this.split?.toPersistence() ?? null,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }

  /**
   * Actualizar con split de categorías
   */
  withSplit(split: Array<{ categoryId: string; allocatedAmount: number }>): Transaction {
    const splitVO = new TransactionSplit(split);

    if (!splitVO.matchesAmount(this.amount)) {
      throw new ValidationError('La suma del split debe coincidir con el monto total');
    }

    return new Transaction(
      this.id,
      this.userId,
      this.kind,
      this.title,
      this.description,
      this.amount,
      this.currency,
      this.paymentMethodId,
      this.isFixed,
      this.status,
      this.occurredOn,
      this.dueOn,
      this.paidOn,
      this.occurredMonth,
      this.sourceRecurringRuleId,
      splitVO,
      this.createdAt,
      this.updatedAt
    );
  }

  /**
   * Marcar como pagada
   */
  markAsPaid(paidOn: Date): Transaction {
    return new Transaction(
      this.id,
      this.userId,
      this.kind,
      this.title,
      this.description,
      this.amount,
      this.currency,
      this.paymentMethodId,
      this.isFixed,
      'paid',
      this.occurredOn,
      this.dueOn,
      paidOn,
      this.occurredMonth,
      this.sourceRecurringRuleId,
      this.split,
      this.createdAt,
      new Date()
    );
  }

  /**
   * Formatear fecha a mes YYYY-MM
   */
  private static formatMonth(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }

  /**
   * Verificar si es ingreso
   */
  isIncome(): boolean {
    return this.kind === 'income';
  }

  /**
   * Verificar si es egreso
   */
  isExpense(): boolean {
    return this.kind === 'expense';
  }

  /**
   * Verificar si está pendiente
   */
  isPending(): boolean {
    return this.status === 'pending';
  }

  /**
   * Verificar si está pagada
   */
  isPaid(): boolean {
    return this.status === 'paid';
  }
}

export type TransactionDTO = ReturnType<Transaction['toDTO']>;
