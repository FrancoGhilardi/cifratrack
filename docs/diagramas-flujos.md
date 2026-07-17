# Diagramas de secuencia y de estados — CifraTrack

> Flujos de negocio principales, en el estado actual del código (no del roadmap).
> Actualizar cuando cambie el flujo de un caso de uso descrito acá.
> Última verificación contra código: 2026-07-16.

---

## 1) Login (Credentials + rate limit + mitigación de timing)

```mermaid
sequenceDiagram
    participant B as Browser
    participant NA as Auth.js (authorize)
    participant RL as rate-limit.ts (Upstash)
    participant UC as AuthenticateUserUseCase
    participant Repo as UserRepository
    participant DB as PostgreSQL

    B->>NA: signIn("credentials", { email, password })
    NA->>NA: loginSchema.parse(credentials)
    NA->>RL: checkLoginRateLimit(ip)
    alt Sin Upstash configurado
        RL-->>NA: true (fail-open)
    else Límite excedido (5 req/min por IP)
        RL-->>NA: false
        NA-->>B: RateLimitedSignInError
    end
    NA->>UC: execute({ email, password })
    UC->>Repo: findByEmail(email)
    Repo->>DB: SELECT ... WHERE email = $1
    alt Usuario no existe
        DB-->>Repo: null
        Repo-->>UC: null
        UC->>UC: verifyPassword(password, DUMMY_HASH)\n(paga el mismo costo bcrypt que el caso real)
        UC-->>NA: throw AuthenticationError("Credenciales inválidas")
    else Usuario existe
        DB-->>Repo: row
        Repo-->>UC: User
        UC->>UC: verifyPassword(password, user.hashedPassword)
        alt Password incorrecto
            UC-->>NA: throw AuthenticationError("Credenciales inválidas")
        else Password correcto
            UC-->>NA: User
        end
    end
    NA-->>B: null (credenciales inválidas) | session JWT (7 días)
```

La comparación bcrypt contra un hash dummy cuando el email no existe evita que un atacante
distinga "email inexistente" de "password incorrecto" por tiempo de respuesta — ver
`src/features/auth/usecases/authenticate-user.usecase.ts`.

---

## 2) Registro de usuario (con seeds)

```mermaid
sequenceDiagram
    participant B as Browser
    participant R as POST /api/auth/register
    participant UC as RegisterUserUseCase
    participant DB as PostgreSQL (transacción)

    B->>R: { email, password, username? }
    R->>UC: execute(input)
    UC->>DB: emailExists(email)?
    alt Email ya registrado
        DB-->>UC: true
        UC-->>R: throw ConflictError
    else Email libre
        UC->>DB: BEGIN
        UC->>DB: INSERT users (password hasheado con bcrypt)
        UC->>DB: INSERT categories (DEFAULT_CATEGORIES, isDefault=true)
        UC->>DB: INSERT payment_methods (DEFAULT_PAYMENT_METHODS, isDefault=true)
        UC->>DB: COMMIT
        Note over UC,DB: si una constraint única falla en el commit\n(race condition), se relanza como ConflictError
        DB-->>UC: User
        UC-->>R: User
        R-->>B: 201 { ok: true, data: UserDTO }
    end
```

---

## 3) Crear transacción con split multi-categoría

```mermaid
sequenceDiagram
    participant B as Browser
    participant R as POST /api/transactions
    participant UC as UpsertTransactionUseCase
    participant Repo as TransactionRepository
    participant DB as PostgreSQL (transacción)

    B->>R: { title, amount, kind, split: [{categoryId, allocatedAmount}, ...] }
    R->>UC: create(userId, data)
    alt sin split
        UC-->>R: throw ValidationError("Debe especificar al menos una categoría")
    end
    UC->>UC: validateSplits(amount, split)\n(suma == amount, sin duplicados, montos > 0)
    alt suma no coincide
        UC-->>R: throw ValidationError
    end
    UC->>Repo: create(userId, data)
    Repo->>DB: BEGIN
    Repo->>DB: SELECT categories/payment_methods WHERE id IN (...) AND user_id = $userId
    alt algún id no pertenece al usuario
        DB-->>Repo: menos filas de las esperadas
        Repo-->>UC: throw ValidationError (rollback)
    end
    Repo->>DB: INSERT transactions
    Repo->>DB: INSERT transaction_categories (splits)
    Repo->>DB: COMMIT
    Repo-->>UC: TransactionWithNames
    UC-->>R: TransactionWithNames
    R-->>B: 201 { ok: true, data: TransactionDTO }
```

---

## 4) Generación mensual de transacciones recurrentes (idempotente)

```mermaid
sequenceDiagram
    participant Caller as POST /api/recurring/generate (requiere sesión)
    participant UC as GenerateMonthlyRecurringTransactionsUseCase
    participant Repo as RecurringRuleRepository
    participant DB as PostgreSQL

    Caller->>UC: execute({ userId, month })
    UC->>Repo: list(userId)
    Repo-->>UC: RecurringRule[]
    UC->>UC: filtra reglas activas en `month`\n(activeFromMonth <= month <= activeToMonth | null)
    alt sin reglas activas
        UC-->>Caller: return (no-op)
    end
    par
        UC->>Repo: findExistingTransactionRuleIds(userId, ruleIds, month)
        UC->>Repo: findCategoriesByRuleIds(ruleIds)
    end
    Repo-->>UC: existingRuleIds, categoriesByRule
    UC->>UC: descarta reglas ya generadas para `month`\n(garantiza idempotencia)
    alt todas ya generadas
        UC-->>Caller: return (no-op)
    end
    UC->>UC: valida totalSplits == rule.amount (si totalSplits > 0)
    alt split no coincide
        UC-->>Caller: throw AppError("VALIDATION_ERROR")
    end
    UC->>Repo: bulkCreateTransactionsFromRules(pendingRules, month)
    Repo->>DB: INSERT transactions (source_recurring_rule_id = rule.id) + transaction_categories
    DB-->>Repo: ok
    Repo-->>UC: void
    UC-->>Caller: void
```

