"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/shared/lib/utils";

const TABS = [
  { href: "/login", label: "Ingresar" },
  { href: "/register", label: "Crear cuenta" },
] as const;

/** Control segmentado que enlaza login/registro y marca la ruta activa. */
export function AuthTabs() {
  const pathname = usePathname();

  return (
    <div
      role="tablist"
      aria-label="Acceso"
      className="inline-flex gap-1 rounded-full bg-auth-accent-tint p-1"
    >
      {TABS.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            role="tab"
            aria-selected={active}
            className={cn(
              "rounded-full px-[18px] py-2 text-[13.5px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--auth-accent)]",
              active
                ? "bg-card text-foreground shadow-sm ring-1 ring-border"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
