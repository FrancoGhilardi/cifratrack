# Base de datos — CifraTrack

> DER, índices y checks del schema real (`src/shared/db/schema.ts`, PostgreSQL/Supabase).
> Fuente de verdad: el schema de Drizzle. `src/shared/db/migrations/schema.ts` y
> `migrations/relations.ts` son copias de introspección — **no** editarlas ni tomarlas como
> referencia. Actualizar este documento en cada `pnpm db:generate` que cambie tablas/relaciones.
> Última verificación contra código: 2026-07-16.

---

## 1) Diagrama entidad-relación

![Diagrama entidad-relación](https://www.plantuml.com/plantuml/svg/pLVRRjiu47tNLypgAItiD4cRxCR81Ws2BBP8KnIvF0Ge88p5iSs65or9EL6R_lk2aYnJid9pYyM-YNFZp9ap9FNUEZGkbmB6Q6d8QCZGQJia4_tcPYG9Ce5SHVQ6gmmDIXXZUZCrEbViM0jju7R67GLwmHMv8YFGnirqDEEC8EKc5LHzaynS0PBac8oD8bAEkmBYt9AnCQ25yWk-Hm2lWJCOGPvp1WS7dqyF3oE0uJ22qaQX91Z174qwGnC1a4GkbX8uEBWwFJo4U6Tt5xp0nX50smlYxPsjfJ93Qs-rOQ51ups0SMgApC4CxSnRfxanfD82Hb2PlbqOCffWBXmSdLzuGySbVTEgjU_UknLZIOQd-ER8J3qe2j-SaMBw6vPx6K97B447epAUTIWpZqJ6-XK2hKk4ddBLrVrOefwYewasd2hebyjdu9-4ohygvGrNNaZAcI8f5p5NgPO46kWk8sMfhmbxGG-uJJ1rVEuDnbeBGbL95pY5ufV24fIUOI59kKIIcsbMrT-HhGd2_w4wGvwTN4qJaukwkntPcjKvxiJ34yJ8fePdZclbKwCx5m6WrBdogNBbQ4e6ufIKmxcs0pZ---Ju52GMsW32Ljn78XyNYqHF4gcLcy48h4GXk78GL_xUbc0R2dYxxKDOXowtFWE3odh4jKfgOPoHObnDGKE6d2q7i9PN1q58X1KO85Qv43WM9PkhXYOJesMJO0NDxuiPdsWZqMculhw-7fwT1LvEFzDd0E6UlumQIUS8U53x15qwVZt4gKCLVJeKGgTLtY_ZoWCu1EK63AWg30M_wfZxJ-RYHQJaDfdmEsAj0sMziK3EV4ITbXSUIyeIFCjyNJajrvvR_-HaEDDWURtRdtNSkgIg4DwEqeJk7ONb130oV8vC0wCmdNBYTMvIIfwWOHkZdnYY4C3E1FMhQgQ5oZRh1b2JwtN_f0GM9JVN79cW1gxcP9sdL9Lui5vpBZA1pXzRuHZy4Kp1upDIS18ioOoUSxQ8trZkRYtEnKK71q1VGP99aUaCfxfabk4gvHdwPw3AomSLnDll1Zl0AEKI1IXqVAvxvyif3Dts1ZkGQLDY-PKM7jLDimK5xE_lR-xlnzNbP4Fubnckt4vxkrjRzNYcMcR-6TsTKECwCwQq8xiyDNw2jPYcdYfLknUBTNjTzscPMDEvEdBbLIitDtrrN45kDMnyeZjtbBiP8CFCaNaLPcd9skQqNYoUoB8sIvo-eSK9M_y0F583tMNSLDW6EBuWrJaPFk4fkcRlAkiUULE0zvtm1hXb8Q-Xa_tdyiHoACUS55oTUZg29V-VnKgwbwNt5V4ZYghVgFlxuL1_3n_s8z2tohRLtNTldqthskmpw3ul-sp28wPFtt1o176kSaiiRXiqT0WCecxwztfpSpLZ_ul9WAilQcCve1Sdb_3fwkF7L_53KLRBUYfGrDfu5RwarGsR2UwYGFIKGzoS_5KEvoSNb-SVZY_zpjraUrlplFqVytbH2ltDc98YWuxi5xNnqDtTHlKzAPPB4VqB)

*Diagrama PlantUML — fuente editable: [`docs/diagrams/base-de-datos-er.puml`](diagrams/base-de-datos-er.puml).*

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
