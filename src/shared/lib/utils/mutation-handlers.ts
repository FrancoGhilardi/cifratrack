/**
 * Utilidades para manejo consistente de errores en mutaciones
 */

/**
 * Extrae un mensaje de error legible de diferentes tipos de errores
 */
export function getErrorMessage(error: unknown, defaultMessage = 'Ha ocurrido un error'): string {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }
  
  return defaultMessage;
}

/**
 * Logger consistente para errores de mutaciones
 * En producción, esto se podría integrar con un servicio de error tracking
 */
export function logMutationError(
  operation: 'create' | 'update' | 'delete',
  entity: string,
  error: unknown
): void {
  const message = getErrorMessage(error);
  console.error(`Error en ${operation} de ${entity}:`, message, error);
  
  // En producción, aquí se podría enviar a Sentry, LogRocket, etc.
  // if (process.env.NODE_ENV === 'production') {
  //   errorTracker.captureException(error, {
  //     tags: { operation, entity },
  //   });
  // }
}

/**
 * Handler genérico para errores de mutaciones con alertas
 */
export function handleMutationError(
  operation: 'create' | 'update' | 'delete',
  entity: string,
  error: unknown,
  options: {
    silent?: boolean;
    customMessage?: string;
  } = {}
): void {
  logMutationError(operation, entity, error);
  
  if (!options.silent) {
    const message = options.customMessage || getErrorMessage(error, `No se pudo ${operation} ${entity}`);
    alert(message);
  }
}

/**
 * Mensajes de éxito consistentes para operaciones CRUD
 */
export const successMessages = {
  create: (entity: string) => `${entity} creado correctamente`,
  update: (entity: string) => `${entity} actualizado correctamente`,
  delete: (entity: string) => `${entity} eliminado correctamente`,
} as const;

/**
 * Logger para éxitos de mutaciones
 */
export function logMutationSuccess(
  operation: 'create' | 'update' | 'delete',
  entity: string
): void {
  const message = successMessages[operation](entity);
  console.log(message);
  
  // En el futuro, aquí se podría mostrar un toast notification
  // toast.success(message);
}
