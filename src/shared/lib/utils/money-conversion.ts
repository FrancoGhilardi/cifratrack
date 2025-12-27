/**
 * Utilidades para conversión de montos entre pesos y centavos
 */

/**
 * Convierte pesos a centavos (entero)
 * @param pesos - Monto en pesos (puede tener decimales)
 * @returns Monto en centavos (entero)
 * @example pesosTocents(10.50) // 1050
 */
export function pesosTocents(pesos: number): number {
  return Math.round(pesos * 100);
}

/**
 * Convierte centavos a pesos (decimal)
 * @param cents - Monto en centavos (entero)
 * @returns Monto en pesos (decimal)
 * @example centsToPesos(1050) // 10.50
 */
export function centsToPesos(cents: number): number {
  return cents / 100;
}

/**
 * Formatea centavos como string con 2 decimales
 * @param cents - Monto en centavos
 * @returns String formateado (ej: "10.50")
 */
export function centsToString(cents: number): string {
  return (cents / 100).toFixed(2);
}

/**
 * Parsea un string de input a centavos
 * @param input - String del input (ej: "10.50" o "10,50")
 * @returns Monto en centavos o NaN si es inválido
 */
export function parseInputToCents(input: string): number {
  const normalized = input.replace(',', '.');
  const pesos = parseFloat(normalized);
  return isNaN(pesos) ? NaN : pesosTocents(pesos);
}

/**
 * Valida que un array de splits sume exactamente el total
 * @param splits - Array de splits con allocatedAmount en centavos
 * @param totalAmount - Monto total en centavos
 * @returns true si la suma coincide
 */
export function validateSplitsSum(
  splits: Array<{ allocatedAmount: number }>,
  totalAmount: number
): boolean {
  const sum = splits.reduce((acc, split) => acc + split.allocatedAmount, 0);
  return sum === totalAmount;
}

/**
 * Calcula el monto restante no asignado
 * @param splits - Array de splits con allocatedAmount en centavos
 * @param totalAmount - Monto total en centavos
 * @returns Monto restante en centavos
 */
export function calculateRemainingAmount(
  splits: Array<{ allocatedAmount: number }>,
  totalAmount: number
): number {
  const allocated = splits.reduce((acc, split) => acc + split.allocatedAmount, 0);
  return totalAmount - allocated;
}
