import { describe, it, expect, vi } from "vitest";
import { UpsertRecurringRuleUseCase } from "./upsert-recurring-rule.usecase";
import type { IRecurringRuleRepository } from "@/entities/recurring-rule/repo";
import { RecurringRule } from "@/entities/recurring-rule/model/recurring-rule.entity";
import { Month } from "@/shared/lib/date";
import { ValidationError, NotFoundError } from "@/shared/lib/errors";
import type { CreateRecurringRuleInput } from "@/entities/recurring-rule/model/recurring-rule.schema";

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
    verifyPaymentMethodOwnership: vi.fn().mockResolvedValue(true),
    verifyCategoriesOwnership: vi.fn().mockResolvedValue(true),
    findExistingTransactionRuleIds: vi.fn().mockResolvedValue(new Set()),
    bulkCreateTransactionsFromRules: vi.fn(),
    ...overrides,
  };
}

const baseInput: CreateRecurringRuleInput = {
  title: "Alquiler",
  amount: 1000,
  kind: "expense",
  dayOfMonth: 5,
  status: "pending",
  paymentMethodId: "pm-1",
  activeFromMonth: "2026-01",
  categories: [{ categoryId: "cat-1", allocatedAmount: 1000 }],
};

describe("UpsertRecurringRuleUseCase — ownership (IDOR)", () => {
  it("create: rechaza forma de pago de otro usuario sin llamar al repo.create", async () => {
    const repo = createMockRepo({
      verifyPaymentMethodOwnership: vi.fn().mockResolvedValue(false),
    });
    const usecase = new UpsertRecurringRuleUseCase(repo);

    await expect(usecase.create("user-1", baseInput)).rejects.toThrow(
      ValidationError,
    );
    expect(repo.create).not.toHaveBeenCalled();
    expect(repo.setCategories).not.toHaveBeenCalled();
  });

  it("create: rechaza categoría de otro usuario sin llamar al repo.create", async () => {
    const repo = createMockRepo({
      verifyCategoriesOwnership: vi.fn().mockResolvedValue(false),
    });
    const usecase = new UpsertRecurringRuleUseCase(repo);

    await expect(usecase.create("user-1", baseInput)).rejects.toThrow(
      ValidationError,
    );
    expect(repo.create).not.toHaveBeenCalled();
  });

  it("create: con IDs propios, crea la regla y setea categorías", async () => {
    const rule = makeRule();
    const repo = createMockRepo({ create: vi.fn().mockResolvedValue(rule) });
    const usecase = new UpsertRecurringRuleUseCase(repo);

    await usecase.create("user-1", baseInput);

    expect(repo.verifyPaymentMethodOwnership).toHaveBeenCalledWith(
      "user-1",
      "pm-1",
    );
    expect(repo.verifyCategoriesOwnership).toHaveBeenCalledWith("user-1", [
      "cat-1",
    ]);
    expect(repo.create).toHaveBeenCalledWith("user-1", baseInput);
    expect(repo.setCategories).toHaveBeenCalledWith(
      rule.id,
      baseInput.categories,
    );
  });

  it("update: rechaza forma de pago de otro usuario sin llamar al repo.update", async () => {
    const existing = makeRule();
    const repo = createMockRepo({
      findById: vi.fn().mockResolvedValue(existing),
      verifyPaymentMethodOwnership: vi.fn().mockResolvedValue(false),
    });
    const usecase = new UpsertRecurringRuleUseCase(repo);

    await expect(
      usecase.update("rule-1", "user-1", { paymentMethodId: "pm-ajeno" }),
    ).rejects.toThrow(ValidationError);
    expect(repo.update).not.toHaveBeenCalled();
  });

  it("update: rechaza categoría de otro usuario sin llamar al repo.update", async () => {
    const existing = makeRule();
    const repo = createMockRepo({
      findById: vi.fn().mockResolvedValue(existing),
      verifyCategoriesOwnership: vi.fn().mockResolvedValue(false),
    });
    const usecase = new UpsertRecurringRuleUseCase(repo);

    await expect(
      usecase.update("rule-1", "user-1", {
        categories: [{ categoryId: "cat-ajena", allocatedAmount: 1000 }],
      }),
    ).rejects.toThrow(ValidationError);
    expect(repo.update).not.toHaveBeenCalled();
  });

  it("update: regla inexistente lanza NotFoundError antes de verificar ownership", async () => {
    const repo = createMockRepo({ findById: vi.fn().mockResolvedValue(null) });
    const usecase = new UpsertRecurringRuleUseCase(repo);

    await expect(
      usecase.update("rule-x", "user-1", { paymentMethodId: "pm-1" }),
    ).rejects.toThrow(NotFoundError);
    expect(repo.verifyPaymentMethodOwnership).not.toHaveBeenCalled();
  });
});
