import type { IRecurringRuleRepository } from "@/entities/recurring-rule/repo";
import type { RecurringRuleDTO } from "../model/recurring-rule.dto";
import { RecurringRuleMapper } from "../mappers/recurring-rule.mapper";

export class ListRecurringRulesUseCase {
  constructor(private readonly repo: IRecurringRuleRepository) {}

  async execute(userId: string): Promise<RecurringRuleDTO[]> {
    const rules = await this.repo.list(userId);
    const ruleIds = rules.map((rule) => rule.id);
    const categoriesByRule = await this.repo.findCategoriesByRuleIds(ruleIds);
    return RecurringRuleMapper.toDTOs(rules, categoriesByRule);
  }
}
