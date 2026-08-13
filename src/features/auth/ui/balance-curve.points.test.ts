import { describe, it, expect } from "vitest";
import { generateBalanceCurve } from "./balance-curve.points";

describe("generateBalanceCurve", () => {
  it("devuelve la cantidad de puntos pedida", () => {
    expect(generateBalanceCurve(20)).toHaveLength(20);
  });

  it("x va de 0 a 1 en orden estrictamente ascendente", () => {
    const pts = generateBalanceCurve(10);
    expect(pts[0].x).toBe(0);
    expect(pts.at(-1)!.x).toBe(1);
    for (let i = 1; i < pts.length; i++) {
      expect(pts[i].x).toBeGreaterThan(pts[i - 1].x);
    }
  });

  it("y siempre queda normalizado en [0,1]", () => {
    for (const p of generateBalanceCurve(40)) {
      expect(p.y).toBeGreaterThanOrEqual(0);
      expect(p.y).toBeLessThanOrEqual(1);
    }
  });

  it("es determinista para el mismo count", () => {
    expect(generateBalanceCurve(15)).toEqual(generateBalanceCurve(15));
  });

  it("lanza si count < 2", () => {
    expect(() => generateBalanceCurve(1)).toThrow();
  });
});
