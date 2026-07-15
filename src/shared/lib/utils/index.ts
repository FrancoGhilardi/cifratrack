import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export { calculatePercentage, getPercentageValue } from "./percentage";

/**
 * Utility para combinar clases de Tailwind CSS
 * Resuelve conflictos y elimina duplicados
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
