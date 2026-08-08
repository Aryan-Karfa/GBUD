# GBUD – Software Design Document (SDD)

**Version:** 1.0

**Project:** GBUD – Strength & Body Progress Platform

---

# 1. Purpose

The Software Design Document (SDD) defines the architectural design, software modules, system interactions, internal workflows, and implementation structure of GBUD.

This document serves as the technical blueprint that bridges the Product Requirements Document (PRD) and the actual implementation.

---

# 2. High-Level Architecture

GBUD follows a modular client-server architecture.

```
                        PostgreSQL
                             │
                        Prisma ORM
                             │
                     Express REST API
                             │
       ┌─────────────────────┼─────────────────────┐
       │                     │                     │
       ▼                     ▼                     ▼
 React Native App      React Web App        Future Admin
```

The backend remains the single source of truth.

All applications communicate exclusively through the REST API.

---

# 3. Software Modules

The application is divided into independent modules.

## Authentication

Responsibilities

- User Registration
- Login
- Logout
- Refresh Token
- Password Reset
- Session Management

Dependencies

- User Module
- Notification Module

---

## User

Responsibilities

- Profile Management
- Preferences
- Units (kg/lbs)
- Theme
- Account Settings

Dependencies

- Authentication

---

## Dashboard

Responsibilities

Provide a summary of:

- Current Weight
- Active Goals
- Workout Status
- Nutrition Targets
- Recent PRs
- Weekly Progress

Consumes data from nearly every module.

---

## Train Module

Purpose

Workout tracking.

Submodules

- Workout Sessions
- Exercise Library
- Sets
- Repetitions
- Weight Logging
- Notes
- Personal Records

Outputs

- Workout History
- Volume
- Strength Metrics

---

## Fuel Module

Purpose

Calculate nutritional requirements.

Submodules

- Goal Calculator
- BMR Calculator
- TDEE Calculator
- Macro Calculator
- Food Library

Outputs

- Calories
- Protein
- Carbohydrates
- Fat
- Fiber
- Water

No meal planning exists within this module.

---

## Progress Module

Purpose

Track long-term improvement.

Submodules

- Weight Tracking
- Goal Tracking
- Weekly Analytics
- Monthly Analytics
- Annual Analytics
- Strength Graphs
- PR Timeline

---

## Goals Module

Responsibilities

Maintain user objectives.

Examples

Target Weight

Target Deadlift

Target Bench

Target Squat

Target Body Fat (Future)

---

## Notification Module

Future

Responsibilities

Workout reminders

Milestones

Goal completion

Weekly reports

---

# 4. Component Interaction

```
User

↓

Authentication

↓

Dashboard

↓

───────────────

Train

Fuel

Progress

Goals

───────────────

↓

Analytics Engine

↓

Database
```

The Dashboard acts as the central aggregation layer.

---

# 5. Internal Data Flow

Example:

Workout Logging

```
User

↓

Start Workout

↓

Select Exercise

↓

Add Set

↓

Save Set

↓

Update Workout

↓

Recalculate:

Volume

Estimated 1RM

Personal Records

↓

Save Database

↓

Refresh Dashboard

↓

Update Progress
```

---

# 6. Fuel Data Flow

```
User

↓

Update Weight

↓

Goal Calculator

↓

BMR

↓

TDEE

↓

Macro Calculation

↓

Nutrition Targets

↓

Dashboard Update
```

Every weight update automatically recalculates nutritional requirements.

---

# 7. Progress Engine

Every significant user action generates progress events.

Examples

Workout Completed

↓

Volume Updated

↓

Strength Updated

↓

Graphs Updated

↓

Goals Evaluated

↓

Achievements Evaluated

↓

Dashboard Refreshed

---

# 8. Dashboard Aggregator

The dashboard never stores duplicated data.

Instead, it requests information from:

Train

Fuel

Progress

Goals

User

The backend assembles a lightweight summary payload for efficient loading.

---

# 9. Folder Structure

```
apps/

    mobile/

    web/

services/

    api/

        auth/

        users/

        workouts/

        exercises/

        fuel/

        progress/

        goals/

        notifications/

packages/

    ui/

    types/

    utils/

    config/
```

Every feature follows the same internal architecture.

---

# 10. Backend Module Structure

Example

```
workouts/

controller.ts

service.ts

repository.ts

routes.ts

schema.ts

types.ts

utils.ts
```

Responsibilities

Controller

↓

Service

↓

Repository

↓

Database

---

# 11. Frontend Architecture

Each feature owns its own files.

Example

```
train/

components/

screens/

hooks/

store/

api/

types/

utils/
```

No feature should directly depend on another feature's implementation.

Communication occurs through shared APIs.

---

# 12. State Design

Global State

- Authentication
- User Preferences
- Theme

Feature State

- Current Workout
- Filters
- Temporary Forms

Server State

Managed through TanStack Query.

---

# 13. Design Patterns

The application should follow:

- Feature-Based Architecture
- Layered Backend
- Repository Pattern
- Dependency Injection (where appropriate)
- Composition over Inheritance
- Reusable Components
- Single Responsibility Principle

---

# 14. Error Handling Flow

```
Request

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

Response

↓

Error Middleware

↓

Client
```

All errors should pass through centralized middleware.

---

# 15. Synchronization Workflow

Offline

↓

Store Locally

↓

Reconnect

↓

Upload Pending Changes

↓

Resolve Conflicts

↓

Refresh Local Cache

↓

Update Dashboard

---

# 16. Performance Strategy

Optimize by:

- Lazy Loading
- Code Splitting (Web)
- Image Optimization
- Query Caching
- Request Deduplication
- Background Synchronization

---

# 17. Future Expansion Points

The design intentionally leaves extension points for:

- AI Coach
- AI Nutrition Assistant
- Smartwatch Companion
- Health Device Sync
- Friends
- Challenges
- Leaderboards
- Workout Sharing
- Trainer Dashboard
- Multi-Tenant Support

These additions should integrate without requiring major architectural changes.

---

# 18. System Principles

Every module should satisfy the following principles:

- High Cohesion
- Low Coupling
- Single Responsibility
- Predictable Data Flow
- Reusable Components
- Shared Type Definitions
- Platform Independence

---

# 19. Software Lifecycle

The lifecycle of a typical user interaction is:

```
User Action

↓

Client Validation

↓

API Request

↓

Server Validation

↓

Business Logic

↓

Database

↓

Response

↓

Cache Update

↓

UI Refresh
```

This predictable flow should be consistent across every module in GBUD.

---

# 20. Software Philosophy

GBUD is designed as a modular, scalable, and maintainable software ecosystem.

Every software component should exist for a clear purpose and integrate seamlessly with the rest of the platform.

The architecture prioritizes long-term maintainability, cross-platform consistency, and developer productivity.

The software should evolve through the addition of new modules rather than modification of existing foundations, ensuring that future features can be introduced with minimal disruption.