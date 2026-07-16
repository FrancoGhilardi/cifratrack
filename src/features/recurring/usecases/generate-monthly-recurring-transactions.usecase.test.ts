import { describe, it, expect, vi } from "vitest";
import { GenerateMonthlyRecurringTransactionsUseCase } from "./generate-monthly-recurring-transactions.usecase";
import type { IRecurringRuleRepository } from "@/entities/recurring-rule/repo";
import { RecurringRule } from "@/entities/recurring-rule/model/recurring-rule.entity";
import { Month } from "@/shared/lib/date";
import { AppError } from "@/shared/lib/errors";

function makeRule(
  overrides: Partial<Parameters<typeof RecurringRule.create>[0]> = {},
) {
  return RecurringRule.create({
    id: overrides.id ?? "rule-1",
    userId: "user-1",
    title: "Alquiler",
    amount: 1000,
    kind: "expense",
    dayOfMonth: 5,
    status: "pending",
    activeFromMonth: Month.parse("2026-01"),
    activeToMonth: null,
    ...overrides,
  });
}

function createMockRepo(
  overrides: Partial<IRecurringRuleRepository> = {},
): IRecurringRuleRepository {
  return {
    list: vi.fn().mockResolvedValue([]),
    findById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    findCategories: vi.fn(),
    findCategoriesByRuleIds: vi.fn().mockResolvedValue({}),
    setCategories: vi.fn(),
    findExistingTransactionRuleIds: vi.fn().mockResolvedValue(new Set()),
    bulkCreateTransactionsFromRules: vi.fn(),
    ...overrides,
  };
}

describe("GenerateMonthlyRecurringTransactionsUseCase", () => {
  it("no genera nada cuando no hay reglas", async () => {
    const repo = createMockRepo();
    const usecase = new GenerateMonthlyRecurringTransactionsUseCase(repo);

    await usecase.execute({ userId: "user-1", month: "2026-07" });

    expect(repo.bulkCreateTransactionsFromRules).not.toHaveBeenCalled();
  });

  it("es idempotente: reglas ya generadas para el mes se filtran", async () => {
    const rule = makeRule({ id: "rule-1" });
    const repo = createMockRepo({
      list: vi.fn().mockResolvedValue([rule]),
      findExistingTransactionRuleIds: vi
        .fn()
        .mockResolvedValue(new Set(["rule-1"])),
    });
    const usecase = new GenerateMonthlyRecurringTransactionsUseCase(repo);

    await usecase.execute({ userId: "user-1", month: "2026-07" });

    expect(repo.bulkCreateTransactionsFromRules).not.toHaveBeenCalled();
  });

  it("filtra reglas fuera del rango activeFromMonth/activeToMonth", async () => {
    const futureRule = makeRule({
      id: "rule-future",
      activeFromMonth: Month.parse("2026-08"),
    });
    const expiredRule = makeRule({
      id: "rule-expired",
      activeFromMonth: Month.parse("2025-01"),
      activeToMonth: Month.parse("2026-06"),
    });
    const activeRule = makeRule({
      id: "rule-active",
      activeFromMonth: Month.parse("2026-01"),
      activeToMonth: Month.parse("2026-12"),
    });
    const repo = createMockRepo({
      list: vi.fn().mockResolvedValue([futureRule, expiredRule, activeRule]),
    });
    const usecase = new GenerateMonthlyRecurringTransactionsUseCase(repo);

    await usecase.execute({ userId: "user-1", month: "2026-07" });

    expect(repo.findExistingTransactionRuleIds).toHaveBeenCalledWith(
      "user-1",
      ["rule-active"],
      "2026-07",
    );
    expect(repo.bulkCreateTransactionsFromRules).toHaveBeenCalledWith(
      [{ rule: activeRule, splits: [] }],
      expect.objectContaining({ toString: expect.any(Function) }),
    );
  });

  it("lanza error cuando los splits no suman el monto de la regla", async () => {
    const rule = makeRule({ id: "rule-1", amount: 1000 });
    const repo = createMockRepo({
      list: vi.fn().mockResolvedValue([rule]),
      findCategoriesByRuleIds: vi.fn().mockResolvedValue({
        "rule-1": [{ categoryId: "cat-1", allocatedAmount: 400 }],
      }),
    });
    const usecase = new GenerateMonthlyRecurringTransactionsUseCase(repo);

    await expect(
      usecase.execute({ userId: "user-1", month: "2026-07" }),
    ).rejects.toThrow(AppError);
    expect(repo.bulkCreateTransactionsFromRules).not.toHaveBeenCalled();
  });

  it("permite reglas sin splits (totalSplits === 0)", async () => {
    const rule = makeRule({ id: "rule-1", amount: 1000 });
    const repo = createMockRepo({
      list: vi.fn().mockResolvedValue([rule]),
      findCategoriesByRuleIds: vi.fn().mockResolvedValue({}),
    });
    const usecase = new GenerateMonthlyRecurringTransactionsUseCase(repo);

    await usecase.execute({ userId: "user-1", month: "2026-07" });

    expect(repo.bulkCreateTransactionsFromRules).toHaveBeenCalledWith(
      [{ rule, splits: [] }],
      expect.anything(),
    );
  });
});
