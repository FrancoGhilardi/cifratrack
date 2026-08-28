"use client";

import {
  LayoutDashboard,
  ArrowLeftRight,
  Tags,
  CreditCard,
  TrendingUp,
  Repeat,
  User,
  type LucideIcon,
} from "lucide-react";

/** Agrupación del menú por frecuencia de uso, no por tipo de dato. */
export type NavGroupId = "diario" | "definiciones" | "patrimonio" | "cuenta";

export type NavItem = {
  name: string;
  href: string;
  icon: LucideIcon;
  group: NavGroupId;
};

/**
 * Grupos del menú, en orden de aparición.
 */
export const navigationGroups: Array<{ id: NavGroupId; label: string }> = [
  { id: "diario", label: "Diario" },
  { id: "definiciones", label: "Definiciones" },
  { id: "patrimonio", label: "Patrimonio" },
  { id: "cuenta", label: "Cuenta" },
];

/**
 * Fuente única de links de navegación para header/sidebar.
 */
export const appNavigation: NavItem[] = [
  {
    name: "Panel Principal",
    href: "/dashboard",
    icon: LayoutDashboard,
    group: "diario",
  },
  {
    name: "Movimientos",
    href: "/transactions",
    icon: ArrowLeftRight,
    group: "diario",
  },
  { name: "Recurrentes", href: "/recurring", icon: Repeat, group: "diario" },
  {
    name: "Categorías",
    href: "/categories",
    icon: Tags,
    group: "definiciones",
  },
  {
    name: "Formas de Pago",
    href: "/payment-methods",
    icon: CreditCard,
    group: "definiciones",
  },
  {
    name: "Inversiones",
    href: "/investments",
    icon: TrendingUp,
    group: "patrimonio",
  },
  { name: "Perfil", href: "/profile", icon: User, group: "cuenta" },
];

/**
 * Devuelve los ítems de un grupo, preservando el orden de `appNavigation`.
 */
export function getNavItemsByGroup(group: NavGroupId): NavItem[] {
  return appNavigation.filter((item) => item.group === group);
}

/**
 * Devuelve el ítem de navegación que corresponde a un pathname.
 * Usa coincidencia por prefijo para cubrir rutas anidadas.
 */
export function getNavItemByPath(pathname: string): NavItem | undefined {
  return appNavigation.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  );
}
