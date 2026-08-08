# GBUD

GBUD is a production-oriented, cross-platform fitness ecosystem designed to support both mobile and web applications. It is built around three core pillars:

- **TRAIN** — Workout planning, execution, exercise tracking, sets/reps/weight, workout history, and personal records (PRs).
- **FUEL** — Nutrition and food tracking.
- **PROGRESS** — Body metrics, strength progression, body measurements, analytics, and long-term progress.

---

## Current Status

- **Phase 0 — Project Foundation**: `Completed`
- **Phase 1 — Backend Foundation**: `Completed`
- **Phase 2 — Database & Prisma**: `Not Started`

---

## Technology Stack

- **Node Version Engine Requirement**: `Node.js >= 22`
- **Package Manager / Workspace**: `pnpm` Monorepo
- **Mobile**: React Native, Expo, TypeScript
- **Web**: React, Vite, TypeScript
- **Backend API**: Node.js, Express, TypeScript, Helmet, Zod, Vitest, Supertest
- **Database (Target)**: PostgreSQL, Prisma ORM
- **State & Data**: Zustand, TanStack Query
- **Authentication (Target)**: JWT (Access & Refresh tokens)

---

## Backend Request Lifecycle (Phase 1 Implemented)

```text
HTTP Request
     ↓
Global Middleware (Helmet, CORS, Body Limits)
     ↓
Request ID Middleware (X-Request-ID Header Generation / Propagation)
     ↓
Logger Middleware (Structured Request Logging)
     ↓
API V1 Router (/api/v1)
     ↓
Request Validation Middleware (Zod Schemas → 422 VALIDATION_ERROR)
     ↓
Controller
     ↓
Service
     ↓
Unmapped Route Handler (404 NOT_FOUND)
     ↓
Centralized Error Handler (AppError Formatting & Production Error Sanitization)
```

---

## Repository Structure

```text
gbud/
├── apps/
│   ├── mobile/             # Expo + React Native + TypeScript app
│   └── web/                # React + Vite + TypeScript web app
│
├── services/
│   └── api/                # Express + Node.js + TypeScript REST API
│       └── src/
│           ├── config/     # Typed environment validation & app configuration
│           ├── controllers/# Thin HTTP Controllers
│           ├── middleware/ # Request ID, Logger, Validation, 404, Error handling
│           ├── repositories/# Repository directory placeholder (unconnected in Phase 1)
│           ├── routes/     # Route registry and endpoint routers
│           ├── services/   # Business logic services
│           ├── utils/      # Custom AppError & backend utilities
│           ├── __tests__/  # Vitest + Supertest automated testing suite
│           ├── app.ts      # Express application setup
│           └── server.ts   # Server startup entry point & graceful shutdown
│
├── packages/
│   ├── config/             # Shared app & environment configurations (@gbud/config)
│   ├── constants/          # Shared domain constants (@gbud/constants)
│   ├── types/              # Shared TypeScript definitions & API contracts (@gbud/types)
│   ├── ui/                 # Shared UI component library foundation (@gbud/ui)
│   ├── utils/              # Framework-independent utility functions (@gbud/utils)
│   └── validation/         # Shared Zod validation schema contracts (@gbud/validation)
│
├── docs/                   # Product & Architecture specifications
├── .env.example            # Environment variables template
├── .gitignore              # Repository git ignore rules
├── package.json            # Root workspace configuration (Node >=22)
├── pnpm-workspace.yaml     # pnpm workspace definition
├── tsconfig.base.json      # Base TypeScript configuration
├── tsconfig.json           # Root TypeScript project references
└── README.md               # Living project documentation
```

---

## Development Setup

### Prerequisites

- **Node.js**: `>= 22` (Verify with `node -v`)
- **pnpm**: Installed or invoked via `npx pnpm` (Verify with `pnpm -v` or `npx pnpm -v`)

### Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd GBUD
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```

4. **Verify TypeScript compilation**
   ```bash
   pnpm typecheck
   ```

5. **Run automated testing suite**
   ```bash
   pnpm test
   ```

6. **Build all workspace packages and apps**
   ```bash
   pnpm build
   ```

7. **Start development services**
   - Start Backend API:
     ```bash
     pnpm dev:api
     ```
     API health endpoint: `http://localhost:4000/api/v1/health`
   - Start Web App:
     ```bash
     pnpm dev:web
     ```
   - Start Mobile App (Expo):
     ```bash
     pnpm dev:mobile
     ```

---

## Functionality Implemented

### Phase 0 — Project Foundation
- Monorepo workspace established using `pnpm`.
- Enforced `"engines": { "node": ">=22" }` across the monorepo.
- Mobile, Web, and API workspace foundations initialized.
- Shared packages (`@gbud/config`, `@gbud/constants`, `@gbud/types`, `@gbud/ui`, `@gbud/utils`, `@gbud/validation`) configured.

### Phase 1 — Backend Foundation
- **Typed Environment Validation**: Typed environment parser (`config/env.ts`) validating `NODE_ENV`, `API_PORT`, and `CORS_ORIGIN`.
- **Centralized Application Configuration**: `appConfig` export (`config/app.config.ts`) preventing scattered `process.env` access.
- **Standardized API Error Contract**: Standardized `APIErrorResponse` payload with predictable error codes (`BAD_REQUEST`, `NOT_FOUND`, `VALIDATION_ERROR`, `INTERNAL_SERVER_ERROR`).
- **Custom AppError**: Operational error helper class (`utils/app-error.ts`).
- **Request ID Middleware**: Correlation middleware (`middleware/request-id.middleware.ts`) generating and propagating `X-Request-ID` headers.
- **Request Logging Middleware**: Structured request logger (`middleware/logger.middleware.ts`).
- **404 Unmapped Route Handler**: Returns structured JSON 404 response (`middleware/not-found.middleware.ts`).
- **Centralized Error Handler**: Error formatting middleware with production error sanitization concealing stack traces (`middleware/error.middleware.ts`).
- **Request Validation Middleware**: Generic Zod validator returning 422 `VALIDATION_ERROR` (`middleware/validation.middleware.ts`).
- **Central Route Registry**: Modular router mounting (`routes/index.ts`).
- **Graceful Shutdown**: Signal handling (`SIGINT`/`SIGTERM`) in `server.ts`.
- **Automated Testing Suite**: Vitest + Supertest suite testing health check, 404 handler, validation middleware (422), and production error sanitization.

---

## Project Roadmap

- **Phase 0 — Project Foundation** *(Completed)*
- **Phase 1 — Backend Foundation** *(Completed)*
- **Phase 2 — Database & Prisma** *(Upcoming: PostgreSQL database setup, Prisma ORM integration, schema migrations, repository implementations)*
- **Phase 3 — Core Data Models & Validation**
- **Phase 4 — Authentication & User Management**
- **Phase 5 — TRAIN Pillar**
- **Phase 6 — FUEL Pillar**
- **Phase 7 — PROGRESS Pillar**
