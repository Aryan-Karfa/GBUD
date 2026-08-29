# GBUD

<<<<<<< HEAD
GBUD is a production-oriented, cross-platform fitness ecosystem designed to support both mobile and web applications. It is built around three core pillars:

- **TRAIN** — Workout planning, execution, exercise tracking, sets/reps/weight, workout history, and personal records (PRs).
- **FUEL** — Nutrition and food tracking.
=======
GBUD is a production-oriented, Android-first fitness ecosystem built around three core pillars:

- **TRAIN** — Workout planning, execution, exercise tracking, sets/reps/weight, workout history, and personal records (PRs).
- **FUEL** — Nutrition and food tracking, meals, quantity-scaled nutrition snapshots, time-based targets, and daily intake summaries.
>>>>>>> b83a35e (Completed Phase 9)
- **PROGRESS** — Body metrics, strength progression, body measurements, analytics, and long-term progress.

---

## Current Status

- **Phase 0 — Project Foundation**: `Completed`
- **Phase 1 — Backend Foundation**: `Completed`
- **Phase 2 — Database & Prisma**: `Completed`
- **Phase 3 — Authentication & Identity**: `Completed`
<<<<<<< HEAD
- **Phase 4 — Core TRAIN Domain**: `Not Started`
=======
- **Phase 4 — Core TRAIN Domain**: `Completed`
- **Phase 5 — Workout Execution**: `Completed`
- **Phase 6 — Progress & Training Analytics**: `Completed`
- **Phase 7 — FUEL & Nutrition Foundation**: `Completed`
- **Phase 8 — Client Architecture & API Integration**: `Completed`
- **Phase 9 — Android Application Foundation**: `Completed`
- **Phase 10 — TRAIN Android Experience**: `Upcoming`
>>>>>>> b83a35e (Completed Phase 9)

---

## Technology Stack

- **Node Version Engine Requirement**: `Node.js >= 22`
- **Package Manager / Workspace**: `pnpm` Monorepo
<<<<<<< HEAD
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
=======
- **Mobile Application**: React Native (0.76.6), Expo (~52.0.0), TypeScript (Android-First Architecture)
- **Backend API**: Node.js, Express, TypeScript, Prisma ORM, Bcrypt, JWT (`jsonwebtoken`), Cookie-Parser, Helmet, Zod, Vitest, Supertest
- **Database**: PostgreSQL, Prisma ORM
- **Client Networking**: `@gbud/api-client` (Fetch, AbortSignal, Single-Flight Refresh Coalescing)
- **Secure Token Storage**: Expo SecureStore (hardware-encrypted refresh token) + In-memory access token

---

## FUEL Domain Architecture

### Source of Truth Philosophy
Actual consumption (`Meal` and `MealFoodEntry`) is the single source of truth for nutrition history. Daily summaries and target comparisons are computed dynamically on read without redundant database caching tables.

```text
FOOD CATALOG (System Foods: ownerId = null | Custom Foods: ownerId = userId)
     │
     ▼
MEALS (mealDate: @db.Date, mealType: BREAKFAST, LUNCH, DINNER, SNACK, OTHER)
     │
     ▼
MEAL FOOD ENTRIES (quantity, unit)
     │
     ├── Per-Serving Snapshots (servingSizeSnapshot, caloriesPerServingSnapshot, etc.)
     └── Entry Total Snapshots (caloriesSnapshot, proteinSnapshot, etc.)
     │
     ▼
DERIVED DAILY NUTRITION ANALYTICS
 ├── Daily Summary (calories, protein, carbs, fat, fiber, meal count)
 ├── Target Comparison (actual vs target, remaining = target - actual)
 └── Time-Based Targets (effectiveFrom: @db.Date, @@unique([userId, effectiveFrom]))
```

