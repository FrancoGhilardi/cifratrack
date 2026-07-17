# Base de datos — CifraTrack

> DER, índices y checks del schema real (`src/shared/db/schema.ts`, PostgreSQL/Supabase).
> Fuente de verdad: el schema de Drizzle. `src/shared/db/migrations/schema.ts` y
> `migrations/relations.ts` son copias de introspección — **no** editarlas ni tomarlas como
> referencia. Actualizar este documento en cada `pnpm db:generate` que cambie tablas/relaciones.
> Última verificación contra código: 2026-07-16.

---

## 1) Diagrama entidad-relación

```mermaid
erDiagram
    users ||--o{ categories : "owns"
    users ||--o{ payment_methods : "owns"
    users ||--o{ transactions : "owns"
    users ||--o{ recurring_rules : "owns"
    users ||--o{ investments : "owns"
    users ||--o{ accounts : "unused (NextAuth adapter)"
    users ||--o{ sessions : "unused (NextAuth adapter)"

    payment_methods |o--o{ transactions : "used in (nullable, SET NULL)"
    payment_methods |o--o{ recurring_rules : "used in (nullable, SET NULL)"

    transactions ||--o{ transaction_categories : "split"
    categories ||--o{ transaction_categories : "allocated in (RESTRICT)"

    recurring_rules ||--o{ recurring_rule_categories : "split"
    categories ||--o{ recurring_rule_categories : "allocated in (RESTRICT)"

    recurring_rules |o--o{ transactions : "generates (source_recurring_rule_id, SET NULL)"

    users {
        uuid id PK
        varchar username
        varchar email UK "255 chars"
        varchar name "120 chars"
        varchar password "255 chars, bcrypt hash"
        char currency "3 chars, default ARS"
        varchar timezone "64 chars, default America/Argentina/Mendoza"
        timestamp created_at
        timestamp updated_at
        timestamp last_login_at
    }

    categories {
        uuid id PK
        uuid user_id FK
        entry_kind kind "income o expense"
        varchar name "60 chars"
        boolean is_active
        boolean is_default
        timestamp created_at
        timestamp updated_at
    }

    payment_methods {
        uuid id PK
        uuid user_id FK
        varchar name "60 chars"
        boolean is_active
        boolean is_default
        timestamp created_at
        timestamp updated_at
    }

    recurring_rules {
        uuid id PK
        uuid user_id FK
        varchar title "120 chars"
        text description
        integer amount "centavos, CHECK mayor a 0"
        entry_kind kind
        smallint day_of_month "CHECK entre 1 y 31"
        transaction_status status "pending o paid, default pending"
        uuid payment_method_id FK "nullable"
        char active_from_month "7 chars, formato YYYY-MM"
        char active_to_month "7 chars, formato YYYY-MM, nullable"
        timestamp created_at
        timestamp updated_at
    }

    recurring_rule_categories {
        uuid id PK
        uuid recurring_rule_id FK
        uuid category_id FK
        integer allocated_amount "centavos, CHECK mayor a 0"
        timestamp created_at
    }

    transactions {
        uuid id PK
        uuid user_id FK
        entry_kind kind
        varchar title "120 chars"
        text description
        integer amount "centavos, CHECK mayor a 0"
        uuid payment_method_id FK "nullable"
        boolean is_fixed
        transaction_status status "pending o paid, default paid"
        date occurred_on
        date due_on "requerido si status=pending, CHECK"
        date paid_on
        char occurred_month "7 chars YYYY-MM, derivado de occurred_on"
        uuid source_recurring_rule_id FK "nullable"
        timestamp created_at
        timestamp updated_at
    }

    transaction_categories {
        uuid transaction_id PK
        uuid category_id PK
        integer allocated_amount "centavos, CHECK mayor a 0"
    }

    investments {
        uuid id PK
        uuid user_id FK
        varchar platform "80 chars"
        varchar title "120 chars"
        varchar yield_provider_id "50 chars, nullable, ej mercadopago"
        numeric principal "14,2 decimal nativo, CHECK mayor a 0"
        numeric tna "6,2 porcentaje, CHECK entre 0 y 999.99"
        integer days "nullable, CHECK entre 1 y 36500"
        boolean is_compound
        date started_on
        text notes
        timestamp created_at
        timestamp updated_at
    }

    accounts {
        uuid id PK
        uuid user_id FK
        text provider
        text provider_account_id
    }

    sessions {
        uuid id PK
        text session_token UK
        uuid user_id FK
        timestamp expires
    }

    verification_tokens {
        text identifier PK
        text token PK "tambien UK por separado"
        timestamp expires
    }
```

