import { describe, it, expect } from "vitest";
import { InvestmentYieldCalculator } from "./investment-yield-calculator";
import { ValidationError } from "@/shared/lib/errors";

describe("InvestmentYieldCalculator.calculate", () => {
  const calculator = new InvestmentYieldCalculator();

  it("calcula interés simple: yield = principal * (tna/100) * (days/365)", () => {
    const result = calculator.calculate(100000, 36.5, 365);
    // 100000 * 0.365 * 1 = 36500
    expect(result.yield).toBe(36500);
    expect(result.total).toBe(136500);
    expect(result.tna).toBe(36.5);
    expect(result.days).toBe(365);
  });

  it("calcula interés simple para un período parcial", () => {
    const result = calculator.calculate(100000, 36.5, 30);
    // 100000 * 0.365 * (30/365) = 3000
    expect(result.yield).toBe(3000);
    expect(result.total).toBe(103000);
  });

  it("calcula interés compuesto con capitalización diaria", () => {
    const result = calculator.calculate(100000, 36.5, 30, true);
    const dailyRate = 36.5 / 100 / 365;
    const expectedTotal =
      Math.round(100000 * Math.pow(1 + dailyRate, 30) * 100) / 100;
    expect(result.total).toBe(expectedTotal);
    expect(result.yield).toBe(Math.round((expectedTotal - 100000) * 100) / 100);
  });

  it("rechaza principal <= 0", () => {
    expect(() => calculator.calculate(0, 36.5, 30)).toThrow(ValidationError);
    expect(() => calculator.calculate(-1000, 36.5, 30)).toThrow(
      ValidationError,
    );
  });

  it("rechaza tna negativa", () => {
    expect(() => calculator.calculate(100000, -1, 30)).toThrow(ValidationError);
  });

  it("rechaza días negativos", () => {
    expect(() => calculator.calculate(100000, 36.5, -1)).toThrow(
      ValidationError,
    );
  });

  it("acepta tna y días en cero sin generar rendimiento", () => {
    const result = calculator.calculate(100000, 0, 0);
    expect(result.yield).toBe(0);
    expect(result.total).toBe(100000);
  });
});

describe("InvestmentYieldCalculator.calculateTEA", () => {
  const calculator = new InvestmentYieldCalculator();

  it("calcula la tasa efectiva anual", () => {
    const tea = calculator.calculateTEA(100000, 103000, 30);
    // ((103000/100000) - 1) * (365/30) * 100 = 36.5
    expect(tea).toBe(36.5);
  });

  it("rechaza valores <= 0", () => {
    expect(() => calculator.calculateTEA(0, 100, 30)).toThrow(ValidationError);
    expect(() => calculator.calculateTEA(100, 0, 30)).toThrow(ValidationError);
    expect(() => calculator.calculateTEA(100, 100, 0)).toThrow(ValidationError);
  });
});

describe("InvestmentYieldCalculator.calculateFinalAmount", () => {
  const calculator = new InvestmentYieldCalculator();

  it("devuelve el total del cálculo de interés simple", () => {
    expect(calculator.calculateFinalAmount(100000, 36.5, 365)).toBe(136500);
  });
});

describe("InvestmentYieldCalculator.calculateDaysForTargetYield", () => {
  const calculator = new InvestmentYieldCalculator();

  it("calcula los días necesarios para alcanzar la ganancia objetivo", () => {
    // days = (yield * 365) / (principal * (tna/100)) = (36500 * 365) / (100000 * 0.365) = 365
    expect(calculator.calculateDaysForTargetYield(100000, 36.5, 36500)).toBe(
      365,
    );
  });

  it("rechaza valores <= 0", () => {
    expect(() => calculator.calculateDaysForTargetYield(0, 36.5, 1000)).toThrow(
      ValidationError,
    );
    expect(() =>
      calculator.calculateDaysForTargetYield(100000, 0, 1000),
    ).toThrow(ValidationError);
    expect(() =>
      calculator.calculateDaysForTargetYield(100000, 36.5, 0),
    ).toThrow(ValidationError);
  });
});