### Key Architectural Invariants
- **Bulletproof Snapshot Immutability**: `MealFoodEntry` snapshots per-serving reference values AND total macronutrients. Future food catalog edits or food deletions (`foodId` set to `null`) will **NEVER** modify historical meal food entry snapshots or historical quantity edits.
- **PostgreSQL `@db.Date` Calendar Types**: `Meal.mealDate` and `NutritionTarget.effectiveFrom` use `@db.Date` to avoid UTC timezone offsets.
- **Strict Unit Matching**: `MealFoodEntry.unit` must equal `Food.servingUnit`. Unit mismatches return `422 VALIDATION_ERROR`.
- **Food Ownership & Soft Deactivation**:
  - System foods (`ownerId = null`): Discoverable by all users; immutable to normal users (modification/deletion returns `403 FORBIDDEN`).
  - Custom user foods (`ownerId = userId`): Scoped strictly to the owner; cross-user access returns `404 NOT_FOUND`. Deleting a custom food soft-deactivates it (`isActive = false`).
- **Time-Based Target Immutability**: Targets define `@@unique([userId, effectiveFrom])`. Target resolution selects the latest target with `effectiveFrom <= queryDate`. Attempting to `PATCH` an effective target (`effectiveFrom <= today`) returns `409 CONFLICT`.
>>>>>>> b83a35e (Completed Phase 9)

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
<<<<<<< HEAD
=======
| `GET` | `/api/v1/exercises` | Public | List exercise catalog with pagination & search filtering |
| `GET` | `/api/v1/exercises/:id` | Public | Retrieve single exercise details |
| `GET` | `/api/v1/workout-templates` | **Bearer** | List workout templates owned by authenticated user |
| `POST` | `/api/v1/workout-templates` | **Bearer** | Create a new workout template |
| `GET` | `/api/v1/workout-templates/:id` | **Bearer** | Retrieve single workout template with ordered exercises |
| `PATCH` | `/api/v1/workout-templates/:id` | **Bearer** | Update template name or description |
| `DELETE` | `/api/v1/workout-templates/:id` | **Bearer** | Delete workout template and its template exercises |
| `POST` | `/api/v1/workout-templates/:id/exercises` | **Bearer** | Add an exercise to a workout template |
| `DELETE` | `/api/v1/workout-templates/:id/exercises/:templateExerciseId` | **Bearer** | Remove an exercise from template & re-number order |
| `PATCH` | `/api/v1/workout-templates/:id/exercises/reorder` | **Bearer** | Atomically reorder exercises in a workout template |
| `POST` | `/api/v1/workout-sessions` | **Bearer** | Start a workout session from a template (snapshots exercises) |
| `GET` | `/api/v1/workout-sessions/active` | **Bearer** | Retrieve current active IN_PROGRESS workout session |
| `GET` | `/api/v1/workout-sessions` | **Bearer** | List completed/abandoned workout history (paginated, `startedAt DESC`) |
| `GET` | `/api/v1/workout-sessions/:id` | **Bearer** | Retrieve workout session details with exercises & sets |
| `POST` | `/api/v1/workout-sessions/:sessionId/exercises/:sessionExerciseId/sets` | **Bearer** | Add a set (`reps`, `weight`) to a session exercise |
| `PATCH` | `/api/v1/workout-sessions/:sessionId/exercises/:sessionExerciseId/sets/:setId` | **Bearer** | Update set performance (`reps`, `weight`) |
| `DELETE` | `/api/v1/workout-sessions/:sessionId/exercises/:sessionExerciseId/sets/:setId` | **Bearer** | Delete set & re-number remaining sets sequentially |
| `POST` | `/api/v1/workout-sessions/:id/complete` | **Bearer** | Mark active session COMPLETED |
| `POST` | `/api/v1/workout-sessions/:id/abandon` | **Bearer** | Mark active session ABANDONED |
| `GET` | `/api/v1/progress/summary` | **Bearer** | Retrieve high-level progress summary |
| `GET` | `/api/v1/progress/frequency` | **Bearer** | Retrieve training frequency metrics |
| `GET` | `/api/v1/progress/volume` | **Bearer** | Retrieve total training volume summary |
| `GET` | `/api/v1/progress/volume/exercises` | **Bearer** | Retrieve exercise-level total volume breakdown |
| `GET` | `/api/v1/progress/volume/muscles` | **Bearer** | Retrieve muscle-group total volume breakdown |
| `GET` | `/api/v1/progress/prs` | **Bearer** | Retrieve GBUD-derived personal records |
| `GET` | `/api/v1/progress/exercises/:exerciseId` | **Bearer** | Retrieve historical performance stats for a specific exercise |
| `GET` | `/api/v1/progress/exercises/:exerciseId/trend` | **Bearer** | Retrieve time-series strength progression trend |
| `GET` | `/api/v1/progress/dashboard` | **Bearer** | Retrieve compact progress dashboard snapshot |
| `GET` | `/api/v1/fuel/foods` | **Bearer** | Search and list system + user custom foods |
| `GET` | `/api/v1/fuel/foods/:id` | **Bearer** | Retrieve food details |
| `POST` | `/api/v1/fuel/foods` | **Bearer** | Create a custom food item |
| `PATCH` | `/api/v1/fuel/foods/:id` | **Bearer** | Update custom food item (system foods return 403) |
| `DELETE` | `/api/v1/fuel/foods/:id` | **Bearer** | Soft-deactivate custom food item (system foods return 403) |
| `POST` | `/api/v1/fuel/meals` | **Bearer** | Create a meal |
| `GET` | `/api/v1/fuel/meals` | **Bearer** | List user meals (optional `mealDate` filter) |
| `GET` | `/api/v1/fuel/meals/:id` | **Bearer** | Retrieve meal details with scaled food entry totals |
| `PATCH` | `/api/v1/fuel/meals/:id` | **Bearer** | Update meal name, date, or type |
| `DELETE` | `/api/v1/fuel/meals/:id` | **Bearer** | Delete meal and cascade entries |
| `POST` | `/api/v1/fuel/meals/:mealId/foods` | **Bearer** | Add food entry to meal (server calculates nutrition snapshot) |
| `PATCH` | `/api/v1/fuel/meals/:mealId/foods/:entryId` | **Bearer** | Update food entry quantity (recalculates using stored snapshots) |
| `DELETE` | `/api/v1/fuel/meals/:mealId/foods/:entryId` | **Bearer** | Delete food entry from meal |
| `GET` | `/api/v1/fuel/summary` | **Bearer** | Retrieve daily nutrition summary for a date |
| `GET` | `/api/v1/fuel/summary/compare` | **Bearer** | Compare daily intake against active nutrition target |
| `GET` | `/api/v1/fuel/history` | **Bearer** | Retrieve daily nutrition history over a date range |
| `POST` | `/api/v1/fuel/targets` | **Bearer** | Create a time-based nutrition target |
| `GET` | `/api/v1/fuel/targets` | **Bearer** | List user nutrition targets |
| `GET` | `/api/v1/fuel/targets/current` | **Bearer** | Retrieve active nutrition target for a date |
| `PATCH` | `/api/v1/fuel/targets/:id` | **Bearer** | Update un-effective target (historical targets return 409) |
| `DELETE` | `/api/v1/fuel/targets/:id` | **Bearer** | Delete nutrition target |
>>>>>>> b83a35e (Completed Phase 9)

