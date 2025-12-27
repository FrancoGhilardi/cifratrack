# IMPLEMENTATION_PLAN.md — Plan de implementación de CifraTrack
**Basado en:** AGENTS.md  
**Objetivo:** Guía paso a paso para construir CifraTrack siguiendo arquitectura limpia y POO pragmática.

---

## FASE 0: Setup inicial del proyecto ✓
**Estado:** Completado (Next.js + TypeScript + TailwindCSS instalado)

---

## FASE 1: Configuración de infraestructura base ✓
**Estado:** Completado  
**Objetivo:** Establecer la base técnica (DB, Auth, estructura de carpetas, libs compartidas)

### 1.1 Estructura de carpetas ✓
Crear la estructura completa según AGENTS.md:
```
src/
  shared/
    config/
    db/
    lib/
    ui/
  entities/
  features/
  widgets/
```

### 1.2 Variables de entorno ✓
- ✅ `.env.local` configurado con DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL
- ✅ `src/shared/config/env.ts` con validación zod

### 1.3 Base de datos (Drizzle + Supabase) ✓
1. Instalar dependencias:
   ```bash
   pnpm add drizzle-orm postgres
   pnpm add -D drizzle-kit
   ```

2. Configurar Drizzle:
   - `drizzle.config.ts`
   - `src/shared/db/client.ts`

3. Crear schema inicial en `src/shared/db/schema.ts`:
   - Tablas de Auth.js: `users`, `accounts`, `sessions`, `verification_tokens`
   - Tablas base: `categories`, `payment_methods`

4. ✅ Migraciones generadas y ejecutadas (0000, 0001)

