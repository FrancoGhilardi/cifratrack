/**
 * Utilidad para mapear nombres de columnas entre frontend (camelCase) y backend (snake_case)
 * Esta función es reutilizable para todas las tablas de la aplicación
 */

/**
 * Mapeo de columnas comunes entre camelCase y snake_case
 */
const COMMON_COLUMN_MAPPINGS: Record<string, string> = {
  // Fechas
  occurredOn: 'occurred_on',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  dueOn: 'due_on',
  paidOn: 'paid_on',
  
  // IDs
  paymentMethodId: 'payment_method_id',
  categoryId: 'category_id',
  userId: 'user_id',
  
  // Otros campos comunes
  isActive: 'is_active',
  isFixed: 'is_fixed',
  
  // Campos que no cambian
  id: 'id',
  title: 'title',
  name: 'name',
  amount: 'amount',
  status: 'status',
  kind: 'kind',
  description: 'description',
};

/**
 * Convierte un nombre de columna de camelCase a snake_case
 * Usa un mapeo predefinido o hace la conversión automática
 * 
 * @param columnName - Nombre de la columna en camelCase
 * @param customMappings - Mapeos adicionales específicos de la tabla
 * @returns Nombre de la columna en snake_case
 * 
 * @example
 * columnToSnakeCase('occurredOn') // 'occurred_on'
 * columnToSnakeCase('paymentMethodId') // 'payment_method_id'
 */
export function columnToSnakeCase(
  columnName: string,
  customMappings?: Record<string, string>
): string {
  // Primero buscar en mapeos personalizados
  if (customMappings && columnName in customMappings) {
    return customMappings[columnName];
  }
  
  // Luego buscar en mapeos comunes
  if (columnName in COMMON_COLUMN_MAPPINGS) {
    return COMMON_COLUMN_MAPPINGS[columnName];
  }
  
  // Si no está en los mapeos, convertir automáticamente
  return columnName.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

/**
 * Convierte un nombre de columna de snake_case a camelCase
 * 
 * @param columnName - Nombre de la columna en snake_case
 * @returns Nombre de la columna en camelCase
 * 
 * @example
 * columnToCamelCase('occurred_on') // 'occurredOn'
 * columnToCamelCase('payment_method_id') // 'paymentMethodId'
 */
export function columnToCamelCase(columnName: string): string {
  return columnName.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Valida que un sortBy sea una columna permitida
 * 
 * @param sortBy - Nombre de la columna (puede ser camelCase o snake_case)
 * @param allowedColumns - Array de columnas permitidas en snake_case
 * @param customMappings - Mapeos adicionales específicos
 * @returns true si la columna es válida
 */
export function isValidSortColumn(
  sortBy: string,
  allowedColumns: string[],
  customMappings?: Record<string, string>
): boolean {
  const snakeCase = columnToSnakeCase(sortBy, customMappings);
  return allowedColumns.includes(snakeCase);
}
