import { ValidationError } from './errors';

/**
 * Value Object para representar dinero en la aplicación
 * Almacena en centavos (integer) para evitar problemas de precisión con decimales
 *
 * Principios:
 * - Inmutable
 * - Validación en constructor
 * - Operaciones type-safe
 */
export class Money {
  private readonly cents: number;

  private constructor(cents: number) {
    if (!Number.isInteger(cents)) {
      throw new ValidationError('El monto en centavos debe ser un entero');
    }
    if (cents < 0) {
      throw new ValidationError('El monto no puede ser negativo');
    }
    this.cents = cents;
  }

  /**
   * Crear Money desde centavos
   */
  static fromCents(cents: number): Money {
    return new Money(cents);
  }

  /**
   * Crear Money desde pesos (con decimales)
   */
  static fromPesos(pesos: number): Money {
    const cents = Math.round(pesos * 100);
    return new Money(cents);
  }

  /**
   * Crear Money con valor cero
   */
  static zero(): Money {
    return new Money(0);
  }

  /**
   * Obtener valor en centavos
   */
  toCents(): number {
    return this.cents;
  }

  /**
   * Obtener valor en pesos (con decimales)
   */
  toPesos(): number {
    return this.cents / 100;
  }

  /**
   * Formatear como string para mostrar (ej: "$1,234.56")
   */
  format(locale: string = 'es-AR', currency: string = 'ARS'): string {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
    }).format(this.toPesos());
  }

  /**
   * Sumar dos Money
   */
  add(other: Money): Money {
    return new Money(this.cents + other.cents);
  }

  /**
   * Restar dos Money
   */
  subtract(other: Money): Money {
    const result = this.cents - other.cents;
    if (result < 0) {
      throw new ValidationError('La resta resulta en un monto negativo');
    }
    return new Money(result);
  }

  /**
   * Multiplicar por un factor
   */
  multiply(factor: number): Money {
    return Money.fromPesos(this.toPesos() * factor);
  }

  /**
   * Dividir por un divisor
   */
  divide(divisor: number): Money {
    if (divisor === 0) {
      throw new ValidationError('No se puede dividir por cero');
    }
    return Money.fromPesos(this.toPesos() / divisor);
  }

  /**
   * Comparar si es mayor que otro Money
   */
  isGreaterThan(other: Money): boolean {
    return this.cents > other.cents;
  }

  /**
   * Comparar si es menor que otro Money
   */
  isLessThan(other: Money): boolean {
    return this.cents < other.cents;
  }

  /**
   * Comparar si es igual a otro Money
   */
  equals(other: Money): boolean {
    return this.cents === other.cents;
  }

  /**
   * Verificar si es cero
   */
  isZero(): boolean {
    return this.cents === 0;
  }

  /**
   * Representación en string para debugging
   */
  toString(): string {
    return this.format();
  }
}

/**
 * Función auxiliar para formatear montos en pesos argentinos
 * @param amountInCents - Monto en centavos (ej: 100000 = $1.000,00)
 * @param currency - Código de moneda (default: ARS)
 * @param locale - Locale para el formato (default: es-AR)
 */
export function formatCurrency(
  amountInCents: number,
  currency = 'ARS',
  locale = 'es-AR'
): string {
  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return formatter.format(amountInCents / 100);
}
