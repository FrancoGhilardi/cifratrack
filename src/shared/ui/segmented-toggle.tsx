"use client";

import { cn } from "@/shared/lib/utils";

interface SegmentedToggleProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: ReadonlyArray<{ value: T; label: string }>;
  /** Etiqueta del grupo para lectores de pantalla. */
  ariaLabel: string;
  className?: string;
  /** Deshabilita el control sin ocultarlo (ej. tipo no editable en edición). */
  disabled?: boolean;
}

/**
 * Control segmentado de dos o más opciones excluyentes.
 * Mismo lenguaje visual que las pestañas del acceso, pero cambia estado
 * en vez de navegar: por eso es un radiogroup y no una lista de links.
 */
export function SegmentedToggle<T extends string>({
  value,
  onChange,
  options,
  ariaLabel,
  className,
  disabled = false,
}: SegmentedToggleProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      aria-disabled={disabled || undefined}
      className={cn(
        "inline-flex gap-0.5 rounded-full bg-app-nav-active p-0.5",
        disabled && "opacity-50",
        className,
      )}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            onClick={() => onChange(option.value)}
            className={cn(
              "rounded-full px-3 py-1 text-[11.5px] font-medium transition-colors",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--app-nav-accent)]",
              "disabled:cursor-not-allowed",
              selected
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
