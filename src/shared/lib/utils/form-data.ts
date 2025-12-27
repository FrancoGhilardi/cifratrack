/**
 * Utilidades para conversión y normalización de datos de formularios a API
 */

/**
 * Convierte un objeto Date a ISO string
 * Maneja casos de undefined/null
 */
export function dateToISOString(date: Date | undefined | null): string | undefined {
  return date?.toISOString();
}

/**
 * Convierte una fecha ISO string a formato de input date (YYYY-MM-DD)
 */
export function isoStringToDateInput(isoString: string | undefined | null): string | undefined {
  if (!isoString) return undefined;
  return new Date(isoString).toISOString().split('T')[0];
}

/**
 * Obtiene la fecha actual en formato de input date (YYYY-MM-DD)
 */
export function getCurrentDateInput(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Normaliza un valor que puede ser null convirtiéndolo a undefined
 * Útil para compatibilidad con APIs que no aceptan null
 */
export function nullToUndefined<T>(value: T | null | undefined): T | undefined {
  return value ?? undefined;
}

/**
 * Normaliza un objeto completo, convirtiendo todos los valores null a undefined
 * Útil para preparar datos de formularios antes de enviarlos a la API
 */
export function normalizeNullValues<T extends Record<string, unknown>>(obj: T): T {
  const result = {} as T;
  
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];
      result[key] = (value === null ? undefined : value) as T[typeof key];
    }
  }
  
  return result;
}

/**
 * Convierte un objeto con campos Date a un objeto con strings ISO
 * Útil para preparar datos antes de enviarlos a APIs REST
 */
export function convertDatesToISO<T extends Record<string, unknown>>(
  obj: T
): Record<string, unknown> {
  const result = {} as Record<string, unknown>;
  
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key] as unknown;
      if (value instanceof Date) {
        result[key] = value.toISOString();
      } else {
        result[key] = value;
      }
    }
  }
  
  return result;
}

/**
 * Prepara datos de formulario para envío a API:
 * - Convierte Date a ISO string
 * - Convierte null a undefined
 * - Elimina campos undefined si se especifica
 */
export function prepareFormDataForAPI<T extends Record<string, unknown>>(
  data: T,
  options: { removeUndefined?: boolean } = {}
): T {
  let result = { ...data };
  
  // Convertir Dates a ISO strings
  for (const key in result) {
    const value = result[key] as unknown;
    if (value instanceof Date) {
      result[key] = value.toISOString() as T[typeof key];
    } else if (value === null) {
      result[key] = undefined as T[typeof key];
    }
  }
  
  // Remover undefined si se solicita
  if (options.removeUndefined) {
    result = Object.fromEntries(
      Object.entries(result).filter(([, value]) => value !== undefined)
    ) as T;
  }
  
  return result;
}
