# Komala HR

An internal HR/payroll app for PT Komala Indonesia — geo-tagged attendance, leave, reimbursement, and payroll with Indonesian PPh 21 / BPJS compliance. Built as a working prototype (web admin + employee self-service + a companion mobile app for check-in).

**⚠️ Before running real payroll:** the PPh 21 TER brackets, PTKP table, progressive brackets, and BPJS rates ship as seeded, editable data (see Tax Settings in the app) modeled on PMK 168/2023, PMK 101/2016, and UU HPP — but the monthly TER tables are an illustrative subset, not the full official Lampiran, and BPJS wage caps change periodically by regulation. Verify all figures against current DJP/BPJS sources before relying on this for statutory withholding. This is not tax advice.

## Stack

- **apps/web** — Next.js 14 (App Router) admin dashboard + employee self-service portal + REST API (serves both the web UI and the mobile app)
- **apps/mobile** — Expo/React Native app for geo-tagged clock-in/out, leave, and payslips
- **packages/db** — Prisma schema + seed data. Uses **SQLite** by default (zero setup); switch to Postgres via `docker-compose.yml` for a closer-to-production setup (see comments in `packages/db/prisma/schema.prisma`)
- **packages/shared** — the PPh21/BPJS tax engine, zod schemas, JWT auth, and the Haversine geofence calculation, shared between web and mobile

## Getting started

```bash
pnpm install
pnpm db:migrate   # creates packages/db/prisma/dev.db and applies migrations
pnpm db:seed      # seeds PT Komala Indonesia, 6 employees, sample attendance/leave/payroll
pnpm web:dev       # http://localhost:3000
```

Demo login (any seeded account, same password for all): password `Komala123!`. Example emails: `ariek.nugroho@komala.co.id` (Super Admin), `siti.rahayu@komala.co.id` (HR Admin), `dewi.lestari@komala.co.id` (Employee).

### Mobile app

```bash
pnpm --filter @komala/mobile start
```

Set `EXPO_PUBLIC_API_BASE_URL` to your machine's LAN IP (not `localhost` — that only resolves on the phone/emulator itself) when testing on a physical device or the Android emulator (`10.0.2.2` for the Android emulator's host loopback).

### Docker (full stack)

```bash
docker compose up -d   # builds image, starts Postgres + web app (~90s first run for seed)
docker compose down    # stops containers
docker compose logs -f web   # watch startup logs
```

The Docker setup runs Postgres + Next.js in containers. The entrypoint handles schema push, seeding, and app start automatically. Access at `http://localhost:7777` (configurable in `docker-compose.yml`).

## What's implemented

- Auth (JWT via `jose`, httpOnly cookie for web / Bearer token for mobile), role-based access (Super Admin / HR Admin / Manager / Employee)
- Org setup: company, offices (with geofence lat/lng/radius), departments, positions, employee CRUD, org chart
- **Geo-tagged attendance**: browser Geolocation (web) / `expo-location` (mobile), Haversine distance-to-office check, inside/outside-geofence flag, admin attendance log
- Leave: types/balances, request + approve/reject, automatic balance deduction on approval
- Reimbursement: submit + approve/reject
- **Payroll**: per-employee gross → BPJS (Kesehatan + Ketenagakerjaan: JHT/JP/JKK/JKM) → PPh21 (monthly TER method) → net pay, with automatic December year-end reconciliation against the progressive Pasal 17 rates; downloadable PDF payslips
- Tax Settings screen to view/edit PTKP, BPJS rates/caps (TER and progressive brackets are read-only in the UI — edit the seed data or `TaxSetting` DB rows directly for those)

## Known gaps (by design, for a first prototype)

- Single company only, no multi-tenant support
- No e-signature, face-recognition check-in, or offline mobile sync
- No performance-review/OKR module
- Auth is a simple custom JWT scheme, not a hardened production IdP
