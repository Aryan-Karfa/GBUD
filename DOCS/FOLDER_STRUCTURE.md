# GBUD – Project Folder Structure

**Version:** 1.0

**Architecture:** Monorepo

**Project:** GBUD – Strength & Body Progress Platform

---

# 1. Root Structure

```
gbud/

│
├── apps/
│
├── services/
│
├── packages/
│
├── docs/
│
├── scripts/
│
├── infrastructure/
│
├── .github/
│
├── .vscode/
│
├── package.json
├── turbo.json
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── .gitignore
└── README.md
```

---

# 2. apps/

Contains all user-facing applications.

```
apps/

├── mobile/
│
├── web/
│
└── admin/        (Future)
```

---

## mobile/

```
mobile/

src/

assets/

app/

components/

features/

hooks/

services/

store/

navigation/

providers/

constants/

theme/

utils/

types/
```

This contains the complete React Native application.

---

## web/

```
web/

src/

assets/

pages/

components/

features/

hooks/

services/

store/

providers/

layouts/

constants/

theme/

utils/

types/
```

This contains the complete React web application.

---

## admin/

Future

```
admin/

Dashboard

Analytics

Users

Moderation

Reports
```

---

# 3. services/

Contains backend services.

```
services/

api/

workers/     (Future)
```

---

## api/

```
api/

src/

config/

middleware/

routes/

modules/

shared/

database/

types/

utils/
```

---

### modules/

Each feature owns itself.

```
modules/

auth/

users/

workouts/

exercises/

fuel/

progress/

goals/

notifications/

friends/      (Future)

leaderboards/ (Future)

ai/           (Future)
```

---

## Example Module

```
workouts/

workout.routes.ts

workout.controller.ts

workout.service.ts

workout.repository.ts

workout.schema.ts

workout.types.ts

workout.mapper.ts

workout.constants.ts

index.ts
```

Everything related to workouts remains inside this folder.

---

# 4. packages/

Reusable code shared across multiple applications.

```
packages/

ui/

types/

utils/

config/

validation/

constants/
```

---

## ui/

Shared design system.

```
Button

Card

Modal

Input

Badge

Avatar

Chart

Skeleton

Toast
```

---

## types/

Shared TypeScript definitions.

Example

```
User

Workout

Exercise

Goal

WeightLog

NutritionTarget

APIResponse
```

Shared by:

- Backend
- Mobile
- Website

---

## utils/

Shared utility functions.

Examples

```
Date Helpers

Unit Conversion

Math Helpers

Formatting

Validation Helpers
```

---

## config/

Shared configuration.

Examples

```
Environment

Theme

API URLs

Feature Flags
```

---

## validation/

Shared Zod schemas.

Examples

```
Login

Register

Workout

Exercise

Weight

Goals

Fuel
```

Frontend and backend use the exact same validation logic.

---

# 5. docs/

All documentation.

```
docs/

Vision

PRD

TRD

SDD

Database

API

Roadmap

Testing

Deployment

Meeting Notes
```

---

# 6. scripts/

Automation.

Examples

```
Seed Database

Generate Types

Backup Database

Import Food Library

Reset Development Data
```

---

# 7. infrastructure/

Deployment.

```
docker/

nginx/

database/

terraform/      (Future)
```

---

# 8. .github/

GitHub automation.

```
workflows/

ISSUE_TEMPLATE/

PULL_REQUEST_TEMPLATE/
```

---

# 9. Shared Naming Convention

Folders

lowercase

Files

feature.type.ts

Examples

```
workout.service.ts

goal.repository.ts

fuel.controller.ts

exercise.schema.ts
```

Components

PascalCase

```
WorkoutCard.tsx

WeightChart.tsx

GoalProgress.tsx
```

Hooks

camelCase

```
useWorkout.ts

useProgress.ts

useFuel.ts
```

---

# 10. Environment Files

```
.env

.env.local

.env.development

.env.production

.env.example
```

No secrets are committed to Git.

---

# 11. Dependency Flow

```
Apps

↓

Packages

↓

API

↓

Database
```

Applications may consume shared packages.

Packages should never depend on applications.

---

# 12. Folder Structure Principles

The project structure follows these rules:

- Features own their code.
- Shared logic lives only in `packages/`.
- Business logic never lives inside UI components.
- Types are shared across the entire ecosystem.
- Validation schemas are shared between frontend and backend.
- Each module remains independently maintainable.
- New features can be added without restructuring existing folders.

---

# 13. Final Directory Tree

```
gbud/
│
├── apps/
│   ├── mobile/
│   ├── web/
│   └── admin/ (future)
│
├── services/
│   ├── api/
│   └── workers/ (future)
│
├── packages/
│   ├── ui/
│   ├── types/
│   ├── utils/
│   ├── validation/
│   ├── constants/
│   └── config/
│
├── docs/
│
├── scripts/
│
├── infrastructure/
│
├── .github/
│
├── .vscode/
│
├── package.json
├── turbo.json
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── .gitignore
└── README.md
```

---

# 14. Design Philosophy

The folder structure is designed around **features first, sharing second, and scalability always**.

Rather than separating code by technical layers across the entire project, each domain owns its implementation while common functionality is centralized into shared packages.

This approach minimizes coupling, improves maintainability, and allows the GBUD ecosystem to expand—from a single mobile application to a complete multi-platform fitness platform—without requiring structural changes.