---

## Database Architecture (Prisma)

<<<<<<< HEAD
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
=======
### Core Models
- `User` (`users` table): User identity, bcrypt credentials, status (`ACTIVE` / `SUSPENDED`), sessions, templates, workout sessions, custom foods, meals, and targets.
- `Session` (`sessions` table): SHA-256 hashed refresh token sessions.
- `Exercise` (`exercises` table): Catalog exercises (`id`, `name`, `description`, `muscleGroup`, `equipment`, `movementPattern`, `exerciseType`, `instructions`, `isActive`).
- `WorkoutTemplate` (`workout_templates` table): `id`, `userId`, `name`, `description`, timestamps.
- `WorkoutTemplateExercise` (`workout_template_exercises` table): `id`, `workoutTemplateId`, `exerciseId`, `order`, `notes`, timestamps.
- `WorkoutSession` (`workout_sessions` table): `id`, `userId`, `workoutTemplateId` (nullable), `status`, `startedAt`, `completedAt`, `abandonedAt`, timestamps.
- `WorkoutSessionExercise` (`workout_session_exercises` table): `id`, `workoutSessionId`, `exerciseId` (nullable), `name` (snapshot), `order`, `notes`, timestamps.
- `WorkoutSet` (`workout_sets` table): `id`, `workoutSessionExerciseId`, `setNumber`, `reps`, `weight`, timestamps.
- `Food` (`foods` table): `id`, `name`, `description`, `servingSize`, `servingUnit`, `calories`, `protein`, `carbohydrates`, `fat`, `fiber`, `isActive`, `ownerId` (nullable).
- `Meal` (`meals` table): `id`, `userId`, `name`, `mealDate` (`@db.Date`), `mealType` (`BREAKFAST` | `LUNCH` | `DINNER` | `SNACK` | `OTHER`), timestamps.
- `MealFoodEntry` (`meal_food_entries` table): `id`, `mealId`, `foodId` (nullable `onDelete: SetNull`), `foodNameSnapshot`, `quantity`, `unit`, per-serving snapshots, entry total snapshots, timestamps.
- `NutritionTarget` (`nutrition_targets` table): `id`, `userId`, `calories`, `protein`, `carbohydrates`, `fat`, `effectiveFrom` (`@db.Date`), timestamps (`@@unique([userId, effectiveFrom])`).
>>>>>>> b83a35e (Completed Phase 9)

