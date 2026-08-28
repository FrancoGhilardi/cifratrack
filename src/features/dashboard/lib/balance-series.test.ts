import { describe, it, expect } from "vitest";
import { buildBalanceSeries } from "./balance-series";
import type { DailyFlowRow } from "@/entities/dashboard/model/balance-series.dto";

describe("buildBalanceSeries", () => {
  it("devuelve un punto por cada día del mes", () => {
    expect(buildBalanceSeries("2026-08", []).points).toHaveLength(31);
    expect(buildBalanceSeries("2026-04", []).points).toHaveLength(30);
  });

  it("contempla años bisiestos en febrero", () => {
    expect(buildBalanceSeries("2024-02", []).points).toHaveLength(29);
    expect(buildBalanceSeries("2026-02", []).points).toHaveLength(28);
  });

  it("acumula el neto diario a lo largo del mes", () => {
    const rows: DailyFlowRow[] = [
      { day: "2026-08-01", income: 100000, expense: 0 },
      { day: "2026-08-03", income: 0, expense: 40000 },
    ];
    const series = buildBalanceSeries("2026-08", rows);

    expect(series.points[0]).toEqual({
      day: "2026-08-01",
      net: 100000,
      cumulative: 100000,
    });
    // día 2 sin movimientos: neto 0, acumulado se sostiene
    expect(series.points[1]).toEqual({
      day: "2026-08-02",
      net: 0,
      cumulative: 100000,
    });
    expect(series.points[2]).toEqual({
      day: "2026-08-03",
      net: -40000,
      cumulative: 60000,
    });
    expect(series.points.at(-1)!.cumulative).toBe(60000);
  });

  it("expone mínimo, máximo y cierre del acumulado", () => {
    const rows: DailyFlowRow[] = [
      { day: "2026-08-01", income: 0, expense: 50000 },
      { day: "2026-08-02", income: 200000, expense: 0 },
      { day: "2026-08-03", income: 0, expense: 30000 },
    ];
    const series = buildBalanceSeries("2026-08", rows);

    expect(series.min).toBe(-50000);
    expect(series.max).toBe(150000);
    expect(series.closing).toBe(120000);
  });

  it("ordena los días de forma ascendente aunque las filas lleguen desordenadas", () => {
    const rows: DailyFlowRow[] = [
      { day: "2026-08-05", income: 10000, expense: 0 },
      { day: "2026-08-02", income: 20000, expense: 0 },
    ];
    const series = buildBalanceSeries("2026-08", rows);

    expect(series.points[1].cumulative).toBe(20000);
    expect(series.points[4].cumulative).toBe(30000);
  });

  it("ignora filas de días que no pertenecen al mes pedido", () => {
    const rows: DailyFlowRow[] = [
      { day: "2026-07-31", income: 999999, expense: 0 },
      { day: "2026-08-01", income: 1000, expense: 0 },
    ];
    const series = buildBalanceSeries("2026-08", rows);

    expect(series.closing).toBe(1000);
  });

  it("mantiene el mes recibido en la respuesta", () => {
    expect(buildBalanceSeries("2026-08", []).month).toBe("2026-08");
  });

  it("lanza si el mes tiene formato inválido", () => {
    expect(() => buildBalanceSeries("2026-8", [])).toThrow();
    expect(() => buildBalanceSeries("agosto", [])).toThrow();
  });
});
