import { describe, it, expect } from "vitest";
import { Month, DateRange } from "./date";
import { ValidationError } from "./errors";

describe("Month", () => {
  it("parse() parsea YYYY-MM válido", () => {
    const month = Month.parse("2026-07");
    expect(month.toString()).toBe("2026-07");
    expect(month.getYear()).toBe(2026);
    expect(month.getMonth()).toBe(7);
  });

  it("parse() rechaza formato inválido", () => {
    expect(() => Month.parse("2026-7")).toThrow(ValidationError);
    expect(() => Month.parse("07-2026")).toThrow(ValidationError);
    expect(() => Month.parse("not-a-month")).toThrow(ValidationError);
  });

  it("fromString() rechaza mes fuera de rango", () => {
    expect(() => Month.fromString("2026-13")).toThrow(ValidationError);
    expect(() => Month.fromString("2026-00")).toThrow(ValidationError);
  });

  it("previous()/next() cruzan el límite de año", () => {
    expect(Month.parse("2026-01").previous().toString()).toBe("2025-12");
    expect(Month.parse("2026-12").next().toString()).toBe("2027-01");
  });

  it("previous()/next() dentro del mismo año", () => {
    expect(Month.parse("2026-07").previous().toString()).toBe("2026-06");
    expect(Month.parse("2026-07").next().toString()).toBe("2026-08");
  });

  it("equals() compara por valor", () => {
    expect(Month.parse("2026-07").equals(Month.parse("2026-07"))).toBe(true);
    expect(Month.parse("2026-07").equals(Month.parse("2026-08"))).toBe(false);
  });

  it("isBefore()/isAfter() ordenan meses", () => {
    const jun = Month.parse("2026-06");
    const jul = Month.parse("2026-07");
    expect(jun.isBefore(jul)).toBe(true);
    expect(jul.isAfter(jun)).toBe(true);
    expect(jul.isBefore(jun)).toBe(false);
  });
});

describe("DateRange", () => {
  it("forMonth() cubre desde el día 1 hasta el último día del mes", () => {
    const range = DateRange.forMonth(Month.parse("2026-02"));
    expect(range.from.getDate()).toBe(1);
    expect(range.from.getMonth()).toBe(1); // febrero (0-indexed)
    expect(range.to.getDate()).toBe(28); // 2026 no es bisiesto
  });

  it("contains() detecta fechas dentro y fuera del rango", () => {
    const range = DateRange.forMonth(Month.parse("2026-07"));
    expect(range.contains(new Date(2026, 6, 15))).toBe(true);
    expect(range.contains(new Date(2026, 7, 1))).toBe(false);
  });

  it("rechaza rango con from posterior a to", () => {
    expect(
      () => new DateRange(new Date(2026, 6, 10), new Date(2026, 6, 1)),
    ).toThrow(ValidationError);
  });

  it("getDays() cuenta días inclusive", () => {
    const range = new DateRange(new Date(2026, 6, 1), new Date(2026, 6, 10));
    expect(range.getDays()).toBe(10);
  });
});