---

## Repository Structure

```text
gbud/
├── apps/
<<<<<<< HEAD
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
=======
│   └── mobile/             # React Native + Expo Android-first mobile application
│       ├── src/
│       │   ├── api/        # Typed API client singleton configuration
│       │   ├── app/        # AppBootstrap & AppProviders composition
│       │   ├── auth/       # AuthProvider, auth.service, and auth.types
│       │   ├── components/ # Reusable layout, common, forms, and feedback components
│       │   ├── features/   # Domain placeholder screens (train, fuel, progress)
│       │   ├── navigation/ # Root, Auth, and Main navigators with Android BackHandler
│       │   ├── screens/    # LoginScreen, RegisterScreen, HomeScreen, ProfileScreen
│       │   ├── storage/    # SecureTokenProvider (Expo SecureStore + in-memory access token)
│       │   └── theme/      # Colors, typography, spacing, radius, shadows, theme
│       ├── App.tsx         # Mobile entry point
│       ├── app.json        # Expo & Android configuration (package: com.gbud.app)
│       └── package.json
│
├── services/
│   └── api/                # Express + Node.js + TypeScript REST API
│       ├── prisma/         # Prisma schema, migrations, & catalog seed script
│       └── src/
│           ├── config/     # Typed environment, app config, & Prisma singleton
│           ├── controllers/# Thin HTTP Controllers
│           ├── middleware/ # Request ID, Logger, Validation, Auth, 404, Error handling
│           ├── modules/    # Domain modules (auth/, train/, progress/, fuel/)
│           ├── repositories/# Data access repositories
│           ├── routes/     # Route registry and endpoint routers
│           ├── services/   # Domain services
│           ├── types/      # Express Request type extensions
│           ├── utils/      # AppError, bcrypt password, & JWT security utilities
│           ├── __tests__/  # Vitest + Supertest testing suite (14 test files, 70 passed tests)
>>>>>>> b83a35e (Completed Phase 9)
│           ├── app.ts      # Express application setup
│           └── server.ts   # Server startup entry point & graceful shutdown
│
├── packages/
<<<<<<< HEAD
│   ├── config/             # Shared app & environment configurations (@gbud/config)
│   ├── constants/          # Shared domain constants (@gbud/constants)
│   ├── types/              # Shared TypeScript definitions & API contracts (@gbud/types)
│   ├── ui/                 # Shared UI component library foundation (@gbud/ui)
=======
│   ├── api-client/         # Shared isomorphic API client (@gbud/api-client)
│   ├── config/             # Shared app & environment configurations (@gbud/config)
│   ├── constants/          # Shared domain constants (@gbud/constants)
│   ├── types/              # Shared TypeScript definitions & API contracts (@gbud/types)
>>>>>>> b83a35e (Completed Phase 9)
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

<<<<<<< HEAD
4. **Generate Prisma Client**
   ```bash
   pnpm --filter @gbud/api run prisma:generate
