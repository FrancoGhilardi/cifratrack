"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import {
  ChartColumnIncreasing,
  ShieldCheck,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import iconPng from "../../../public/icon.png";
import { ThemeToggle } from "@/shared/ui/theme-toggle";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";

interface AuthShellProps {
  title: string;
  description: string;
  footer: ReactNode;
  children: ReactNode;
}

const highlights: Array<{
  icon: LucideIcon;
  title: string;
  description: string;
}> = [
  {
    icon: Wallet,
    title: "Movimientos en un solo lugar",
    description:
      "Ingresos, egresos, categorias y formas de pago con un flujo consistente.",
  },
  {
    icon: ChartColumnIncreasing,
    title: "Seguimiento de inversiones",
    description:
      "Portafolio, rendimiento y tasas en vivo desde la misma interfaz.",
  },
  {
    icon: ShieldCheck,
    title: "Arquitectura ordenada",
    description:
      "UI, hooks, use cases y repositorios desacoplados para iterar sin romper negocio.",
  },
];

export function AuthShell({
  title,
  description,
  footer,
  children,
}: AuthShellProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 top-0 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-secondary blur-3xl opacity-70" />
      </div>

      <div className="absolute right-4 top-4 z-10 sm:right-6 sm:top-6">
        <ThemeToggle />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
        <div className="grid w-full max-w-5xl gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(24rem,30rem)] lg:items-center">
          <section className="hidden lg:block">
            <div className="space-y-8 px-4">
              <div className="inline-flex items-center gap-3 rounded-full border border-border bg-background/80 px-4 py-2 shadow-sm backdrop-blur">
                <Image
                  src={iconPng}
                  alt="CifraTrack"
                  width={28}
                  height={28}
                  className="h-7 w-7 rounded-md"
                  priority
                />
                <span className="text-sm font-semibold tracking-wide">
                  CifraTrack
                </span>
              </div>

              <div className="space-y-4">
                <p className="text-sm font-medium uppercase tracking-[0.24em] text-muted-foreground">
                  Finanzas personales
                </p>
                <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-foreground xl:text-5xl">
                  Controla tu informacion financiera sin perder claridad.
                </h1>
                <p className="max-w-xl text-base leading-7 text-muted-foreground">
                  La aplicacion ya cubre dashboard, movimientos, recurrentes e
                  inversiones. Esta vista de acceso mantiene ese mismo enfoque:
                  simple, legible y lista para usar en desktop, tablet y
                  celular.
                </p>
              </div>

              <div className="grid gap-3 xl:grid-cols-3">
                {highlights.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.title}
                      className="rounded-2xl border border-border bg-background/70 p-4 shadow-sm backdrop-blur"
                    >
                      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-accent text-accent-foreground">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h2 className="text-sm font-semibold text-foreground">
                        {item.title}
                      </h2>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          <Card className="w-full border border-border/80 bg-card/95 shadow-xl backdrop-blur">
            <CardHeader className="space-y-4 p-5 sm:p-6">
              <div className="flex items-center gap-3 lg:hidden">
                <Image
                  src={iconPng}
                  alt="CifraTrack"
                  width={32}
                  height={32}
                  className="h-8 w-8 rounded-md"
                  priority
                />
                <div>
                  <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
                    CifraTrack
                  </p>
                  <p className="text-sm text-foreground">
                    Control financiero personal
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <CardTitle className="text-2xl sm:text-3xl">{title}</CardTitle>
                <CardDescription className="text-sm leading-6 sm:text-base">
                  {description}
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="p-5 pt-0 sm:p-6 sm:pt-0">
              {children}
            </CardContent>

            <CardFooter className="justify-center border-t border-border/70 px-5 pb-5 pt-4 sm:px-6 sm:pb-6">
              {footer}
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
