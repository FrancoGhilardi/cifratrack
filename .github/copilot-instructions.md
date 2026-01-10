# CifraTrack - Guía para Agentes de IA

## Arquitectura del proyecto

CifraTrack es una aplicación financiera personal en Next.js con arquitectura en capas inspirada en Clean Architecture + Feature-Sliced Design:

- **`entities/`**: Contratos del dominio (modelos de negocio, repositorios interface, value objects)
- **`features/`**: Implementaciones por funcionalidad (repos con Drizzle, casos de uso, hooks React, API fetchers, UI)
- **`shared/`**: Infraestructura común (DB, auth, utilidades, componentes UI)
- **`widgets/`**: Composiciones complejas multi-feature (sidebar, dashboard cards)
- **`app/`**: Rutas Next.js (páginas y API handlers)

## Principios no negociables

1. **Single Source of Truth**: Un concepto vive en un solo lugar. No duplicar lógica entre componentes
2. **Separación estricta**: UI no conoce Drizzle/SQL; Backend no contiene lógica de negocio (usa usecases)
3. **Dominio ≠ DTO**: Siempre mapear explícitamente entre DB ↔ Domain ↔ DTO
4. **OOP pragmática**: Usar clases para entidades, value objects, servicios, usecases, repositorios. React se mantiene funcional
5. **userId desde sesión**: Nunca confiar en IDs de usuario del cliente; obtener desde `await auth()`

## Stack tecnológico

- **Frontend**: Next.js App Router, TypeScript strict, TailwindCSS, shadcn/ui, TanStack Query/Table, react-hook-form + zod
- **Backend**: Next.js Route Handlers, Auth.js (credentials MVP), Drizzle ORM
- **DB**: PostgreSQL en Supabase

## Patrones de código

### Entidades (entities/)

Siempre clases con validación en constructor:

```ts
// entities/transaction/model/transaction.entity.ts
class Transaction {
  constructor(...) {
    this.validate(); // Invariantes: amount > 0, split suma total
  }
  static create(data) { /* factory method */ }
}
```

### Value Objects

```ts
// shared/lib/money.ts
class Money {
  private readonly cents: number; // Inmutable, centavos para evitar decimales
  static fromPesos(pesos: number): Money;
  toPesos(): number;
}
```

### Repositorios

- Interface en `entities/*/repo.ts`
- Implementación Drizzle en `features/*/repo.impl.ts`
- UI nunca importa `repo.impl.ts`

### Casos de uso

Clases con inyección de dependencias:

```ts
// features/transactions/usecases/upsert-transaction.usecase.ts
class UpsertTransactionUseCase {
  constructor(private repository: TransactionRepository) {}

  async create(userId: string, data: CreateTransactionInput) {
    this.validateSplits(data.amount, data.split); // Validaciones de negocio
    return this.repository.create(userId, data);
  }
}
```

### API Handlers

Delegan a usecases:

```ts
// app/api/transactions/route.ts
const repository = new TransactionRepository();
const usecase = new ListTransactionsUseCase(repository);

export async function GET(request: NextRequest) {
  const session = await auth(); // userId desde sesión
  const result = await usecase.execute({ userId: session.user.id, ...params });
  return NextResponse.json({ data: result });
}
```

### Frontend Hooks

Adaptadores entre React y servicios:

```ts
// features/transactions/hooks/useTransactionsTable.ts
export function useTransactionsTable() {
  const searchParams = useSearchParams(); // Filtros desde URL
  const params = useMemo(() => ({ /* parse params */ }), [searchParams]);

  const query = useQuery({
    queryKey: transactionKeys.list(params), // Query keys centralizadas
    queryFn: () => fetchTransactions(params),
  });

  const updateParams = useCallback((newParams) => { /* actualizar URL */ }, []);
  return { data: query.data, updateParams, ... };
}
```

## Modelo de datos crítico

### Transacciones multi-categoría

- `transactions` tiene `amount` total
- `transaction_categories` tiene múltiples filas con `allocated_amount` por categoría
- **Invariante**: `sum(allocated_amount) === transactions.amount`
- Validar en usecase dentro de transacción DB

### Recurrentes sin afectar el pasado

- Al editar `recurring_rules`: cerrar regla actual con `active_to_month`, crear nueva desde mes siguiente
- `transactions.source_recurring_rule_id` rastrea origen
- Generación mensual idempotente (no duplicar)

### Inversiones con interés simple

```ts
yield = principal * (tna / 100) * (days / 365);
total = principal + yield;
```

Implementado en `InvestmentYieldCalculator` (clase de servicio).

