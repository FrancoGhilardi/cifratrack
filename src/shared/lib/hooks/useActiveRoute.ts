import { usePathname } from 'next/navigation';

/**
 * Hook para detectar si una ruta está activa
 * Útil para menús de navegación
 */
export function useActiveRoute() {
  const pathname = usePathname();

  /**
   * Verifica si una ruta específica está activa
   */
  const isActive = (href: string, exact: boolean = true): boolean => {
    if (exact) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  /**
   * Devuelve clases CSS basadas en si la ruta está activa
   */
  const getActiveClasses = (
    href: string,
    activeClasses: string,
    inactiveClasses: string,
    exact: boolean = true
  ): string => {
    return isActive(href, exact) ? activeClasses : inactiveClasses;
  };

  return {
    pathname,
    isActive,
    getActiveClasses,
  };
}
