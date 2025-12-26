import { NextResponse } from 'next/server';
import type { ApiOk, ApiErr, Paginated } from './types';
import { normalizeError, isAppError } from './errors';

/**
 * Helper para crear respuesta exitosa
 */
export function ok<T>(data: T, status: number = 200): NextResponse<ApiOk<T>> {
  return NextResponse.json({ ok: true, data }, { status });
}

/**
 * Helper para crear respuesta de error
 */
export function err(error: unknown, defaultStatus: number = 500): NextResponse<ApiErr> {
  const normalized = normalizeError(error);
  const status = isAppError(error) ? error.statusCode : defaultStatus;

  return NextResponse.json(
    {
      ok: false,
      error: normalized,
    },
    { status }
  );
}

/**
 * Helper para crear respuesta paginada
 */
export function paginated<T>(
  items: T[],
  page: number,
  pageSize: number,
  total: number
): Paginated<T> {
  return {
    items,
    page,
    pageSize,
    total,
    totalPages: Math.ceil(total / pageSize),
  };
}

/**
 * Helper para crear respuesta paginada directamente como NextResponse
 */
export function okPaginated<T>(
  items: T[],
  page: number,
  pageSize: number,
  total: number
): NextResponse<ApiOk<Paginated<T>>> {
  return ok(paginated(items, page, pageSize, total));
}
