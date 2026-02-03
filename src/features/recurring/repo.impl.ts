import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/shared/db/client";
import {
  recurringRules,
  recurringRuleCategories,
  transactions,
  transactionCategories,
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
      })
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
    data: CreateRecurringRuleInput
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
    data: UpdateRecurringRuleInput
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
        description: data.description ?? existing.description,
        amount:
          data.amount !== undefined ? Math.trunc(data.amount) : existing.amount,
        kind: data.kind ?? existing.kind,
        dayOfMonth: data.dayOfMonth ?? existing.dayOfMonth,
        status: data.status ?? existing.status,
        paymentMethodId: data.paymentMethodId ?? existing.paymentMethodId,
        activeFromMonth:
          data.activeFromMonth ?? existing.activeFromMonth.toString(),
        activeToMonth:
          data.activeToMonth ?? existing.activeToMonth?.toString() ?? null,
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
    ruleId: string
  ): Promise<Array<{ categoryId: string; allocatedAmount: number }>> {
    const categoriesByRule = await this.findCategoriesByRuleIds([ruleId]);
    return categoriesByRule[ruleId] ?? [];
  }

  async findCategoriesByRuleIds(
    ruleIds: string[]
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
    categories: Array<{ categoryId: string; allocatedAmount: number }>
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
      }))
    );
  }

  async findExistingTransaction(userId: string, ruleId: string, month: string) {
    const [row] = await db
      .select({ id: transactions.id })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          eq(transactions.sourceRecurringRuleId, ruleId),
          eq(transactions.occurredMonth, month)
        )
      )
      .limit(1);
    return row?.id ?? null;
  }

  async createTransactionFromRule(
    rule: RecurringRule,
    month: Month,
    splits: Array<{ categoryId: string; allocatedAmount: number }>
  ) {
    const occurredOn = `${month.toString()}-${rule.dayOfMonth
      .toString()
      .padStart(2, "0")}`;
    const dueOn = rule.status === "pending" ? occurredOn : null;
    const paidOn = rule.status === "paid" ? occurredOn : null;
    const [tx] = await db
      .insert(transactions)
      .values({
        userId: rule.userId,
        kind: rule.kind,
        title: rule.title,
        description: rule.description,
        amount: Math.trunc(rule.amount),
        currency: "ARS",
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
      })
      .returning();

    if (splits.length > 0) {
      await db.insert(transactionCategories).values(
        splits.map((s) => ({
          transactionId: tx.id,
          categoryId: s.categoryId,
          allocatedAmount: Math.trunc(s.allocatedAmount),
        }))
      );
    }
  }
}
