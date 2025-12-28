import type { IRecurringRuleRepository } from '@/entities/recurring-rule/repo';
import type { RecurringRule } from '@/entities/recurring-rule/model/recurring-rule.entity';

export class ListRecurringRulesUseCase {
  constructor(private readonly repo: IRecurringRuleRepository) {}

  async execute(userId: string): Promise<RecurringRule[]> {
    return this.repo.list(userId);
  }
}
