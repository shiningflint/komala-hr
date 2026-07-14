# AGENTS.md — Komala HR

## Quick Reference

```bash
pnpm install          # install all workspace deps
pnpm db:migrate       # create/apply Prisma migrations (SQLite at packages/db/prisma/dev.db)
pnpm db:seed          # seed demo company, 6 employees, sample data, tax settings
pnpm web:dev          # Next.js dev server at http://localhost:3000
pnpm web:build        # production build (NOT `pnpm build` — that script doesn't exist)
pnpm --filter @komala/mobile start   # Expo dev server for mobile app
```

### Docker (full stack)

```bash
docker compose up -d   # builds image, starts Postgres + web app (~90s first run for seed)
docker compose down    # stops containers
docker compose logs -f web   # watch startup logs
```

The Docker setup runs Postgres + Next.js in containers. The entrypoint handles schema push, seeding, and app start automatically. Access at `http://localhost:7777` (configurable in `docker-compose.yml`).

Demo password for all seeded accounts: `Komala123!`. Example emails: `ariek.nugroho@komala.co.id` (SUPER_ADMIN), `siti.rahayu@komala.co.id` (HR_ADMIN), `dewi.lestari@komala.co.id` (EMPLOYEE).

There are **no tests** in this codebase. No test runner is configured.

## Architecture

**Monorepo** managed by Turborepo + pnpm workspaces (`pnpm-workspace.yaml`).

```
apps/web       → Next.js 14 App Router (admin dashboard + ESS portal + REST API)
apps/mobile    → Expo / React Native (clock-in/out, leave, payslips for employees)
packages/db    → Prisma schema, migrations, seed, singleton PrismaClient
packages/shared → Zod schemas, tax engine (PPh21/BPJS), JWT auth, Haversine geofence
```

The **web app's API routes** (`apps/web/app/api/`) serve as the backend for both web and mobile clients. The mobile app is a thin client that calls these REST endpoints.

### Data Flow Pattern

- **Web UI mutations**: React form → Server Action (`lib/actions/*.ts`) → Service (`lib/services/*.ts`) → Prisma
- **Web UI reads**: Server Component → Prisma directly (or service)
- **Mobile / API clients**: HTTP request → Route handler (`app/api/**/route.ts`) → `getAuthContext(req)` → Service → Prisma
- **Shared validation**: Zod schemas in `packages/shared/src/schemas/` are imported by both web actions and API route handlers

### Auth

- JWT via `jose` library. Tokens contain `{ userId, employeeId, email, role }`.
- **Web**: httpOnly cookie (`SESSION_COOKIE`), validated in Server Components/Layouts via `requireSession()` / `requireAdmin()` / `requireManagerOrAbove()` from `lib/session.ts`.
- **Mobile**: Bearer token in Authorization header, validated via `getAuthContext(req)` from `lib/auth-context.ts` which checks both cookie and Bearer.
- Role hierarchy: `SUPER_ADMIN` > `HR_ADMIN` > `MANAGER` > `EMPLOYEE`. Session helpers enforce access at the layout level (`/dashboard/**` requires manager+, `/me/**` requires any authenticated user).

### Database

- **SQLite by default** for zero-setup dev. Prisma schema deliberately avoids SQLite-incompatible features.
- Switch to Postgres: change `provider` in `schema.prisma` to `"postgresql"`, set `DATABASE_URL`, run `docker compose up -d`, then `prisma migrate dev`.
- `packages/db/prisma/schema.postgres.prisma` is the Postgres variant — identical schema but with `provider = "postgresql"`. The Docker build copies this over `schema.prisma` automatically.
- All enum-like fields are stored as `String` (SQLite has no native enums). Validation happens via Zod schemas in `packages/shared`, not at the DB level.
- The `@komala/db` package re-exports `@prisma/client` and provides a singleton `PrismaClient` with the global cache pattern for Next.js hot-reload safety.

## Key Domain Concepts

### Indonesian Tax Compliance

The tax engine in `packages/shared/src/tax/` implements:

- **PPh21** (income tax) using the TER (Tarif Efektif Rata-rata) monthly method per PMK 168/2023
- **December year-end reconciliation**: compares TER withholdings against progressive Pasal 17 rates, calculates true-up
- **BPJS** contributions: Kesehatan, JHT, JP (employee + company), JKK, JKM (company only)
- **PTKP** statuses: TK0–TK3, K0–K3 (marital/dependent status for non-taxable income threshold)
- Tax settings are versioned by `effectiveYear` in the `TaxSetting` model and editable in the UI (TER/progressive brackets are read-only in UI — edit DB directly for those)

`calcPayslip()` in `packages/shared/src/tax/payslip.ts` is the central function: gross → BPJS → PPh21 → net.

### Attendance & Geofencing

