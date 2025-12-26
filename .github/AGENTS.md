# AGENTS.md — Contexto de desarrollo para GitHub Copilot
**Proyecto:** CifraTrack  
**Objetivo:** App web para control personal de ingresos/egresos con dashboard, ABM de movimientos/categorías/formas de pago, inversiones, perfil y recurrentes mensuales.  
**Enfoque:** Arquitectura escalable, código mantenible, sin duplicación, y uso de POO donde tenga sentido (sin forzar React a convertirse en Java 2008).

---

## 1) Principios no negociables
1. **Single Source of Truth**
   - Un concepto vive en un solo lugar (modelo, repositorio, usecase, hook).
   - No “copiar-pegar y ajustar” lógica en 3 componentes distintos.

2. **Separación estricta de capas**
   - UI (React) **no** conoce SQL, ni Drizzle, ni queries crudas.
   - Backend (Route Handlers/Server Actions) **no** contiene lógica de negocio: delega en usecases.

3. **Dominio ≠ DTO**
   - Los modelos del dominio no son “lo que devuelve la DB”.
   - Siempre mapear **DB/DTO → Dominio** y **Dominio → DTO** en mappers.

4. **OOP pragmática**
   - Usar **clases** para: entidades, value objects, servicios, usecases, repos, validadores, cálculos.
   - Mantener componentes React como **funcionales** (hooks + composición).
   - Hooks actúan como **adaptadores** entre UI y clases/servicios.

5. **Seguridad y consistencia**
   - Autenticación con cookies httpOnly.
   - Validación en frontend + backend.
   - Paginado/orden/filtros con whitelist y protección contra inyección.
   - Nada de exponer `userId` desde el cliente para filtrar: el server usa el usuario de sesión.

---

## 2) Stack y librerías
### Frontend
- Next.js (App Router) + TypeScript (strict)
- TailwindCSS + shadcn/ui
- TanStack Query (server state)
- TanStack Table (tablas)
- Recharts (pie charts)
- react-hook-form + zod (forms)

### Backend
- Next Route Handlers (`app/api/*`) y/o Server Actions (cuando convenga)
- Auth.js (NextAuth) con Credentials **MVP** y soporte futuro para Google OAuth

### Base de datos
- PostgreSQL en Supabase
- ORM: **Drizzle ORM** + migraciones

---

## 3) Arquitectura de carpetas (referencia)
> Mantener estructura Feature-Sliced + Clean-ish: `entities` define contratos/modelos; `features` implementa y expone casos de uso; `shared` infra.

```txt
app/
  (auth)/login
  (auth)/register
  (app)/dashboard
  (app)/profile
  (app)/investments
  api/

src/
  shared/
    config/env.ts
    db/{client.ts,schema.ts,migrations/}
    lib/{auth.ts,money.ts,date.ts,errors.ts,pagination.ts}
    ui/...
  entities/
    user/
    transaction/
    category/
    payment-method/
    investment/
    recurring-rule/
  features/
    auth/
    dashboard/
    transactions/
    categories/
    payment-methods/
    investments/
    profile/
    recurring/
  widgets/
    sidebar/
    dashboard/
    tables/
```

---

## 4) POO: cómo aplicarla correctamente en CifraTrack
### 4.1 Dominio (entities/*) — SIEMPRE con clases
- **Entidades**: `Transaction`, `Category`, `PaymentMethod`, `Investment`, `RecurringRule`, `UserProfile`.
- **Value Objects**: `Money`, `Month`, `DateRange`, `Percent`.
- **Servicios de dominio**: `InvestmentYieldCalculator`, `RecurringRuleGenerator`.
- **Invariantes** dentro de constructores/factory methods:
  - montos > 0
  - TNA en rango
  - days > 0
  - splits por categoría suman el total

Ejemplo de patrón (orientativo):
- `Transaction.create({...})` valida invariantes.
- `Transaction.withSplit([...])` asegura sumatoria correcta.
- `Investment.calculateYield()` delega a `InvestmentYieldCalculator`.

### 4.2 Backend (features/*/usecases) — clases de casos de uso
Cada caso de uso es una **clase**:
- `ListTransactionsUseCase`
- `UpsertTransactionUseCase`
- `DeleteTransactionUseCase`
- `GetDashboardSummaryUseCase`
- `UpsertRecurringRuleUseCase`
- `GenerateMonthlyRecurringTransactionsUseCase`

