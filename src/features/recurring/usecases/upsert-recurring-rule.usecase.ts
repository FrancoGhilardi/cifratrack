import type { IRecurringRuleRepository } from "@/entities/recurring-rule/repo";
import type {
  CreateRecurringRuleInput,
  UpdateRecurringRuleInput,
} from "@/entities/recurring-rule/model/recurring-rule.schema";
import { NotFoundError, ValidationError } from "@/shared/lib/errors";
import { RecurringRule } from "@/entities/recurring-rule/model/recurring-rule.entity";

export class UpsertRecurringRuleUseCase {
  constructor(private readonly repo: IRecurringRuleRepository) {}

  private validateCategories(
    categories: CreateRecurringRuleInput["categories"],
    amount: number,
  ) {
    if (!categories || categories.length === 0) return;
    const total = categories.reduce(
      (acc, item) => acc + item.allocatedAmount,
      0,
    );
    if (total !== amount) {
      throw new ValidationError(
        "La suma de las categorías debe coincidir con el monto total",
      );
    }
  }

  async create(
    userId: string,
    data: CreateRecurringRuleInput,
  ): Promise<RecurringRule> {
    this.validateCategories(data.categories, data.amount);
    const rule = await this.repo.create(userId, data);
    if (data.categories) {
      await this.repo.setCategories(rule.id, data.categories);
    }
    return rule;
  }

  async update(
    id: string,
    userId: string,
    data: UpdateRecurringRuleInput,
  ): Promise<RecurringRule> {
    const existing = await this.repo.findById(id, userId);
    if (!existing) {
      throw new NotFoundError("Regla recurrente", id);
    }

    const amount = data.amount ?? existing.amount;
    this.validateCategories(data.categories, amount);

    const updated = await this.repo.update(id, userId, data);
    if (data.categories !== undefined) {
      await this.repo.setCategories(id, data.categories);
    }
    return updated;
  }
}
