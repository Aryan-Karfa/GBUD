# GBUD

GBUD is a production-oriented, Android-first fitness ecosystem built around three core pillars:

- **TRAIN** — Workout planning, execution, exercise tracking, sets/reps/weight, workout history, and personal records (PRs).
- **FUEL** — Nutrition and food tracking, meals, quantity-scaled nutrition snapshots, time-based targets, and daily intake summaries.
- **PROGRESS** — Body metrics, strength progression, body measurements, analytics, and long-term progress.

---

## Current Status

- **Phase 0 — Project Foundation**: `Completed`
- **Phase 1 — Backend Foundation**: `Completed`
- **Phase 2 — Database & Prisma**: `Completed`
- **Phase 3 — Authentication & Identity**: `Completed`
- **Phase 4 — Core TRAIN Domain**: `Completed`
- **Phase 5 — Workout Execution**: `Completed`
- **Phase 6 — Progress & Training Analytics**: `Completed`
- **Phase 7 — FUEL & Nutrition Foundation**: `Completed`
- **Phase 8 — Client Architecture & API Integration**: `Completed`
- **Phase 9 — Android Application Foundation**: `Completed`
- **Phase 10 — TRAIN Android Experience**: `Completed`
- **Phase 11 — FUEL Android Experience**: `Completed`
- **Phase 12 — PROGRESS Android Experience**: `Upcoming`

---

## Technology Stack

- **Node Version Engine Requirement**: `Node.js >= 22`
- **Package Manager / Workspace**: `pnpm` Monorepo
- **Mobile Application**: React Native (0.76.6), Expo (~52.0.0), TypeScript (Android-First Architecture)
- **Backend API**: Node.js, Express, TypeScript, Prisma ORM, Bcrypt, JWT (`jsonwebtoken`), Cookie-Parser, Helmet, Zod, Vitest, Supertest
- **Database**: PostgreSQL, Prisma ORM
- **Client Networking**: `@gbud/api-client` (Fetch, AbortSignal, Single-Flight Refresh Coalescing)
- **Secure Token Storage**: Refresh token remains stored through Expo SecureStore; access token remains memory-only

---

## TRAIN Domain Architecture

### Source of Truth Philosophy
The backend API is the single source of truth for all TRAIN domain operations. The Android mobile client uses the strongly-typed `@gbud/api-client` exclusively through `trainService` without duplicating workout execution or session business logic.

```text
EXERCISE CATALOG (Categorized by muscle group, equipment, pattern)
     │
     ▼
WORKOUT TEMPLATES (Named routines with ordered exercises & notes)
     │
     ▼
WORKOUT SESSIONS (Only ONE active IN_PROGRESS session permitted)
     │
     ├── Exercise Snapshot (Stores immutable name & order per session exercise)
     │
     ▼
WORKOUT SETS (Set number, reps, weight logged sequentially)
     │
     ▼
SESSION COMPLETION / ABANDONMENT
     │
     ▼
WORKOUT HISTORY (Paginated, startedAt DESC, strictly read-only)
```

### Key Architectural Invariants
- **Single Active Session Constraint**: The backend strictly enforces that each athlete may only have one `IN_PROGRESS` workout session. When an active session exists, attempting to start another returns `409 CONFLICT`; the mobile app handles this gracefully by displaying an inline banner allowing the athlete to resume their current workout without data loss or application crashes.
- **Session Snapshot Principle**: When a workout session is created, the backend takes an immutable snapshot of each exercise's name, order, and notes. The mobile app displays this snapshot rather than reconstructing exercises from the catalog, ensuring historical consistency even if catalog exercises change.
- **Historical Immutability**: Sessions marked `COMPLETED` or `ABANDONED` are strictly read-only. All set modification targets, inline creation forms, and completion/abandonment controls are hidden in historical view screens.
- **Android Hardware Back Protection**: When an active workout is in progress, pressing the Android hardware back button or tapping the header back button triggers an interceptor modal ("Leave Active Workout?"). Leaving the screen returns to `TrainHome` while keeping the session actively running in the backend.

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

---

## Database Architecture (Prisma)

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

---

## Repository Structure

