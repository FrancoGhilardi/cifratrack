import { describe, it, expect, vi } from "vitest";
import { UpsertTransactionUseCase } from "./upsert-transaction.usecase";
import type {
  ITransactionRepository,
  TransactionWithNames,
} from "@/entities/transaction/repo";
import type {
  CreateTransactionInput,
  UpdateTransactionInput,
} from "@/entities/transaction/model/transaction.schema";
import { ValidationError } from "@/shared/lib/errors";

function createMockRepository(
  overrides: Partial<ITransactionRepository> = {},
): ITransactionRepository {
  return {
    list: vi.fn(),
    findById: vi.fn().mockResolvedValue(null),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    getByMonth: vi.fn(),
    getExpenseStatusSummary: vi.fn(),
    getMonthlySummary: vi.fn(),
    ...overrides,
  };
}

const baseCreateInput = {
  amount: 800,
  split: [
    { categoryId: "cat-1", allocatedAmount: 500 },
    { categoryId: "cat-2", allocatedAmount: 300 },
  ],
} as unknown as CreateTransactionInput;

describe("UpsertTransactionUseCase.create", () => {
  it("rechaza cuando no hay split", async () => {
    const repo = createMockRepository();
    const usecase = new UpsertTransactionUseCase(repo);

    await expect(
      usecase.create("user-1", {
        amount: 800,
        split: [],
      } as unknown as CreateTransactionInput),
    ).rejects.toThrow(ValidationError);
    expect(repo.create).not.toHaveBeenCalled();
  });

  it("rechaza cuando el split no suma el monto total", async () => {
    const repo = createMockRepository();
    const usecase = new UpsertTransactionUseCase(repo);

    const input = {
      amount: 800,
      split: [{ categoryId: "cat-1", allocatedAmount: 500 }],
    } as unknown as CreateTransactionInput;

    await expect(usecase.create("user-1", input)).rejects.toThrow(
      ValidationError,
    );
    expect(repo.create).not.toHaveBeenCalled();
  });

  it("rechaza categorías duplicadas en el split", async () => {
    const repo = createMockRepository();
    const usecase = new UpsertTransactionUseCase(repo);

    const input = {
      amount: 800,
      split: [
        { categoryId: "cat-1", allocatedAmount: 500 },
        { categoryId: "cat-1", allocatedAmount: 300 },
      ],
    } as unknown as CreateTransactionInput;

    await expect(usecase.create("user-1", input)).rejects.toThrow(
      ValidationError,
    );
    expect(repo.create).not.toHaveBeenCalled();
  });

  it("crea la transacción cuando el split es válido", async () => {
    const created = { id: "tx-1" } as unknown as TransactionWithNames;
    const repo = createMockRepository({
      create: vi.fn().mockResolvedValue(created),
    });
    const usecase = new UpsertTransactionUseCase(repo);

    const result = await usecase.create("user-1", baseCreateInput);

    expect(result).toBe(created);
    expect(repo.create).toHaveBeenCalledWith("user-1", baseCreateInput);
  });
});

describe("UpsertTransactionUseCase.update", () => {
  it("usa el monto de la transacción existente cuando data.amount no viene", async () => {
    const existing = {
      transaction: { amount: 800 },
    } as unknown as TransactionWithNames;
    const updated = { id: "tx-1" } as unknown as TransactionWithNames;
    const repo = createMockRepository({
      findById: vi.fn().mockResolvedValue(existing),
      update: vi.fn().mockResolvedValue(updated),
    });
    const usecase = new UpsertTransactionUseCase(repo);

    const input = {
      split: [
        { categoryId: "cat-1", allocatedAmount: 500 },
        { categoryId: "cat-2", allocatedAmount: 300 },
      ],
    } as unknown as UpdateTransactionInput;

    const result = await usecase.update("tx-1", "user-1", input);

    expect(result).toBe(updated);
    expect(repo.update).toHaveBeenCalledWith("tx-1", "user-1", input);
  });

  it("rechaza cuando no puede determinar el monto (sin data.amount ni transacción existente)", async () => {
    const repo = createMockRepository({
      findById: vi.fn().mockResolvedValue(null),
    });
    const usecase = new UpsertTransactionUseCase(repo);

    const input = {
      split: [{ categoryId: "cat-1", allocatedAmount: 500 }],
    } as unknown as UpdateTransactionInput;

    await expect(usecase.update("tx-1", "user-1", input)).rejects.toThrow(
      ValidationError,
    );
    expect(repo.update).not.toHaveBeenCalled();
  });

  it("rechaza cuando el split enviado no suma el monto existente", async () => {
    const existing = {
      transaction: { amount: 800 },
    } as unknown as TransactionWithNames;
    const repo = createMockRepository({
      findById: vi.fn().mockResolvedValue(existing),
    });
    const usecase = new UpsertTransactionUseCase(repo);

    const input = {
      split: [{ categoryId: "cat-1", allocatedAmount: 500 }],
    } as unknown as UpdateTransactionInput;

    await expect(usecase.update("tx-1", "user-1", input)).rejects.toThrow(
      ValidationError,
    );
    expect(repo.update).not.toHaveBeenCalled();
  });

  it("no valida splits cuando la actualización no envía split", async () => {
    const updated = { id: "tx-1" } as unknown as TransactionWithNames;
    const repo = createMockRepository({
      update: vi.fn().mockResolvedValue(updated),
    });
    const usecase = new UpsertTransactionUseCase(repo);

    const input = { amount: 1000 } as unknown as UpdateTransactionInput;
    const result = await usecase.update("tx-1", "user-1", input);

    expect(result).toBe(updated);
    expect(repo.findById).not.toHaveBeenCalled();
  });
});
