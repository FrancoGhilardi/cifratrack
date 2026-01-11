/**
 * Tipos base para respuestas de API
 * Siguiendo el patrón Result para manejo de errores type-safe
 */

/**
 * Respuesta exitosa de API
 */
export type ApiOk<T> = {
  ok: true;
  data: T;
};

/**
 * Respuesta de error de API
 */
export type ApiErr = {
  ok: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

/**
 * Respuesta de API (éxito o error)
 */
export type ApiResponse<T> = ApiOk<T> | ApiErr;

/**
 * Datos paginados
 */
export type Paginated<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  nextCursor?: string;
  nextCursorId?: string;
};

/**
 * Respuesta paginada de API
 */
export type PaginatedResponse<T> = {
  data: T[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
};

/**
 * Parámetros de paginación
 */
export type PaginationParams = {
  page: number;
  pageSize: number;
};

/**
 * Parámetros de ordenamiento
 */
export type SortParams = {
  sortBy: string;
  sortOrder: "asc" | "desc";
};

/**
 * Parámetros de filtrado base
 */
export type FilterParams = Record<
  string,
  string | number | boolean | undefined
>;

/**
 * Parámetros completos de listado (paginación + orden + filtros)
 */
export type ListParams = PaginationParams & Partial<SortParams> & FilterParams;

/**
 * Type guard para verificar si una respuesta es exitosa
 */
export function isApiOk<T>(response: ApiResponse<T>): response is ApiOk<T> {
  return response.ok === true;
}

/**
 * Type guard para verificar si una respuesta es error
 */
export function isApiErr<T>(response: ApiResponse<T>): response is ApiErr {
  return response.ok === false;
}