## API: Respuestas estándar

```ts
type ApiOk<T> = { ok: true; data: T };
type ApiErr = { ok: false; error: { code: string; message: string } };
type Paginated<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
};
```

Endpoints de tabla **siempre** incluyen:

- Paginación: `page`, `pageSize` (máx 100)
- Orden: `sortBy` (whitelist), `sortOrder`
- Filtros: `month` (YYYY-MM), `kind`, `status`, `categoryIds` (CSV), `q`

## Flujo para agregar features

1. Modelo/entidad en `entities/<name>/model/*.entity.ts`
2. Interface repo en `entities/<name>/repo.ts`
3. Implementación repo en `features/<name>/repo.impl.ts`
4. Usecase clase en `features/<name>/usecases/*.usecase.ts`
5. API handler en `app/api/<name>/route.ts`
6. Fetcher en `features/<name>/api/*.api.ts`
7. Hooks en `features/<name>/hooks/use*.ts`
8. UI en `features/<name>/ui/*.tsx`

## Comandos clave

```bash
pnpm dev                 # Desarrollo
pnpm build              # Build producción
pnpm db:push            # Sincronizar schema con DB (desarrollo)
pnpm db:studio          # Drizzle Studio para explorar DB
```

## Path aliases

```ts
@/*           -> raíz del proyecto
@/shared/*    -> src/shared/*
@/entities/*  -> src/entities/*
@/features/*  -> src/features/*
@/widgets/*   -> src/widgets/*
@/app/*       -> app/*
```

## Validación

- **Frontend**: Schemas zod + `zodResolver` con react-hook-form
- **Backend**: Revalidar con zod o validadores de dominio en usecases
- Nunca confiar en validación del cliente

## Seeds por usuario

Al registrar usuario, insertar defaults:

- Payment methods: Efectivo, Transferencia, Débito, Crédito Visa/Mastercard, Otros
- Categories expense: Alquiler, Expensas, Servicios, Tarjetas, Supermercado, Transporte, Salud, Educación, etc.
- Categories income: Sueldo, Freelance, Ingresos Extra, Rendimientos, Otros

**Importante**: Seeds son por usuario, no globales.

## Convenciones TypeScript

- `strict: true`
- Preferir `unknown` sobre `any`
- Mappers explícitos para conversiones (DB ↔ Domain ↔ DTO)
- Errors normalizados en `shared/lib/errors.ts` (`ValidationError`, `NotFoundError`, `UnauthorizedError`)
- No export default salvo páginas Next.js

## Convenciones de nomenclatura

### Archivos y directorios

- **kebab-case** para archivos: `transaction.entity.ts`, `upsert-transaction.usecase.ts`, `use-transactions-table.ts`
- **PascalCase** para componentes React: `TransactionForm.tsx`, `InvestmentSummaryCards.tsx`
- Sufijos descriptivos:
  - `.entity.ts` para entidades de dominio
  - `.schema.ts` para schemas zod
  - `.dto.ts` para DTOs
  - `.usecase.ts` para casos de uso
  - `.repo.ts` para interfaces de repositorio
  - `.impl.ts` para implementaciones (`repo.impl.ts`)
  - `.mapper.ts` para mappers
  - `.api.ts` para fetchers de API

### Clases y tipos

- **PascalCase** para clases: `Transaction`, `TransactionRepository`, `UpsertTransactionUseCase`
- **PascalCase** para interfaces con prefijo `I` solo en repos: `ITransactionRepository`
- **PascalCase** para tipos y DTOs: `TransactionDTO`, `CreateTransactionInput`, `PaginatedResponse<T>`
- **camelCase** para métodos y propiedades: `calculateYield()`, `occurredOn`, `userId`

### Hooks y funciones

- **camelCase** con prefijo `use` para hooks: `useTransactionsTable()`, `useInvestmentMutations()`
- **camelCase** para funciones: `fetchTransactions()`, `formatCurrency()`, `validateSplits()`
- Pattern para hooks:
  - `use[Feature]` para query único: `useProfile()`, `useTransaction(id)`
  - `use[Feature]s` para lista: `useCategories()`, `usePaymentMethods()`
  - `use[Feature]sTable` para tablas con estado: `useTransactionsTable()`, `useInvestmentsTable()`
  - `use[Feature]Mutations` para mutaciones: `useTransactionMutations()`, `useCategoryMutations()`

### Componentes UI

