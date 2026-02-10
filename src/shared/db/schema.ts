import {
  pgTable,
  unique,
  uuid,
  varchar,
  timestamp,
  text,
  char,
  foreignKey,
  bigint,
  boolean,
  index,
  check,
  numeric,
  smallint,
  date,
  integer,
  primaryKey,
  pgEnum,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const entryKind = pgEnum("entry_kind", ["income", "expense"]);
export const recurringCadence = pgEnum("recurring_cadence", ["monthly"]);
export const transactionStatus = pgEnum("transaction_status", [
  "pending",
  "paid",
]);

export const users = pgTable(
  "users",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    username: varchar({ length: 30 }),
    email: varchar({ length: 255 }).notNull(),
    emailVerified: timestamp("email_verified", {
      withTimezone: true,
      mode: "date",
    }),
    name: varchar({ length: 120 }),
    image: text(),
    password: varchar({ length: 255 }).notNull(),
    currency: char({ length: 3 }).default("ARS").notNull(),
    timezone: varchar({ length: 64 })
      .default("America/Argentina/Mendoza")
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
    lastLoginAt: timestamp("last_login_at", {
      withTimezone: true,
      mode: "date",
    }),
  },
  (table) => [unique("users_email_key").on(table.email)],
);

export const accounts = pgTable(
  "accounts",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid("user_id").notNull(),
    type: text().notNull(),
    provider: text().notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    expiresAt: bigint("expires_at", { mode: "number" }),
    tokenType: text("token_type"),
    scope: text(),
    idToken: text("id_token"),
    sessionState: text("session_state"),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "accounts_user_id_fkey",
    }).onDelete("cascade"),
    unique("accounts_provider_provider_account_id_key").on(
      table.provider,
      table.providerAccountId,
    ),
  ],
);

export const sessions = pgTable(
  "sessions",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    sessionToken: text("session_token").notNull(),
    userId: uuid("user_id").notNull(),
    expires: timestamp({ withTimezone: true, mode: "string" }).notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "sessions_user_id_fkey",
    }).onDelete("cascade"),
    unique("sessions_session_token_key").on(table.sessionToken),
  ],
);

export const categories = pgTable(
  "categories",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid("user_id").notNull(),
    kind: entryKind().notNull(),
    name: varchar({ length: 60 }).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    isDefault: boolean("is_default").default(false).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "categories_user_id_fkey",
    }).onDelete("cascade"),
    unique("categories_user_id_kind_name_key").on(
      table.userId,
      table.kind,
      table.name,
    ),
  ],
);

export const paymentMethods = pgTable(
  "payment_methods",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid("user_id").notNull(),
    name: varchar({ length: 60 }).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    isDefault: boolean("is_default").default(false).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "payment_methods_user_id_fkey",
    }).onDelete("cascade"),
    unique("payment_methods_user_id_name_key").on(table.userId, table.name),
  ],
);

export const recurringRules = pgTable(
  "recurring_rules",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid("user_id").notNull(),
    title: varchar({ length: 120 }).notNull(),
    description: text(),
    amount: integer().notNull(),
    kind: entryKind().notNull(),
    dayOfMonth: smallint("day_of_month").notNull(),
    status: transactionStatus().default("pending").notNull(),
    paymentMethodId: uuid("payment_method_id"),
    activeFromMonth: char("active_from_month", { length: 7 }).notNull(), // YYYY-MM
    activeToMonth: char("active_to_month", { length: 7 }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_rr_user_month").using(
      "btree",
      table.userId.asc().nullsLast().op("uuid_ops"),
      table.activeFromMonth.asc().nullsLast().op("text_ops"),
    ),
    foreignKey({
      columns: [table.paymentMethodId],
      foreignColumns: [paymentMethods.id],
      name: "recurring_rules_payment_method_id_fkey",
    }).onDelete("set null"),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "recurring_rules_user_id_fkey",
    }).onDelete("cascade"),
    check("recurring_rules_amount_check", sql`amount > 0`),
    check(
      "recurring_rules_day_of_month_check",
      sql`(day_of_month >= 1) AND (day_of_month <= 31)`,
    ),
  ],
);

export const transactions = pgTable(
  "transactions",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid("user_id").notNull(),
    kind: entryKind().notNull(),
    title: varchar({ length: 120 }).notNull(),
    description: text(),
    amount: integer().notNull(),
    currency: char({ length: 3 }).default("ARS").notNull(),
    paymentMethodId: uuid("payment_method_id"),
    isFixed: boolean("is_fixed").default(false).notNull(),
    status: transactionStatus().default("paid").notNull(),
    occurredOn: date("occurred_on").notNull(),
    dueOn: date("due_on"),
    paidOn: date("paid_on"),
    occurredMonth: char("occurred_month", { length: 7 }).notNull(),
    sourceRecurringRuleId: uuid("source_recurring_rule_id"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_tx_user_date").using(
      "btree",
      table.userId.asc().nullsLast().op("uuid_ops"),
      table.occurredOn.asc().nullsLast().op("uuid_ops"),
    ),
    index("idx_tx_user_kind").using(
      "btree",
      table.userId.asc().nullsLast().op("enum_ops"),
      table.kind.asc().nullsLast().op("uuid_ops"),
    ),
    index("idx_tx_user_month").using(
      "btree",
      table.userId.asc().nullsLast().op("uuid_ops"),
      table.occurredMonth.asc().nullsLast().op("date_ops"),
    ),
    index("idx_tx_user_status").using(
      "btree",
      table.userId.asc().nullsLast().op("uuid_ops"),
      table.status.asc().nullsLast().op("enum_ops"),
    ),
    foreignKey({
      columns: [table.sourceRecurringRuleId],
      foreignColumns: [recurringRules.id],
      name: "fk_tx_recurring_rule",
    }).onDelete("set null"),
    foreignKey({
      columns: [table.paymentMethodId],
      foreignColumns: [paymentMethods.id],
      name: "transactions_payment_method_id_fkey",
    }).onDelete("set null"),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "transactions_user_id_fkey",
    }).onDelete("cascade"),
    check(
      "chk_tx_pending_due_on",
      sql`((status = 'pending'::transaction_status) AND (due_on IS NOT NULL)) OR (status = 'paid'::transaction_status)`,
    ),
    check("transactions_amount_check", sql`amount > 0`),
  ],
);

