# GBUD

GBUD is a production-oriented, cross-platform fitness ecosystem designed to support both mobile and web applications. It is built around three core pillars:

- **TRAIN** — Workout planning, execution, exercise tracking, sets/reps/weight, workout history, and personal records (PRs).
- **FUEL** — Nutrition and food tracking.
- **PROGRESS** — Body metrics, strength progression, body measurements, analytics, and long-term progress.

---

## Current Status

- **Phase 0 — Project Foundation**: `Completed`
- **Phase 1 — Backend Foundation**: `Completed`
- **Phase 2 — Database & Prisma**: `Completed`
- **Phase 3 — Authentication & Identity**: `Completed`
- **Phase 4 — Core TRAIN Domain**: `Not Started`

---

## Technology Stack

- **Node Version Engine Requirement**: `Node.js >= 22`
- **Package Manager / Workspace**: `pnpm` Monorepo
- **Mobile**: React Native, Expo, TypeScript
- **Web**: React, Vite, TypeScript
- **Backend API**: Node.js, Express, TypeScript, Prisma ORM, Bcrypt, JWT (`jsonwebtoken`), Cookie-Parser, Helmet, Zod, Vitest, Supertest
- **Database**: PostgreSQL, Prisma ORM
- **State & Data**: Zustand, TanStack Query
- **Authentication**: JWT Access Tokens + Database Refresh Token Sessions with Atomic Rotation

---

## Authentication Architecture (Phase 3 Implemented)

### Registration & Login Lifecycle
```text
Client Request
     ↓
Zod Validation (registerSchema / loginSchema)
     ↓
Auth Controller (Cookie Detection / Transport Handler)
     ↓
Auth Service
     ├── Password Hashing / Verification (bcrypt)
     ├── User Status Check (ACTIVE enforcement)
     ├── User Repository (Prisma)
     └── Session Repository (Atomic Prisma Transaction)
     ↓
Tokens & Response
     ├── Access Token (JWT 15m expiration)
     ├── Refresh Token (HttpOnly Cookie for Web / JSON for Mobile)
     └── Safe User Profile (passwordHash & tokenHash NEVER exposed)
```

### Protected Request Lifecycle
```text
Client Request (Header: Authorization: Bearer <access_token>)
     ↓
Auth Middleware (`authenticate`)
     ├── Extract & Verify JWT Access Token
     ├── Resolve User via UserRepository
     └── Attach `req.user`
     ↓
Protected Controller (`GET /api/v1/auth/me`)
```

### Atomic Refresh Token Rotation
```text
Refresh Request
     ↓
Hash Refresh Token (SHA-256)
     ↓
Prisma Transaction (`rotateSessionAtomic`)
     ├── Verify Active Session & Expiration
     ├── Revoke Old Session
     └── Issue New Session & Rotated Refresh Token
```

---

## Implemented API Endpoints

| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/health` | Public | System runtime status |
| `POST` | `/api/v1/auth/register` | Public | Register new user account |
| `POST` | `/api/v1/auth/login` | Public | Authenticate user & issue tokens |
| `POST` | `/api/v1/auth/refresh` | Public | Rotate refresh token & issue new access token |
| `POST` | `/api/v1/auth/logout` | Public | Revoke session server-side & clear cookies |
| `GET` | `/api/v1/auth/me` | **Bearer** | Retrieve authenticated user profile |

---

## Database Architecture (Prisma)

### `User` Model (`users`)
- `id` (UUID Primary Key)
- `email` (Unique String, normalized lowercase)
- `username` (Unique String)
- `passwordHash` (String, bcrypt salt factor 10)
- `status` (`ACTIVE` | `SUSPENDED` Enum)
- `createdAt`, `updatedAt` (Timestamps)
- `sessions` (Relation `Session[]` with `onDelete: Cascade`)

### `Session` Model (`sessions`)
- `id` (UUID Primary Key)
- `userId` (Foreign Key -> `User.id`)
- `tokenHash` (Unique String, SHA-256 hash of refresh token)
- `expiresAt` (Timestamp)
- `revokedAt` (Optional Timestamp)
- `createdAt`, `updatedAt` (Timestamps)

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
│       ├── prisma/         # Prisma schema and database configuration
│       │   └── schema.prisma
│       └── src/
│           ├── config/     # Typed environment, app config, & Prisma singleton
│           ├── controllers/# Thin HTTP Controllers (auth.controller.ts, health.controller.ts)
│           ├── middleware/ # Request ID, Logger, Validation, Auth, 404, Error handling
│           ├── modules/    # Domain modules (auth/ module with service, controller, routes)
│           ├── repositories/# Data access repositories (user.repository.ts, session.repository.ts)
│           ├── routes/     # Route registry and endpoint routers
│           ├── services/   # Business logic services
│           ├── types/      # Express Request type extensions (express.d.ts)
│           ├── utils/      # AppError, bcrypt password, & JWT security utilities
│           ├── __tests__/  # Vitest + Supertest testing suite (auth, health, 404, error, validation)
│           ├── app.ts      # Express application setup
│           └── server.ts   # Server startup entry point & graceful shutdown
│
├── packages/
│   ├── config/             # Shared app & environment configurations (@gbud/config)
│   ├── constants/          # Shared domain constants (@gbud/constants)
│   ├── types/              # Shared TypeScript definitions & API contracts (@gbud/types)
│   ├── ui/                 # Shared UI component library foundation (@gbud/ui)
│   ├── utils/              # Framework-independent utility functions (@gbud/utils)
│   └── validation/         # Shared Zod validation schemas (@gbud/validation)
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

4. **Generate Prisma Client**
   ```bash
   pnpm --filter @gbud/api run prisma:generate
   ```

5. **Verify TypeScript compilation**
   ```bash
   pnpm typecheck
   ```

6. **Run automated testing suite**
   ```bash
   pnpm test
   ```

7. **Build all workspace packages and apps**
   ```bash
   pnpm build
   ```

8. **Start development services**
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

## Project Roadmap

- **Phase 0 — Project Foundation** *(Completed)*
- **Phase 1 — Backend Foundation** *(Completed)*
- **Phase 2 — Database & Prisma** *(Completed)*
- **Phase 3 — Authentication & Identity** *(Completed)*
- **Phase 4 — Core TRAIN Domain** *(Upcoming: Workout models, Exercise library, Sets/Reps/Weight tracking, Personal Records, Workout Execution)*
- **Phase 5 — FUEL Domain**
- **Phase 6 — PROGRESS Domain**
