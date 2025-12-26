import { relations } from "drizzle-orm/relations";
import { users, accounts, sessions, categories, paymentMethods, recurringRules, transactions, investments, recurringRuleCategories, transactionCategories } from "./schema";

export const accountsRelations = relations(accounts, ({one}) => ({
	user: one(users, {
		fields: [accounts.userId],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	accounts: many(accounts),
	sessions: many(sessions),
	categories: many(categories),
	paymentMethods: many(paymentMethods),
	recurringRules: many(recurringRules),
	transactions: many(transactions),
	investments: many(investments),
}));

export const sessionsRelations = relations(sessions, ({one}) => ({
	user: one(users, {
		fields: [sessions.userId],
		references: [users.id]
	}),
}));

export const categoriesRelations = relations(categories, ({one, many}) => ({
	user: one(users, {
		fields: [categories.userId],
		references: [users.id]
	}),
	recurringRuleCategories: many(recurringRuleCategories),
	transactionCategories: many(transactionCategories),
}));

export const paymentMethodsRelations = relations(paymentMethods, ({one, many}) => ({
	user: one(users, {
		fields: [paymentMethods.userId],
		references: [users.id]
	}),
	recurringRules: many(recurringRules),
	transactions: many(transactions),
}));

export const recurringRulesRelations = relations(recurringRules, ({one, many}) => ({
	paymentMethod: one(paymentMethods, {
		fields: [recurringRules.paymentMethodId],
		references: [paymentMethods.id]
	}),
	user: one(users, {
		fields: [recurringRules.userId],
		references: [users.id]
	}),
	transactions: many(transactions),
	recurringRuleCategories: many(recurringRuleCategories),
}));

export const transactionsRelations = relations(transactions, ({one, many}) => ({
	recurringRule: one(recurringRules, {
		fields: [transactions.sourceRecurringRuleId],
		references: [recurringRules.id]
	}),
	paymentMethod: one(paymentMethods, {
		fields: [transactions.paymentMethodId],
		references: [paymentMethods.id]
	}),
	user: one(users, {
		fields: [transactions.userId],
		references: [users.id]
	}),
	transactionCategories: many(transactionCategories),
}));

export const investmentsRelations = relations(investments, ({one}) => ({
	user: one(users, {
		fields: [investments.userId],
		references: [users.id]
	}),
}));

export const recurringRuleCategoriesRelations = relations(recurringRuleCategories, ({one}) => ({
	category: one(categories, {
		fields: [recurringRuleCategories.categoryId],
		references: [categories.id]
	}),
	recurringRule: one(recurringRules, {
		fields: [recurringRuleCategories.recurringRuleId],
		references: [recurringRules.id]
	}),
}));

export const transactionCategoriesRelations = relations(transactionCategories, ({one}) => ({
	category: one(categories, {
		fields: [transactionCategories.categoryId],
		references: [categories.id]
	}),
	transaction: one(transactions, {
		fields: [transactionCategories.transactionId],
		references: [transactions.id]
	}),
}));