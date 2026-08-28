import { describe, expect, it } from "vitest";
import { buildTransactionSummary } from "./transaction-summary";

describe("buildTransactionSummary", () => {
  it("devuelve todo en cero cuando no hay filas", () => {
    expect(buildTransactionSummary([], "2026-08")).toEqual({
      month: "2026-08",
      totalPaid: 0,
      paidCount: 0,
      totalPending: 0,
      pendingCount: 0,
      totalIncome: 0,
      incomeCount: 0,
      totalExpenses: 0,
      expenseCount: 0,
    });
  });

  it("separa pagado y pendiente solo entre los egresos", () => {
    const summary = buildTransactionSummary(
      [
        { kind: "expense", status: "paid", total: 30_000, count: 2 },
        { kind: "expense", status: "pending", total: 12_500, count: 1 },
        { kind: "income", status: "paid", total: 100_000, count: 1 },
      ],
      "2026-08",
    );

    expect(summary.totalPaid).toBe(30_000);
    expect(summary.paidCount).toBe(2);
    expect(summary.totalPending).toBe(12_500);
    expect(summary.pendingCount).toBe(1);
    expect(summary.totalExpenses).toBe(42_500);
    expect(summary.expenseCount).toBe(3);
    expect(summary.totalIncome).toBe(100_000);
    expect(summary.incomeCount).toBe(1);
  });

  it("no cuenta los ingresos pendientes como egresos pendientes", () => {
    const summary = buildTransactionSummary(
      [{ kind: "income", status: "pending", total: 5_000, count: 1 }],
      "2026-08",
    );

    expect(summary.totalPending).toBe(0);
    expect(summary.pendingCount).toBe(0);
    expect(summary.totalIncome).toBe(5_000);
  });

  it("tolera totales nulos de la base", () => {
    const summary = buildTransactionSummary(
      [{ kind: "expense", status: "paid", total: null, count: null }],
      "2026-08",
    );

    expect(summary.totalPaid).toBe(0);
    expect(summary.paidCount).toBe(0);
  });
});
