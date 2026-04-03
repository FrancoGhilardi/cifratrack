"use client";

import { LogOut, Menu, User } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { ThemeToggle } from "@/shared/ui/theme-toggle";
import { cn } from "@/shared/lib/utils";

interface HeaderProps {
  userName?: string;
  userEmail?: string;
  onLogout?: () => void;
  className?: string;
  showNavigationTrigger?: boolean;
  onOpenNavigation?: () => void;
}

export function Header({
  userName,
  userEmail,
  onLogout,
  className,
  showNavigationTrigger = false,
  onOpenNavigation,
}: HeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-30 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80",
        className,
      )}
    >
      <div className="flex min-h-16 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          {showNavigationTrigger && onOpenNavigation && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="shrink-0 lg:hidden"
              onClick={onOpenNavigation}
              aria-label="Abrir menú"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}

          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-semibold text-accent-foreground">
            <User className="h-4 w-4" />
          </div>

          <div className="min-w-0 leading-tight">
            <span className="block truncate text-sm font-medium text-foreground">
              {userName ? userName : "Usuario"}
            </span>
            {userEmail && (
              <span className="hidden truncate text-xs text-muted-foreground sm:block">
                {userEmail}
              </span>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="sm"
            onClick={onLogout}
            className="px-2 sm:px-3"
          >
            <LogOut className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Salir</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
