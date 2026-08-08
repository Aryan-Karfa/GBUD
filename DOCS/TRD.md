# GBUD – Technical Requirements Document (TRD)

**Version:** 1.0

**Project:** GBUD – Strength & Body Progress Platform

**Platforms:** Android, iOS, Web

---

# 1. Technical Overview

GBUD is a cloud-based cross-platform fitness ecosystem consisting of:

- Mobile Application
- Web Application
- Backend API
- PostgreSQL Database

All platforms communicate through a centralized REST API, ensuring data consistency and synchronization across devices.

---

# 2. System Architecture

GBUD follows a client-server architecture.

```
                 PostgreSQL
                      │
                 Prisma ORM
                      │
            Node.js + Express API
                      │
      ┌───────────────┼───────────────┐
      │               │               │
      ▼               ▼               ▼
 React Native      React Web      Future Admin
(Android / iOS)
```

The backend acts as the single source of truth.

No client application communicates directly with the database.

---

# 3. Technology Stack

## Frontend (Web)

- React
- Vite
- TypeScript
- React Router
- Zustand
- TanStack Query
- Tailwind CSS
- Anime.js
- ReactBits
- KokonutUI
- Aceternity UI

---

## Frontend (Mobile)

- React Native
- Expo
- TypeScript
- Expo Router
- Zustand
- TanStack Query
- React Native Reanimated
- React Native Gesture Handler

---

## Backend

- Node.js
- Express.js
- TypeScript
- Prisma ORM

---

## Database

- PostgreSQL

---

## Authentication

- JWT Access Tokens
- Refresh Tokens
- Secure Password Hashing (Argon2 or bcrypt)

---

## Validation

- Zod

---

## File Storage

Future Support:

- Cloudinary

Used for:

- Profile Images
- Progress Photos

---

# 4. Project Structure

```
gbud/

apps/
    mobile/
    web/

services/
    api/

packages/
    ui/
    types/
    utils/
    config/

docs/
```

The monorepo architecture enables shared types, utilities, validation schemas, and configuration across applications.

---

# 5. Backend Architecture

The backend follows a layered architecture.

```
Routes

↓

Controllers

↓

Services

↓

Repositories (Prisma)

↓

Database
```

Responsibilities:

Routes

- Endpoint definitions

Controllers

- Request validation
- Response formatting

Services

- Business logic

Repositories

- Database interaction

---

# 6. API Design

Architecture Style:

REST

Response Format:

JSON

Versioning:

```
/api/v1/
```

Example:

```
/api/v1/auth/login

/api/v1/workouts

/api/v1/exercises

/api/v1/progress

/api/v1/fuel

/api/v1/goals
```

---

# 7. Authentication Flow

Authentication shall support:

- Register
- Login
- Logout
- Refresh Token
- Password Reset
- Email Verification (Future)

JWT will be used for authenticated requests.

Refresh tokens will enable secure session renewal.

---

# 8. State Management

## Client State

Zustand

Responsible for:

- Authentication
- Theme
- User Preferences
- Temporary Workout State

---

## Server State

TanStack Query

Responsible for:

- API caching
- Synchronization
- Background refetching
- Mutation handling

---

# 9. Offline Strategy

Workout logging should continue without an internet connection.

Workflow:

Create Workout

↓

Store Locally

↓

Reconnect

↓

Automatic Synchronization

Conflict resolution:

Newest timestamp wins unless user intervention is required.

---

# 10. Data Synchronization

Synchronization should occur:

- Login
- App Launch
- Workout Completion
- Weight Update
- Pull-to-Refresh
- Periodically while online

---

# 11. Security Requirements

Passwords

- Hashed before storage

Authentication

- JWT

Transport

- HTTPS only

Input Validation

- Zod

Database

- Parameterized queries through Prisma

Environment Variables

Never exposed to the client.

---

# 12. Performance Requirements

The application should:

- Launch quickly
- Maintain smooth 60 FPS interactions
- Respond to user actions immediately
- Cache frequently accessed data
- Minimize unnecessary network requests

---

# 13. Database Requirements

Primary Database

PostgreSQL

ORM

Prisma

Database responsibilities:

- User Management
- Workout Storage
- Progress History
- Goals
- Nutrition Data
- Food Library

---

# 14. Error Handling

The API should return standardized error responses.

Example:

```json
{
  "success": false,
  "message": "Workout not found.",
  "code": "WORKOUT_NOT_FOUND"
}
```

Unexpected errors should be logged without exposing internal implementation details.

---

# 15. Logging

Application logs should include:

- API Requests
- Authentication Events
- Database Errors
- Synchronization Failures
- Server Exceptions

Production logging should support future integration with centralized logging solutions.

---

# 16. Notifications

Future support:

- Push Notifications
- Workout Reminders
- Goal Milestones
- Personal Records
- Weekly Progress Summaries

---

# 17. Scalability

The architecture should support:

- Thousands of concurrent users
- Horizontal backend scaling
- CDN integration for static assets
- Future microservice extraction if required

The initial implementation will remain a modular monolith to simplify development.

---

# 18. Third-Party Integrations

Future integrations may include:

- Apple Health
- Google Health Connect
- Cloudinary
- Firebase Cloud Messaging
- Apple Push Notification Service

All integrations should remain optional and isolated behind service abstractions.

---

# 19. Build & Deployment

Frontend:

- Vercel (Web)

Backend:

- Docker
- Railway / Render / VPS (final choice during deployment)

Database:

- PostgreSQL

Mobile:

- Expo Application Services (EAS)

---

# 20. Code Quality Standards

The project shall maintain:

- TypeScript throughout the codebase
- ESLint
- Prettier
- Husky Git Hooks
- Conventional Commits
- Modular architecture
- Reusable components
- Shared type definitions

Every pull request should preserve readability, maintainability, and consistency.

---

# 21. Future Technical Roadmap

The architecture should be designed to accommodate future capabilities without major refactoring.

Planned enhancements include:

- AI-powered workout insights
- AI-powered nutrition guidance
- Wearable device synchronization
- Smartwatch companion app
- Workout templates
- Social features
- Leaderboards
- Challenges
- Multi-language support
- Advanced analytics

---

# 22. Technical Principles

The engineering philosophy behind GBUD is:

- Build once, use everywhere.
- Keep business logic centralized.
- Share code wherever practical.
- Prioritize maintainability over premature optimization.
- Design for long-term scalability.
- Keep the user experience fast, reliable, and resilient.

Every technical decision should support the product's three foundational pillars:

**Train. Fuel. Progress.**