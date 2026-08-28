import { describe, expect, it } from "vitest";
import { formatMonthLabel } from "./month-label";

describe("formatMonthLabel", () => {
  it("formatea el mes en español", () => {
    expect(formatMonthLabel("2026-08")).toBe("agosto 2026");
  });

  it("formatea enero y diciembre sin desfase de mes", () => {
    expect(formatMonthLabel("2026-01")).toBe("enero 2026");
    expect(formatMonthLabel("2026-12")).toBe("diciembre 2026");
  });

  it("devuelve cadena vacía si el mes es inválido", () => {
    expect(formatMonthLabel("")).toBe("");
    expect(formatMonthLabel("2026-13")).toBe("");
  });
});
