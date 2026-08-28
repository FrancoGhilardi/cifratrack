import { Button } from "./button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface MonthSelectorProps {
  /**
   * Mes actual en formato YYYY-MM
   */
  currentMonth: string;
  /**
   * Label formateado del mes (ej: "diciembre 2025")
   */
  monthLabel: string;
  /**
   * Si el mes actual es el mes del sistema
   */
  isCurrentMonth: boolean;
  /**
   * Callback para navegar al mes anterior
   */
  onPreviousMonth: () => void;
  /**
   * Callback para navegar al mes siguiente
   */
  onNextMonth: () => void;
  /**
   * Callback para ir al mes actual del sistema
   */
  onCurrentMonth: () => void;
}

/**
 * Componente selector de mes con navegación
 */
export function MonthSelector({
  monthLabel,
  isCurrentMonth,
  onPreviousMonth,
  onNextMonth,
  onCurrentMonth,
}: MonthSelectorProps) {
  // Crear versión abreviada del mes (primeras 3 letras)
  const parts = monthLabel.split(" ");
  const monthAbbrev = parts[0].substring(0, 3);
  const year = parts[1];
  const shortLabel = `${monthAbbrev} ${year}`;

  return (
    <div className="inline-flex max-w-full items-center gap-0.5 rounded-full border border-border bg-card p-1">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 shrink-0 rounded-full"
        onClick={onPreviousMonth}
        aria-label="Mes anterior"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <span className="min-w-[6.5rem] px-1 text-center text-[13px] capitalize sm:min-w-[8rem]">
        <span className="sm:hidden">{shortLabel}</span>
        <span className="hidden sm:inline">{monthLabel}</span>
      </span>

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 shrink-0 rounded-full"
        onClick={onNextMonth}
        disabled={isCurrentMonth}
        aria-label="Mes siguiente"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      {!isCurrentMonth && (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 shrink-0 rounded-full bg-app-nav-active px-3 font-mono text-[10px] uppercase tracking-[0.1em] text-app-nav-accent hover:bg-app-nav-active"
          onClick={onCurrentMonth}
        >
          Hoy
        </Button>
      )}
    </div>
  );
}
