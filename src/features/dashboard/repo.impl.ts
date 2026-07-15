import { eq, and, sql } from "drizzle-orm";
import { db } from "@/shared/db/client";
import {
  transactions,
  transactionCategories,
  categories,
  paymentMethods,
} from "@/shared/db/schema";
import type { DashboardSummaryDTO } from "@/entities/dashboard/model/dashboard-summary.dto";
import type { IDashboardRepository } from "@/entities/dashboard/repo";

/**
 * Repositorio para consultas del Dashboard
 */
export class DashboardRepository implements IDashboardRepository {
  /**
   * Obtener resumen del dashboard para un mes específico
   */
  async getSummary(
    userId: string,
    month: string,
  ): Promise<DashboardSummaryDTO> {
    // Ejecutar las 4 queries en paralelo (independientes entre sí)
    const [
      totalsResult,
      expensesByCategoryResult,
      incomesByCategoryResult,
      expensesByPaymentMethodResult,
    ] = await Promise.all([
      // Totales de ingresos y egresos
      db
        .select({
          kind: transactions.kind,
          status: transactions.status,
          total: sql<number>`CAST(SUM(${transactions.amount}) AS INTEGER)`,
          count: sql<number>`CAST(COUNT(*) AS INTEGER)`,
        })
        .from(transactions)
        .where(
          and(
            eq(transactions.userId, userId),
            eq(transactions.occurredMonth, month),
          ),
        )
        .groupBy(transactions.kind, transactions.status),

      // Egresos por categoría
      db
        .select({
          categoryId: categories.id,
          categoryName: categories.name,
          total: sql<number>`CAST(SUM(${transactionCategories.allocatedAmount}) AS INTEGER)`,
        })
        .from(transactionCategories)
        .innerJoin(
          categories,
          eq(transactionCategories.categoryId, categories.id),
        )
        .innerJoin(
          transactions,
          eq(transactionCategories.transactionId, transactions.id),
        )
        .where(
          and(
            eq(transactions.userId, userId),
            eq(transactions.occurredMonth, month),
            eq(transactions.kind, "expense"),
          ),
        )
        .groupBy(categories.id, categories.name)
        .orderBy(sql`SUM(${transactionCategories.allocatedAmount}) DESC`),

      // Ingresos por categoría
      db
        .select({
          categoryId: categories.id,
          categoryName: categories.name,
          total: sql<number>`CAST(SUM(${transactionCategories.allocatedAmount}) AS INTEGER)`,
        })
        .from(transactionCategories)
        .innerJoin(
          categories,
          eq(transactionCategories.categoryId, categories.id),
        )
        .innerJoin(
          transactions,
          eq(transactionCategories.transactionId, transactions.id),
        )
        .where(
          and(
            eq(transactions.userId, userId),
            eq(transactions.occurredMonth, month),
            eq(transactions.kind, "income"),
          ),
        )
        .groupBy(categories.id, categories.name)
        .orderBy(sql`SUM(${transactionCategories.allocatedAmount}) DESC`),

      // Egresos por forma de pago
      db
        .select({
          paymentMethodId: paymentMethods.id,
          paymentMethodName: paymentMethods.name,
          total: sql<number>`CAST(SUM(${transactions.amount}) AS INTEGER)`,
        })
        .from(transactions)
        .innerJoin(
          paymentMethods,
          eq(transactions.paymentMethodId, paymentMethods.id),
        )
        .where(
          and(
            eq(transactions.userId, userId),
            eq(transactions.occurredMonth, month),
            eq(transactions.kind, "expense"),
          ),
        )
        .groupBy(paymentMethods.id, paymentMethods.name)
        .orderBy(sql`SUM(${transactions.amount}) DESC`),
    ]);

    // Procesar totales
    let totalIncome = 0;
    let totalExpenses = 0;
    let incomeCount = 0;
    let expensesCount = 0;
    let pendingCount = 0;

    for (const row of totalsResult) {
      if (row.kind === "income") {
        totalIncome += row.total || 0;
        incomeCount += row.count || 0;
      } else {
        totalExpenses += row.total || 0;
        expensesCount += row.count || 0;
      }
      if (row.status === "pending") {
        pendingCount += row.count || 0;
      }
    }

    const balance = totalIncome - totalExpenses;

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
