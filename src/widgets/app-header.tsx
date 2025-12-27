'use client';

import Link from 'next/link';
import { cn } from '@/shared/lib/utils';
import { useActiveRoute } from '@/shared/lib/hooks/useActiveRoute';
import { ThemeToggle } from '@/shared/ui/theme-toggle';
import { LayoutDashboard, Tags, CreditCard, LogOut, ArrowLeftRight, TrendingUp } from 'lucide-react';
import { Button } from '@/shared/ui/button';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Movimientos', href: '/transactions', icon: ArrowLeftRight },
  { name: 'Inversiones', href: '/investments', icon: TrendingUp },
  { name: 'Categorías', href: '/categories', icon: Tags },
  { name: 'Formas de pago', href: '/payment-methods', icon: CreditCard },
];

/**
 * Header de navegación principal (temporal hasta Fase 9)
 */
export function AppHeader() {
  const { isActive } = useActiveRoute();

  const handleLogout = async () => {
    // TODO: Implementar logout cuando esté la autenticación completa
    window.location.href = '/login';
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto flex h-14 max-w-7xl items-center px-4">
        {/* Logo */}
        <div className="mr-8">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <span className="text-xl font-bold">CifraTrack</span>
          </Link>
        </div>

        {/* Navegación */}
        <nav className="flex flex-1 items-center space-x-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center space-x-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  active
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Acciones */}
        <div className="flex items-center space-x-2">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-muted-foreground"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Salir
          </Button>
        </div>
      </div>
    </header>
  );
}
