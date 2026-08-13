"use client";

import type { ReactNode } from "react";
import { ThemeToggle } from "@/shared/ui/theme-toggle";
import { AuthWordmark } from "@/features/auth/ui/auth-wordmark";
import { AuthTabs } from "@/features/auth/ui/auth-tabs";
import { AuthBrandPanel } from "@/features/auth/ui/auth-brand-panel";
import { AUTH_BRAND_SERIF } from "@/features/auth/ui/auth-fonts";

interface AuthShellProps {
  title: string;
  description: string;
  footer: ReactNode;
  children: ReactNode;
}

export function AuthShell({
  title,
  description,
  footer,
  children,
}: AuthShellProps) {
  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-[1.05fr_0.95fr]">
      {/* Form side */}
      <section className="relative flex flex-col p-6 sm:p-10 lg:p-14">
        <div className="flex items-center justify-between">
          <AuthWordmark />
          <ThemeToggle />
        </div>

        <div className="flex flex-1 flex-col justify-center py-10">
          <div className="mx-auto w-full max-w-[400px]">
            <h1
              className="mb-2 text-3xl font-medium leading-tight tracking-tight text-balance text-foreground sm:text-4xl"
              style={{ fontFamily: AUTH_BRAND_SERIF }}
            >
              {title}
            </h1>
            <p className="mb-7 max-w-[42ch] text-[15px] leading-relaxed text-muted-foreground">
              {description}
            </p>

            <div className="mb-6">
              <AuthTabs />
            </div>

            {children}

            <div className="pt-6">{footer}</div>
          </div>
        </div>
      </section>

      {/* Brand panel */}
      <AuthBrandPanel />
    </div>
  );
}
