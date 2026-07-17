# Diagramas de clases (UML) — CifraTrack

> Diagramas de clases del dominio (entidades, value objects, servicios) y de la capa de
> aplicación (UseCases, contratos de repositorio). Actualizar en cada cambio de firma,
> invariante o clase nueva en `src/entities/**` o `src/features/**/usecases`.
> Última verificación contra código: 2026-07-16.

---

## 1) Capa de dominio (`src/entities/**`)

```mermaid
classDiagram
    class Transaction {
        +string id
        +string userId
        +"income"|"expense" kind
        +string title
        +string? description
        +number amount "centavos"
        +string? paymentMethodId
        +boolean isFixed
        +"pending"|"paid" status
        +string occurredOn "YYYY-MM-DD"
        +string? dueOn
        +string? paidOn
        +string occurredMonth "YYYY-MM"
        +string? sourceRecurringRuleId
        +TransactionSplit? split
        +Date createdAt
        +Date updatedAt
        +create(data)$ Transaction
        +fromPersistence(data)$ Transaction
        +toDTO() TransactionDTO
        +withSplit(split) Transaction
        +markAsPaid(paidOn) Transaction
        +isIncome() boolean
        +isExpense() boolean
        +isPending() boolean
        +isPaid() boolean
        -validate() void
    }

    class TransactionSplit {
        +Array~Split~ splits
        +getTotal() number
        +matchesAmount(amount) boolean
        +toPersistence() Split[]
        +fromPersistence(data)$ TransactionSplit
        -validate() void
    }

    class RecurringRule {
        +string id
        +string userId
        +string title
        +string? description
        +number amount
        +"income"|"expense" kind
        +number dayOfMonth
        +"pending"|"paid" status
        +string? paymentMethodId
        +Month activeFromMonth
        +Month? activeToMonth
        +Date createdAt
        +Date updatedAt
        +create(props)$ RecurringRule
        +fromDB(data)$ RecurringRule
        +toDTO() dto
        -validate() void
    }

    class Category {
        +string id
        +string userId
        +"income"|"expense" kind
        +string name
        +boolean isActive
        +boolean isDefault
        +fromPersistence(data)$ Category
        +toDTO() CategoryDTO
        +isIncome() boolean
        +isExpense() boolean
        +canBeDeleted() boolean
    }

    class PaymentMethod {
        +string id
        +string userId
        +string name
        +boolean isActive
        +boolean isDefault
        +fromPersistence(data)$ PaymentMethod
        +toDTO() PaymentMethodDTO
        +canBeDeleted() boolean
    }

    class Investment {
        +string id
        +string userId
        +string platform
        +string title
        +string? yieldProviderId
        +number principal "decimal, NO Money"
        +number tna "porcentaje"
        +number? days
        +boolean isCompound
        +Date startedOn
        +string? notes
        +create(data)$ Investment
        +fromDB(data)$ Investment
        +getEndDate() Date?
        +hasEnded() boolean
        +getDaysRemaining() number?
        -validate() void
    }

    class InvestmentYieldCalculator {
        +calculate(principal, tna, days, isCompound) InvestmentYieldResult
        +calculateTEA(principal, finalAmount, days) number
        +calculateFinalAmount(principal, tna, days) number
        +calculateDaysForTargetYield(principal, tna, targetYield) number
    }

    class User {
        +string id
        +string email
        +string hashedPassword
        +string? name
        +string currency
        +string timezone
    }

    class Money {
        -number cents
        +fromCents(cents)$ Money
        +fromPesos(pesos)$ Money
        +zero()$ Money
        +toCents() number
        +toPesos() number
        +format(locale, currency) string
        +add(other) Money
        +subtract(other) Money
        +multiply(factor) Money
        +divide(divisor) Money
        +isGreaterThan(other) boolean
        +isLessThan(other) boolean
        +equals(other) boolean
        +isZero() boolean
    }

    class Month {
        +parse(value)$ Month
        +isBefore(other) boolean
        +isAfter(other) boolean
        +toString() string
    }

    Transaction "1" o-- "0..1" TransactionSplit : split
    Investment ..> InvestmentYieldCalculator : usa (servicio de dominio)
    RecurringRule "1" *-- "1" Month : activeFromMonth
    RecurringRule "1" *-- "0..1" Month : activeToMonth
```

