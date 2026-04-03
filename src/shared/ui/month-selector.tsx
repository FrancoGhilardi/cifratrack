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
    <div className="inline-flex max-w-full flex-wrap items-center justify-center gap-2 rounded-xl border border-border bg-card p-2 shadow-sm sm:flex-nowrap">
      <Button
        variant="outline"
        size="icon"
        className="h-9 w-9 shrink-0"
        onClick={onPreviousMonth}
        aria-label="Mes anterior"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <div className="min-w-[7.5rem] flex-1 px-1 text-center sm:min-w-[9rem]">
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Periodo
        </p>
        <p className="text-sm font-semibold capitalize sm:hidden">
          {shortLabel}
        </p>
        <p className="hidden text-sm font-semibold capitalize sm:block">
          {monthLabel}
        </p>
      </div>

      <Button
        variant="outline"
        size="icon"
        className="h-9 w-9 shrink-0"
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
          className="h-9 w-full px-3 text-sm sm:w-auto"
          onClick={onCurrentMonth}
        >
          Hoy
        </Button>
      )}
    </div>
  );
}
