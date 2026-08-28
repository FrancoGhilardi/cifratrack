/**
 * Rampa de colores de categoría.
 *
 * Son referencias a tokens CSS, no hex: así siguen al tema sin duplicar la
 * lista. Funcionan en `fill`/`stroke` de SVG (Recharts) y en `background`.
 */
export const CATEGORY_COLORS = [
  "var(--app-cat-1)",
  "var(--app-cat-2)",
  "var(--app-cat-3)",
  "var(--app-cat-4)",
  "var(--app-cat-5)",
  "var(--app-cat-6)",
  "var(--app-cat-7)",
  "var(--app-cat-8)",
] as const;

/** Color estable para la categoría en la posición `index`. */
export function getCategoryColor(index: number): string {
  return CATEGORY_COLORS[index % CATEGORY_COLORS.length];
}
