export interface RecurringRuleCategoryDTO {
  categoryId: string;
  allocatedAmount: number;
}

export interface RecurringRuleDTO {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  amount: number;
  kind: 'income' | 'expense';
  dayOfMonth: number;
  status: 'pending' | 'paid';
  paymentMethodId: string | null;
  activeFromMonth: string;
  activeToMonth: string | null;
  categories: RecurringRuleCategoryDTO[];
  createdAt: string;
  updatedAt: string;
}
