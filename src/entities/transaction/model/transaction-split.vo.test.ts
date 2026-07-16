import { describe, it, expect } from "vitest";
import { TransactionSplit } from "./transaction-split.vo";
import { ValidationError } from "@/shared/lib/errors";

describe("TransactionSplit", () => {
  it("acepta splits válidos", () => {
    const split = new TransactionSplit([
      { categoryId: "cat-1", allocatedAmount: 500 },
      { categoryId: "cat-2", allocatedAmount: 300 },
    ]);
    expect(split.getTotal()).toBe(800);
  });

  it("rechaza array vacío", () => {
    expect(() => new TransactionSplit([])).toThrow(ValidationError);
  });

  it("rechaza montos negativos o cero", () => {
    expect(
      () => new TransactionSplit([{ categoryId: "cat-1", allocatedAmount: 0 }]),
    ).toThrow(ValidationError);
    expect(
      () =>
        new TransactionSplit([{ categoryId: "cat-1", allocatedAmount: -100 }]),
    ).toThrow(ValidationError);
  });

  it("rechaza categorías duplicadas", () => {
    expect(
      () =>
        new TransactionSplit([
          { categoryId: "cat-1", allocatedAmount: 500 },
          { categoryId: "cat-1", allocatedAmount: 300 },
        ]),
    ).toThrow(ValidationError);
  });

  it("matchesAmount() compara el total contra el monto de la transacción", () => {
    const split = new TransactionSplit([
      { categoryId: "cat-1", allocatedAmount: 500 },
      { categoryId: "cat-2", allocatedAmount: 300 },
    ]);
    expect(split.matchesAmount(800)).toBe(true);
    expect(split.matchesAmount(801)).toBe(false);
  });

  it("fromPersistence()/toPersistence() son simétricos", () => {
    const data = [{ categoryId: "cat-1", allocatedAmount: 500 }];
    const split = TransactionSplit.fromPersistence(data);
    expect(split.toPersistence()).toEqual(data);
  });
});