- **PascalCase** con sufijo descriptivo:
  - `*Form` para formularios: `TransactionForm`, `InvestmentForm`
  - `*Dialog` para modales: `TransactionDialog`, `DeleteInvestmentDialog`
  - `*Table` para tablas: `TransactionsTable`, `InvestmentsTable`
  - `*List` para listas: `InvestmentList`, `RecurringRulesList`
  - `*Card` para tarjetas: `InvestmentSummaryCards`, `DashboardCard`
  - `*Skeleton` para loading states: `InvestmentListSkeleton`

### Casos de uso

- Pattern: `[Action][Feature]UseCase`
- Ejemplos: `UpsertTransactionUseCase`, `DeleteCategoryUseCase`, `GetDashboardSummaryUseCase`, `GenerateMonthlyRecurringTransactionsUseCase`

### Variables y constantes

- **SCREAMING_SNAKE_CASE** para constantes globales: `API_BASE`, `SORT_COLUMN_MAP`, `MAX_PAGE_SIZE`
- **camelCase** para variables locales: `userId`, `totalAmount`, `occurredMonth`

### API y Database

- **snake_case** para columnas DB: `occurred_on`, `payment_method_id`, `is_active`, `created_at`
- **snake_case** para query params de API: `sort_by`, `sort_order` (pero internamente mapeado desde camelCase del frontend)
- **kebab-case** para rutas API: `/api/transactions`, `/api/payment-methods`, `/api/recurring/generate`

## Migraciones de base de datos

### Workflow con Drizzle

1. **Modificar schema**: Editar `src/shared/db/schema.ts`
2. **Push en desarrollo**: `pnpm db:push` (sincroniza sin crear migración)
3. **Generar migración**: `pnpm drizzle-kit generate` (cuando estés listo para versionar)
4. **Aplicar en producción**: Las migraciones se aplican automáticamente en el pipeline

### Convenciones para migraciones

```sql
-- Estructura típica de una migración:
-- 1. Comentario descriptivo
-- 2. ALTER TABLE para modificaciones
-- 3. Conversión de datos cuando sea necesario
-- 4. Índices nuevos o actualizados
-- 5. Limpiar constraints/triggers obsoletos

-- Ejemplo: Migración de montos a centavos
ALTER TABLE "transactions"
  ALTER COLUMN "amount" TYPE integer USING round("amount" * 100)::integer;

-- Ejemplo: Trigger para campo calculado
CREATE OR REPLACE FUNCTION update_transaction_occurred_month()
RETURNS TRIGGER AS $$
BEGIN
  NEW.occurred_month := to_char(NEW.occurred_on, 'YYYY-MM');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_transaction_occurred_month
  BEFORE INSERT OR UPDATE OF occurred_on ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_transaction_occurred_month();
```

### Reglas para migraciones

- **Nombres descriptivos**: `0001_add_recurring_rules.sql`, `0002_fix_occurred_month.sql`
- **Usar IF EXISTS/IF NOT EXISTS**: Para idempotencia (`ALTER TABLE IF EXISTS`, `DROP COLUMN IF EXISTS`)
- **Conversión segura**: Usar `USING` cuando cambies tipos de dato
- **Preservar datos**: Nunca hacer `DROP TABLE` sin respaldo, preferir `ALTER COLUMN`
- **Índices críticos**: Siempre indexar `(user_id, *)` para queries por usuario
- **Formato de fechas**: Usar `char(7)` para meses en formato `YYYY-MM`
- **Montos en centavos**: Siempre `integer`, conversión con `round(amount * 100)::integer`

### Ejemplos del proyecto

- Ver [migrations/0002_fix_occurred_month.sql](src/shared/db/migrations/0002_fix_occurred_month.sql) para triggers
- Ver [migrations/0003_align_recurring_rules.sql](src/shared/db/migrations/0003_align_recurring_rules.sql) para ALTER complejos con conversión de tipos

## Referencias rápidas

- Modelo transacción: [src/entities/transaction/model/transaction.entity.ts](src/entities/transaction/model/transaction.entity.ts)
- Repo impl ejemplo: [src/features/transactions/repo.impl.ts](src/features/transactions/repo.impl.ts)
- Usecase ejemplo: [src/features/transactions/usecases/upsert-transaction.usecase.ts](src/features/transactions/usecases/upsert-transaction.usecase.ts)
- Hook tabla ejemplo: [src/features/transactions/hooks/useTransactionsTable.ts](src/features/transactions/hooks/useTransactionsTable.ts)
- Schema DB: [src/shared/db/schema.ts](src/shared/db/schema.ts)
- Value Objects: [src/shared/lib/money.ts](src/shared/lib/money.ts), [src/shared/lib/date.ts](src/shared/lib/date.ts)
