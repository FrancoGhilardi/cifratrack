import { describe, it, expect } from "vitest";
import { Money, formatCurrency } from "./money";
import { ValidationError } from "./errors";

describe("Money", () => {
  it("crea desde centavos", () => {
    expect(Money.fromCents(1050).toCents()).toBe(1050);
  });

  it("crea desde pesos redondeando al centavo", () => {
    expect(Money.fromPesos(10.5).toCents()).toBe(1050);
    expect(Money.fromPesos(10.005).toCents()).toBe(1001); // redondeo estándar
  });

  it("zero() da un monto de cero centavos", () => {
    expect(Money.zero().toCents()).toBe(0);
    expect(Money.zero().isZero()).toBe(true);
  });

  it("rechaza centavos no enteros", () => {
    expect(() => Money.fromCents(10.5)).toThrow(ValidationError);
  });

  it("rechaza montos negativos", () => {
    expect(() => Money.fromCents(-100)).toThrow(ValidationError);
  });

  it("toPesos() convierte centavos a pesos", () => {
    expect(Money.fromCents(1050).toPesos()).toBe(10.5);
  });

  it("add() suma dos montos", () => {
    const result = Money.fromCents(500).add(Money.fromCents(300));
    expect(result.toCents()).toBe(800);
  });

  it("subtract() resta dos montos", () => {
    const result = Money.fromCents(500).subtract(Money.fromCents(300));
    expect(result.toCents()).toBe(200);
  });

  it("subtract() rechaza resultado negativo", () => {
    expect(() => Money.fromCents(300).subtract(Money.fromCents(500))).toThrow(
      ValidationError,
    );
  });

  it("multiply() multiplica y redondea al centavo", () => {
    expect(Money.fromCents(100).multiply(1.5).toCents()).toBe(150);
    expect(Money.fromCents(333).multiply(3).toCents()).toBe(999);
  });

  it("divide() divide y redondea al centavo", () => {
    expect(Money.fromCents(100).divide(3).toCents()).toBe(33);
  });

  it("divide() rechaza división por cero", () => {
    expect(() => Money.fromCents(100).divide(0)).toThrow(ValidationError);
  });

  it("isGreaterThan / isLessThan / equals comparan centavos", () => {
    const a = Money.fromCents(500);
    const b = Money.fromCents(300);
    expect(a.isGreaterThan(b)).toBe(true);
    expect(b.isLessThan(a)).toBe(true);
    expect(a.equals(Money.fromCents(500))).toBe(true);
  });

  it("format() produce un string de moneda ARS", () => {
    const formatted = Money.fromCents(123456).format();
    expect(formatted).toContain("1.234,56");
  });
});

describe("formatCurrency", () => {
  it("formatea centavos a string de moneda con 2 decimales", () => {
    expect(formatCurrency(100000)).toContain("1.000,00");
  });
});