- Employees must have an assigned `Office` (with lat/lng/radius) to clock in
- `checkGeofence()` in `packages/shared/src/geo/haversine.ts` computes Haversine distance
- Clock-in after 9:00 AM is flagged as `LATE`
- Attendance uses API routes (not Server Actions) because the `ClockCard` component is `"use client"` and calls `fetch()` directly

### Payroll Lifecycle

`DRAFT` → `PROCESSED` → `PAID`. Each transition has guard checks. Processing creates/updates `Payslip` records for all employees in a transaction.

## Code Conventions

### File Organization

- `apps/web/lib/actions/` — Next.js Server Actions (`"use server"`). Thin wrappers that parse FormData, call services, revalidate paths, and redirect.
- `apps/web/lib/services/` — Business logic. Pure async functions, no HTTP concerns. Called by both actions and API routes.
- `apps/web/app/api/` — REST route handlers. Used by mobile app and client-side web components (e.g., `ClockCard`).
- `apps/web/components/` — Shared React components. Client components use `"use server"` directive; server components are the default.
- `packages/shared/src/schemas/` — Zod schemas + inferred types. Single source of truth for validation across all clients.

### Styling

- Tailwind CSS with a custom `brand-*` color palette defined in `tailwind.config.ts`
- Reusable CSS utility classes in `globals.css`: `.card`, `.btn-primary`, `.btn-secondary`, `.btn-danger`, `.input`, `.label`, `.badge-green`, `.badge-yellow`, `.badge-red`, `.badge-slate`
- Use these utility classes instead of raw Tailwind for standard UI elements

### Forms

- Forms use native HTML `<form>` elements with Server Actions (not client-side state management)
- `FormData` is parsed manually in action files (no form library)
- After mutation: `revalidatePath()` + `redirect()` — standard Next.js App Router pattern

### TypeScript

- `@komala/shared` exports both schemas and types (e.g., `employeeSchema` and `EmployeeInput`)
- Prefer `z.infer<typeof schema>` types over manual interfaces when a Zod schema exists
- Cast Prisma string fields to shared types when needed (e.g., `employee.ptkpStatus as PTKPStatus`)

## Gotchas

1. **SQLite stores dates as strings.** Calendar dates (leave, attendance) are stored as UTC-midnight. Use `formatCalendarDate()` from `apps/web/lib/format.ts` to display them without timezone shift.

2. **No native enums in SQLite.** All status/type fields are plain strings validated by Zod. When adding new enum values, update both `packages/shared/src/schemas/enums.ts` and the Prisma schema comments.

3. **Attendance API routes, not Server Actions.** The clock-in/out flow uses `fetch()` from a client component, not Server Actions. New attendance features should follow this pattern.

4. **Mobile API base URL.** `localhost` resolves to the phone/emulator itself, not the dev machine. Use `EXPO_PUBLIC_API_BASE_URL` env var with your LAN IP or `10.0.2.2` for Android emulator.

5. **Default new employee password** is `Komala123!` (hardcoded in `apps/web/lib/actions/employees.ts`). Password is optional on the form — falls back to this default.

6. **Tax settings are versioned by year.** `getTaxSettingsForYear()` looks up the correct `TaxSetting` row. When adding a new year, seed or create a new `TaxSetting` record.

7. **Payroll December reconciliation** requires `yearToDate` figures. The `processPayrollPeriod` service fetches prior months' payslips and passes accumulated totals. This only triggers for `month === 12`.

8. **Payslip stores a JSON snapshot** (`calculationSnapshot`) for audit trail. It's `JSON.stringify(result.snapshot)` — the full breakdown of the calculation.

9. **No test suite.** There's no test runner, no test files, no test scripts. If you add tests, you'll need to set up the tooling from scratch.

10. **Single-tenant.** The schema has a `Company` model but the app assumes one company. All seed data creates one company. Don't add multi-tenant logic without discussing the scope change.

11. **Build script is `web:build`, not `build`.** The root `package.json` has `"web:build": "pnpm --filter @komala/web build"`. Running `pnpm build` at the root fails.

12. **`next.config.js` requires `output: "standalone"`** for the Docker standalone server. This is already set. Removing it breaks the Docker build.

13. **`useSearchParams()` needs `<Suspense>`.** Next.js 14 requires any component using `useSearchParams()` to be wrapped in a `<Suspense>` boundary, or the build fails at static generation. The login page already does this.

14. **No `public/` directory.** The web app has no `public/` folder. Don't add `COPY ... ./apps/web/public` to the Dockerfile — it will fail.

15. **Docker Prisma engine needs `openssl`.** The `node:20-bookworm-slim` base image needs `apt-get install openssl` for the Prisma query engine to load. Alpine (`node:20-alpine`) has musl/openssl version mismatches that break Prisma.

16. **pnpm symlinks don't survive Docker COPY.** `node_modules/.bin/` contains pnpm symlinks that break when copied into a container. The Docker setup installs `prisma` and `tsx` globally via `npm install -g` as a workaround, and copies `packages/db/node_modules` separately for seed script module resolution.
