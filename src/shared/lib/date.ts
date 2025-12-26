import { ValidationError } from './errors';

/**
 * Value Object para representar un mes (YYYY-MM)
 */
export class Month {
  private readonly value: string;

  private constructor(year: number, month: number) {
    if (month < 1 || month > 12) {
      throw new ValidationError('El mes debe estar entre 1 y 12');
    }
    if (year < 1900 || year > 2100) {
      throw new ValidationError('El año debe estar entre 1900 y 2100');
    }
    this.value = `${year}-${month.toString().padStart(2, '0')}`;
  }

  /**
   * Crear Month desde string YYYY-MM
   */
  static fromString(str: string): Month {
    const match = str.match(/^(\d{4})-(\d{2})$/);
    if (!match) {
      throw new ValidationError('Formato de mes inválido. Usar YYYY-MM');
    }
    const [, yearStr, monthStr] = match;
    return new Month(parseInt(yearStr, 10), parseInt(monthStr, 10));
  }

  /**
   * Crear Month desde Date
   */
  static fromDate(date: Date): Month {
    return new Month(date.getFullYear(), date.getMonth() + 1);
  }

  /**
   * Obtener mes actual
   */
  static current(): Month {
    return Month.fromDate(new Date());
  }

  /**
   * Obtener valor como string YYYY-MM
   */
  toString(): string {
    return this.value;
  }

  /**
   * Obtener año
   */
  getYear(): number {
    return parseInt(this.value.split('-')[0], 10);
  }

  /**
   * Obtener mes (1-12)
   */
  getMonth(): number {
    return parseInt(this.value.split('-')[1], 10);
  }

  /**
   * Obtener mes anterior
   */
  previous(): Month {
    const month = this.getMonth();
    const year = this.getYear();
    if (month === 1) {
      return new Month(year - 1, 12);
    }
    return new Month(year, month - 1);
  }

  /**
   * Obtener mes siguiente
   */
  next(): Month {
    const month = this.getMonth();
    const year = this.getYear();
    if (month === 12) {
      return new Month(year + 1, 1);
    }
    return new Month(year, month + 1);
  }

  /**
   * Verificar si es igual a otro Month
   */
  equals(other: Month): boolean {
    return this.value === other.value;
  }

  /**
   * Verificar si es antes que otro Month
   */
  isBefore(other: Month): boolean {
    return this.value < other.value;
  }

  /**
   * Verificar si es después que otro Month
   */
  isAfter(other: Month): boolean {
    return this.value > other.value;
  }
}

/**
 * Value Object para representar un rango de fechas
 */
export class DateRange {
  constructor(
    public readonly from: Date,
    public readonly to: Date
  ) {
    if (from > to) {
      throw new ValidationError('La fecha inicial debe ser anterior o igual a la fecha final');
    }
  }

  /**
   * Crear rango desde strings ISO
   */
  static fromStrings(from: string, to: string): DateRange {
    return new DateRange(new Date(from), new Date(to));
  }

  /**
   * Crear rango para un mes específico
   */
  static forMonth(month: Month): DateRange {
    const year = month.getYear();
    const monthNum = month.getMonth();
    const from = new Date(year, monthNum - 1, 1);
    const to = new Date(year, monthNum, 0, 23, 59, 59, 999);
    return new DateRange(from, to);
  }

  /**
   * Verificar si una fecha está dentro del rango
   */
  contains(date: Date): boolean {
    return date >= this.from && date <= this.to;
  }

  /**
   * Obtener cantidad de días en el rango
   */
  getDays(): number {
    const diff = this.to.getTime() - this.from.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
  }
}

/**
 * Formatear fecha a string ISO (YYYY-MM-DD)
 */
export function formatDateToISO(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Parsear string ISO a Date
 */
export function parseISODate(str: string): Date {
  const date = new Date(str);
  if (isNaN(date.getTime())) {
    throw new ValidationError('Fecha inválida');
  }
  return date;
}

/**
 * Obtener primer día del mes
 */
export function getFirstDayOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

/**
 * Obtener último día del mes
 */
export function getLastDayOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

/**
 * Verificar si una fecha es hoy
 */
export function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

/**
 * Verificar si una fecha es del mes actual
 */
export function isCurrentMonth(date: Date): boolean {
  const today = new Date();
  return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
}
