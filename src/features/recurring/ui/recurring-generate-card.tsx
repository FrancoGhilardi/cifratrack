import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { Spinner } from "@/shared/ui/spinner";
import { Label } from "@/shared/ui/label";

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
    <Card className="border shadow-none">
      <CardHeader className="space-y-2 pb-3">
        <div className="space-y-2">
          <CardTitle className="text-lg">
            Generar transacciones del mes
          </CardTitle>
          <CardDescription>
            Ejecuta las reglas activas para el mes seleccionado. Es idempotente:
            no duplica transacciones existentes.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-[180px_auto] md:items-end">
          <div className="min-w-0 space-y-2">
            <Label htmlFor="recurring-target-month">Mes a generar</Label>
            <Input
              id="recurring-target-month"
              type="month"
              value={month}
              onChange={(e) => onMonthChange(e.target.value)}
              className="h-11 w-full min-w-0"
            />
          </div>

          <Button
            onClick={onGenerate}
            disabled={isLoading || !month}
            className="h-11 w-full md:w-auto md:justify-self-start"
          >
            {isLoading && <Spinner size="xs" />}
            {isLoading ? "Generando..." : "Generar movimientos"}
          </Button>
        </div>

        {errorMessage && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3">
            <p className="text-sm text-destructive">{errorMessage}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