=======
4. **Generate Prisma Client & Seed System Catalog**
   ```bash
   pnpm --filter @gbud/api run prisma:generate
   pnpm --filter @gbud/api run prisma:seed
>>>>>>> b83a35e (Completed Phase 9)
   ```

5. **Verify TypeScript compilation**
   ```bash
   pnpm typecheck
   ```

6. **Run automated testing suite**
   ```bash
   pnpm test
   ```

<<<<<<< HEAD
7. **Build all workspace packages and apps**
=======
7. **Build all workspace packages and services**
>>>>>>> b83a35e (Completed Phase 9)
   ```bash
   pnpm build
   ```

8. **Start development services**
   - Start Backend API:
     ```bash
     pnpm dev:api
     ```
     API health endpoint: `http://localhost:4000/api/v1/health`
<<<<<<< HEAD
   - Start Web App:
     ```bash
     pnpm dev:web
     ```
   - Start Mobile App (Expo):
     ```bash
     pnpm dev:mobile
     ```
=======
   - Start Mobile App (Expo / Android):
     ```bash
     pnpm dev:mobile
     ```
     To launch on Android device/emulator:
     ```bash
     pnpm --filter @gbud/mobile android
     ```

---

## Phase 9 — Android Application Foundation

Phase 9 transforms `apps/mobile` into the production-ready Android-first GBUD application foundation. The inactive web application and unused UI packages were cleanly removed, focusing all frontend engineering directly on the Android platform.

### Architecture Overview

```text
                        📱 GBUD Android App
                                 │
                     ┌───────────▼───────────┐
                     │     AppBootstrap      │
                     │  (Restoring Session)  │
                     └───────────┬───────────┘
                                 │
               ┌─────────────────┴─────────────────┐
               ▼                                   ▼
        UNAUTHENTICATED                      AUTHENTICATED
               │                                   │
               ▼                                   ▼
         AuthNavigator                       MainNavigator
         ├── LoginScreen                     ├── HomeScreen
         └── RegisterScreen                  ├── Train (Phase 10 Placeholder)
                                             ├── Fuel (Phase 11 Placeholder)
                                             ├── Progress (Phase 12 Placeholder)
                                             └── ProfileScreen (Logout & Telemetry)
```

### Key Technical Pillars

1. **Android-First Design System (`theme/`)**:
   - Centralized dark-mode palette (`#09090b` primary background, `#18181b` card surface, `#27272a` borders).
   - High-contrast athletic emerald accent (`#10b981`), amber, and cyan highlights.
   - 4px/8px grid scale, standard Android typography sizes, and native elevation tokens (`elevation2`, `elevation4`, `elevation8`).

2. **Reusable Foundational Mobile Components (`components/`)**:
   - `Screen`: Safe-area and status-bar aware layout wrapper with scrollable/non-scrollable modes.
   - `Card`: Elevated surface card with optional touch feedback.
   - `Text`: Typography component with standard variants (`hero`, `title`, `heading`, `subheading`, `body`, `caption`, `muted`, `error`, `success`).
   - `Button`: Primary, secondary, outline, ghost, and danger buttons with active opacity and loading spinner states.
   - `Input`: Form field with label, focus states, error messages, and password visibility toggle.
   - `KeyboardAvoidingContainer`: Android soft-keyboard avoiding wrapper.
   - `LoadingScreen`, `LoadingIndicator`, `ErrorState`, `EmptyState`, `IconButton`, `Divider`.

