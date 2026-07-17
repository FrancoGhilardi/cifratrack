import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/shared/db/client";
import {
  recurringRules,
  recurringRuleCategories,
  transactions,
  transactionCategories,
  categories,
  paymentMethods,
} from "@/shared/db/schema";
import { RecurringRule } from "@/entities/recurring-rule/model/recurring-rule.entity";
import type { IRecurringRuleRepository } from "@/entities/recurring-rule/repo";
import type {
  CreateRecurringRuleInput,
  UpdateRecurringRuleInput,
} from "@/entities/recurring-rule/model/recurring-rule.schema";
import { Month } from "@/shared/lib/date";
import { NotFoundError } from "@/shared/lib/errors";

export class RecurringRuleRepository implements IRecurringRuleRepository {
  async list(userId: string): Promise<RecurringRule[]> {
    const rows = await db
      .select()
      .from(recurringRules)
      .where(eq(recurringRules.userId, userId));

    return rows.map((row) =>
      RecurringRule.fromDB({
        id: row.id,
        userId: row.userId,
        title: row.title,
        description: row.description,
        amount: Number(row.amount),
        kind: row.kind,
        dayOfMonth: row.dayOfMonth,
        status: row.status,
        paymentMethodId: row.paymentMethodId,
        activeFromMonth: row.activeFromMonth,
        activeToMonth: row.activeToMonth,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      }),
    );
  }

