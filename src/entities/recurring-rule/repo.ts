import type { RecurringRule } from './model/recurring-rule.entity';
import type { CreateRecurringRuleInput, UpdateRecurringRuleInput } from './model/recurring-rule.schema';

export interface IRecurringRuleRepository {
  list(userId: string): Promise<RecurringRule[]>;
  findById(id: string, userId: string): Promise<RecurringRule | null>;
  create(userId: string, data: CreateRecurringRuleInput): Promise<RecurringRule>;
  update(id: string, userId: string, data: UpdateRecurringRuleInput): Promise<RecurringRule>;
  delete(id: string, userId: string): Promise<void>;
  findCategories(ruleId: string): Promise<Array<{ categoryId: string; allocatedAmount: number }>>;
  setCategories(ruleId: string, categories: Array<{ categoryId: string; allocatedAmount: number }>): Promise<void>;
  findExistingTransaction(userId: string, ruleId: string, month: string): Promise<string | null>;
  createTransactionFromRule(
    rule: RecurringRule,
    month: import('@/shared/lib/date').Month,
    splits: Array<{ categoryId: string; allocatedAmount: number }>
  ): Promise<void>;
}
