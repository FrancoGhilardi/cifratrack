import { Month } from "@/shared/lib/date";
import type {
  BalanceSeriesDTO,
  BalanceSeriesPointDTO,
  DailyFlowRow,
} from "@/entities/dashboard/model/balance-series.dto";

/** Cantidad de días del mes (contempla bisiestos). */
function daysInMonth(month: Month): number {
  return new Date(month.getYear(), month.getMonth(), 0).getDate();
}

/**
 * Construye la serie diaria de saldo acumulado de un mes.
 *
 * Genera un punto por cada día del mes (incluidos los días sin movimientos,
 * donde el neto es 0 y el acumulado se sostiene). Las filas fuera del mes
 * pedido se ignoran. Todos los montos son centavos enteros.
 *
 * @throws ValidationError si `month` no tiene formato YYYY-MM
 */
export function buildBalanceSeries(
  month: string,
  rows: DailyFlowRow[],
): BalanceSeriesDTO {
  const parsed = Month.parse(month);
  const total = daysInMonth(parsed);

  // Indexar los flujos por día para no recorrer las filas por cada día.
  const netByDay = new Map<string, number>();
  for (const row of rows) {
    if (!row.day.startsWith(`${month}-`)) continue;
    const previous = netByDay.get(row.day) ?? 0;
    netByDay.set(row.day, previous + row.income - row.expense);
  }

  const points: BalanceSeriesPointDTO[] = [];
  let cumulative = 0;
  let min = 0;
  let max = 0;

  for (let dayNumber = 1; dayNumber <= total; dayNumber++) {
    const day = `${month}-${dayNumber.toString().padStart(2, "0")}`;
    const net = netByDay.get(day) ?? 0;
    cumulative += net;
    if (cumulative < min) min = cumulative;
    if (cumulative > max) max = cumulative;
    points.push({ day, net, cumulative });
  }

  return { month, points, min, max, closing: cumulative };
}
