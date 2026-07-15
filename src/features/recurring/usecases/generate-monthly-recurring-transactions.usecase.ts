import type { IRecurringRuleRepository } from "@/entities/recurring-rule/repo";
import { Month } from "@/shared/lib/date";
import { AppError } from "@/shared/lib/errors";

interface GenerateInput {
  userId: string;
  month: string; // YYYY-MM
}

export class GenerateMonthlyRecurringTransactionsUseCase {
  constructor(private readonly repo: IRecurringRuleRepository) {}

  async execute({ userId, month }: GenerateInput) {
    const targetMonth = Month.parse(month);
    const rules = await this.repo.list(userId);

    // Filtrar reglas activas en el mes
    const activeRules = rules.filter((rule) => {
      const fromOk = !rule.activeFromMonth.isAfter(targetMonth);
      const toOk =
        !rule.activeToMonth || !targetMonth.isAfter(rule.activeToMonth);
      return fromOk && toOk;
    });

    if (activeRules.length === 0) return;

    const ruleIds = activeRules.map((rule) => rule.id);

    const [existingRuleIds, categoriesByRule] = await Promise.all([
      this.repo.findExistingTransactionRuleIds(
        userId,
        ruleIds,
        targetMonth.toString(),
      ),
      this.repo.findCategoriesByRuleIds(ruleIds),
    ]);

    // Filtrar reglas pendientes de generar (idempotente)
    const pendingRules = activeRules.filter(
      (rule) => !existingRuleIds.has(rule.id),
    );
    if (pendingRules.length === 0) return;

    const itemsToCreate = pendingRules.map((rule) => {
      const splits = categoriesByRule[rule.id] ?? [];
      const totalSplits = splits.reduce(
        (acc: number, s) => acc + s.allocatedAmount,
        0,
      );
      if (totalSplits > 0 && totalSplits !== rule.amount) {
        throw new AppError(
          "La sumatoria de categorías no coincide con el monto de la regla",
          "VALIDATION_ERROR",
          400,
        );
      }
      return { rule, splits };
    });

    await this.repo.bulkCreateTransactionsFromRules(itemsToCreate, targetMonth);
  }
}
