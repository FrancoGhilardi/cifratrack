import { Button } from './button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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
  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="icon" onClick={onPreviousMonth}>
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <div className="min-w-[180px] text-center">
        <p className="text-sm font-medium capitalize">{monthLabel}</p>
      </div>

      <Button
        variant="outline"
        size="icon"
        onClick={onNextMonth}
        disabled={isCurrentMonth}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      {!isCurrentMonth && (
        <Button variant="ghost" size="sm" onClick={onCurrentMonth}>
          Hoy
        </Button>
      )}
    </div>
  );
}
