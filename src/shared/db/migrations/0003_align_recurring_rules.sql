-- Alinear tablas de recurrentes con el schema actual (fase 7)

-- recurring_rules: nuevos campos y tipos
ALTER TABLE "recurring_rules"
  ADD COLUMN IF NOT EXISTS "description" text,
  ADD COLUMN IF NOT EXISTS "status" transaction_status DEFAULT 'pending' NOT NULL,
  ADD COLUMN IF NOT EXISTS "updated_at" timestamp with time zone DEFAULT now() NOT NULL;

-- convertir monto a centavos (integer)
ALTER TABLE "recurring_rules"
  ALTER COLUMN "amount" TYPE integer USING round("amount" * 100)::integer;

-- asegurar integer para day_of_month
ALTER TABLE "recurring_rules"
  ALTER COLUMN "day_of_month" TYPE integer USING "day_of_month";

-- normalizar active_from_month / active_to_month a char(7) YYYY-MM
ALTER TABLE "recurring_rules"
  ALTER COLUMN "active_from_month" TYPE char(7) USING to_char("active_from_month", 'YYYY-MM'),
  ALTER COLUMN "active_to_month" TYPE char(7) USING CASE WHEN "active_to_month" IS NULL THEN NULL ELSE to_char("active_to_month", 'YYYY-MM') END;

-- eliminar columnas obsoletas
ALTER TABLE "recurring_rules"
  DROP COLUMN IF EXISTS "currency",
  DROP COLUMN IF EXISTS "cadence",
  DROP COLUMN IF EXISTS "is_active";

-- índice útil para filtros por usuario/mes
CREATE INDEX IF NOT EXISTS "idx_rr_user_month_v2" ON "recurring_rules" ("user_id", "active_from_month");

-- recurring_rule_categories: id PK, timestamps y montos en centavos
ALTER TABLE "recurring_rule_categories"
  DROP CONSTRAINT IF EXISTS "recurring_rule_categories_pkey";

ALTER TABLE "recurring_rule_categories"
  ADD COLUMN IF NOT EXISTS "id" uuid DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS "created_at" timestamp with time zone DEFAULT now() NOT NULL;

ALTER TABLE "recurring_rule_categories"
  ALTER COLUMN "allocated_amount" TYPE integer USING round("allocated_amount" * 100)::integer;

ALTER TABLE "recurring_rule_categories"
  ADD CONSTRAINT "recurring_rule_categories_pkey" PRIMARY KEY ("id");

CREATE UNIQUE INDEX IF NOT EXISTS "idx_rrc_rule_category_unique"
  ON "recurring_rule_categories" ("recurring_rule_id", "category_id");
