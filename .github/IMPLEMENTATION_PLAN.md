# IMPLEMENTATION_PLAN.md — Plan de implementación de CifraTrack
**Basado en:** AGENTS.md  
**Objetivo:** Guía paso a paso para construir CifraTrack siguiendo arquitectura limpia y POO pragmática.

---

## FASE 0: Setup inicial del proyecto ✓
**Estado:** Completado (Next.js + TypeScript + TailwindCSS instalado)

---

## FASE 1: Configuración de infraestructura base
**Objetivo:** Establecer la base técnica (DB, Auth, estructura de carpetas, libs compartidas)

### 1.1 Estructura de carpetas
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

### 1.2 Variables de entorno
- Crear `.env.local` con:
  - `DATABASE_URL` (Supabase)
  - `NEXTAUTH_SECRET`
  - `NEXTAUTH_URL`
- Crear `src/shared/config/env.ts` con validación zod

### 1.3 Base de datos (Drizzle + Supabase)
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

4. Generar y ejecutar primera migración

### 1.4 Librerías compartidas base
Crear en `src/shared/lib/`:
- **errors.ts**: `ApiError`, `DomainError`, `ValidationError`
- **types.ts**: `ApiOk<T>`, `ApiErr`, `Paginated<T>`
- **response.ts**: helpers `ok()`, `err()`, `paginated()`
- **money.ts**: clase `Money` (value object)
- **date.ts**: utilidades de fecha, clase `Month`, `DateRange`
- **pagination.ts**: `PaginationParams`, validadores de sort/filter
- **validation.ts**: helpers de validación zod comunes

---

## FASE 2: Autenticación (Auth.js + Credentials MVP)
**Objetivo:** Sistema de login/register funcional con cookies httpOnly

### 2.1 Instalación de Auth.js
```bash
pnpm add next-auth@beta
pnpm add bcryptjs
pnpm add -D @types/bcryptjs
```

### 2.2 Entidad User (dominio)
Crear en `src/entities/user/`:
- `model/user.entity.ts`: clase `User` (id, email, name, hashedPassword, createdAt)
- `model/user.schema.ts`: schemas zod (registro, login)
- `repo.ts`: interface `IUserRepository`

### 2.3 Feature Auth
Crear en `src/features/auth/`:

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
- Next.js Auth.js maneja automáticamente `app/api/auth/[...nextauth]/route.ts`

**Seeds:**
- `seeds/default-categories.ts`: lista de categorías por defecto
- `seeds/default-payment-methods.ts`: lista de formas de pago

### 2.4 UI de Auth
Crear en `app/(auth)/`:
- `login/page.tsx`: formulario con react-hook-form + zod
- `register/page.tsx`: formulario de registro
- Hooks en `features/auth/hooks/`:
  - `useRegister()`
  - `useLogin()`

**Componentes shadcn/ui necesarios:**
- Button
- Input
- Form
- Card

---

## FASE 3: Dashboard básico (resumen mensual)
**Objetivo:** Pantalla principal con resumen de ingresos/egresos del mes

### 3.1 Extender schema DB
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

Crear migración.

### 3.2 Entidades Transaction y Category
Crear en `src/entities/transaction/`:
- `model/transaction.entity.ts`: clase `Transaction`
  - factory method `create()`
  - método `withSplit()` para validar split
- `model/transaction-split.vo.ts`: value object `TransactionSplit`
- `model/transaction.schema.ts`: schemas zod
- `repo.ts`: interface `ITransactionRepository`

Crear en `src/entities/category/`:
- `model/category.entity.ts`: clase `Category`
- `model/category.schema.ts`: schemas zod
- `repo.ts`: interface `ICategoryRepository`

Crear en `src/entities/payment-method/`:
- `model/payment-method.entity.ts`: clase `PaymentMethod`
- `model/payment-method.schema.ts`: schemas zod
- `repo.ts`: interface `IPaymentMethodRepository`

### 3.3 Feature Dashboard
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
- `features/dashboard/api/dashboard.api.ts`: fetcher
- `features/dashboard/hooks/useDashboardSummary.ts`: hook con TanStack Query
- `features/dashboard/model/query-keys.ts`: `dashboardKeys.summary(month)`

**UI:**
- `app/(app)/dashboard/page.tsx`
- `widgets/dashboard/summary-cards.tsx`: cards de ingreso/egreso/balance
- `widgets/dashboard/expenses-chart.tsx`: pie chart con Recharts
- Selector de mes (prev/next)

**Componentes shadcn/ui necesarios:**
- Card
- Select (para mes)

---

## FASE 4: Categorías y Formas de Pago (ABM)
**Objetivo:** CRUD completo de categorías y payment methods

### 4.1 Feature Categories
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

### 4.2 Feature Payment Methods
Estructura idéntica a categories:
- `src/features/payment-methods/`
- `app/api/payment-methods/`
- `app/(app)/payment-methods/page.tsx`

