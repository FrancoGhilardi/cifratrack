/**
 * Quita acentos y pasa a minusculas - base para busquedas
 * case-insensitive y accent-insensitive.
 */
export function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}
