import type { IRecurringRuleRepository } from '@/entities/recurring-rule/repo';
import { NotFoundError } from '@/shared/lib/errors';
import { Month } from '@/shared/lib/date';

export class DeleteRecurringRuleUseCase {
  constructor(private readonly repo: IRecurringRuleRepository) {}

  async execute(id: string, userId: string) {
    const existing = await this.repo.findById(id, userId);
    if (!existing) {
      throw new NotFoundError('Regla recurrente', id);
    }

    // Si está activa, cerrarla al mes anterior; si ya tiene toMonth, borrar
    if (!existing.activeToMonth) {
      const previous = Month.current().previous().toString();
      await this.repo.update(id, userId, { activeToMonth: previous });
      return;
    }

    await this.repo.delete(id, userId);
  }
}