Notas:
- `Transaction`, `Investment` validan invariantes en el constructor salvo `skipValidation = true`
  (usado exclusivamente por `fromPersistence`/`fromDB` al reconstruir desde la base de datos).
- `Money` es el VO de dinero para transacciones/recurrentes (centavos). `Investment.principal`/`tna`
  son `number` decimal nativo — **no** pasan por `Money` (ver `docs/reglas-de-negocio.md` §3.4).
- `Category`/`PaymentMethod` no tienen `validate()` propio hoy — su única regla de negocio
  (`canBeDeleted`) delega en `isDefault`; la regla de "sin transacciones asociadas" vive en el
  UseCase (`hasTransactions` vía repo), no en la entidad.

---

## 2) Contratos de repositorio (`src/entities/*/repo.ts`)

```mermaid
classDiagram
    class ITransactionRepository {
        <<interface>>
        +list(params) PaginatedTransactions
        +findById(id, userId) TransactionWithNames?
        +create(userId, data) TransactionWithNames
        +update(id, userId, data) TransactionWithNames
        +delete(id, userId) void
        +getByMonth(userId, month) Transaction[]
        +getExpenseStatusSummary(userId, month) TransactionSummaryDTO
        +getMonthlySummary(userId, month) MonthlySummary
    }

    class IRecurringRuleRepository {
        <<interface>>
        +list(userId) RecurringRule[]
        +findById(id, userId) RecurringRule?
        +create(userId, data) RecurringRule
        +update(id, userId, data) RecurringRule
        +delete(id, userId) void
        +findCategories(ruleId) Split[]
        +findCategoriesByRuleIds(ruleIds) Record
        +setCategories(ruleId, categories) void
        +verifyPaymentMethodOwnership(userId, id) boolean
        +verifyCategoriesOwnership(userId, ids) boolean
        +findExistingTransactionRuleIds(userId, ruleIds, month) Set
        +bulkCreateTransactionsFromRules(items, month) void
    }

    class IInvestmentRepository {
        <<interface>>
        +list(userId, params) PaginatedInvestments
        +findById(id, userId) Investment?
        +create(investment) Investment
        +update(id, userId, data) Investment
        +delete(id, userId) void
        +count(userId) number
        +getTotalInvested(userId) number
    }

    class ICategoryRepository {
        <<interface>>
        +list(userId, filters?) Category[]
        +findById(id, userId) Category?
        +create(userId, data) Category
        +update(id, userId, data) Category
        +delete(id, userId) void
        +hasTransactions(id, userId) boolean
    }

    class IPaymentMethodRepository {
        <<interface>>
        +list(userId, filters?) PaymentMethod[]
        +findById(id, userId) PaymentMethod?
        +create(userId, data) PaymentMethod
        +update(id, userId, data) PaymentMethod
        +delete(id, userId) void
        +hasTransactions(id, userId) boolean
    }

    class IUserRepository {
        <<interface>>
        +findByEmail(email) User?
        +findById(id) User?
        +create(data) User
        +updatePassword(id, hash) void
    }

    class TransactionRepository {
        Drizzle impl
    }
    class RecurringRuleRepository {
        Drizzle impl
    }
    class InvestmentRepository {
        Drizzle impl
    }
    class CategoryRepository {
        Drizzle impl
    }
    class PaymentMethodRepository {
        Drizzle impl
    }
    class UserRepository {
        Drizzle impl
    }

    ITransactionRepository <|.. TransactionRepository
    IRecurringRuleRepository <|.. RecurringRuleRepository
    IInvestmentRepository <|.. InvestmentRepository
    ICategoryRepository <|.. CategoryRepository
    IPaymentMethodRepository <|.. PaymentMethodRepository
    IUserRepository <|.. UserRepository
```

---

## 3) UseCases por feature

