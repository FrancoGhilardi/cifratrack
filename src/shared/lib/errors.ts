/**
 * Sistema de errores personalizado para CifraTrack
 * Separación clara entre errores de dominio, validación y API
 */

/**
 * Error base de la aplicación
 */
export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 500,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error de dominio - violación de reglas de negocio
 * Ejemplo: "El split de categorías no suma el total del movimiento"
 */
export class DomainError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 'DOMAIN_ERROR', 400, details);
  }
}

/**
 * Error de validación - datos inválidos
 * Ejemplo: "El monto debe ser mayor a 0"
 */
export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 'VALIDATION_ERROR', 400, details);
  }
}

/**
 * Error de autenticación - usuario no autenticado
 */
export class AuthenticationError extends AppError {
  constructor(message: string = 'No autenticado') {
    super(message, 'AUTHENTICATION_ERROR', 401);
  }
}

/**
 * Error de autorización - usuario sin permisos
 */
export class AuthorizationError extends AppError {
  constructor(message: string = 'No autorizado') {
    super(message, 'AUTHORIZATION_ERROR', 403);
  }
}

/**
 * Error de recurso no encontrado
 */
export class NotFoundError extends AppError {
  constructor(resource: string, id?: string | number) {
    const message = id ? `${resource} con id ${id} no encontrado` : `${resource} no encontrado`;
    super(message, 'NOT_FOUND', 404);
  }
}

/**
 * Error de conflicto - recurso ya existe
 */
export class ConflictError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 'CONFLICT', 409, details);
  }
}

/**
 * Helper para verificar si un error es de tipo AppError
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * Helper para convertir un error desconocido en formato estándar
 */
export function normalizeError(error: unknown): { code: string; message: string; details?: unknown } {
  if (isAppError(error)) {
    return {
      code: error.code,
      message: error.message,
      details: error.details,
    };
  }

  if (error instanceof Error) {
    return {
      code: 'INTERNAL_ERROR',
      message: error.message,
    };
  }

  return {
    code: 'UNKNOWN_ERROR',
    message: 'Ha ocurrido un error inesperado',
  };
}
