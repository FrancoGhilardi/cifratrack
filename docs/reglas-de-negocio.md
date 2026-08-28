# Reglas de negocio y convenciones — CifraTrack

> Documentación exhaustiva de dominio, arquitectura y convenciones. `CLAUDE.md` apunta acá
> para contexto extendido — mantener sincronizado con el código, no con la intención original.
> Última verificación contra código: 2026-08-28.

---

## 1) Principios no negociables

1. **Single Source of Truth**: un concepto vive en un solo lugar (modelo, repositorio, usecase, hook). No copiar-pegar lógica ajustada en varios componentes.
2. **Separación estricta de capas**: UI no conoce SQL ni Drizzle. Route Handlers no contienen lógica de negocio: delegan en UseCases.
3. **Dominio ≠ DTO**: los modelos de dominio no son "lo que devuelve la DB". Siempre mapear DB→Dominio y Dominio→DTO en mappers.
4. **OOP pragmática**: clases para entidades, value objects, servicios, usecases, repos. Componentes React siempre funcionales (hooks + composición); las clases no se usan como class components.
5. **Seguridad y consistencia**: cookies httpOnly, validación en frontend + backend, paginado/orden/filtros con whitelist, `userId` siempre desde la sesión — nunca desde el cliente.

Ver `CLAUDE.md` para el detalle de capas (UI → API Route → UseCase → Repository → DB) y la organización de carpetas (Feature-Sliced).

---

## 2) Modelado de dominio

### 2.1 Entidades y Value Objects
- **Entidades**: `Transaction`, `Category`, `PaymentMethod`, `Investment`, `RecurringRule`, `UserProfile`.
- **Value Objects**: `Money` (centavos), `Month`, `TransactionSplit`.
- **Servicios de dominio**: `InvestmentYieldCalculator`.
- Invariantes validadas en constructor/factory: montos > 0, TNA en rango, `days > 0`, splits por categoría suman el total.
- Patrón: `Entity.create(...)` valida invariantes; `Entity.fromPersistence(...)` salta validación (flag `skipValidation`) para datos ya persistidos en DB.

### 2.2 UseCases
Cada caso de uso es una clase que recibe repos por constructor (DI simple), aplica reglas de negocio y devuelve **entidades de dominio** (nunca rows de DB ni DTOs). El mapeo a DTO ocurre en la capa de API/mappers.

Para passthrough puro (`list`, `get-by-id`, `delete` sin reglas propias) extender las bases genéricas de `src/shared/lib/usecases/`. Si hay reglas de negocio (ver §3), escribir la clase específica sin heredar.

### 2.3 Repositorios
- Interfaz en `src/entities/*/repo.ts` (contrato de dominio).
- Implementación Drizzle en `src/features/*/repo.impl.ts`. Mapean rows ↔ entidades inmediatamente al salir de la query.

---

## 3) Reglas de negocio por feature

### 3.1 Transacciones y splits multi-categoría
- `TransactionSplit` (VO en `src/entities/transaction/model/transaction-split.vo.ts`) valida que la suma de `allocatedAmount` coincida con el monto total de la transacción, sin categorías duplicadas ni montos ≤ 0.
- Los `categoryId`/`paymentMethodId` que llegan del cliente deben pertenecer al usuario de la sesión (aislamiento multi-tenant) — las FKs solo garantizan existencia, no ownership.
- Respuesta de error uniforme para "no existe" y "existe pero es de otro usuario" (no filtrar cuál de los dos casos ocurrió).
- **Resumen del mes (`GET /api/transactions/summary?month=YYYY-MM`, `TransactionSummaryDTO`):** todos los montos en centavos.
  - `totalPaid`/`paidCount` y `totalPending`/`pendingCount` son **solo egresos** (semántica histórica: "deuda del usuario"). Un ingreso con `status: "pending"` nunca se cuenta acá.
  - `totalIncome`/`incomeCount` y `totalExpenses`/`expenseCount` son los totales del mes por tipo (`kind`), sin filtrar por `status`.
  - La agregación vive en `buildTransactionSummary` (`src/features/transactions/lib/transaction-summary.ts`), función pura que reduce filas `{ kind, status, total, count }` agrupadas por `kind` + `status` — la separa de la query de Drizzle para poder testearla sin DB.
  - Este endpoint **no** dispara la generación de recurrentes del mes (a diferencia de otras vistas que sí la disparan al entrar); es una lectura pura sobre `transactions`.