Cada usecase:
- recibe repos por constructor (inyección simple)
- aplica validaciones/reglas de negocio
- devuelve DTOs listos para responder (o modelos de dominio según necesidad interna)

### 4.3 Repositorios — interfaces en entities, implementación en features
- `entities/*/repo.ts`: interface del repositorio (contrato)
- `features/*/repo.impl.ts`: implementación con Drizzle

**Regla:** UI nunca importa `repo.impl.ts`. UI consume hooks o services públicos del feature.

### 4.4 Frontend — POO donde tiene sentido, sin pelear con React
- **NO** usar class components.
- **SÍ** usar clases para:
  - `ApiClient` / `HttpClient`
  - `TransactionsService` (client-side) para llamar endpoints
  - `TableState` / `FiltersState` si se vuelve complejo
  - `ViewModel` opcional (cuando una pantalla requiere mucha lógica derivada)

**Hooks** como adaptadores:
- `useTransactionsTable()`:
  - crea/usa `TransactionsService`
  - arma queryKey
  - parsea filtros de URL
  - expone handlers a UI

---

## 5) Modelado de datos (Postgres + Supabase)
### Entidades principales
- `users`, `accounts`, `sessions`, `verification_tokens` (Auth.js)
- `categories` (por usuario, con defaults)
- `payment_methods` (por usuario, con defaults)
- `transactions` (movimientos)
- `transaction_categories` (split multi-categoría con `allocated_amount`)
- `investments`
- `recurring_rules` + `recurring_rule_categories`
- `transactions.source_recurring_rule_id` para rastrear origen

### Reglas clave
1. **Historial por mes**
   - `transactions.occurred_month` (generado) e índice por `(user_id, occurred_month)`
   - consultas **no** devuelven futuros: `occurred_on <= today`

2. **Múltiples categorías por movimiento**
   - `transaction_categories` con `allocated_amount`
   - Invariante: sumatoria = `transactions.amount`
   - Validar en usecase dentro de una transacción DB

3. **Recurrentes editables sin tocar pasado**
   - `recurring_rules` versionadas:
     - cerrar regla actual `active_to_month`
     - crear nueva regla desde `mes_siguiente`
   - Generación idempotente de transacciones mensuales
   - Solo gastos fijos manejan `status paid/pending` editable por mes

---

## 6) API / Backend: contratos y convenciones
### 6.1 Respuesta estándar
- Éxito:
```ts
type ApiOk<T> = { ok: true; data: T };
```
- Error:
```ts
type ApiErr = { ok: false; error: { code: string; message: string; details?: unknown } };
```

### 6.2 Paginado/orden/filtros (obligatorio)
Para endpoints de tabla:
- query params:
  - `page`, `pageSize`
  - `sortBy`, `sortDir` (whitelist)
  - filtros: `month`, `kind`, `status`, `paymentMethodId`, `categoryIds`, `q`
- respuesta:
```ts
type Paginated<T> = { items: T[]; page: number; pageSize: number; total: number };
```

**Reglas:**
- `pageSize` máximo (ej: 100).
- `sortBy` solo columnas permitidas (whitelist).
- `categoryIds` puede ser CSV.
- Siempre filtrar por `userId` desde sesión (no desde query).

### 6.3 Endpoints sugeridos (mínimos)
- `GET /api/dashboard/summary?month=YYYY-MM`
- `GET /api/transactions?...` (paginado/filtrado/orden)
- `POST /api/transactions`
- `PUT /api/transactions/:id`
- `DELETE /api/transactions/:id`
- `GET/POST/PUT/DELETE /api/categories`
- `GET/POST/PUT/DELETE /api/payment-methods`
- `GET/POST/PUT/DELETE /api/investments`
- `GET/POST/PUT/DELETE /api/recurring-rules`
- `POST /api/recurring/generate?month=YYYY-MM` (idempotente) o implícito en summary/list

---

## 7) Frontend: reglas de implementación (TanStack Query + hooks)
### 7.1 Query Keys
- Definir query keys estables en un solo lugar por feature:
  - `transactionsKeys.list(filters)`
  - `dashboardKeys.summary(month)`
  - `categoriesKeys.list()`
- No armar query keys “a mano” en componentes.

### 7.2 Mutations e invalidación
- Después de crear/editar/eliminar:
  - invalidar lista y summary del mes afectado
  - invalidar categorías / métodos de pago si impactan filtros

### 7.3 Hooks obligatorios por pantalla
- Dashboard:
  - `useDashboardSummary(month)`
- Movimientos:
  - `useTransactionsTable()` (estado tabla + query)
  - `useTransactionMutations()`
