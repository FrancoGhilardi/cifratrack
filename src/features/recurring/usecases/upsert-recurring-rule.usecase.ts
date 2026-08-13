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

  private async verifyOwnership(
    userId: string,
    paymentMethodId: string | null | undefined,
    categories: CreateRecurringRuleInput["categories"],
  ) {
    const checks: Promise<void>[] = [];

    if (paymentMethodId) {
      checks.push(
        this.repo
          .verifyPaymentMethodOwnership(userId, paymentMethodId)
          .then((owns) => {
            if (!owns) throw new ValidationError("Forma de pago inexistente");
          }),
      );
    }

    if (categories && categories.length > 0) {
      checks.push(
        this.repo
          .verifyCategoriesOwnership(
            userId,
            categories.map((c) => c.categoryId),
          )
          .then((owns) => {
            if (!owns) throw new ValidationError("Categoría inexistente");
          }),
      );
    }

    await Promise.all(checks);
  }

  async create(
    userId: string,
    data: CreateRecurringRuleInput,
  ): Promise<RecurringRule> {
    this.validateCategories(data.categories, data.amount);
    await this.verifyOwnership(userId, data.paymentMethodId, data.categories);
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
    await this.verifyOwnership(userId, data.paymentMethodId, data.categories);

    const updated = await this.repo.update(id, userId, data);
    if (data.categories !== undefined) {
      await this.repo.setCategories(id, data.categories);
    }
    return updated;
  }
}
