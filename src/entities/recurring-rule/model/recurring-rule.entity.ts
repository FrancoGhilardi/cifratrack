import { DomainError } from '@/shared/lib/errors';
import { Month } from '@/shared/lib/date';

export class RecurringRule {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly title: string,
    public readonly description: string | null,
    public readonly amount: number,
    public readonly kind: 'income' | 'expense',
    public readonly dayOfMonth: number,
    public readonly status: 'pending' | 'paid',
    public readonly paymentMethodId: string | null,
    public readonly activeFromMonth: Month,
    public readonly activeToMonth: Month | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {
    this.validate();
  }

  private validate() {
    if (!this.title.trim()) {
      throw new DomainError('El título es requerido');
    }

    if (this.amount <= 0) {
      throw new DomainError('El monto debe ser mayor a cero');
    }

    if (this.dayOfMonth < 1 || this.dayOfMonth > 31) {
      throw new DomainError('El día del mes debe estar entre 1 y 31');
    }

    if (this.activeToMonth && this.activeToMonth.isBefore(this.activeFromMonth)) {
      throw new DomainError('La fecha de fin debe ser posterior o igual a la de inicio');
    }
  }

  static create(props: {
    id: string;
    userId: string;
    title: string;
    description?: string | null;
    amount: number;
    kind: 'income' | 'expense';
    dayOfMonth: number;
    status: 'pending' | 'paid';
    paymentMethodId?: string | null;
    activeFromMonth: Month;
    activeToMonth?: Month | null;
    createdAt?: Date;
    updatedAt?: Date;
  }): RecurringRule {
    return new RecurringRule(
      props.id,
      props.userId,
      props.title,
      props.description ?? null,
      props.amount,
      props.kind,
      props.dayOfMonth,
      props.status,
      props.paymentMethodId ?? null,
      props.activeFromMonth,
      props.activeToMonth ?? null,
      props.createdAt ?? new Date(),
      props.updatedAt ?? new Date()
    );
  }

  static fromDB(data: {
    id: string;
    userId: string;
    title: string;
    description: string | null;
    amount: number;
    kind: 'income' | 'expense';
    dayOfMonth: number;
    status: 'pending' | 'paid';
    paymentMethodId: string | null;
    activeFromMonth: string; // YYYY-MM
    activeToMonth: string | null; // YYYY-MM
    createdAt: Date;
    updatedAt: Date;
  }): RecurringRule {
    const activeFrom = Month.parse(data.activeFromMonth);
    let activeTo = data.activeToMonth ? Month.parse(data.activeToMonth) : null;

    // Proteger contra datos históricos inconsistentes que podrían quebrar el dominio
    if (activeTo && activeTo.isBefore(activeFrom)) {
      activeTo = activeFrom;
    }

    return new RecurringRule(
      data.id,
      data.userId,
      data.title,
      data.description,
      data.amount,
      data.kind,
      data.dayOfMonth,
      data.status,
      data.paymentMethodId,
      activeFrom,
      activeTo,
      data.createdAt,
      data.updatedAt
    );
  }

  toDTO() {
    return {
      id: this.id,
      userId: this.userId,
      title: this.title,
      description: this.description,
      amount: this.amount,
      kind: this.kind,
      dayOfMonth: this.dayOfMonth,
      status: this.status,
      paymentMethodId: this.paymentMethodId,
      activeFromMonth: this.activeFromMonth.toString(),
      activeToMonth: this.activeToMonth ? this.activeToMonth.toString() : null,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}
