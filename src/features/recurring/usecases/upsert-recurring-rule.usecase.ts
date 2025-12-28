import { Month } from '@/shared/lib/date';
import type { IRecurringRuleRepository } from '@/entities/recurring-rule/repo';
import type { CreateRecurringRuleInput, UpdateRecurringRuleInput } from '@/entities/recurring-rule/model/recurring-rule.schema';
import { NotFoundError, ValidationError } from '@/shared/lib/errors';
import { RecurringRule } from '@/entities/recurring-rule/model/recurring-rule.entity';

export class UpsertRecurringRuleUseCase {
  constructor(private readonly repo: IRecurringRuleRepository) {}

  private validateCategories(categories: CreateRecurringRuleInput['categories'], amount: number) {
    if (!categories || categories.length === 0) return;
    const total = categories.reduce((acc, item) => acc + item.allocatedAmount, 0);
    if (total !== amount) {
      throw new ValidationError('La suma de las categorías debe coincidir con el monto total');
    }
  }

  async create(userId: string, data: CreateRecurringRuleInput): Promise<RecurringRule> {
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
    data: UpdateRecurringRuleInput
  ): Promise<RecurringRule> {
    const existing = await this.repo.findById(id, userId);
    if (!existing) {
      throw new NotFoundError('Regla recurrente', id);
    }

    const amount = data.amount ?? existing.amount;
    this.validateCategories(data.categories, amount);

    // Si es una regla activa y cambia algo relevante, cerrarla y versionar
    if (!existing.activeToMonth) {
      const hasChanges =
        data.title !== undefined ||
        data.description !== undefined ||
        data.amount !== undefined ||
        data.kind !== undefined ||
        data.dayOfMonth !== undefined ||
        data.status !== undefined ||
        data.paymentMethodId !== undefined ||
        data.categories !== undefined;

      if (hasChanges) {
        const currentMonth = Month.current();
        const closeMonth = currentMonth.previous();
        // Evitar que el cierre quede antes del inicio original
        const safeCloseMonth = closeMonth.isBefore(existing.activeFromMonth) ? existing.activeFromMonth : closeMonth;
        await this.repo.update(id, userId, { activeToMonth: safeCloseMonth.toString() });

        const newStartMonth = currentMonth;
        const requestedEnd = data.activeToMonth ? Month.parse(data.activeToMonth) : null;
        if (requestedEnd && requestedEnd.isBefore(newStartMonth)) {
          throw new ValidationError(
            `El mes de fin (${requestedEnd.toString()}) no puede ser anterior al mes de inicio de la nueva versión (${newStartMonth.toString()})`
          );
        }

        const activeToMonth = requestedEnd ? requestedEnd.toString() : undefined;
        const newRule = await this.repo.create(userId, {
          title: data.title ?? existing.title,
          description: data.description ?? existing.description ?? undefined,
          amount,
          kind: data.kind ?? existing.kind,
          dayOfMonth: data.dayOfMonth ?? existing.dayOfMonth,
          status: data.status ?? existing.status,
          paymentMethodId: data.paymentMethodId ?? existing.paymentMethodId ?? undefined,
          activeFromMonth: newStartMonth.toString(),
          activeToMonth,
        });
        const categories = data.categories ?? (await this.repo.findCategories(existing.id));
        await this.repo.setCategories(newRule.id, categories);

        return newRule;
      }
    }

    const updated = await this.repo.update(id, userId, data);
    if (data.categories !== undefined) {
      await this.repo.setCategories(id, data.categories);
    }
    return updated;
  }
}
