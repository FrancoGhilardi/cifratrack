# Arquitectura — CifraTrack

> Documentación de arquitectura, infraestructura y ciclo de vida de un request.
> `CLAUDE.md` apunta acá para contexto extendido. Mantener sincronizado con el código
> en cada cambio que afecte capas, infraestructura o el pipeline de un request.
> Última verificación contra código: 2026-08-28.

---

## 1) Visión general

CifraTrack es una app de control financiero personal construida con **Next.js 16 (App Router)** +
**TypeScript strict**, siguiendo **Clean Architecture / DDD por capas** con organización
**Feature-Sliced**. No hay backend separado: los Route Handlers de Next.js son el backend.

![Diagrama de capas de arquitectura](https://www.plantuml.com/plantuml/svg/RL5DKzim4BtxLsnpSYX9e0TccWD39g6G3e6GZuP3BekqiLNBahfQGw3J_zwn0zE4wSKZwxrz-zxJHHHagKeBoByg8wIaOkme31YJJv9JIH0i6fV4mhY0Z2KyeYeozfNJGsyzmtDkXFPmvSlW7JcPouibO5A2BhFx54qRhAmiQ2i3Qp9NaXDGv8HuZ_NC65P6ImvVJawInD96G3omoN81RMfXursI15G5PWIjMtoY3BNd5c24eJMrxEy4_bc2renG2Pn-XVGD7xvZiRrs2tHpGLN0VKNy0fzXHx_sle1ldij6U3bE_knlfQrqVqOuFOFq1x4Y2psuzPg0AoUcf7OpDIT-8lve9x3VldGbGbeQhIqz8rDxxGQLvBKcLf9xDg-aqpPaADH8JLOVClbA2AxHQKiSrmv3w64mlQEZ7jTGLs8pDvYE3mUNaOOOAQvTPDNR44h557j7lIgIge5Ttk772eEFHZoR_qmo1TyrPR3lIsUNqxk3laOeVWUDKB0fHAFW8qQ2rjH7oPZczpThbywhq5pl2fnU7J2N8Gh676QaJLoxb548h2cD69STWm_AU8Us_MPYD9uVfXXCnn5eAyGE8sY2abYXzckNbiW5IQVUTGonURTEDFhDn-N3eiwp74EdSmwJ5VHXGw9o-3w_kqqcg-QwhdemtL6MmsGvR4vD5_Md-PjUGHz6R5vVBS7TRD8CTBldExVG1vMJAcvyPjmCXMxgRBLIJRbyM40Vzep2-vCboGKvNPKs-Gi0)

*Diagrama PlantUML — fuente editable: [`docs/diagrams/arquitectura-capas.puml`](diagrams/arquitectura-capas.puml).*

---

## 2) Capas (no negociables)

```
UI (React + hooks)  →  API Route (app/api/**)  →  UseCase  →  Repository (Drizzle)  →  DB
                                                      ↑ retorna Entidades de Dominio
                    ←  mapea a DTO               ←  UseCase
```

| Capa | Responsabilidad | Puede importar de | NO puede importar de |
|---|---|---|---|
| UI (`src/features/*/ui`, `src/widgets`) | Renderizado, hooks de TanStack Query | hooks del feature, `src/shared/ui` | Drizzle, `repo.impl.ts`, `src/shared/db` |
| API Routes (`app/api/**/route.ts`) | Auth check, parseo request→DTO, invocar UseCase, responder JSON | `withApiHandler`, UseCases, mappers | Drizzle directo, lógica de negocio |
| UseCases (`src/features/*/usecases`) | Reglas de negocio, orquestación | interfaces de repo (`src/entities/*/repo.ts`) | Drizzle directo, Next.js (`NextRequest`/`NextResponse`) |
| Repositories (`src/features/*/repo.impl.ts`) | Queries Drizzle, mapeo row↔entidad | `src/shared/db`, entidades de dominio | UseCases, API routes |
| Domain Entities/VOs (`src/entities/*/model`) | Invariantes de negocio | nada de capas superiores | features, app, Next.js |

Ver `docs/reglas-de-negocio.md` para las reglas de negocio concretas que estas capas implementan.

---

## 3) Ciclo de vida de un request autenticado

![Diagrama de ciclo de vida de un request autenticado](https://www.plantuml.com/plantuml/svg/RLF1RkCs4BtpArxt906sPAJjnK3JZUEWRj5WjqxS08jS9kJKOasJof2AuopsO_e1FVNMQtwieAniuyKU11tcpNjlvWtVnaIIkgq3oNrd4-lK2Os5xpkEQUpi7wptsh7w9ZMyPRIEh5TnOtrBGblSaTwi9NJUd0SN1Bl69dvLZvd8Qxxa66dDPywkFJJxnF8AjHDgRwn93Kw-doZLaYIhRKi-uSrCmYwol055p8vBhOJ7VPNYhI-srXZ7En8kU-JbpJ5q6Rh4M90tRk1Q7WDsDZLdhNsDM1mZLf7FAN9VMdt1pcs8DWNPt_fYBlRfoGq-SkKO-px4j1Q--ktN7Z2VAJN3-1INDvZYfulh-lsxgslKrDew2Vb8EjdWeoANiEmIeNt-zyvPJIXg5zRMZr0BhsrCBAD37tMfAHKovNXyYYMcyFoOYXBHUkWcPn8KkyW3euJ4Qsjew1dCP9gYnCFptuIpBZNLdn653c5Z6R_SN6U5REhAUaIEzlaVhu3FgZDCyUta1CB62ki4mi7lZvgSotUp4lT3LLKAwAsSXw_o_Ey-0xrH-LjcamjCSHnRyH7t7Sj-XBjWzbUwuIsDq1oA-5IgnKlVCDlu5CAnO_V0w2BBpmQ6uUZ5oAqlVESrmR23TZOVxYkMbYGo7JHHuu6SDTHhGmUF3y7qiNq81jO_FF_bh0aAM7nUq7UJ2NxlktB85o91-lbwXHMcsPIco1K_ikuI5mUJ8_Jl9fPgzG8Sj8NNZc8UmlCwQ1jkVP6Q_8Gm3rko1utw2ys19nyhfX1kGwM5AN7TjIR_d8sfgAggL3rcV8fvjdyOV3Xu5BqfJcAVo52fvhD3W0DhsCMXUx1yuPCrr6_SXAtrDcGRmsg_KkoNai_X9T0jjKmWpA_VvOiOTdeocU0ZmcQA91sFO2WHFg48cvf5Cg5mR8EFNALOAlMMlUcsJlq7)

*Diagrama PlantUML — fuente editable: [`docs/diagrams/arquitectura-request-lifecycle.puml`](diagrams/arquitectura-request-lifecycle.puml).*

`withApiHandler` (`src/shared/lib/api-handler.ts`) centraliza: chequeo de sesión (salvo `public: true`),
parseo de `query`/`body`, y el `try/catch` uniforme (`ZodError` → `ValidationError` 400,
`AppError` → su `statusCode`, resto → 500 vía `err()`).

---

## 4) Infraestructura y despliegue

- **Hosting**: Next.js 16 App Router — compatible con despliegue en Vercel (Node/Edge runtime híbrido); el middleware (`proxy.ts`) corre en cada request.
- **Base de datos**: PostgreSQL gestionado en Supabase. Acceso vía `postgres` (driver) + Drizzle ORM (`src/shared/db/client.ts`).
- **Migraciones**: Drizzle Kit (`drizzle.config.ts`) genera SQL desde `src/shared/db/schema.ts` hacia `src/shared/db/migrations/`. Nunca se edita el SQL generado a mano.
- **Rate limiting**: Upstash Redis (REST) vía `@upstash/ratelimit`, sliding window 5 req/min sobre login y register. **Fail-open**: si `UPSTASH_REDIS_REST_URL`/`TOKEN` no están configuradas, el rate limit queda deshabilitado (solo `console.warn`) — ver `src/shared/lib/rate-limit.ts`.
- **Autenticación**: Auth.js (NextAuth v5) con `Credentials` provider, sesión **JWT** (no hay tablas de sesión en DB: `accounts`/`sessions`/`verification_tokens` del schema son del adapter de NextAuth y están **sin uso** mientras no se agregue un provider OAuth).
- **Datos de mercado**: `GET /api/market-data/live` es la única ruta pública con lógica no trivial — arma catálogo y hace fetch a APIs externas desde el servidor, con caché de 5 min.
- **CI**: `.github/workflows/ci.yml` — `pnpm typecheck` + `pnpm lint` (+ `pnpm test`) en cada PR hacia `main`/`develop`.
- **Headers de seguridad** (`next.config.ts`): `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, HSTS, `Permissions-Policy`. No hay `Content-Security-Policy` todavía (ver `docs/roadmap-mejoras.md` Fase 5).

---

## 5) Organización de carpetas (Feature-Sliced)

```
app/
  (app)/**            páginas protegidas (dashboard, transactions, investments, ...)
  (auth)/**            login, register
  api/**               route handlers (backend)
src/
  entities/<entity>/
    model/*.entity.ts     clase de dominio pura
    model/*.schema.ts      Zod (validación de input)
    repo.ts                 interfaz del repositorio (contrato)
  features/<feature>/
    usecases/*.usecase.ts  lógica de negocio
    repo.impl.ts             implementación Drizzle del contrato
    api/*.api.ts              fetcher cliente (fetch a /api/**)
    hooks/                     TanStack Query hooks
    mappers/*.mapper.ts       Dominio ↔ DTO
    model/query-keys.ts       query keys centralizadas
    ui/                         componentes del feature
  shared/
    config/env.ts              validación Zod de variables de entorno
    db/{client.ts,schema.ts,relations.ts,migrations/}
    lib/{auth.ts,money.ts,date.ts,errors.ts,response.ts,api-handler.ts,rate-limit.ts,password.ts}
    ui/                          kit shadcn/ui
  widgets/                      composiciones de UI de alto nivel (sidebar, dashboard, tablas)
```

Features existentes: `auth`, `categories`, `dashboard`, `investments`, `market-data`,
`payment-methods`, `profile`, `recurring`, `transactions`.

### 5.1) UI de autenticación (login/registro)

`src/widgets/auth/auth-shell.tsx` (`AuthShell`) define el layout split-screen de `/login` y `/register`:
form a la izquierda (topbar con wordmark + `ThemeToggle`, título, `AuthTabs`, contenido, footer) y panel de
marca oscuro a la derecha. Mantiene la misma firma de props (`title`, `description`, `footer`, `children`)
para que las páginas no dependan del layout interno.

Componentes en `src/features/auth/ui/`:

- `AuthTabs` — control segmentado (`role="tablist"`) que navega entre `/login` y `/register` vía `Link`, marca la ruta activa según `usePathname()`.
- `AuthBrandPanel` — panel oscuro decorativo (headline, mini-ledger de ejemplo, `BalanceCurve`, línea de seguridad). Solo visible en viewport `lg+`. Usa `Wordmark`/`BRAND_SERIF` de `src/shared/ui/` (ver §5.2).
- `BalanceCurve` — curva de saldo animada en Canvas nativo (sin librerías de charting), theme-aware (relee el token `--auth-panel-accent` en cada frame) y respeta `prefers-reduced-motion`.
- `balance-curve.points.ts` — función pura `generateBalanceCurve(count)` que genera los puntos normalizados de la curva; es la única lógica de este conjunto cubierta por test unitario (vitest, `environment: node`).

El wordmark "cifratrack.01" y el font-stack serif de marca (`AuthWordmark`/`AUTH_BRAND_SERIF`) se movieron a
`src/shared/ui/wordmark.tsx`/`brand-fonts.ts` (`Wordmark`/`BRAND_SERIF`) para que el menú lateral del panel
los reutilice sin duplicar código — ver §5.2. `AuthShell` y `AuthBrandPanel` los consumen con `tone="default"`
y `tone="panel"` respectivamente.

`src/shared/ui/password-input.tsx` (`PasswordInput`) — input de contraseña con toggle mostrar/ocultar,
compartido entre login y registro; envuelve `Input` y reenvía ref/props (compatible con `{...field}` de react-hook-form).

**Paleta con scope**: el acento esmeralda y el panel oscuro viven en tokens `--auth-*` (`app/globals.css`,
`:root` + overrides `.dark` + mapeo en `@theme inline`). No alteran `--primary`/`--accent`/otros tokens
globales — el theme global de la app sigue siendo escala de grises.

**Google login**: previsto como feature futura; hoy sin UI ni código muerto. No tratar como faltante/bug.

### 5.2) UI del panel (dashboard, header, menú lateral)

Comparte la estética del acceso (serif de marca, acento esmeralda, etiquetas mono, cifras tabulares) a
través de componentes movidos/creados en `src/shared/ui/`:

- `Wordmark` (`wordmark.tsx`) — wordmark serif "cifratrack.01" con tono `default` / `panel` / `nav`; reemplaza
  al `AuthWordmark` que vivía en `features/auth/ui/` (ver §5.1).
- `BRAND_SERIF` (`brand-fonts.ts`) — font-stack serif compartido (antes `AUTH_BRAND_SERIF`).
- `SegmentedToggle` (`segmented-toggle.tsx`) — control segmentado genérico (`role="radiogroup"`), usado por
  el toggle Lista/Torta de categorías.

Widgets nuevos en `src/widgets/dashboard/` (reemplazan a `SummaryCards`, **eliminado**):

- `BalanceHero` — hero de balance del mes con `BalanceCurveChart` embebida (curva Canvas de saldo acumulado,
  decorativa/`aria-hidden`, relee tokens de color en cada frame para seguir el tema).
- `FlowTiles` — dos tiles (ingresos/egresos) con su proporción sobre el movimiento total del mes.
- `CategoryLedger` — filas de libro mayor por categoría (punto de color, importe mono, hairline de proporción).

`src/shared/lib/category-colors.ts` — rampa de 8 colores de categoría (`getCategoryColor(index)`), como
referencias a tokens CSS (`var(--app-cat-N)`). Vive en `shared/lib/` (mudado desde `widgets/dashboard/`) porque
la consumen tanto los widgets del panel (`CategoryLedger`, `ExpensesChart`/`CategoryPieChart`) como el feature
de movimientos (`transaction-filters-bar.tsx`, `transactions-ledger.tsx`, `transaction-card-list.tsx`) — un
feature no puede importar un widget, así que la utilidad compartida se subió a `shared/`.

**Paleta con scope de app**: la superficie del menú lateral (clara en tema claro, tinta oscura en tema oscuro
— a diferencia del panel de auth, que es oscuro en ambos temas), los semánticos de signo (`--app-pos`/`--app-neg`)
y la rampa de categorías viven en tokens `--app-*` (`app/globals.css`, `:root` + overrides `.dark` + mapeo en
`@theme inline`), separados de `--auth-*` y de los tokens globales (`--primary`/`--accent`/etc.), que no se tocan.

**Lógica pura del feature**: `src/features/dashboard/lib/` es la ubicación de la lógica de negocio pura del
feature dashboard, testeable sin DB/React (vitest `environment: node`) — hoy contiene `balance-series.ts`
(`buildBalanceSeries`, ver `docs/reglas-de-negocio.md` §3.7).

### 5.3) UI de movimientos (`/transactions`)

Continúa la estética del acceso y el panel (serif, mono en versalitas, mono tabular, hairlines en vez de
cajas) en `src/features/transactions/ui/`:

- `TransactionSummaryStrip` — tira de 4 métricas del mes (Ingresos, Egresos, Pagado, Pendiente) con barra de
  proporción pagado/pendiente. Reemplaza a `TransactionSummaryCards` (**eliminado**).
- `TransactionFiltersBar` — barra de filtros: búsqueda, `SegmentedToggle` para tipo/estado, select de forma de
  pago, chips de categoría con color de la rampa. El mes ya no vive acá (pasó al encabezado, ver más abajo).
  Reemplaza a `TransactionFilters` (**eliminado**).
- `TransactionsLedger` (desktop, `md+`) — libro mayor: hairlines, cabecera ordenable con `aria-sort`, una sola
  columna de importe con signo + color por token (`getAmountTone`/`getAmountSign`, exportados desde acá).
- `TransactionCardList` (mobile, `<md`) — mismo lenguaje que el libro mayor en fichas, reusa
  `getAmountTone`/`getAmountSign` de `TransactionsLedger`.
- `TransactionsTable` — contenedor delgado que elige `TransactionsLedger` o `TransactionCardList` según
  breakpoint; conserva la firma de props histórica para no acoplar la página a la implementación interna.
- `transactions-skeleton.tsx` — `TransactionSummaryStripSkeleton` / `TransactionsLedgerSkeleton`, con la forma
  real del contenido (no placeholders genéricos).

**Lógica pura del feature**: `src/features/transactions/lib/transaction-summary.ts` —
`buildTransactionSummary(rows, month)` reduce filas agrupadas por `kind`+`status` a `TransactionSummaryDTO`
(ver `docs/reglas-de-negocio.md` §3.1 y `docs/diagramas-clases.md`), testeable sin DB.

**Navegación de mes controlada por URL**: `src/shared/lib/hooks/useControlledMonthNavigation.ts` — variante de
`useMonthNavigation` (panel, estado local) para pantallas donde el mes vive afuera del hook (la URL, vía
`useTableParams`). Comparte `formatMonthLabel` (`src/shared/lib/utils/month-label.ts`) con el hook de estado
local para no duplicar el formateo "agosto 2026". El encabezado de `/transactions` combina este hook con
`MonthSelector` (mismo componente que usa el panel).

**Token de estado pendiente**: `--app-pend` (`app/globals.css`, junto a `--app-pos`/`--app-neg`) — semántico de
signo para "todavía no" (egresos con `status: "pending"`), distinto del arcilla de egreso (`--app-neg`) y
afinado para contraste AA en ambos temas (`text-app-pend` sobre `bg-card`).

---

## 6) Documentos relacionados

- [`docs/reglas-de-negocio.md`](reglas-de-negocio.md) — reglas de negocio, contratos de API, convenciones de dominio.
- [`docs/base-de-datos.md`](base-de-datos.md) — DER completo, índices, checks, tablas sin uso.
- [`docs/diagramas-clases.md`](diagramas-clases.md) — UML de entidades, value objects, servicios y usecases.
- [`docs/diagramas-flujos.md`](diagramas-flujos.md) — diagramas de secuencia y de estados de los flujos principales.