3. **Secure Token Management (`SecureTokenProvider`)**:
   - **Access Token**: Kept strictly in memory. Never persisted to disk, `AsyncStorage`, or logs.
   - **Refresh Token**: Stored securely in `expo-secure-store` with key `gbud_mobile_refresh_token` (hardware-backed Keystore on Android).
   - Safe cleanup on logout or invalid session.

4. **Authentication & Session Lifecycle (`AuthProvider`, `auth.service`)**:
   - On app launch, `AppBootstrap` initializes and attempts session restoration from SecureStore.
   - Successfully restored credentials retrieve `/auth/me` and seamlessly route to `MainNavigator`.
   - Failed or absent credentials route gracefully to `AuthNavigator`.
   - Client-side schema validation via `@gbud/validation` (`loginSchema`, `registerSchema`).

5. **Navigation Architecture & Android BackHandler (`NavigationProvider`)**:
   - Zero bulky third-party navigation bloat. Lightweight, strongly-typed React Native primitives.
   - Android hardware `BackHandler` integration:
     - On `RegisterScreen`, hardware back returns to `LoginScreen`.
     - On secondary tabs (`Train`, `Fuel`, `Progress`, `Profile`), hardware back returns to `HomeScreen`.
     - On `HomeScreen` and `LoginScreen`, hardware back allows standard Android OS exit/minimize behavior.

6. **Controlled Domain Placeholders**:
   - Established future domain boundaries in `src/features/` with descriptive placeholders for subsequent phases:
     - **TRAIN** (`TrainPlaceholderScreen`): Arriving in Phase 10 (workout planning, execution, live sets/reps).
     - **FUEL** (`FuelPlaceholderScreen`): Arriving in Phase 11 (nutrition tracking, foods, meals, macros).
     - **PROGRESS** (`ProgressPlaceholderScreen`): Arriving in Phase 12 (analytics, 1RM progression, volume trends).

7. **Android System Configuration**:
   - `app.json`: Configured with package `com.gbud.app`, dark splash screen, adaptive icons, and dark Android navigation bar.
   - Network documentation for Android emulator loopback (`http://10.0.2.2:4000`) vs host/LAN devices.
>>>>>>> b83a35e (Completed Phase 9)

---

## Project Roadmap

<<<<<<< HEAD
- **Phase 0 — Project Foundation** *(Completed)*
- **Phase 1 — Backend Foundation** *(Completed)*
- **Phase 2 — Database & Prisma** *(Completed)*
- **Phase 3 — Authentication & Identity** *(Completed)*
- **Phase 4 — Core TRAIN Domain** *(Upcoming: Workout models, Exercise library, Sets/Reps/Weight tracking, Personal Records, Workout Execution)*
- **Phase 5 — FUEL Domain**
- **Phase 6 — PROGRESS Domain**
=======
- **Phase 0 — Project Foundation** *(Completed)* ✅
- **Phase 1 — Backend Foundation** *(Completed)* ✅
- **Phase 2 — Database & Prisma** *(Completed)* ✅
- **Phase 3 — Authentication & Identity** *(Completed)* ✅
- **Phase 4 — Core TRAIN Domain** *(Completed)* ✅
- **Phase 5 — Workout Execution** *(Completed)* ✅
- **Phase 6 — Progress & Training Analytics** *(Completed)* ✅
- **Phase 7 — FUEL & Nutrition Foundation** *(Completed)* ✅
- **Phase 8 — Client Architecture & API Integration** *(Completed)* ✅
- **Phase 9 — Android Application Foundation** *(Completed)* ✅
- **Phase 10 — TRAIN Android Experience** *(Upcoming)* ⏳
- **Phase 11 — FUEL Android Experience** *(Upcoming)* ⏳
- **Phase 12 — PROGRESS Android Experience** *(Upcoming)* ⏳
- **Phase 13 — Android UX & Polish** *(Upcoming)* ⏳
- **Phase 14 — Production & Android Release** *(Upcoming)* ⏳
>>>>>>> b83a35e (Completed Phase 9)
