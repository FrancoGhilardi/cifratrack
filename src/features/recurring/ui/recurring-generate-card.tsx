import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';

interface RecurringGenerateCardProps {
  month: string;
  onMonthChange: (month: string) => void;
  onGenerate: () => void;
  isLoading?: boolean;
  errorMessage?: string | null;
}

/**
 * Tarjeta reutilizable para disparar la generación mensual de transacciones recurrentes.
 */
export function RecurringGenerateCard({
  month,
  onMonthChange,
  onGenerate,
  isLoading,
  errorMessage,
}: RecurringGenerateCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <CardTitle>Generar transacciones del mes</CardTitle>
          <CardDescription>
            Ejecuta las reglas activas para el mes seleccionado. Es idempotente: no duplica transacciones existentes.
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Input
            type="month"
            value={month}
            onChange={(e) => onMonthChange(e.target.value)}
            className="w-36"
          />
          <Button onClick={onGenerate} disabled={isLoading}>
            {isLoading ? 'Generando...' : 'Generar'}
          </Button>
        </div>
      </CardHeader>
      {errorMessage && (
        <CardContent>
          <p className="text-sm text-destructive">{errorMessage}</p>
        </CardContent>
      )}
    </Card>
  );
}
