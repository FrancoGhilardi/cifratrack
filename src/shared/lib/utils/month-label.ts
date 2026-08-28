/**
 * Etiqueta legible de un mes YYYY-MM, ej. "agosto 2026".
 * Devuelve "" si el mes no es válido: la UI decide el fallback.
 */
export function formatMonthLabel(month: string): string {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) return "";

  const [year, monthNum] = month.split("-").map(Number);
  const date = new Date(year, monthNum - 1, 1);
  const monthName = date.toLocaleDateString("es-AR", { month: "long" });

  return `${monthName} ${year}`;
}
