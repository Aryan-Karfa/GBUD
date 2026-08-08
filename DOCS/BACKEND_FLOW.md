# GBUD – Backend Request Flow

**Version:** 1.0

**Project:** GBUD – Strength & Body Progress Platform

---

# 1. Backend Philosophy

The backend should follow a strict layered architecture.

Every request follows the exact same lifecycle.

```
Client

↓

Route

↓

Middleware

↓

Validation

↓

Controller

↓

Service

↓

Repository

↓

Database

↓

Repository

↓

Service

↓

Controller

↓

Response Formatter

↓

Client
```

No layer should bypass another layer.

---

# 2. Complete Request Lifecycle

```
User Action

↓

HTTP Request

↓

Express Route

↓

Authentication Middleware

↓

Validation Middleware

↓

Controller

↓

Business Service

↓

Repository (Prisma)

↓

PostgreSQL

↓

Repository

↓

Business Service

↓

Response Builder

↓

HTTP Response
```

---

# 3. Layer Responsibilities

## Routes

Responsibilities

- Define endpoints
- Attach middleware
- Forward request to controller

Example

```
POST /api/v1/workouts

↓

WorkoutController.createWorkout()
```

Routes should NEVER contain business logic.

---

## Middleware

Responsibilities

- Authentication
- Authorization
- Validation
- Rate Limiting
- Logging
- Error Handling

Example

```
Request

↓

JWT Verification

↓

User Attached

↓

Continue
```

---

## Validation Layer

Responsibilities

- Validate request body
- Validate params
- Validate query
- Sanitize input

Tools

- Zod

If validation fails

```
Return

400 Bad Request
```

No controller should execute if validation fails.

---

## Controllers

Responsibilities

Controllers should only:

- Receive validated request
- Call service
- Return formatted response

Controllers should NEVER:

- Query database
- Perform calculations
- Contain business rules

Example

```
WorkoutController

↓

WorkoutService
```

---

## Services

This is where the application lives.

Responsibilities

- Business Logic
- Calculations
- Decision Making
- Workflow Coordination

Example

```
Complete Workout

↓

Calculate Volume

↓

Detect PR

↓

Update Progress

↓

Update Goals

↓

Return Summary
```

Every major feature should have its own service.

---

## Repository Layer

Responsibilities

Only database communication.

Examples

```
Create Workout

Find Workout

Update Workout

Delete Workout

Find User

Find Goals
```

Repositories never contain business logic.

---

## Database

Single Source of Truth

PostgreSQL

Managed through Prisma ORM.

Every persistent piece of data lives here.

---

# 4. Feature-Based Backend Structure

```
services/

api/

    auth/

        auth.routes.ts

        auth.controller.ts

        auth.service.ts

        auth.repository.ts

        auth.schema.ts

        auth.types.ts

        auth.constants.ts

    workouts/

        workout.routes.ts

        workout.controller.ts

        workout.service.ts

        workout.repository.ts

        workout.schema.ts

        workout.types.ts

        workout.utils.ts

    exercises/

    progress/

    fuel/

    goals/

    users/
```

Every feature is completely self-contained.

---

# 5. Internal Flow Example

## User Logs a Workout

```
POST /workouts

↓

Route

↓

JWT Middleware

↓

Validation

↓

WorkoutController

↓

WorkoutService

↓

WorkoutRepository

↓

Database

↓

WorkoutService

↓

ProgressService

↓

GoalService

↓

Response

↓

Client
```

Notice:

Progress and Goals are updated automatically.

The client doesn't have to request it separately.

---

# 6. Cross-Service Communication

Services may communicate with each other.

Example

```
WorkoutService

↓

ProgressService

↓

GoalService

↓

NotificationService
```

However,

Repositories should NEVER call other repositories directly.

Only services coordinate workflows.

---

# 7. Error Flow

```
Throw Error

↓

Service

↓

Controller

↓

Global Error Middleware

↓

Standard Response
```

Example

```json
{
  "success": false,
  "message": "Exercise not found.",
  "code": "EXERCISE_NOT_FOUND"
}
```

Every error follows the same format.

---

# 8. Success Response Format

Every successful response follows one structure.

```json
{
  "success": true,
  "message": "Workout saved successfully.",
  "data": {}
}
```

This keeps frontend integration predictable.

---

# 9. Authentication Flow

```
Login Request

↓

Validate Credentials

↓

Generate Access Token

↓

Generate Refresh Token

↓

Store Refresh Token

↓

Return Tokens
```

Every protected endpoint follows:

```
Request

↓

JWT Verification

↓

User Attached

↓

Controller
```

---

# 10. Module Interaction

```
Authentication

↓

Users

↓

Train

↓

Progress

↓

Fuel

↓

Goals

↓

Notifications
```

Each module owns its own logic.

Shared workflows happen through services.

---

# 11. Logging Flow

Every request should generate logs.

```
Incoming Request

↓

Execution Time

↓

Status Code

↓

User ID

↓

IP Address

↓

Response Time
```

Errors should include stack traces in development and sanitized messages in production.

---

# 12. Future Event Architecture

As GBUD grows, certain actions can emit events.

Example

```
Workout Completed

↓

Event Bus

↓

Progress Updated

↓

Goal Checked

↓

Achievement Awarded

↓

Notification Sent
```

Initially, these can be implemented through direct service calls inside the modular monolith.

If needed in the future, they can be migrated to an event-driven architecture without changing the external API.

---

# 13. Backend Principles

Every backend module must follow these rules:

- One responsibility per layer.
- Business logic belongs only in services.
- Database access belongs only in repositories.
- Controllers remain thin.
- Validation occurs before business logic.
- Every response follows a standard format.
- Every feature is modular and independently maintainable.
- Shared logic is extracted into reusable utilities or services.

---

# 14. Backend Flow Summary

```
Client
   │
   ▼
Route
   │
   ▼
Middleware
(Authentication, Validation, Logging)
   │
   ▼
Controller
   │
   ▼
Service
(Business Logic)
   │
   ▼
Repository
(Database Operations)
   │
   ▼
Prisma ORM
   │
   ▼
PostgreSQL
   │
   ▲
Repository
   │
   ▲
Service
   │
   ▲
Controller
   │
   ▲
Standard Response
   │
   ▲
Client
```

This architecture ensures consistency, scalability, and maintainability across every feature in GBUD while keeping responsibilities clearly separated.