```text
gbud/
├── apps/
│   └── mobile/             # React Native + Expo Android-first mobile application
│       ├── src/
│       │   ├── api/        # Typed API client singleton configuration
│       │   ├── app/        # AppBootstrap & AppProviders composition
│       │   ├── auth/       # AuthProvider, auth.service, and auth.types
│       │   ├── components/ # Reusable layout, common, forms, and feedback components
│       │   ├── features/   # Feature domains: train/, fuel/, progress/
│       │   │   ├── train/  # Phase 10 TRAIN domain (components, hooks, screens, services, types)
│       │   │   ├── fuel/   # Phase 11 FUEL domain placeholder
│       │   │   └── progress/# Phase 12 PROGRESS domain placeholder
│       │   ├── navigation/ # Root, Auth, Main, and Train navigators with BackHandler
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
│           ├── app.ts      # Express application setup
│           └── server.ts   # Server startup entry point & graceful shutdown
│
├── packages/
│   ├── api-client/         # Shared isomorphic API client (@gbud/api-client)
│   ├── config/             # Shared app & environment configurations (@gbud/config)
│   ├── constants/          # Shared domain constants (@gbud/constants)
│   ├── types/              # Shared TypeScript definitions & API contracts (@gbud/types)
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

4. **Generate Prisma Client & Seed System Catalog**
   ```bash
   pnpm --filter @gbud/api run prisma:generate
   pnpm --filter @gbud/api run prisma:seed
   ```

5. **Verify TypeScript compilation**
   ```bash
   pnpm typecheck
   ```

6. **Run automated testing suite**
   ```bash
   pnpm test
   ```

7. **Build all workspace packages and services**
   ```bash
   pnpm build
   ```

8. **Start development services**
   - Start Backend API:
     ```bash
     pnpm dev:api
     ```
     API health endpoint: `http://localhost:4000/api/v1/health`
   - Start Mobile App (Expo / Android):
     ```bash
     pnpm dev:mobile
     ```
     To launch on Android device/emulator:
     ```bash
     pnpm --filter @gbud/mobile android
     ```

---

## Phase 10 — TRAIN Android Application Experience

Phase 10 transforms the TRAIN placeholder in `apps/mobile` into the first fully functional GBUD mobile domain, delivering complete workout discovery, template management, active session execution, and historical review.

### Architecture Overview

```text
                               📱 MainNavigator (Train Tab)
                                             │
                                     ┌───────▼───────┐
                                     │ TrainNavigator│
                                     └───────┬───────┘
                                             │
      ┌─────────────────┬────────────────────┼───────────────────┬──────────────────┐
      ▼                 ▼                    ▼                   ▼                  ▼
TrainHomeScreen   ExerciseLibrary     WorkoutTemplates    ActiveWorkout     WorkoutHistory
(Active Banner,   (Filter & Search)   (List & Quick Start) (Live Execution, (Paginated History,
 Quick Actions,         │                    │            Header Timer,      Status Badges)
 Recent Activity)       ▼                    ▼            Ordered Sets,             │
                  ExerciseDetail      TemplateDetail      Back Interceptor,         ▼
                  (Equipment, Form)   (Start / Edit)      Complete/Abandon)  HistoryDetail
                                             │                               (Read-Only Snapshot)
                                             ▼
                                      TemplateEditor
                                      (Move Up/Down,
                                       Exercise Picker)
```

### Key Technical Pillars

1. **Screen Architecture (9 TRAIN Screens)**:
   - `TrainHomeScreen`: Active session banner with live timer, quick action navigation cards, and recent workout activity.
   - `ExerciseLibraryScreen`: Full catalog browser with search input, horizontal muscle group filter chips, and empty/error states.
   - `ExerciseDetailScreen`: Single exercise metadata (equipment, movement pattern, type, description, and instructions).
   - `WorkoutTemplatesScreen`: List of saved routines, quick "Start Workout" action with 409 conflict detection, and "+ Create" header action.
   - `WorkoutTemplateDetailScreen`: Ordered exercise list with notes, "Start Workout" CTA, "Edit", and "Delete" with confirmation modal.
   - `WorkoutTemplateEditorScreen`: Routine builder with name/description inputs, Move Up / Move Down reordering, and modal `ExercisePicker`.
   - `ActiveWorkoutScreen`: Live workout execution surface with `WorkoutProgressHeader`, dynamic timer, session exercise rows, set addition/editing/deletion, `WorkoutActionBar`, and back interceptor.
   - `WorkoutHistoryScreen`: Paginated list of completed/abandoned workouts sorted `startedAt DESC` with status badges and metrics.
   - `WorkoutHistoryDetailScreen`: Strictly read-only historical session snapshot showing recorded exercises and sets.

