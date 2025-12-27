/**
 * Normaliza mensajes de error para mostrarlos de forma amigable al usuario
 */
export function getFriendlyErrorMessage(error: Error | null): string {
  if (!error) return '';

  const message = error.message;

  // Errores comunes de autenticación
  if (message.includes('No autenticado') || message.includes('401')) {
    return 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
  }

  // Errores de red
  if (message.includes('Failed to fetch') || message.includes('Network')) {
    return 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
  }

  // Errores de datos indefinidos (query no retornó datos)
  if (message.includes('data is undefined') || message.includes('undefined')) {
    return 'No se pudieron cargar los datos. Intenta recargar la página.';
  }

  // Mensaje genérico pero amigable
  return 'Ocurrió un error inesperado. Intenta nuevamente.';
}

/**
 * Tipos de error para categorización
 */
export enum ErrorType {
  DUPLICATE = 'duplicate',
  VALIDATION = 'validation',
  NOT_FOUND = 'not_found',
  NETWORK = 'network',
  UNAUTHORIZED = 'unauthorized',
  UNKNOWN = 'unknown',
}

/**
 * Detecta el tipo de error basándose en el mensaje
 */
export function detectErrorType(error: Error | string): ErrorType {
  const message = typeof error === 'string' ? error : error.message;

  if (message.includes('Ya existe')) {
    return ErrorType.DUPLICATE;
  }

  if (message.includes('No autenticado') || message.includes('401')) {
    return ErrorType.UNAUTHORIZED;
  }

  if (message.includes('No encontrad') || message.includes('404')) {
    return ErrorType.NOT_FOUND;
  }

  if (message.includes('Failed to fetch') || message.includes('Network')) {
    return ErrorType.NETWORK;
  }

  if (
    message.includes('inválido') ||
    message.includes('requerido') ||
    message.includes('debe')
  ) {
    return ErrorType.VALIDATION;
  }

  return ErrorType.UNKNOWN;
}

/**
 * Formatea el mensaje de error con el icono/prefijo apropiado
 */
export function formatErrorMessage(error: Error | string): string {
  const type = detectErrorType(error);
  const message = typeof error === 'string' ? error : error.message;

  switch (type) {
    case ErrorType.DUPLICATE:
      return `⚠️ ${message}`;
    case ErrorType.VALIDATION:
      return `⚠️ ${message}`;
    case ErrorType.NOT_FOUND:
      return `❌ ${message}`;
    case ErrorType.NETWORK:
      return `🔌 ${message}`;
    case ErrorType.UNAUTHORIZED:
      return `🔒 ${message}`;
    default:
      return `❌ Error: ${message}`;
  }
}