**No es un cron público**: la ruta `POST /api/recurring/generate` requiere sesión (no está en
`PUBLIC_PATHS` de `proxy.ts`). Si se agrega un trigger automático (cron), documentarlo acá y en
`docs/arquitectura.md` antes de exponerlo.

---

## 5) Cálculo de rendimiento de inversión

```mermaid
sequenceDiagram
    participant B as Browser
    participant R as POST /api/investments
    participant UC as UpsertInvestmentUseCase
    participant Ent as Investment (entidad)
    participant Calc as InvestmentYieldCalculator
    participant Repo as InvestmentRepository

    B->>R: { platform, title, principal, tna, days, isCompound }
    R->>UC: execute(userId, data)
    UC->>Ent: Investment.create(data)
    Ent->>Ent: validate()\n(principal>0, 0<=tna<=999.99, days>0 si !isCompound, startedOn no futura)
    alt inválido
        Ent-->>UC: throw ValidationError
    end
    UC->>Repo: create(investment)
    Repo-->>UC: Investment persistida
    UC-->>R: Investment
    Note over R,Calc: El cálculo de rendimiento se hace on-demand\n(GET, no se persiste el yield)
    R->>Calc: calculate(principal, tna, days, isCompound)
    alt isCompound
        Calc->>Calc: interés compuesto diario:\ntotal = principal * (1 + tna/100/365)^days
    else simple
        Calc->>Calc: yield = principal * (tna/100) * (days/365)\ntotal = principal + yield
    end
    Calc-->>R: { yield, total, tna, days }
    R-->>B: 200 { ok: true, data: { ...InvestmentDTO, yield, total } }
```

---

## 6) Eliminar categoría (regla de negocio con dos guardas)

```mermaid
sequenceDiagram
    participant B as Browser
    participant R as DELETE /api/categories/:id
    participant UC as DeleteCategoryUseCase
    participant Repo as CategoryRepository

    B->>R: DELETE /api/categories/:id
    R->>UC: execute(id, userId)
    UC->>Repo: findById(id, userId)
    alt no existe / no es del usuario
        Repo-->>UC: null
        UC-->>R: throw DomainError("Categoría no encontrada")
    end
    alt category.isDefault
        UC-->>R: throw DomainError("No se pueden eliminar categorías por defecto")
    end
    UC->>Repo: hasTransactions(id, userId)
    alt tiene transacciones asociadas
        Repo-->>UC: true
        UC-->>R: throw DomainError("... Puedes desactivarla en su lugar")
    end
    UC->>Repo: delete(id, userId)
    Repo-->>UC: void
    UC-->>R: void
    R-->>B: 200 { ok: true, data: null }
```

El mismo patrón (guarda `isDefault` + guarda `hasTransactions`) aplica a
`DeletePaymentMethodUseCase`.

---

## 7) Diagrama de estados — `Transaction.status`

```mermaid
stateDiagram-v2
    [*] --> paid: create() sin status\n(default)
    [*] --> pending: create({ status: "pending", dueOn: requerido })

    pending --> paid: markAsPaid(paidOn)
    paid --> paid: markAsPaid(paidOn) (idempotente, no-op de negocio)

    note right of pending
        CHECK chk_tx_pending_due_on en DB:
        status=pending exige due_on NOT NULL
    end note

    note right of paid
        Solo relevante para egresos fijos
        (isFixed=true) — el resto de las
        transacciones nace y queda en "paid"
    end note
```

No hay transición `paid → pending` en el dominio actual (no existe método `markAsPending()` en
`Transaction`); revertir un pago requiere editar la transacción con los datos correctos.

---

## 8) Diagrama de estados — versionado de `RecurringRule`

```mermaid
stateDiagram-v2
    [*] --> Vigente: create({ activeFromMonth, activeToMonth: null })

    Vigente --> Vigente: update() sin tocar activeToMonth\n(edita título/monto/día, no reescribe el pasado)
    Vigente --> Cerrada: update({ activeToMonth: mesActual })

    Cerrada --> [*]

    state "Nueva versión" as Nueva
    Cerrada --> Nueva: create({ activeFromMonth: mesSiguiente, ...cambios })
    Nueva --> Vigente: (la nueva fila es la regla "Vigente" desde ese momento)

    note right of Vigente
        activeToMonth = NULL
        Elegible para generación mensual
        mientras targetMonth esté dentro
        de [activeFromMonth, activeToMonth|∞]
    end note

    note right of Cerrada
        Las transacciones ya generadas
        con source_recurring_rule_id
        apuntando a esta fila NO se tocan
        (ON DELETE SET NULL si se borra la regla)
    end note
```

"Editar" una regla recurrente vigente que ya generó transacciones en el pasado, en la práctica,
significa: cerrar la fila actual (`activeToMonth = mes anterior al cambio`) y crear una fila nueva
desde el mes del cambio en adelante — nunca se reescribe `activeFromMonth`/datos de una regla ya
cerrada. Ver `docs/reglas-de-negocio.md` §3.3.