  async findById(id: string, userId: string): Promise<RecurringRule | null> {
    const [row] = await db
      .select()
      .from(recurringRules)
      .where(and(eq(recurringRules.id, id), eq(recurringRules.userId, userId)))
      .limit(1);

    if (!row) return null;

    return RecurringRule.fromDB({
      id: row.id,
      userId: row.userId,
      title: row.title,
      description: row.description,
      amount: Number(row.amount),
      kind: row.kind,
      dayOfMonth: row.dayOfMonth,
      status: row.status,
      paymentMethodId: row.paymentMethodId,
      activeFromMonth: row.activeFromMonth,
      activeToMonth: row.activeToMonth,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  async create(
    userId: string,
    data: CreateRecurringRuleInput,
  ): Promise<RecurringRule> {
    const now = new Date();
    const [row] = await db
      .insert(recurringRules)
      .values({
        userId,
        title: data.title,
        description: data.description ?? null,
        amount: Math.trunc(data.amount),
        kind: data.kind,
        dayOfMonth: data.dayOfMonth,
        status: data.status ?? "pending",
        paymentMethodId: data.paymentMethodId ?? null,
        activeFromMonth: data.activeFromMonth,
        activeToMonth: data.activeToMonth ?? null,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return RecurringRule.fromDB({
      id: row.id,
      userId: row.userId,
      title: row.title,
      description: row.description,
      amount: Number(row.amount),
      kind: row.kind,
      dayOfMonth: row.dayOfMonth,
      status: row.status,
      paymentMethodId: row.paymentMethodId,
      activeFromMonth: row.activeFromMonth,
      activeToMonth: row.activeToMonth,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  async update(
    id: string,
    userId: string,
    data: UpdateRecurringRuleInput,
  ): Promise<RecurringRule> {
    const existing = await this.findById(id, userId);
    if (!existing) {
      throw new NotFoundError("Regla recurrente", id);
    }

    const now = new Date();
    const [row] = await db
      .update(recurringRules)
      .set({
        title: data.title ?? existing.title,
        description:
          data.description !== undefined
            ? data.description
            : existing.description,
        amount:
          data.amount !== undefined ? Math.trunc(data.amount) : existing.amount,
        kind: data.kind ?? existing.kind,
        dayOfMonth: data.dayOfMonth ?? existing.dayOfMonth,
        status: data.status ?? existing.status,
        paymentMethodId:
          data.paymentMethodId !== undefined
            ? data.paymentMethodId
            : existing.paymentMethodId,
        activeFromMonth:
          data.activeFromMonth ?? existing.activeFromMonth.toString(),
        activeToMonth:
          data.activeToMonth !== undefined
            ? data.activeToMonth
            : (existing.activeToMonth?.toString() ?? null),
        updatedAt: now,
      })
      .where(and(eq(recurringRules.id, id), eq(recurringRules.userId, userId)))
      .returning();

    return RecurringRule.fromDB({
      id: row.id,
      userId: row.userId,
      title: row.title,
      description: row.description,
      amount: Number(row.amount),
      kind: row.kind,
      dayOfMonth: row.dayOfMonth,
      status: row.status,
      paymentMethodId: row.paymentMethodId,
      activeFromMonth: row.activeFromMonth,
      activeToMonth: row.activeToMonth,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  async delete(id: string, userId: string): Promise<void> {
    await db
      .delete(recurringRules)
      .where(and(eq(recurringRules.id, id), eq(recurringRules.userId, userId)));
  }

  async findCategories(
    ruleId: string,
  ): Promise<Array<{ categoryId: string; allocatedAmount: number }>> {
    const categoriesByRule = await this.findCategoriesByRuleIds([ruleId]);
    return categoriesByRule[ruleId] ?? [];
  }

  async findCategoriesByRuleIds(
    ruleIds: string[],
  ): Promise<
    Record<string, Array<{ categoryId: string; allocatedAmount: number }>>
  > {
    if (ruleIds.length === 0) {
      return {};
    }

    const rows = await db
      .select({
        ruleId: recurringRuleCategories.recurringRuleId,
        categoryId: recurringRuleCategories.categoryId,
        allocatedAmount: recurringRuleCategories.allocatedAmount,
      })
      .from(recurringRuleCategories)
      .where(inArray(recurringRuleCategories.recurringRuleId, ruleIds));

    return rows.reduce<
      Record<string, Array<{ categoryId: string; allocatedAmount: number }>>
    >((acc, row) => {
      const bucket = acc[row.ruleId] ?? [];
      bucket.push({
        categoryId: row.categoryId,
        allocatedAmount: Number(row.allocatedAmount),
      });
      acc[row.ruleId] = bucket;
      return acc;
    }, {});
  }

  async setCategories(
    ruleId: string,
    categories: Array<{ categoryId: string; allocatedAmount: number }>,
  ): Promise<void> {
    await db
      .delete(recurringRuleCategories)
      .where(eq(recurringRuleCategories.recurringRuleId, ruleId));
    if (categories.length === 0) return;
    await db.insert(recurringRuleCategories).values(
      categories.map((cat) => ({
        recurringRuleId: ruleId,
        categoryId: cat.categoryId,
        allocatedAmount: Math.trunc(cat.allocatedAmount),
      })),
    );
  }

  async verifyPaymentMethodOwnership(
    userId: string,
    paymentMethodId: string,
  ): Promise<boolean> {
    const [pm] = await db
      .select({ id: paymentMethods.id })
      .from(paymentMethods)
      .where(
        and(
          eq(paymentMethods.id, paymentMethodId),
          eq(paymentMethods.userId, userId),
        ),
      )
      .limit(1);
    return Boolean(pm);
  }

  async verifyCategoriesOwnership(
    userId: string,
    categoryIds: string[],
  ): Promise<boolean> {
    if (categoryIds.length === 0) return true;
    const uniqueCategoryIds = [...new Set(categoryIds)];
    const rows = await db
      .select({ id: categories.id })
      .from(categories)
      .where(
        and(
          inArray(categories.id, uniqueCategoryIds),
          eq(categories.userId, userId),
        ),
      );
    return rows.length === uniqueCategoryIds.length;
  }

  async findExistingTransactionRuleIds(
    userId: string,
    ruleIds: string[],
    month: string,
  ): Promise<Set<string>> {
    if (ruleIds.length === 0) return new Set();

    const rows = await db
      .select({ ruleId: transactions.sourceRecurringRuleId })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          inArray(transactions.sourceRecurringRuleId, ruleIds),
          eq(transactions.occurredMonth, month),
        ),
      );

    return new Set(rows.map((row) => row.ruleId!));
  }

  async bulkCreateTransactionsFromRules(
    items: Array<{
      rule: RecurringRule;
      splits: Array<{ categoryId: string; allocatedAmount: number }>;
    }>,
    month: Month,
  ): Promise<void> {
    if (items.length === 0) return;

    const lastDayOfMonth = new Date(
      month.getYear(),
      month.getMonth(),
      0,
    ).getDate();

    await db.transaction(async (tx) => {
      const insertedRows = await tx
        .insert(transactions)
        .values(
          items.map(({ rule }) => {
            const day = Math.min(rule.dayOfMonth, lastDayOfMonth);
            const occurredOn = `${month.toString()}-${day.toString().padStart(2, "0")}`;
            const dueOn = rule.status === "pending" ? occurredOn : null;
            const paidOn = rule.status === "paid" ? occurredOn : null;

            return {
              userId: rule.userId,
              kind: rule.kind,
              title: rule.title,
              description: rule.description,
              amount: Math.trunc(rule.amount),
              paymentMethodId: rule.paymentMethodId,
              isFixed: true,
              status: rule.status,
              occurredOn,
              dueOn,
              paidOn,
              occurredMonth: month.toString(),
              sourceRecurringRuleId: rule.id,
              createdAt: new Date(),
              updatedAt: new Date(),
            };
          }),
        )
        .returning({
          id: transactions.id,
          sourceRecurringRuleId: transactions.sourceRecurringRuleId,
        });

      const transactionIdByRuleId = new Map(
        insertedRows.map((row) => [row.sourceRecurringRuleId!, row.id]),
      );

      const splitRows = items.flatMap(({ rule, splits }) => {
        const transactionId = transactionIdByRuleId.get(rule.id)!;
        return splits.map((s) => ({
          transactionId,
          categoryId: s.categoryId,
          allocatedAmount: Math.trunc(s.allocatedAmount),
        }));
      });

      if (splitRows.length > 0) {
        await tx.insert(transactionCategories).values(splitRows);
      }
    });
  }
}
