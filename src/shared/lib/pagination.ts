import { z } from 'zod';
import { ValidationError } from './errors';

/**
 * Constantes de paginación
 */
export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;

/**
 * Schema de validación para parámetros de paginación
 */
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(PAGINATION_DEFAULTS.PAGE),
  pageSize: z.coerce
    .number()
    .int()
    .min(1)
    .max(PAGINATION_DEFAULTS.MAX_PAGE_SIZE)
    .default(PAGINATION_DEFAULTS.PAGE_SIZE),
});

/**
 * Schema de validación para ordenamiento
 */
export function createSortSchema(allowedFields: readonly string[]) {
  return z.object({
    sortBy: z.enum(allowedFields as [string, ...string[]]).optional(),
    sortDir: z.enum(['asc', 'desc']).default('desc'),
  });
}

/**
 * Clase para manejar parámetros de paginación
 */
export class PaginationParams {
  constructor(
    public readonly page: number,
    public readonly pageSize: number
  ) {
    if (page < 1) {
      throw new ValidationError('El número de página debe ser mayor o igual a 1');
    }
    if (pageSize < 1 || pageSize > PAGINATION_DEFAULTS.MAX_PAGE_SIZE) {
      throw new ValidationError(
        `El tamaño de página debe estar entre 1 y ${PAGINATION_DEFAULTS.MAX_PAGE_SIZE}`
      );
    }
  }

  /**
   * Crear desde query params (con defaults)
   */
  static fromQuery(query: URLSearchParams | Record<string, string | undefined>): PaginationParams {
    const params = query instanceof URLSearchParams ? Object.fromEntries(query) : query;
    const validated = paginationSchema.parse(params);
    return new PaginationParams(validated.page, validated.pageSize);
  }

  /**
   * Obtener offset para queries SQL
   */
  getOffset(): number {
    return (this.page - 1) * this.pageSize;
  }

  /**
   * Obtener limit para queries SQL
   */
  getLimit(): number {
    return this.pageSize;
  }
}

/**
 * Clase para manejar parámetros de ordenamiento
 */
export class SortParams {
  constructor(
    public readonly sortBy: string,
    public readonly sortDir: 'asc' | 'desc',
    private readonly allowedFields: readonly string[]
  ) {
    if (!allowedFields.includes(sortBy)) {
      throw new ValidationError(
        `Campo de ordenamiento inválido: ${sortBy}. Permitidos: ${allowedFields.join(', ')}`
      );
    }
  }

  /**
   * Crear desde query params con validación de whitelist
   */
  static fromQuery(
    query: URLSearchParams | Record<string, string | undefined>,
    allowedFields: readonly string[],
    defaultField: string = allowedFields[0]
  ): SortParams {
    const params = query instanceof URLSearchParams ? Object.fromEntries(query) : query;

    const sortBy = params.sortBy || defaultField;
    const sortDir = (params.sortDir as 'asc' | 'desc') || 'desc';

    return new SortParams(sortBy, sortDir, allowedFields);
  }

  /**
   * Obtener string SQL para ORDER BY (ej: "created_at DESC")
   */
  toSQL(): string {
    return `${this.sortBy} ${this.sortDir.toUpperCase()}`;
  }
}

/**
 * Helper para parsear múltiples IDs desde query string
 * Ejemplo: ?categoryIds=1,2,3 => [1, 2, 3]
 */
export function parseCommaSeparatedIds(value: string | undefined): number[] {
  if (!value) return [];
  return value
    .split(',')
    .map((id) => parseInt(id.trim(), 10))
    .filter((id) => !isNaN(id));
}

/**
 * Helper para parsear valor booleano desde query string
 */
export function parseBoolean(value: string | undefined): boolean | undefined {
  if (value === undefined || value === '') return undefined;
  return value === 'true' || value === '1';
}

/**
 * Helper para sanitizar string de búsqueda
 */
export function sanitizeSearchQuery(query: string | undefined, maxLength: number = 100): string {
  if (!query) return '';
  return query.trim().slice(0, maxLength);
}

/**
 * Helper para validar que un enum value sea válido
 */
export function validateEnumValue<T extends string>(
  value: string | undefined,
  allowedValues: readonly T[],
  defaultValue?: T
): T | undefined {
  if (!value) return defaultValue;
  if (allowedValues.includes(value as T)) {
    return value as T;
  }
  throw new ValidationError(
    `Valor inválido: ${value}. Valores permitidos: ${allowedValues.join(', ')}`
  );
}