export const investments = pgTable(
  "investments",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid("user_id").notNull(),
    platform: varchar({ length: 80 }).notNull(),
    title: varchar({ length: 120 }).notNull(),
    // Link to yield_rates provider (e.g. 'mercadopago')
    yieldProviderId: varchar("yield_provider_id", { length: 50 }),
    principal: numeric({ precision: 14, scale: 2 }).notNull(),
    tna: numeric({ precision: 6, scale: 2 }).notNull(),
    days: integer(),
    isCompound: boolean("is_compound").default(false).notNull(),
    startedOn: date("started_on")
      .default(sql`CURRENT_DATE`)
      .notNull(),
    notes: text(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_investments_user").using(
      "btree",
      table.userId.asc().nullsLast().op("uuid_ops"),
    ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "investments_user_id_fkey",
    }).onDelete("cascade"),
    check("investments_days_check", sql`(days > 0) AND (days <= 36500)`),
    check("investments_principal_check", sql`principal > (0)::numeric`),
    check(
      "investments_tna_check",
      sql`(tna >= (0)::numeric) AND (tna <= 999.99)`,
    ),
  ],
);

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text().notNull(),
    token: text().notNull(),
    expires: timestamp({ withTimezone: true, mode: "string" }).notNull(),
  },
  (table) => [
    primaryKey({
      columns: [table.identifier, table.token],
      name: "verification_tokens_pkey",
    }),
    unique("verification_tokens_token_key").on(table.token),
  ],
);

export const recurringRuleCategories = pgTable(
  "recurring_rule_categories",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    recurringRuleId: uuid("recurring_rule_id").notNull(),
    categoryId: uuid("category_id").notNull(),
    allocatedAmount: integer("allocated_amount").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.categoryId],
      foreignColumns: [categories.id],
      name: "recurring_rule_categories_category_id_fkey",
    }).onDelete("restrict"),
    foreignKey({
      columns: [table.recurringRuleId],
      foreignColumns: [recurringRules.id],
      name: "recurring_rule_categories_recurring_rule_id_fkey",
    }).onDelete("cascade"),
    check(
      "recurring_rule_categories_allocated_amount_check",
      sql`allocated_amount > 0`,
    ),
  ],
);

export const transactionCategories = pgTable(
  "transaction_categories",
  {
    transactionId: uuid("transaction_id").notNull(),
    categoryId: uuid("category_id").notNull(),
    allocatedAmount: integer("allocated_amount").notNull(),
  },
  (table) => [
    index("idx_txcat_category").using(
      "btree",
      table.categoryId.asc().nullsLast().op("uuid_ops"),
    ),
    foreignKey({
      columns: [table.categoryId],
      foreignColumns: [categories.id],
      name: "transaction_categories_category_id_fkey",
    }).onDelete("restrict"),
    foreignKey({
      columns: [table.transactionId],
      foreignColumns: [transactions.id],
      name: "transaction_categories_transaction_id_fkey",
    }).onDelete("cascade"),
    primaryKey({
      columns: [table.transactionId, table.categoryId],
      name: "transaction_categories_pkey",
    }),
    check(
      "transaction_categories_allocated_amount_check",
      sql`allocated_amount > 0`,
    ),
  ],
);

/**
 * DEPRECATED: Tabla obsoleta - Ya no se usa después de eliminar YieldChart
 *
 * Esta tabla almacenaba tasas históricas de rendimiento (TNA) de diferentes proveedores
 * para mostrar gráficos de tendencia. Fue eliminada junto con la funcionalidad de YieldChart
 * en el dashboard. Ahora solo se consultan tasas en vivo directamente desde la API externa.
 *
 * Nota: La tabla todavía existe en la base de datos pero no tiene código que la use.
 * Se puede eliminar en una migración futura si se confirma que no hay datos importantes.
 */
/* export const yieldRates = pgTable(
  "yield_rates",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    providerId: text("provider_id").notNull(),
    rate: numeric("rate", { precision: 10, scale: 2 }).notNull(),
    currency: char("currency", { length: 3 }).default("ARS").notNull(),
    date: date("date").notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("yield_rates_provider_date_idx").on(
      table.providerId,
      table.date,
    ),
  ],
); */
