import type { RecurringRule } from '@/entities/recurring-rule/model/recurring-rule.entity';
import type { RecurringRuleCategoryDTO, RecurringRuleDTO } from '../model/recurring-rule.dto';

export class RecurringRuleMapper {
  static toDTO(rule: RecurringRule, categories: RecurringRuleCategoryDTO[] = []): RecurringRuleDTO {
    const base = rule.toDTO();
    return {
      ...base,
      categories,
    };
  }

  static toDTOs(
    rules: RecurringRule[],
    categoriesByRule: Record<string, RecurringRuleCategoryDTO[]> = {}
  ): RecurringRuleDTO[] {
    return rules.map((rule) => this.toDTO(rule, categoriesByRule[rule.id] ?? []));
  }
}