### 1.4 Librerías compartidas base ✓
**Implementado en `src/shared/lib/`:**
- ✅ **errors.ts**: `AppError` base + clases de error especializadas
- ✅ **types.ts**: tipos base de API y paginación
- ✅ **response.ts**: helpers `ok()`, `err()` para respuestas tipadas
- ✅ **money.ts**: clase `Money` (value object) con operaciones
- ✅ **date.ts**: utilidades de fecha, `toYYYYMM()`, `formatMonth()`
- ✅ **pagination.ts**: validadores y tipos de paginación
- ✅ **validation.ts**: helpers zod comunes
- ✅ **utils/error-messages.ts**: `getFriendlyErrorMessage()` centralizado
- ✅ **hooks/** personalizados: `useCurrency`, `useMonthNavigation`
- ✅ **query-provider.tsx**: TanStack Query setup

---

## FASE 2: Autenticación (Auth.js + Credentials MVP) ✓
**Estado:** Completado  
**Objetivo:** Sistema de login/register funcional con cookies httpOnly

### 2.1 Instalación de Auth.js ✓
```bash
pnpm add next-auth@beta
pnpm add bcryptjs
pnpm add -D @types/bcryptjs
```

### 2.2 Entidad User (dominio) ✓
**Implementado en `src/entities/user/`:**
- ✅ `model/user.entity.ts`: clase `User` con propiedades y factory methods
- ✅ `model/user.schema.ts`: schemas zod para registro y login
- ✅ `repo.ts`: interface `IUserRepository`

### 2.3 Feature Auth ✓
**Implementado en `src/features/auth/`:**

**Repositorio:**
- `repo.impl.ts`: implementación con Drizzle
  - `findByEmail()`
  - `create()`

**Casos de uso:**
- `usecases/register-user.usecase.ts`:
  - validar email único
  - hashear password
  - crear usuario
  - insertar defaults (categories + payment_methods)
- `usecases/authenticate-user.usecase.ts`:
  - validar credenciales
  - comparar hash

**Auth.js config:**
- `src/shared/lib/auth.ts`: configuración NextAuth con Credentials provider
- Integrar usecases en callbacks

**API Routes:**
- ✅ `app/api/auth/[...nextauth]/route.ts`: handlers de Auth.js
- ✅ `app/api/auth/register/route.ts`: endpoint de registro

**Seeds:**
- ✅ `seeds/default-categories.ts`: 20 categorías por defecto (10 income, 10 expense)
- ✅ `seeds/default-payment-methods.ts`: 3 métodos por defecto (Efectivo, Débito, Crédito)

### 2.4 UI de Auth ✓
**Implementado en `app/(auth)/`:**
- ✅ `login/page.tsx`: formulario con react-hook-form + zod
- ✅ `register/page.tsx`: formulario de registro con seeds automáticos
- ✅ Hooks en `features/auth/hooks/`:
  - `useRegister()`: mutación con TanStack Query
  - `useLogin()`: autenticación con next-auth
- ✅ API integration completa con manejo de errores

**Componentes shadcn/ui integrados:**
- ✅ Button, Input, Form, Card, Label

---

## FASE 3: Dashboard básico (resumen mensual) ✓
**Estado:** Completado  
**Objetivo:** Pantalla principal con resumen de ingresos/egresos del mes

### 3.1 Extender schema DB ✓
Agregar tabla `transactions` en `src/shared/db/schema.ts`:
```ts
- id, userId, title, description
- amount (integer, centavos)
- kind (enum: 'income' | 'expense')
- status (enum: 'paid' | 'pending')
- occurred_on (date)
- occurred_month (string YYYY-MM, generado)
- due_on, paid_on
- is_fixed (boolean)
- payment_method_id
- source_recurring_rule_id
- created_at, updated_at
```

Agregar tabla `transaction_categories`:
```ts
- id
- transaction_id
- category_id
- allocated_amount
```

✅ Migración 0001 creada y ejecutada.

### 3.2 Entidades Transaction y Category ✓
**Implementado en `src/entities/transaction/`:**
- ✅ `model/transaction.entity.ts`: clase `Transaction` con factory methods
- ✅ `model/transaction-split.vo.ts`: value object `TransactionSplit`
- ✅ `model/transaction.schema.ts`: schemas zod de validación
- ✅ `repo.ts`: interface `ITransactionRepository`

**Implementado en `src/entities/category/`:**
- ✅ `model/category.entity.ts`: clase `Category`
- ✅ `model/category.schema.ts`: schemas zod (create, update)
- ✅ `repo.ts`: interface `ICategoryRepository`

**Implementado en `src/entities/payment-method/`:**
- ✅ `model/payment-method.entity.ts`: clase `PaymentMethod`
- ✅ `model/payment-method.schema.ts`: schemas zod (create, update)
- ✅ `repo.ts`: interface `IPaymentMethodRepository`

### 3.3 Feature Dashboard ✓
Crear en `src/features/dashboard/`:

**DTOs:**
- `model/dashboard-summary.dto.ts`:
  ```ts
  {
    month: string;
    totalIncome: number;
    totalExpenses: number;
    balance: number;
    expensesByCategory: Array<{ categoryId, categoryName, total }>;
    incomeByPaymentMethod: Array<{ paymentMethodId, name, total }>;
  }
  ```

**Repositorio (query especializada):**
- `repo.impl.ts`: 
  - `getSummary(userId, month)` con JOIN y GROUP BY

**Caso de uso:**
- `usecases/get-dashboard-summary.usecase.ts`:
  - recibe userId (de sesión) y month
  - consulta transactions del mes
  - calcula totales y agrupaciones
  - devuelve DTO

**API:**
- `app/api/dashboard/summary/route.ts`:
  - `GET` con query param `?month=YYYY-MM`
  - obtiene userId de sesión
  - ejecuta usecase
  - retorna `ApiOk<DashboardSummaryDTO>`

**Frontend:**
- ✅ `features/dashboard/api/dashboard.api.ts`: fetcher con tipos
- ✅ `features/dashboard/hooks/useDashboardSummary.ts`: hook con TanStack Query
- ✅ `features/dashboard/model/query-keys.ts`: factory de keys

**UI:**
- ✅ `app/(app)/dashboard/page.tsx`: página principal
- ✅ `widgets/dashboard/summary-cards.tsx`: cards con ingresos/egresos/balance
- ✅ `widgets/dashboard/expenses-chart.tsx`: gráfico de gastos por categoría (Recharts)
- ✅ `src/shared/ui/month-selector.tsx`: navegación mensual reutilizable
- ✅ `widgets/dashboard/dashboard-skeleton.tsx`: loading states

**Componentes shadcn/ui integrados:**
- ✅ Card, Button

---

## FASE 4: Categorías y Formas de Pago (ABM) ✓
**Estado:** Completado  
**Objetivo:** CRUD completo de categorías y payment methods

### 4.1 Feature Categories ✓
Crear en `src/features/categories/`:

**Repositorio:**
- `repo.impl.ts`: 
  - `list(userId, kind?)`
  - `findById(id, userId)`
  - `create(data)`
  - `update(id, userId, data)`
  - `delete(id, userId)`
  - validar que no se elimine si tiene transacciones asociadas

**Casos de uso:**
- `usecases/list-categories.usecase.ts`
- `usecases/upsert-category.usecase.ts`
- `usecases/delete-category.usecase.ts`

**API:**
- `app/api/categories/route.ts`: GET, POST
- `app/api/categories/[id]/route.ts`: PUT, DELETE

**Frontend:**
- `features/categories/api/categories.api.ts`
- `features/categories/hooks/`:
  - `useCategories()`
  - `useCategoryMutations()`
- `features/categories/ui/`:
  - `category-form.tsx`
  - `category-list.tsx`
  - `delete-category-dialog.tsx`

**UI:**
- `app/(app)/categories/page.tsx`

**Componentes shadcn/ui necesarios:**
- Dialog
- Table
- Badge

### 4.2 Feature Payment Methods ✓
**Estructura implementada:**
- ✅ `src/features/payment-methods/repo.impl.ts`: CRUD completo con validaciones
- ✅ `src/features/payment-methods/usecases/`: list, upsert, delete
- ✅ `app/api/payment-methods/`: routes GET/POST y [id] GET/PUT/DELETE
- ✅ `src/features/payment-methods/api/`: fetchers
- ✅ `src/features/payment-methods/hooks/`: usePaymentMethods, usePaymentMethodMutations
- ✅ `src/features/payment-methods/ui/`: form, list, delete dialog, skeleton
- ✅ `app/(app)/payment-methods/page.tsx`
- ✅ Navegación integrada en AppHeader
- ✅ Refactorizado con componentes compartidos: DataTable, ConfirmDialog, useDialogForm

**Componentes genéricos creados:**
- ✅ `src/shared/ui/data-table.tsx`: tabla reutilizable con columnas/acciones configurables
- ✅ `src/shared/ui/data-table-skeleton.tsx`: skeleton genérico para tablas
- ✅ `src/shared/ui/confirm-dialog.tsx`: diálogo de confirmación reutilizable
- ✅ `src/shared/lib/hooks/useDialogForm.ts`: hook para manejo de errores en forms
- ✅ `src/shared/lib/hooks/useConfirmDialog.ts`: hook para confirmaciones con errores

---

## FASE 5: Movimientos (Transactions ABM con split)
**Objetivo:** Lista paginada, filtrado, ordenamiento, CRUD con múltiples categorías

### 5.1 Feature Transactions (Backend + API Client) ✓
**Estado:** Completado  
**Implementado en `src/features/transactions/`:**

**Repositorio:**
- ✅ `repo.impl.ts` (483 líneas):
  - `list(params)` con paginado, filtros, orden
    - filtros: month, kind, status, paymentMethodId, categoryIds, q
    - JOIN con categories, payment_methods
    - sortBy: occurredOn, amount, title, status (asc/desc)
    - retorna: {data, total, page, pageSize, totalPages}
  - `findById(id, userId)` con splits y relaciones
  - `create(data, splits)` en transacción DB con validación de sumatoria
  - `update(id, userId, data, splits)` validando splits opcionales
  - `delete(id, userId)` con cascade a splits

**Casos de uso:**
- ✅ `usecases/list-transactions.usecase.ts`:
  - validar params (whitelist sortBy, límite pageSize max 100)
  - delegar a repositorio
  - mapear a DTOs
- `usecases/upsert-transaction.usecase.ts`:
  - validar splits sum = amount
- ✅ `usecases/upsert-transaction.usecase.ts`:
  - create() valida que splits sum = amount
  - update() valida splits si se proporcionan
  - validateSplits() método privado con validaciones de negocio
- ✅ `usecases/delete-transaction.usecase.ts`:
  - verificar existencia antes de eliminar

**Mappers:**
- ✅ `mappers/transaction.mapper.ts`:
  - TransactionDTO interface (18 propiedades)
  - toDTO() con manejo de Date/string para campos timestamp
  - toDTOs() para arrays

**API:**
- ✅ `app/api/transactions/route.ts`: 
  - GET: parsear 10 query params, retornar {data, meta}
  - POST: validación zod, retornar 201 con DTO
- ✅ `app/api/transactions/[id]/route.ts`: 
  - GET: con verificación de ownership
  - PUT: actualización parcial con validación
  - DELETE: eliminar con cascade

**Frontend (API Client):**
- ✅ `api/transactions.api.ts`: fetchers para todos los endpoints
  - fetchTransactions() con parámetros de filtrado
  - fetchTransactionById()
  - createTransaction()
  - updateTransaction()
  - deleteTransaction()
- ✅ `model/query-keys.ts`: factory de keys de TanStack Query
- ✅ `hooks/index.ts`: exports centralizados
- ✅ `hooks/useTransactionsTable.ts`: 
  - gestión de estado desde URL (filtros, paginación, orden)
  - updateParams(), resetFilters(), goToPage(), setSort()
- ✅ `hooks/useTransactionMutations.ts`:
  - create, update, delete con invalidación automática de queries
- ✅ `hooks/useTransaction.ts`: obtener transacción individual

**Schema updates:**
- ✅ Agregado occurredMonth (required, YYYY-MM)
- ✅ Agregado sourceRecurringRuleId (optional, uuid)
- ✅ Status cambiado de optional a required

**Validación:**
- ✅ TypeScript: 0 errores (pnpm tsc --noEmit)
- ✅ ESLint: 0 errores, 0 warnings

### 5.2 Feature Transactions (UI Components) ✓
**Estado:** Completado
**Implementado en `src/features/transactions/ui/`:**
- ✅ `transactions-table.tsx`: TanStack Table con columnas ordenables y renderizado condicional
- ✅ `transaction-form.tsx`: form con react-hook-form + zod, manejo de montos y splits
- ✅ `transaction-filters.tsx`: filtros por mes, tipo, estado, etc.
- ✅ `category-split-input.tsx`: componente complejo para asignar importes por categoría
- ✅ `transaction-dialog.tsx`: wrapper modal para el formulario

**UI:**
- ✅ `app/(app)/transactions/page.tsx`: integración completa con hooks y componentes compartidos

**Componentes shadcn/ui integrados:**
- ✅ Table, Popover, Calendar, Command, Separator, Dialog, Select, Checkbox

---

## FASE 6: Inversiones (básico con interés simple)
**Objetivo:** CRUD de inversiones con cálculo de rendimiento

### 6.1 Extender schema DB ✓
**Estado:** Completado  
Tabla `investments` implementada en migración 0000 con:
```ts
- id, userId ✓
- platform (varchar 80) - plataforma de inversión
- title (varchar 120) - nombre de la inversión
- principal (numeric 14,2) - monto invertido (decisión: decimal en lugar de centavos para mayor flexibilidad)
- tna (numeric 6,2) - tasa nominal anual
- days (integer) - duración en días
- started_on (date) - fecha de inicio
- notes (text) - descripción/notas
- created_at, updated_at ✓
- Constraints: days > 0 && days <= 36500, principal > 0, tna 0-999.99
- Índice: idx_investments_user
```

### 6.2 Entidad Investment ✓
**Estado:** Completado  
**Implementado en `src/entities/investment/`:**

**Modelo de dominio:**
- ✅ `model/investment.entity.ts`: clase `Investment`
  - Propiedades: id, userId, platform, title, principal, tna, days, startedOn, notes, timestamps
  - Validaciones de invariantes: principal > 0, tna 0-999.99, days 1-36500, startedOn no futuro
  - Factory methods: `create()` con validación, `fromDB()` sin validación
  - Métodos de negocio: `getEndDate()`, `hasEnded()`, `getDaysRemaining()`

**Schemas de validación:**
- ✅ `model/investment.schema.ts`: schemas zod
  - `createInvestmentSchema`: validación completa con refinements de decimales
  - `updateInvestmentSchema`: validación parcial
  - `investmentQuerySchema`: filtros y paginación (sortBy, active, q)

**Servicio de dominio:**
- ✅ `services/investment-yield-calculator.ts`: clase `InvestmentYieldCalculator`
  - `calculate(principal, tna, days)`: rendimiento con interés simple
  - `calculateTEA(principal, finalAmount, days)`: Tasa Efectiva Anual
  - `calculateFinalAmount(principal, tna, days)`: monto final esperado
  - `calculateDaysForTargetYield(principal, tna, targetYield)`: días para objetivo
  - Fórmula: `yield = principal × (tna / 100) × (days / 365)`
  - Todos los cálculos redondeados a 2 decimales

**Repositorio:**
- ✅ `repo.ts`: interface `IInvestmentRepository`
  - `list(userId, params)`: paginado con filtros
  - `findById(id, userId)`: búsqueda individual
  - `create(investment)`: inserción
  - `update(id, userId, data)`: actualización parcial
  - `delete(id, userId)`: eliminación
  - `count(userId)`: total de inversiones
  - `getTotalInvested(userId)`: suma de principales

**Exports centralizados:**
- ✅ `index.ts`: barrel export de entidad, schemas, servicio y repo


### 6.3 Feature Investments ✓
**Estado:** Completado  
**Implementado en `src/features/investments/`:**

**Repositorio:**
- ✅ `repo.impl.ts`: clase `InvestmentRepository` (263 líneas)
  - `list(userId, params)`: con paginado, filtros (q, active), ordenamiento
  - `findById(id, userId)`: búsqueda individual
  - `create(investment)`: inserción
  - `update(id, userId, data)`: actualización parcial
  - `delete(id, userId)`: eliminación
  - `count(userId)`: total de inversiones
  - `getTotalInvested(userId)`: suma de principales
  - Filtro especial `active`: calcula si inversión finalizó con SQL

**Casos de uso:**
- ✅ `usecases/list-investments.usecase.ts`: delegación al repositorio
- ✅ `usecases/upsert-investment.usecase.ts`:
  - `create()`: crea entidad con validación + persiste
  - `update()`: actualización parcial
  - `calculateYield()`: método de utilidad para UI
- ✅ `usecases/delete-investment.usecase.ts`: eliminación

**API:**
- ✅ `app/api/investments/route.ts`: GET (list) + POST (create)
  - GET retorna DTOs con rendimiento calculado
  - Validación con zod schemas
  - Manejo de errores tipado
- ✅ `app/api/investments/[id]/route.ts`: GET + PUT + DELETE
  - Verificación de ownership
  - DTOs con campos calculados: yield, total, endDate, hasEnded, daysRemaining

**Frontend:**
- ✅ `model/investment.dto.ts`: tipos para API (InvestmentDTO, inputs, responses)
- ✅ `model/query-keys.ts`: factory de keys de TanStack Query
- ✅ `mappers/investment.mapper.ts`: mapper explícito Dominio ↔ DTO
  - `toDTO()`: convierte Investment a DTO con rendimiento calculado
  - `toDTOs()`: batch conversion para listas
  - `fromDB()`: alias para Investment.fromDB (consistencia)
- ✅ `api/investments.api.ts`: fetchers para todos los endpoints
- ✅ `hooks/useInvestments.ts`:
  - `useInvestments(params)`: query para lista paginada
  - `useInvestment(id)`: query para detalle individual
  - `useInvestmentMutations()`: mutaciones con invalidación automática
- ✅ `hooks/index.ts`: barrel exports

**Validación:**
- ✅ TypeScript: 0 errores (pnpm tsc --noEmit)
- ✅ Correcciones aplicadas:
  - Next.js 15: params async en route handlers
  - ZodError: usar `.issues` en lugar de `.errors`
  - Investment: import normal (no type) para uso en runtime
- ✅ Mejoras aplicadas según AGENTS.md:
  - ✅ InvestmentMapper centraliza mapeo dominio ↔ DTO
  - ✅ Mejor tipado en usecase (Record<string, unknown> en lugar de any)

**Pendiente:**
- ~~UI components (investment-form, investments-table)~~
- ~~Página principal (app/(app)/investments/page.tsx)~~

### 6.4 Feature Investments (UI) ✅
**Estado:** Completado  
**Implementado:**

**Componentes UI:**
- ✅ `ui/investment-form.tsx`: formulario con react-hook-form + zod (crear/editar)
- ✅ `ui/investment-list.tsx`: tabla con TanStack Table (orden, filtros, paginación, acciones)
- ✅ `ui/delete-investment-dialog.tsx`: confirmación de eliminación con ConfirmDialog
- ✅ `ui/index.ts`: barrel exports

**Página principal:**
- ✅ `app/(app)/investments/page.tsx`: página completa
  - `useInvestmentsTable` con estado en URL, keepPreviousData y loading in situ
  - Estados: loading inicial con skeleton, refetch con overlay, empty state

**Navegación:**
- ✅ Agregado "Inversiones" al AppHeader con ícono TrendingUp

**Mejoras aplicadas:**
- ✅ useCurrency extendido con formatCurrency() para decimales directos
- ✅ Hook `useInvestmentsTable` para filtros/orden/paginación + debounced search
- ✅ Hook compartido `useDebouncedValue`
- ✅ Componentes compartidos: `TableLoadingOverlay`, `TableRowsSkeleton` para reutilizar en tablas
- ✅ TypeScript: 0 errores



---

## FASE 7: Recurrentes mensuales
**Objetivo:** Reglas versionadas + generación idempotente de transacciones

### 7.1 Extender schema DB
Agregar tabla `recurring_rules`:
```ts
- id, userId
- title, description
- amount, kind
- day_of_month (1-31)
- status (paid/pending) default
- payment_method_id
- active_from_month (YYYY-MM)
- active_to_month (YYYY-MM nullable)
- created_at, updated_at
```

Agregar tabla `recurring_rule_categories`:
```ts
- id
- recurring_rule_id
- category_id
- allocated_amount
```

### 7.2 Entidad RecurringRule
Crear en `src/entities/recurring-rule/`:
- `model/recurring-rule.entity.ts`: clase `RecurringRule`
- `model/recurring-rule.schema.ts`
- `repo.ts`: interface

### 7.3 Feature Recurring
Crear en `src/features/recurring/`:

**Repositorio:**
- `repo.impl.ts`: CRUD de reglas

**Casos de uso:**
- `usecases/list-recurring-rules.usecase.ts`
- `usecases/upsert-recurring-rule.usecase.ts`:
  - si es edición de regla activa:
    - cerrar regla actual (set `active_to_month` = mes anterior)
    - crear nueva regla desde mes actual
- `usecases/delete-recurring-rule.usecase.ts`: cerrar en mes actual
- `usecases/generate-monthly-recurring-transactions.usecase.ts`:
  - recibir `userId`, `month`
  - buscar reglas activas en ese mes
  - para cada regla:
    - verificar si ya existe transaction con `source_recurring_rule_id` + `occurred_month`
    - si no existe, crear transaction + splits
  - idempotente

**API:**
- `app/api/recurring/route.ts`: GET, POST
- `app/api/recurring/[id]/route.ts`: PUT, DELETE
- `app/api/recurring/generate/route.ts`: POST con `?month=YYYY-MM`

**Frontend:**
- `features/recurring/hooks/`:
  - `useRecurringRules()`
  - `useRecurringRuleMutations()`
- `features/recurring/ui/`:
  - `recurring-rules-list.tsx`
  - `recurring-rule-form.tsx`

**UI:**
- `app/(app)/recurring/page.tsx`

### 7.4 Integración con Dashboard
- Al cargar dashboard summary, llamar automáticamente a generate (o hacerlo en middleware)
- Mostrar badge en transactions generadas desde recurrentes

---

## FASE 8: Perfil de usuario
**Objetivo:** Pantalla de perfil con posibilidad de cambiar nombre/email/password

### 8.1 Extender entidad User
Agregar en `src/entities/user/`:
- métodos de validación para cambio de password

### 8.2 Feature Profile
Crear en `src/features/profile/`:

**Casos de uso:**
- `usecases/update-profile.usecase.ts`: cambiar nombre/email
- `usecases/change-password.usecase.ts`: verificar password actual, hashear nuevo

**API:**
- `app/api/profile/route.ts`: GET (datos actuales), PUT
- `app/api/profile/password/route.ts`: PUT

**Frontend:**
- `features/profile/hooks/`:
  - `useProfile()`
  - `useProfileMutations()`
- `features/profile/ui/`:
  - `profile-form.tsx`
  - `change-password-form.tsx`

**UI:**
- `app/(app)/profile/page.tsx`

---

## FASE 9: Layout y navegación
**Objetivo:** Sidebar, header, navegación entre secciones


### 9.1 Widgets compartidos ✓
**Estado:** Completado (27/12/2025)
Crear en `src/widgets/`:
- ✅ `sidebar/sidebar.tsx`: navegación principal (Dashboard, Movimientos, Categorías, Formas de Pago, Inversiones, Recurrentes, Perfil)
- `header/header.tsx`: usuario logueado + logout

### 9.2 Layout de app
- `app/(app)/layout.tsx`: incluir sidebar + header
- Protección de rutas con middleware o verificación de sesión

---

## FASE 10: Mejoras de UX y polish
**Objetivo:** Detalles que hacen la diferencia

### 10.1 Loading states
- Skeletons en tablas y cards
- Spinners en botones de submit

### 10.2 Toast notifications
- Instalar `sonner` o usar shadcn/ui toast
- Notificar éxito/error en mutaciones

### 10.3 Confirmaciones de eliminación
- Dialogs de confirmación antes de DELETE

### 10.4 Validación de formularios en tiempo real
- Mensajes de error debajo de inputs

### 10.5 Empty states
- Mensajes cuando no hay datos en tablas

### 10.6 Responsive design
- Mobile-first
- Sidebar colapsable en mobile

---

## FASE 11: Testing (opcional para MVP, crítico para producción)
**Objetivo:** Tests de lógica crítica

### 11.1 Unit tests
Instalar:
```bash
pnpm add -D vitest @testing-library/react @testing-library/jest-dom
```

Testear:
- Value objects: `Money`, `Month`
- Servicios de dominio: `InvestmentYieldCalculator`
- Casos de uso críticos: `UpsertTransactionUseCase` (validación de split)
- Generación de recurrentes (idempotencia)

### 11.2 Integration tests (opcional)
- Endpoints de API con datos mock

---

## FASE 12: Despliegue
**Objetivo:** Producción en Vercel

### 12.1 Preparar entorno
- Configurar variables de entorno en Vercel
- Verificar que Supabase esté en plan adecuado

### 12.2 Deploy
- Push a GitHub
- Conectar con Vercel
- Ejecutar migraciones en producción

### 12.3 Monitoreo
- Configurar logs (Vercel logs o Sentry)
- Revisar performance

---

## FASE 13: Post-MVP (futuro)
- Google OAuth (agregar provider en Auth.js)
- Reportes avanzados (gráficos de evolución temporal)
- Exportar datos a CSV/Excel
- Presupuestos por categoría
- Multi-moneda
- Tags adicionales en transactions
- Notificaciones de vencimientos (pending expenses)

---

## CHECKLIST de implementación por feature
Para cada feature nueva:
- [ ] Definir entidad/modelo en `entities/`
- [ ] Crear repo interface en `entities/`
- [ ] Implementar repo en `features/*/repo.impl.ts`
- [ ] Crear usecase(s) en `features/*/usecases/`
- [ ] Crear mappers si aplica
- [ ] Crear API route en `app/api/`
- [ ] Crear fetchers en `features/*/api/`
- [ ] Crear hooks en `features/*/hooks/`
- [ ] Crear schemas zod en `features/*/model/`
- [ ] Construir UI en `features/*/ui/` o `widgets/`
- [ ] Agregar query keys en `features/*/model/query-keys.ts`
- [ ] Invalidar queries relacionadas en mutations
- [ ] Probar manualmente o agregar test

---

## ORDEN RECOMENDADO DE EJECUCIÓN
1. ✅ **FASE 1** → infraestructura base
2. ✅ **FASE 2** → auth (bloqueante para todo lo demás)
3. ✅ **FASE 3** → dashboard básico (motivación temprana)
4. ✅ **FASE 4** → categorías y payment methods (necesario para transactions)
5. ✅ **FASE 5** → movimientos (core del sistema)
   - ✅ 5.1: Backend + API Client completo
   - ✅ 5.2: UI Components completo
6. **FASE 9** → layout y navegación (para probar todo integrado)
7. **FASE 6** → inversiones
8. **FASE 7** → recurrentes (más complejo, dejarlo para cuando el resto esté sólido)
9. **FASE 8** → perfil
10. **FASE 10** → polish y UX
11. **FASE 11** → testing
12. **FASE 12** → deploy

---

## NOTAS FINALES
- **No saltear pasos**: cada fase construye sobre la anterior
- **No copiar-pegar código**: usar mappers, servicios, hooks compartidos
- **Validar siempre en backend**: nunca confiar solo en validación frontend
- **Commits atómicos**: un commit por funcionalidad completa (repo + usecase + api + hook + ui)
- **Revisar AGENTS.md** antes de cada feature para recordar principios

---

**Última actualización:** 27 de diciembre de 2025  
**Próximo paso:** FASE 9 - Layout y navegación
