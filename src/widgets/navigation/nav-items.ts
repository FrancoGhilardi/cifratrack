'use client';

import {
  LayoutDashboard,
  ArrowLeftRight,
  Tags,
  CreditCard,
  TrendingUp,
  Repeat,
  User,
  type LucideIcon,
} from 'lucide-react';

export type NavItem = {
  name: string;
  href: string;
  icon: LucideIcon;
};

/**
 * Fuente única de links de navegación para header/sidebar.
 */
export const appNavigation: NavItem[] = [
  { name: 'Panel Principal', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Movimientos', href: '/transactions', icon: ArrowLeftRight },
  { name: 'Categorías', href: '/categories', icon: Tags },
  { name: 'Formas de Pago', href: '/payment-methods', icon: CreditCard },
  { name: 'Inversiones', href: '/investments', icon: TrendingUp },
  { name: 'Recurrentes', href: '/recurring', icon: Repeat },
  { name: 'Perfil', href: '/profile', icon: User },
];