2. **Domain Service Isolation (`trainService`)**:
   - Centralized singleton wrapping all 17 `@gbud/api-client` TRAIN endpoints across exercises, templates, sessions, and sets.
   - Mobile components and custom hooks never invoke raw `fetch` or access `apiClient` directly.

3. **Custom React State Hooks (`hooks/`)**:
   - `useExercises`: Catalog querying, text search, muscle group filtering, pull-to-refresh, and ID lookup.
   - `useWorkoutTemplates`: Routine listing, creation with sequential exercise additions, editing, deletion, and reordering.
   - `useWorkoutSession`: Active workout discovery, session creation (with 409 conflict detection & recovery), set logging, updates, deletion, completion, and abandonment.
   - `useWorkoutHistory`: Paginated history fetching, page navigation, and historical session detail retrieval.

4. **Dedicated TRAIN UI Components (`components/`)**:
   - `MuscleGroupBadge`: Color-coded badge per anatomical muscle group.
   - `ExerciseCard`: Catalog card displaying muscle badge, equipment, category, and description.
   - `ExerciseListItem`: Compact selectable list item for pickers.
   - `ExercisePicker`: Full-screen searchable modal for adding exercises to templates.
   - `WorkoutTemplateCard`: Routine card with exercise count, preview text, and direct "Start Workout" button.
   - `WorkoutSetRow`: Active/read-only set row with Set #, Weight, Reps, and edit/delete touch targets.
   - `SetInputRow`: Form row with client-side validation (enforcing reps, weight, or both, rejecting empty inputs) and inline error display.
   - `WorkoutExerciseRow`: Container rendering exercise snapshot metadata, logged sets, and inline set entry forms.
   - `WorkoutTimer`: Dynamic elapsed duration counter calculated from server `startedAt` (`HH:MM:SS`), ticking every second without drift.
   - `WorkoutProgressHeader`: Active workout header showing live timer, exercise count, and total sets logged.
   - `WorkoutActionBar`: Bottom action bar with Complete (confirmation modal) and Abandon (danger modal) actions.

5. **Android Hardware Back Protection**:
   - `NavigationManager` incorporates a back interceptor hook. When an active session is in progress on `ActiveWorkoutScreen`, pressing the Android hardware back button or top back arrow displays a confirmation dialog ("Leave Active Workout?"). Leaving returns to `TrainHome` while the backend session remains active.

---

## Phase 11 — FUEL Android Application Experience

GBUD Phase 11 transformed the Android-first FUEL placeholder in `apps/mobile` into a fully functional nutrition product domain consuming Phase 7 backend capabilities through `@gbud/api-client`.

```text
                                📱 MainNavigator (Fuel Tab)
                                              │
                                      ┌───────▼───────┐
                                      │ FuelNavigator │
                                      └───────┬───────┘
                                              │
      ┌──────────────────┬────────────────────┼───────────────────┬──────────────────┐
      ▼                  ▼                    ▼                   ▼                  ▼
FuelHomeScreen     FoodLibrary        MealsScreen         NutritionTarget     NutritionHistory
(Date Selector,    (Filter & Search)  (Date-Driven Meals) (Effective Target   (30-Day Intake Log)
 Today's Summary,        │                    │            & History)                │
 Quick Actions)          ▼                    ▼                   │                  ▼
                   FoodDetail         MealDetail          NutritionComparison (Read-Only Detail)
                   (Facts, Edit,      (Snapshot Entries,  (Side-by-Side Day
                    Deactivate)        Add/Edit/Remove)    Comparison)
                         │                    │
                         ▼                    ▼
                   CustomFoodEditor   MealEditorScreen
                   (Creation/Edit)    (Create/Edit Meal)
```

### Key Technical Pillars

