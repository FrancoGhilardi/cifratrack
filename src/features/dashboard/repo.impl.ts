import { eq, and, sql } from 'drizzle-orm';
import { db } from '@/shared/db/client';
import { transactions, transactionCategories, categories, paymentMethods } from '@/shared/db/schema';
import type { DashboardSummaryDTO } from './model/dashboard-summary.dto';

/**
 * Repositorio para consultas del Dashboard
 */
export class DashboardRepository {
  /**
   * Obtener resumen del dashboard para un mes específico
   */
  async getSummary(userId: string, month: string): Promise<DashboardSummaryDTO> {
    // Consultar totales de ingresos y egresos
    const totalsResult = await db
      .select({
        kind: transactions.kind,
        status: transactions.status,
        total: sql<number>`CAST(SUM(${transactions.amount}) AS INTEGER)`,
        count: sql<number>`CAST(COUNT(*) AS INTEGER)`,
      })
      .from(transactions)
      .where(and(eq(transactions.userId, userId), eq(transactions.occurredMonth, month)))
      .groupBy(transactions.kind, transactions.status);

    // Procesar totales
    let totalIncome = 0;
    let totalExpenses = 0;
    let incomeCount = 0;
    let expensesCount = 0;
    let pendingCount = 0;

    for (const row of totalsResult) {
      if (row.kind === 'income') {
        totalIncome += row.total || 0;
        incomeCount += row.count || 0;
      } else {
        totalExpenses += row.total || 0;
        expensesCount += row.count || 0;
      }
      if (row.status === 'pending') {
        pendingCount += row.count || 0;
      }
    }

    const balance = totalIncome - totalExpenses;

    // Consultar egresos por categoría
    const expensesByCategoryResult = await db
      .select({
        categoryId: categories.id,
        categoryName: categories.name,
        total: sql<number>`CAST(SUM(${transactionCategories.allocatedAmount}) AS INTEGER)`,
      })
      .from(transactionCategories)
      .innerJoin(categories, eq(transactionCategories.categoryId, categories.id))
      .innerJoin(transactions, eq(transactionCategories.transactionId, transactions.id))
      .where(
        and(
          eq(transactions.userId, userId),
          eq(transactions.occurredMonth, month),
          eq(transactions.kind, 'expense')
        )
      )
      .groupBy(categories.id, categories.name)
      .orderBy(sql`SUM(${transactionCategories.allocatedAmount}) DESC`);

    // Consultar ingresos por categoría
    const incomesByCategoryResult = await db
      .select({
        categoryId: categories.id,
        categoryName: categories.name,
        total: sql<number>`CAST(SUM(${transactionCategories.allocatedAmount}) AS INTEGER)`,
      })
      .from(transactionCategories)
      .innerJoin(categories, eq(transactionCategories.categoryId, categories.id))
      .innerJoin(transactions, eq(transactionCategories.transactionId, transactions.id))
      .where(
        and(
          eq(transactions.userId, userId),
          eq(transactions.occurredMonth, month),
          eq(transactions.kind, 'income')
        )
      )
      .groupBy(categories.id, categories.name)
      .orderBy(sql`SUM(${transactionCategories.allocatedAmount}) DESC`);

    // Consultar egresos por forma de pago
    const expensesByPaymentMethodResult = await db
      .select({
        paymentMethodId: paymentMethods.id,
        paymentMethodName: paymentMethods.name,
        total: sql<number>`CAST(SUM(${transactions.amount}) AS INTEGER)`,
      })
      .from(transactions)
      .innerJoin(paymentMethods, eq(transactions.paymentMethodId, paymentMethods.id))
      .where(
        and(
          eq(transactions.userId, userId),
          eq(transactions.occurredMonth, month),
          eq(transactions.kind, 'expense')
        )
      )
      .groupBy(paymentMethods.id, paymentMethods.name)
      .orderBy(sql`SUM(${transactions.amount}) DESC`);

    return {
      month,
      totalIncome,
      totalExpenses,
      balance,
      expensesByCategory: expensesByCategoryResult.map((row) => ({
        categoryId: row.categoryId,
        categoryName: row.categoryName,
        total: row.total || 0,
      })),
      incomeByCategory: incomesByCategoryResult.map((row) => ({
        categoryId: row.categoryId,
        categoryName: row.categoryName,
        total: row.total || 0,
      })),
      expensesByPaymentMethod: expensesByPaymentMethodResult.map((row) => ({
        paymentMethodId: row.paymentMethodId,
        paymentMethodName: row.paymentMethodName,
        total: row.total || 0,
      })),
      transactionsCount: {
        total: incomeCount + expensesCount,
        income: incomeCount,
        expenses: expensesCount,
        pending: pendingCount,
      },
    };
  }
}
