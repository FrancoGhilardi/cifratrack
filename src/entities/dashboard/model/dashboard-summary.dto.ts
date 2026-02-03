/**
 * DTO: Dashboard Summary
 *
 * Resumen financiero de un mes especifico
 */
export interface DashboardSummaryDTO {
  month: string; // formato YYYY-MM
  totalIncome: number; // en centavos
  totalExpenses: number; // en centavos
  balance: number; // en centavos
  expensesByCategory: Array<{
    categoryId: string;
    categoryName: string;
    total: number; // en centavos
  }>;
  incomeByCategory: Array<{
    categoryId: string;
    categoryName: string;
    total: number; // en centavos
  }>;
  expensesByPaymentMethod: Array<{
    paymentMethodId: string;
    paymentMethodName: string;
    total: number; // en centavos
  }>;
  transactionsCount: {
    total: number;
    income: number;
    expenses: number;
    pending: number;
  };
}
