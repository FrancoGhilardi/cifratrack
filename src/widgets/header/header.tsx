"use client";

import { LogOut, Menu } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { ThemeToggle } from "@/shared/ui/theme-toggle";
import { cn } from "@/shared/lib/utils";
import { useActiveRoute } from "@/shared/lib/hooks/useActiveRoute";
import { getNavItemByPath } from "@/widgets/navigation/nav-items";

interface HeaderProps {
  userName?: string;
  userEmail?: string;
  onLogout?: () => void;
  className?: string;
  showNavigationTrigger?: boolean;
  onOpenNavigation?: () => void;
}

/** Iniciales para el avatar (máximo dos). */
function getInitials(name?: string): string {
  if (!name) return "US";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function Header({
  userName,
  userEmail,
  onLogout,
  className,
  showNavigationTrigger = false,
  onOpenNavigation,
}: HeaderProps) {
  const { pathname } = useActiveRoute();
  const section = getNavItemByPath(pathname);

  return (
    <header
      className={cn(
        "sticky top-0 z-30 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80",
        className,
      )}
    >
      <div className="flex h-[58px] items-center gap-3 px-4 sm:px-6 lg:px-8">
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

        <span className="min-w-0 truncate font-mono text-[10.5px] uppercase tracking-[0.15em] text-muted-foreground">
          {section?.name ?? "cifratrack"}
        </span>

        <div className="flex-1" />

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <ThemeToggle />

          <div className="flex items-center gap-2.5 border-l border-border pl-3 sm:ml-1">
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-app-nav-active font-mono text-[11px] text-app-nav-accent"
              aria-hidden="true"
            >
              {getInitials(userName)}
            </span>

            <div className="hidden min-w-0 leading-tight sm:block">
              <span className="block truncate text-[12.5px] font-medium text-foreground">
                {userName ? userName : "Usuario"}
              </span>
              {userEmail && (
                <span className="block truncate text-[11px] text-muted-foreground">
                  {userEmail}
                </span>
              )}
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={onLogout}
              aria-label="Cerrar sesión"
              className="shrink-0"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
