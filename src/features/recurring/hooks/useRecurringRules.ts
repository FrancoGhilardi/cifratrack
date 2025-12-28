import { useQuery } from '@tanstack/react-query';
import { recurringApi } from '../api/recurring.api';
import { recurringKeys } from '../model/query-keys';

export function useRecurringRules() {
  return useQuery({
    queryKey: recurringKeys.list(),
    queryFn: () => recurringApi.list(),
  });
}

export function useRecurringRule(id: string | null) {
  return useQuery({
    queryKey: id ? recurringKeys.detail(id) : recurringKeys.detail(''),
    queryFn: () => recurringApi.getById(id!),
    enabled: !!id,
  });
}
