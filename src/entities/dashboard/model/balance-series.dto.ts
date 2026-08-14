/**
 * DTO: Serie diaria de saldo
 *
 * Evolución del saldo acumulado dentro de un mes.
 * Todos los montos están en centavos (enteros).
 */

/** Fila cruda del repositorio: flujo de un día. */
export interface DailyFlowRow {
  /** Fecha en formato YYYY-MM-DD */
  day: string;
  /** Ingresos del día, en centavos */
  income: number;
  /** Egresos del día, en centavos */
  expense: number;
}

/** Punto de la serie: un día del mes. */
export interface BalanceSeriesPointDTO {
  /** Fecha en formato YYYY-MM-DD */
  day: string;
  /** Neto del día (ingresos - egresos), en centavos */
  net: number;
  /** Saldo acumulado desde el día 1 del mes, en centavos */
  cumulative: number;
}

/** Serie completa de un mes. */
export interface BalanceSeriesDTO {
  /** Mes en formato YYYY-MM */
  month: string;
  /** Un punto por día del mes, en orden ascendente */
  points: BalanceSeriesPointDTO[];
  /** Mínimo del acumulado, en centavos */
  min: number;
  /** Máximo del acumulado, en centavos */
  max: number;
  /** Acumulado del último día, en centavos */
  closing: number;
}
