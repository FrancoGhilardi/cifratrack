"use client";

import Link from "next/link";
import { useActiveRoute } from "@/shared/lib/hooks/useActiveRoute";
import { cn } from "@/shared/lib/utils";
import { appNavigation } from "@/widgets/navigation/nav-items";

export function Sidebar() {
  const { isActive } = useActiveRoute();

  return (
    <aside className="flex h-screen min-h-screen w-64 flex-col border-r border-border">
      <div className="flex h-16 items-center border-b border-border px-6">
        <span className="text-xl font-bold">CifraTrack</span>
      </div>
      <nav className="flex-1 space-y-1 px-2 py-4">
        {appNavigation.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
