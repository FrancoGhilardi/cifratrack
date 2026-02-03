import type {
  CreateRecurringRuleInput,
  UpdateRecurringRuleInput,
} from '@/entities/recurring-rule/model/recurring-rule.schema';
import { apiFetch } from '@/shared/lib/api-client';
import type { ApiOk } from '@/shared/lib/types';
import type { RecurringRuleDTO } from '../model/recurring-rule.dto';

export const recurringApi = {
  async list(): Promise<RecurringRuleDTO[]> {
    const data = await apiFetch<ApiOk<RecurringRuleDTO[]>>('/api/recurring');
    return data.data;
  },

  async getById(id: string): Promise<RecurringRuleDTO> {
    const data = await apiFetch<ApiOk<RecurringRuleDTO>>(`/api/recurring/${id}`);
    return data.data;
  },

  async create(input: CreateRecurringRuleInput): Promise<RecurringRuleDTO> {
    const data = await apiFetch<ApiOk<RecurringRuleDTO>>('/api/recurring', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    return data.data;
  },

  async update(id: string, input: UpdateRecurringRuleInput): Promise<RecurringRuleDTO> {
    const data = await apiFetch<ApiOk<RecurringRuleDTO>>(`/api/recurring/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    return data.data;
  },

  async delete(id: string): Promise<void> {
    await apiFetch<void>(`/api/recurring/${id}`, { method: 'DELETE' });
  },

  async generate(month: string): Promise<void> {
    await apiFetch<void>(`/api/recurring/generate?month=${month}`, { method: 'POST' });
  },
};
