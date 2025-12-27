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
  // Crear versión abreviada del mes (primeras 3 letras)
  const parts = monthLabel.split(' ');
  const monthAbbrev = parts[0].substring(0, 3);
  const year = parts[1];
  const shortLabel = `${monthAbbrev} ${year}`;

  return (
    <div className="flex items-center gap-1 sm:gap-2">
      <Button 
        variant="outline" 
        size="icon"
        className="h-8 w-8 sm:h-10 sm:w-10"
        onClick={onPreviousMonth}
      >
        <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
      </Button>

      <div className="text-center px-2">
        {/* Versión mobile: abreviada */}
        <p className="text-xs font-medium capitalize md:hidden">{shortLabel}</p>
        {/* Versión tablet/desktop: completa */}
        <p className="hidden md:block text-sm font-medium capitalize">{monthLabel}</p>
      </div>

      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 sm:h-10 sm:w-10"
        onClick={onNextMonth}
        disabled={isCurrentMonth}
      >
        <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
      </Button>

      {!isCurrentMonth && (
        <Button 
          variant="ghost" 
          size="sm"
          className="h-8 px-2 text-xs sm:text-sm sm:px-3"
          onClick={onCurrentMonth}
        >
          Hoy
        </Button>
      )}
    </div>
  );
}