1. **Screen Architecture (10 FUEL Screens)**:
   - `FuelHomeScreen`: Primary landing screen with calendar `DateSelector`, `NutritionSummaryCard` comparing daily totals against date-effective target, today's meals list, and quick actions.
   - `FoodLibraryScreen`: Server-queried catalog browser with search input, horizontal filter chips (`ALL`, `SYSTEM`, `CUSTOM`), and "+ Custom" header action.
   - `FoodDetailScreen`: Comprehensive nutrition facts display; custom foods feature Edit and Deactivate actions; system foods are strictly read-only.
   - `CustomFoodEditorScreen`: Custom food creator and editor with client-side validation for serving size, units, and non-negative macro values.
   - `MealsScreen`: Date-driven meals overview with `DateSelector`, meal cards with nutrition totals, and "+ Add Meal" action.
   - `MealDetailScreen`: Detailed meal overview with authoritative totals, list of `MealFoodRow` items with immutable snapshots, "+ Add Food" opening `FoodPicker`, edit quantity modal, remove entry confirmation, and meal deletion.
   - `MealEditorScreen`: Meal creation/edit form for meal name, meal category (BREAKFAST, LUNCH, DINNER, SNACK, OTHER), and calendar date.
   - `NutritionTargetScreen`: Displays the target applicable to the selected calendar date (`effectiveFrom <= selectedDate`), target history list, and form to schedule future targets with 409 conflict detection.
   - `NutritionHistoryScreen`: Chronological list of daily summaries across the past 30 days without premature charting.
   - `NutritionComparisonScreen`: Side-by-side date intake comparison between two selected calendar dates without judgmental scoring or gamification.

2. **Domain Service Isolation (`fuelService`)**:
   - Centralized singleton wrapping all 21 `@gbud/api-client` FUEL endpoints across foods, meals, meal entries, targets, and summaries.
   - No components, hooks, or screens invoke raw `fetch` or access `apiClient` directly.

3. **Custom React State Hooks (`hooks/`)**:
   - `useFoods`: Server-driven food querying, pagination, system vs custom filtering, and custom food mutations.
   - `useMeals`: Date-aware meal logging, meal detail retrieval, and authoritative food entry management.
   - `useNutritionTargets`: Date-effective target resolution, target history listing, and target creation with conflict handling.
   - `useDailyNutrition`: Daily intake summaries, date-specific target comparisons, date range history, and neutral date comparisons.

4. **Dedicated FUEL UI Components (`components/`)**:
   - `FoodTypeBadge`: Pill badge distinguishing "SYSTEM" (emerald) vs "CUSTOM" (amber).
   - `MealTypeBadge`: Category badge for meal types (BREAKFAST, LUNCH, DINNER, SNACK, OTHER).
   - `FoodCard`: Catalog card displaying serving size, calories, and macro breakdown.
   - `FoodListItem`: Compact selectable list item for pickers.
   - `MealCard`: Card displaying meal type, food count, and nutrition totals.
   - `MealFoodRow`: Container rendering immutable food snapshot values (`foodNameSnapshot`, `caloriesSnapshot`, etc.) with edit and remove targets.
   - `NutritionProgressRow`: Clean progress bar displaying actual vs target intake without judgmental colors.
   - `NutritionSummaryCard`: Daily intake summary card with macro progress rows.
   - `NutritionTargetCard`: Card showing target calories, protein, carbs, fat, and effective date.
   - `DateSelector`: Lightweight calendar date navigator without timezone skew.
   - `FoodQuantityInput`: Modal for editing entry quantity with input validation.
   - `FoodPicker`: Searchable modal for browsing and adding foods with initial quantities.
   - `FuelErrorState`: Contextual error card with retry handler.

5. **Authoritative Invariants**:
   - **No Optimistic Nutrition State**: Mobile client never computes meal or daily nutrition totals locally; all displayed totals derive strictly from backend responses.
   - **Historical Food Snapshot Immutability**: Past meal entries render immutable server snapshot values, preserving historical integrity even if catalog food definitions change or are deleted.
   - **Date-Aware Target Resolution**: Target comparison resolves the target applicable to the selected calendar date (`effectiveFrom <= requestedDate`).

---

## Project Roadmap

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
- **Phase 10 — TRAIN Android Experience** *(Completed)* ✅
- **Phase 11 — FUEL Android Experience** *(Completed)* ✅
- **Phase 12 — PROGRESS Android Experience** *(Upcoming)* ⏳
- **Phase 13 — Android UX & Polish** *(Upcoming)* ⏳
- **Phase 14 — Production & Android Release** *(Upcoming)* ⏳

