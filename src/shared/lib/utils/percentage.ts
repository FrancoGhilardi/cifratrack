/**
 * Calcular el porcentaje de una parte sobre un total
 * @param part - La parte
 * @param total - El total
 * @param decimals - Cantidad de decimales (por defecto 1)
 * @returns Porcentaje como string formateado
 */
export function calculatePercentage(
  part: number,
  total: number,
  decimals: number = 1
): string {
  if (total === 0) return '0';
  return ((part / total) * 100).toFixed(decimals);
}

/**
 * Calcular el porcentaje como número
 * @param part - La parte
 * @param total - El total
 * @returns Porcentaje como número (0-100)
 */
export function getPercentageValue(part: number, total: number): number {
  if (total === 0) return 0;
  return (part / total) * 100;
}
