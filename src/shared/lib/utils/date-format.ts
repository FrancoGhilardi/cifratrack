/**
 * Utilidades para trabajar con fechas en la aplicación
 */

/**
 * Formatea una fecha civil (YYYY-MM-DD, sin componente horario) al formato
 * argentino (DD/MM/YYYY). Fuerza timeZone 'UTC' porque estas fechas se
 * interpretan siempre como el día calendario tal cual, sin corrimientos por
 * el huso horario del navegador.
 */
export function formatDateToLocal(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  });
}

/**
 * Formatea una fecha con hora al formato argentino
 */
export function formatDateTimeToLocal(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Formatea una fecha en formato largo (ej: "27 de diciembre de 2025")
 */
export function formatDateLong(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj.toLocaleDateString("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Formatea una fecha en formato corto con nombre de mes (ej: "27 dic 2025")
 */
export function formatDateShort(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj.toLocaleDateString("es-AR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * Obtiene el nombre del mes en español
 */
export function getMonthName(monthIndex: number): string {
  const months = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];
  return months[monthIndex];
}
