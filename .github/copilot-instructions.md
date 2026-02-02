# CifraTrack Copilot Instructions

## 🏗 Authorization & Architecture

- **Strict Layering:**
  - **UI (React):** ONLY interacts with API via Hooks/Query. NO DB imports, NO queries.
  - **API Routes:** Application entry points. Parse Request -> Call UseCase -> Map to DTO -> Return Response.
  - **UseCases (`src/features/**/usecases`):\*\* Pure business logic. Receive inputs, validate rules, call Repositories. Return Domain Entities (not DB rows).
  - **Repositories (`src/features/**/repo.impl.ts`):\*\* Handle Drizzle ORM queries. Map DB results to Domain Entities immediately.
  - **Domain Entities (`src/entities/**/model/\*.entity.ts`):\*\* Pure TS classes with business validation in constructor.

- **Data Flow:**
  `Request -> Route Handler -> UseCase -> Repository -> DB -> Repository (Mapper to Domain) -> UseCase -> Route Handler (Mapper to DTO) -> Response`

## 🧩 conventions & Patterns

- **Domain Modeling:**
  - Use **Classes** for Entities, Value Objects (`Money`), and Services.
  - **Value Objects:** Always use `Money` class for currency (stores cents).
  - **Validation:** Enforce invariants in Entity constructors.
- **DTOs vs Domain:**
  - Never return Domain Entities directly to the client. Always map to DTOs in the API layer.
  - Define DTO interfaces in `mappers/*.mapper.ts`.
- **Database:**
  - **Drizzle ORM:** Use `src/shared/db/schema.ts` definitions.
  - **Migrations:** Do not manually edit SQL. Use `pnpm db:generate` and `pnpm db:migrate`.
- **UI Components:**
  - **Functional Components:** Use React Hooks.
  - **Shadcn UI:** Reuse components from `src/shared/ui` or `components/ui`.
  - **Styles:** Tailwind CSS.

## 🛠 Tech Stack

- **Framework:** Next.js 15+ (App Router).
- **Language:** TypeScript (Strict).
- **State Management:** TanStack Query (Server State), Local State (React).
- **Forms:** React Hook Form + Zod.
- **DB:** PostgreSQL (Supabase) via Drizzle ORM.
- **Auth:** NextAuth (Auth.js) v5.

## 🚀 Key Commands

- **Dev Server:** `pnpm dev`
- **DB Generate:** `pnpm db:generate` (creates SQL from schema)
- **DB Migrate:** `pnpm db:migrate` (applies SQL to DB)
- **Type Check:** `pnpm typecheck`

## 📂 Project Structure

- `@/features/[feature]/`: Contains everything related to a specific feature (API, Hooks, UI, UseCases, Repos).
- `@/entities/[entity]/`: Definitions of Domain Models and Interfaces (Contracts).
- `@/shared/`: Shared infrastructure, UI kit, and libraries.
- `app/api/`: **THIN** wrappers around UseCases.

## 📝 Example Patterns

**Route Handler:**

```typescript
// app/api/transactions/route.ts
export async function GET(req: NextRequest) {
  const session = await auth();
  // ... parse params ...
  const result = await listUseCase.execute(params); // Returns Domain Objects
  const dtos = TransactionMapper.domainsToDTOs(result.data); // Map to DTO
  return NextResponse.json(dtos);
}
```

**UseCase:**

```typescript
// src/features/transactions/usecases/list-transaction.usecase.ts
export class ListTransactionsUseCase {
  constructor(private repo: ITransactionRepository) {}
  async execute(params: Params): Promise<PaginatedTransactions> {
    // Business validation
    if (params.amount < 0) throw new ValidationError("Invalid amount");
    return this.repo.list(params);
  }
}
```
