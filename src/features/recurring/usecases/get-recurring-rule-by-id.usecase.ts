import type { IRecurringRuleRepository } from "@/entities/recurring-rule/repo";
import { NotFoundError } from "@/shared/lib/errors";
import { RecurringRuleMapper } from "../mappers/recurring-rule.mapper";
import type { RecurringRuleDTO } from "../model/recurring-rule.dto";

/**
 * Caso de uso: Obtener regla recurrente por ID
 */
export class GetRecurringRuleByIdUseCase {
  constructor(private readonly repo: IRecurringRuleRepository) {}

  async execute(id: string, userId: string): Promise<RecurringRuleDTO> {
    const rule = await this.repo.findById(id, userId);
    if (!rule) {
      throw new NotFoundError("Regla recurrente", id);
    }

    const categories = await this.repo.findCategories(rule.id);
    return RecurringRuleMapper.toDTO(rule, categories);
  }
}