---

## 2) Notas por tabla

### `users`
- `email` único (`users_email_key`). `password` es hash bcrypt (nunca texto plano).
- `currency`/`timezone` con defaults (`ARS`, `America/Argentina/Mendoza`) — no hay multi-moneda ni multi-timezone activo hoy, son campos preparados.

### `categories` / `payment_methods`
- `(user_id, kind, name)` único en categorías; `(user_id, name)` único en formas de pago.
- `is_default`: seeds por usuario al registrarse (ver `docs/reglas-de-negocio.md` §3.5). No editables ni eliminables mientras `is_default = true`.
- `ON DELETE CASCADE` desde `users`.

### `recurring_rules`
- Versionado temporal: una regla "vigente" tiene `active_to_month = NULL`; se cierra seteando `active_to_month` y se crea una nueva fila desde el mes siguiente. Nunca se edita `active_from_month` de una regla con transacciones ya generadas.
- `idx_rr_user_month` (`user_id`, `active_from_month`) — soporta el filtro de reglas activas por rango de mes en la generación mensual.
- FK `payment_method_id` con `ON DELETE SET NULL`: borrar una forma de pago no rompe reglas existentes.

### `recurring_rule_categories` / `transaction_categories`
- Splits de categorías. `allocated_amount` en centavos, `CHECK > 0`.
- FK a `categories` con `ON DELETE RESTRICT`: **no se puede borrar una categoría** que esté referenciada en un split (ni de transacción ni de regla recurrente) — el repo debe manejar ese error o el UseCase validarlo antes.
- `transaction_categories` tiene PK compuesta `(transaction_id, category_id)` — no permite dos filas para la misma combinación.

### `transactions`
- `occurred_month` es una columna derivada de `occurred_on` (mantenida por la app, no generada por Postgres) — usada para filtros mensuales rápidos vía `idx_tx_user_month`.
- `CHECK chk_tx_pending_due_on`: si `status = 'pending'` entonces `due_on` es obligatorio. Si `status = 'paid'`, `due_on` es libre.
- `source_recurring_rule_id` (`ON DELETE SET NULL`) traza el origen cuando la transacción fue generada por una regla recurrente — permite la idempotencia de la generación mensual (`findExistingTransactionRuleIds`).
- Índices trigram (`gin_trgm_ops`) sobre `title`/`description` normalizados (minúsculas, sin acentos) para el filtro de búsqueda libre `q` — requieren que el filtro en `repo.impl.ts` aplique la misma normalización (`translate(lower(...))`) o el índice no se usa.
- `idx_tx_user_date` (`user_id`, `occurred_on`, `id`) sirve tanto el filtro por fecha como la keyset pagination (`ORDER BY occurred_on, id`).

### `investments`
- Único lugar del dominio donde el dinero **no** usa la convención `Money`/centavos: `principal` y `tna` son `numeric` (decimal nativo de Postgres). Ver `docs/reglas-de-negocio.md` §3.4.
- `days` nullable: inversión de duración indefinida (`isCompound` puede ir sin `days` fijo, según la entidad `Investment.validate()`).

### Tablas sin uso activo
- `accounts`, `sessions`, `verification_tokens`: parte del adapter de NextAuth para providers OAuth. El provider activo es `Credentials` con sesión **JWT** (no persiste en `sessions`). Se mantienen por si se agrega OAuth (Google) a futuro — ver `docs/roadmap-mejoras.md` Fase 10 antes de eliminarlas.
- `yield_rates`: comentada en `schema.ts`, tabla física puede seguir viva en la DB pero sin código que la use (ver comentario en `schema.ts` y Fase 10 del roadmap).

---

## 3) Enums

```ts
entry_kind         = "income" | "expense"
recurring_cadence   = "monthly"                 // único valor soportado hoy
transaction_status  = "pending" | "paid"
```

`recurring_cadence` está definido en el schema pero no hay columna que lo use actualmente
(las reglas recurrentes son siempre mensuales por diseño — `dayOfMonth` + versión por mes).