```mermaid
classDiagram
    class ListUseCase~T~ {
        <<generic base>>
        -ListRepo repo
        +execute(userId, filters?) TResult
    }
    class GetByIdUseCase~T~ {
        <<generic base>>
        -FindByIdRepo repo
        -string resourceLabel
        +execute(id, userId) TEntity
        "throws NotFoundError si no existe"
    }
    class DeleteUseCase {
        <<generic base>>
        -DeleteRepo repo
        +execute(id, userId) void
    }

    class UpsertTransactionUseCase {
        -ITransactionRepository repository
        +create(userId, data) TransactionWithNames
        +update(id, userId, data) TransactionWithNames
        -validateSplits(amount, splits) void
    }
    class DeleteTransactionUseCase
    class ListTransactionsUseCase
    class GetTransactionByIdUseCase
    class GetTransactionsSummaryUseCase

    class UpsertRecurringRuleUseCase
    class DeleteRecurringRuleUseCase
    class ListRecurringRulesUseCase
    class GetRecurringRuleByIdUseCase
    class GenerateMonthlyRecurringTransactionsUseCase {
        -IRecurringRuleRepository repo
        +execute(userId, month) void
        "idempotente: filtra reglas ya generadas"
    }

    class UpsertCategoryUseCase {
        "bloquea edición si isDefault"
    }
    class DeleteCategoryUseCase {
        "bloquea si isDefault o hasTransactions"
    }
    class ListCategoriesUseCase
    class GetCategoryByIdUseCase

    class UpsertPaymentMethodUseCase {
        "bloquea edición si isDefault"
    }
    class DeletePaymentMethodUseCase {
        "bloquea si isDefault o hasTransactions"
    }
    class ListPaymentMethodsUseCase
    class GetPaymentMethodByIdUseCase

    class UpsertInvestmentUseCase
    class DeleteInvestmentUseCase
    class ListInvestmentsUseCase
    class GetInvestmentByIdUseCase

    class AuthenticateUserUseCase {
        -IUserRepository userRepository
        +execute(input) User
        "mitiga timing attack con hash dummy"
    }
    class RegisterUserUseCase {
        "inserta seeds de categorías/formas de pago"
    }
    class ChangePasswordUseCase
    class GetProfileUseCase
    class UpdateProfileUseCase

    class GetDashboardSummaryUseCase
    class GetLiveYieldsUseCase

    DeleteUseCase <|-- DeleteTransactionUseCase : podría extender (hoy clase propia por reglas futuras)
    GetByIdUseCase~T~ <|-- GetTransactionByIdUseCase
    ListUseCase~T~ <|-- ListTransactionsUseCase

    UpsertTransactionUseCase --> ITransactionRepository
    GenerateMonthlyRecurringTransactionsUseCase --> IRecurringRuleRepository
    AuthenticateUserUseCase --> IUserRepository
```

Nota: el diagrama de UseCases muestra la intención arquitectónica (`ListUseCase`/`GetByIdUseCase`/
`DeleteUseCase` genéricos para passthrough puro, ver `src/shared/lib/usecases/`). Antes de asumir que
un UseCase concreto extiende la base genérica, verificar el archivo — los que tienen reglas de
negocio propias (`Upsert*`, `Delete*` de categorías/formas de pago, `GenerateMonthly*`) están
escritos como clase independiente, sin herencia.

---

## 4) Jerarquía de errores (`src/shared/lib/errors.ts`)

```mermaid
classDiagram
    class AppError {
        <<abstract-ish base>>
        +string message
        +string code
        +number statusCode
        +unknown? details
    }
    class ValidationError { code="VALIDATION_ERROR" statusCode=400 }
    class DomainError { code="DOMAIN_ERROR" statusCode=400 }
    class AuthenticationError { code="AUTHENTICATION_ERROR" statusCode=401 }
    class AuthorizationError { code="AUTHORIZATION_ERROR" statusCode=403 }
    class NotFoundError { code="NOT_FOUND" statusCode=404 }
    class ConflictError { code="CONFLICT" statusCode=409 }
    class RateLimitError { code="RATE_LIMITED" statusCode=429 }

    Error <|-- AppError
    AppError <|-- ValidationError
    AppError <|-- DomainError
    AppError <|-- AuthenticationError
    AppError <|-- AuthorizationError
    AppError <|-- NotFoundError
    AppError <|-- ConflictError
    AppError <|-- RateLimitError
```