- Categorías:
  - `useCategories()`, `useCategoryMutations()`
- Formas de pago:
  - `usePaymentMethods()`, `usePaymentMethodMutations()`
- Inversiones:
  - `useInvestmentsTable()`, `useInvestmentMutations()`
- Recurrentes:
  - `useRecurringRules()`, `useRecurringRuleMutations()`

### 7.4 Tabla “Movimientos”
- Mostrar columnas:
  - Fecha (`occurred_on`)
  - Título
  - Forma de pago
  - **Ingreso** (si `kind=income`)
  - **Egreso** (si `kind=expense`)
  - Estado (`paid/pending`) si `is_fixed && kind=expense`
  - Categorías (chips)
  - Acciones (edit/delete)
- El split por categorías se edita con UI que permita asignar importes por categoría.

---

## 8) Validaciones (zod + dominio)
### Frontend (zod)
- Formularios deben tener schemas zod en `features/*/model/*.schema.ts`
- `react-hook-form` siempre con `zodResolver`

### Backend (usecases)
- Revalidar todo con zod o validadores de dominio
- Asegurar invariantes:
  - amount > 0
  - si `pending` => `due_on` requerido
  - si `paid` => `paid_on` recomendado (o set automático)
  - split: sum allocated = amount

---

## 9) Seeds por usuario (defaults)
Al crear usuario (Credentials o Google):
- Insertar defaults en:
  - `payment_methods`: Efectivo, Transferencia, Débito, Crédito Visa, Crédito Mastercard, Otros
  - `categories` expense: Alquiler, Expensas, Servicios, Tarjetas, Supermercado, Transporte, Salud, Educación, Entretenimiento, Impuestos, Suscripciones, Otros
  - `categories` income: Sueldo, Freelance, Ingresos Extra, Rendimientos, Otros

**Regla:** seeds son por usuario. No son globales compartidos.

---

## 10) Cálculo de inversiones (MVP)
Interés simple:
- `yield = principal * (tna/100) * (days/365)`
- `total = principal + yield`

Implementar en `InvestmentYieldCalculator` (clase) y testear.

---

## 11) Estándares de código (TypeScript)
- `strict: true` y `exactOptionalPropertyTypes: true`
- Preferir `unknown` sobre `any`
- Errors normalizados: `ApiError` en `shared/lib/errors.ts`
- No exportar default salvo en componentes de página cuando sea natural
- Mappers explícitos: `mapTransactionRowToDomain`, `mapDomainToTransactionDTO`

---

## 12) Seguridad
- Auth.js con cookies httpOnly
- Secrets en env
- Rate limit para login/register (middleware o capa server)
- Nunca confiar en IDs de usuario enviados por el cliente
- Sanitizar `q` (búsquedas) y limitar longitudes

---

## 13) Checklist para agregar una feature nueva (evitar duplicación)
1. Crear **entidad/modelo** (si aplica) en `entities/<x>/`
2. Definir **repo interface** en `entities/<x>/repo.ts`
3. Implementar repo Drizzle en `features/<x>/repo.impl.ts`
4. Crear **usecase class** en `features/<x>/usecases/`
5. Exponer endpoint Route Handler en `app/api/...`
6. Crear `*.api.ts` (fetcher) en `features/<x>/api/`
7. Crear hooks en `features/<x>/hooks/`
8. Construir UI en `features/<x>/ui/` o `widgets/`
9. Agregar tests mínimos del usecase/cálculos críticos

---

## 14) Convenciones de commits y PR (rápidas)
- PR debe incluir:
  - qué se agregó
  - endpoints tocados
  - migraciones nuevas
  - screenshots de UI (si aplica)
- Si se agrega un campo a DB:
  - migración
  - mapper actualizado
  - schema zod actualizado
  - invalidación de queries revisada

---

## 15) Variables de entorno (referencia)
- `DATABASE_URL` (Supabase Postgres)
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- (futuro Google)
  - `GOOGLE_CLIENT_ID`
  - `GOOGLE_CLIENT_SECRET`

---

## 16) Nota final (para Copilot)
Al generar código:
- Respetar carpetas, capas y contratos.
- Priorizar reutilización (clases/servicios/mappers/hook adapters).
- Evitar duplicar lógica en componentes.
- Mantener POO donde suma, no donde molesta.

CifraTrack no necesita “arquitectura astronauta”, pero sí necesita que el mes pasado no se reescriba solo porque editaste un recurrente hoy.
