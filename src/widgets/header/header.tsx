"use client";

import { LogOut, User } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { ThemeToggle } from "@/shared/ui/theme-toggle";

interface HeaderProps {
  userName?: string;
  userEmail?: string;
  onLogout?: () => void;
}

export function Header({ userName, userEmail, onLogout }: HeaderProps) {
  return (
    <header className="h-16 w-full flex items-center justify-between border-b border-border px-6">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-sm font-semibold text-accent-foreground">
          <User className="h-4 w-4" />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="font-medium text-sm text-foreground">
            {userName ? userName : "Usuario"}
          </span>
          {userEmail && <span className="text-xs text-muted-foreground">{userEmail}</span>}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Button variant="ghost" size="sm" onClick={onLogout}>
          <LogOut className="h-4 w-4 mr-2" />
          Salir
        </Button>
      </div>
    </header>
  );
}
