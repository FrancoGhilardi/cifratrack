'use client';

import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { ThemeToggle } from '@/shared/ui/theme-toggle';
import { LogOut } from 'lucide-react';
import { Button } from '@/shared/ui/button';

/**
 * Header de aplicación sin navegación (ahora está en el sidebar)
 */
export function AppHeader() {
  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        {/* Logo */}
        <div>
          <Link href="/dashboard" className="flex items-center space-x-2">
            <span className="text-xl font-bold">CifraTrack</span>
          </Link>
        </div>

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