---

## FASE 5: Movimientos (Transactions ABM con split)
**Objetivo:** Lista paginada, filtrado, ordenamiento, CRUD con múltiples categorías

### 5.1 Feature Transactions
Crear en `src/features/transactions/`:

**Repositorio:**
- `repo.impl.ts`:
  - `list(params)` con paginado, filtros, orden
    - filtros: month, kind, status, paymentMethodId, categoryIds, q
    - JOIN con categories, payment_methods
  - `findById(id, userId)` con splits
  - `create(data, splits)` en transacción DB
  - `update(id, userId, data, splits)` validando sumatoria
  - `delete(id, userId)` con cascade a splits

**Casos de uso:**
- `usecases/list-transactions.usecase.ts`:
  - validar params (whitelist sortBy, límite pageSize)
  - llamar repo
  - mapear a DTOs
- `usecases/upsert-transaction.usecase.ts`:
  - validar splits sum = amount
  - crear/actualizar transaction + splits en transacción
- `usecases/delete-transaction.usecase.ts`

**Mappers:**
- `mappers/transaction.mapper.ts`:
  - `mapRowToDomain()`
  - `mapDomainToDTO()`

**API:**
- `app/api/transactions/route.ts`: GET, POST
- `app/api/transactions/[id]/route.ts`: GET, PUT, DELETE

**Frontend:**
- `features/transactions/api/transactions.api.ts`
- `features/transactions/hooks/`:
  - `useTransactionsTable()`: estado de filtros, paginado, orden desde URL
  - `useTransactionMutations()`
- `features/transactions/ui/`:
  - `transactions-table.tsx`: TanStack Table con columnas
  - `transaction-form.tsx`: form con split de categorías
  - `transaction-filters.tsx`: filtros en sidebar/header
  - `category-split-input.tsx`: componente para asignar importes por categoría

**UI:**
- `app/(app)/transactions/page.tsx`

**Componentes shadcn/ui necesarios:**
- Table (TanStack Table integration)
- Popover
- Calendar (para DatePicker)
- Command (para multi-select de categorías)
- Separator

### 5.2 Validación de Split
En el usecase `UpsertTransactionUseCase`:
```ts
const totalAllocated = splits.reduce((sum, s) => sum + s.amount, 0);
if (totalAllocated !== transaction.amount) {
  throw new ValidationError('Split amounts must sum to transaction amount');
}
```

---

## FASE 6: Inversiones (básico con interés simple)
**Objetivo:** CRUD de inversiones con cálculo de rendimiento

### 6.1 Extender schema DB
Agregar tabla `investments`:
```ts
- id, userId
- name, description
- principal (integer, centavos)
- tna (decimal)
- start_date
- days (integer)
- created_at, updated_at
```

### 6.2 Entidad Investment
Crear en `src/entities/investment/`:
- `model/investment.entity.ts`: clase `Investment`
  - validar principal > 0, tna en rango, days > 0
- `model/investment.schema.ts`
- `repo.ts`: interface

**Servicio de dominio:**
- `services/investment-yield-calculator.ts`:
  ```ts
  class InvestmentYieldCalculator {
    calculate(principal: number, tna: number, days: number) {
      const yield = principal * (tna / 100) * (days / 365);
      return { yield, total: principal + yield };
    }
  }
  ```

### 6.3 Feature Investments
Crear en `src/features/investments/`:

**Repositorio:**
- `repo.impl.ts`: CRUD básico con paginado

**Casos de uso:**
- `usecases/list-investments.usecase.ts`
- `usecases/upsert-investment.usecase.ts`: calcular yield al guardar
- `usecases/delete-investment.usecase.ts`

**API:**
- `app/api/investments/route.ts`
- `app/api/investments/[id]/route.ts`

**Frontend:**
- `features/investments/hooks/`:
  - `useInvestmentsTable()`
  - `useInvestmentMutations()`
- `features/investments/ui/`:
  - `investments-table.tsx`: mostrar principal, TNA, días, rendimiento calculado
  - `investment-form.tsx`

**UI:**
- `app/(app)/investments/page.tsx`

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

### 9.1 Widgets compartidos
Crear en `src/widgets/`:
- `sidebar/sidebar.tsx`: navegación principal
  - Dashboard
  - Movimientos
  - Categorías
  - Formas de Pago
  - Inversiones
  - Recurrentes
  - Perfil
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
1. **FASE 1** → infraestructura base
2. **FASE 2** → auth (bloqueante para todo lo demás)
3. **FASE 3** → dashboard básico (motivación temprana)
4. **FASE 4** → categorías y payment methods (necesario para transactions)
5. **FASE 5** → movimientos (core del sistema)
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

**Última actualización:** 26 de diciembre de 2025  
**Próximo paso:** FASE 1 - Configuración de infraestructura base