### 3.2 Categorías y formas de pago
- Tienen flag `isDefault` (seeds por usuario) y no pueden editarse el nombre/tipo si `isDefault === true` (`upsert-*.usecase.ts` lo bloquea).
- No se pueden eliminar si `isDefault === true` o si tienen transacciones asociadas (`hasTransactions` vía repo) — ver `delete-category.usecase.ts` / `delete-payment-method.usecase.ts`.

### 3.3 Recurrentes (`recurring_rules`)
- Se versionan: **no se edita el pasado**. Para cambiar una regla vigente, se cierra con `active_to_month` y se crea una nueva desde el mes siguiente.
- La generación mensual de transacciones (`generate-monthly-recurring-transactions.usecase.ts`) debe ser **idempotente**: reglas ya generadas para un mes se filtran, no se duplican.
- A diferencia de transacciones manuales, las reglas recurrentes permiten `totalSplits === 0` (reglas sin categorías asignadas) — divergencia intencional respecto a `TransactionSplit`.

### 3.4 Inversiones
- Interés simple vía `InvestmentYieldCalculator` (`src/entities/investment/services/`): `yield = principal * (tna/100) * (days/365)`, `total = principal + yield`.
- Representación de dinero: `investments.principal` es `numeric(14,2)` en DB (decimales nativos de Postgres), **no** usa la clase `Money` (que trabaja en centavos). `tna` es una tasa, no dinero. Nunca mezclar montos de inversión con `Money` sin conversión explícita — usar el helper de `src/shared/lib/utils/money-conversion.ts` si hace falta cruzar ambos mundos.

### 3.5 Seeds por usuario
Al registrarse (`src/features/auth/seeds/`) se insertan, por usuario (no compartidos globalmente):
- **Formas de pago** (`default-payment-methods.ts`): Efectivo, Transferencia, Débito, Crédito Visa, Crédito Mastercard, Otros.
- **Categorías de gasto** (`default-categories.ts`): Alquiler, Expensas, Servicios, Tarjetas, Supermercado, Transporte, Salud, Educación, Entretenimiento, Impuestos, Suscripciones, Otros.
- **Categorías de ingreso**: Sueldo, Freelance, Ingresos Extra, Rendimientos, Otros.

Todas con `isDefault: true` (ver §3.2 para las restricciones que eso implica).

### 3.6 Historial por mes
- `transactions.occurred_month` es una columna generada, indexada por `(user_id, occurred_month)`.
- Los listados **no** devuelven transacciones futuras: filtro `occurred_on <= today`.

### 3.7 Serie diaria de saldo (dashboard)
- `GET /api/dashboard/balance-series?month=YYYY-MM` → `{ ok: true, data: BalanceSeriesDTO }`.
- `BalanceSeriesDTO`: `{ month, points: [{ day, net, cumulative }], min, max, closing }`. Todos los montos en **centavos**.
- Regla de construcción (`buildBalanceSeries`, `src/features/dashboard/lib/balance-series.ts`): un punto por cada día del mes, incluidos los días sin movimientos (`net: 0`, el acumulado se sostiene); las filas fuera del mes pedido se ignoran; `min`/`max` siempre incluyen el 0 de base (así un mes íntegramente positivo o negativo no queda pegado al piso/techo del gráfico).
- Este endpoint **no** dispara la generación de transacciones recurrentes — de eso se encarga `GET /api/dashboard/summary`, que el cliente pide en paralelo (evita duplicar el trabajo de generación).

---

## 4) API / Backend: contratos

### 4.1 Respuesta estándar (`src/shared/lib/response.ts`)
```ts
type ApiOk<T> = { ok: true; data: T };
type ApiErr = { ok: false; error: { code: string; message: string; details?: unknown } };
```
Helpers: `ok()`, `err()`, `okPaginated()`. Paginado incluye `items`, `page`, `pageSize`, `total`, `totalPages` y opcionalmente `nextCursor`/`nextCursorId` para keyset.

