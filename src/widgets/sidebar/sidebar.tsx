"use client";

import Link from "next/link";
import { ShieldCheck, X } from "lucide-react";
import { useActiveRoute } from "@/shared/lib/hooks/useActiveRoute";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { Wordmark } from "@/shared/ui/wordmark";
import {
  getNavItemsByGroup,
  navigationGroups,
} from "@/widgets/navigation/nav-items";

interface SidebarProps {
  onNavigate?: () => void;
  onClose?: () => void;
  className?: string;
  showCloseButton?: boolean;
}

export function Sidebar({
  onNavigate,
  onClose,
  className,
  showCloseButton = false,
}: SidebarProps) {
  const { isActive } = useActiveRoute();

  return (
    <aside
      className={cn(
        "flex w-64 flex-col gap-6 border-r border-app-nav-line bg-app-nav py-5",
        className,
      )}
    >
      <div className="flex items-center justify-between px-5">
        <Link href="/dashboard" onClick={onNavigate} className="rounded-sm">
          <Wordmark tone="nav" />
        </Link>

        {showCloseButton && onClose && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Cerrar menú"
            className="text-app-nav-soft hover:bg-app-nav-hover hover:text-app-nav-ink"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <nav
        className="flex flex-1 flex-col gap-5 overflow-y-auto px-3"
        aria-label="Navegación principal"
      >
        {navigationGroups.map((group) => {
          const items = getNavItemsByGroup(group.id);
          if (items.length === 0) return null;

          return (
            <div key={group.id} className="flex flex-col gap-0.5">
              <h2 className="mb-1.5 ml-3 font-mono text-[9.5px] uppercase tracking-[0.16em] text-app-nav-soft">
                {group.label}
              </h2>

              {items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href, false);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "relative flex items-center gap-3 rounded-lg px-3 py-2 text-[13.5px] transition-colors",
                      "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--app-nav-accent)]",
                      active
                        ? "bg-app-nav-active font-medium text-app-nav-ink"
                        : "text-app-nav-soft hover:bg-app-nav-hover hover:text-app-nav-ink",
                    )}
                  >
                    {active && (
                      <span
                        aria-hidden="true"
                        className="absolute -left-3 top-2 bottom-2 w-0.5 rounded-r-sm bg-app-nav-accent"
                      />
                    )}
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{item.name}</span>
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>

      <p className="mx-4 flex items-start gap-2.5 border-t border-app-nav-line px-1 pt-3.5 text-[11.5px] leading-relaxed text-app-nav-soft">
        <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-app-nav-accent" />
        Cifrado de punta a punta. Nunca compartimos tu información.
      </p>
    </aside>
  );
}