### 4.2 Jerarquía de errores (`src/shared/lib/errors.ts`)
Todas extienden `AppError` (`code`, `statusCode`, `details?`):
`ValidationError` (400), `DomainError` (400), `AuthenticationError` (401), `AuthorizationError` (403), `NotFoundError` (404), `ConflictError` (409), `RateLimitError` (429).

### 4.3 Paginado/orden/filtros (obligatorio en endpoints de tabla)
- Query params: `page`, `pageSize` (con máximo), `sortBy`/`sortDir` (whitelist de columnas), filtros específicos por feature (`month`, `kind`, `status`, `paymentMethodId`, `categoryIds`, `q`, etc.).
- `categoryIds` puede ir como CSV.
- `userId` siempre desde la sesión (`auth()` de `src/shared/lib/auth.ts`), nunca desde query/body.

### 4.4 Endpoints existentes (`app/api/**/route.ts`)
```
POST   /api/auth/register
GET    /api/dashboard/summary?month=YYYY-MM
GET    /api/dashboard/balance-series?month=YYYY-MM
GET/POST        /api/transactions
GET/PATCH/DELETE /api/transactions/:id
GET    /api/transactions/summary?month=YYYY-MM
GET/POST        /api/categories
GET/PATCH/DELETE /api/categories/:id
GET/POST        /api/payment-methods
GET/PATCH/DELETE /api/payment-methods/:id
GET/POST        /api/investments
GET/PATCH/DELETE /api/investments/:id
GET/POST        /api/recurring
GET/PATCH/DELETE /api/recurring/:id
POST   /api/recurring/generate   (idempotente, requiere sesión — no es un cron público)
GET    /api/market-data/live     (pública, cacheada)
GET/PATCH /api/profile
PATCH  /api/profile/password
```

---

## 5) Frontend (TanStack Query + hooks)

### 5.1 Query keys
Definidas en `src/features/<feature>/model/query-keys.ts` por feature (ej. `transactionsKeys.list(filters)`, `dashboardKeys.summary(month)`). Nunca armadas a mano en componentes.

### 5.2 Mutations e invalidación
Después de crear/editar/eliminar: invalidar la lista del feature y cualquier `summary`/agregado afectado (mes, categorías, formas de pago si impactan filtros de otras pantallas).

### 5.3 Validación de formularios
Schemas Zod en `features/*/model/*.schema.ts`; `react-hook-form` siempre con `zodResolver`. El backend revalida todo igual (nunca confiar solo en la validación de cliente).

---

## 6) Seguridad

- Auth.js (NextAuth v5) con Credentials provider, sesión JWT de 7 días (`updateAge` 24h), cookies httpOnly.
- `proxy.ts` (middleware) protege todas las rutas salvo `/login`, `/register`, `/api/auth`.
- Rate limiting (`src/shared/lib/rate-limit.ts`, Upstash) sobre login/register — **fail-open** si faltan las variables de Upstash en el entorno (solo emite `console.warn`, no bloquea).
- Nunca confiar en IDs de usuario enviados por el cliente — siempre resolver `userId` desde la sesión server-side.
- Sanitizar/limitar longitud de parámetros de búsqueda libre (`q`).

---

## 7) Estándares de código TypeScript

- `strict: true` y `exactOptionalPropertyTypes: true` en `tsconfig.json`.
- Preferir `unknown` sobre `any`.
- Mappers explícitos y nombrados (ej. `mapTransactionRowToDomain`, `mapDomainToTransactionDTO`), nunca mapeo implícito/inline disperso.
- No exportar `default` salvo en componentes de página de Next.js donde es requerido por el framework.

---

## 8) Variables de entorno (`src/shared/config/env.ts`, Zod)

| Variable | Requerida | Notas |
|---|---|---|
| `DATABASE_URL` | Sí | URL válida (Postgres/Supabase) |
| `NEXTAUTH_SECRET` | Sí | Mínimo 32 caracteres |
| `NEXTAUTH_URL` | Sí | URL válida |
| `NODE_ENV` | No | `development` / `production` / `test`, default `development` |
| `UPSTASH_REDIS_REST_URL` | No | Si falta, rate limiting queda deshabilitado (fail-open) |
| `UPSTASH_REDIS_REST_TOKEN` | No | Idem |

---

## 9) Checklist al agregar una feature nueva

Ver `CLAUDE.md` §"Checklist al agregar una feature nueva" — es la versión canónica y vive ahí para no duplicar.
