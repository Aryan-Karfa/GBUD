# GBUD – API Specification

**Version:** 1.0

**Project:** GBUD – Strength & Body Progress Platform

---

# 1. Purpose

The API Specification defines the communication contract between the frontend applications (Web & Mobile) and the backend services.

All clients must communicate exclusively through these REST APIs.

Every endpoint follows a consistent request, response, authentication, and error-handling format.

---

# 2. API Overview

## Base URL

```
/api/v1
```

## Authentication

- JSON Web Token (JWT)
- Refresh Token Rotation

## Content Type

```
application/json
```

---

# 3. Standard Success Response

```json
{
  "success": true,
  "message": "Operation completed successfully.",
  "data": {}
}
```

---

# 4. Standard Error Response

```json
{
  "success": false,
  "message": "Validation failed.",
  "code": "VALIDATION_ERROR",
  "errors": []
}
```

---

# 5. Authentication Module

## Register

**POST**

```
/auth/register
```

Creates a new user account.

---

## Login

**POST**

```
/auth/login
```

Returns:

- Access Token
- Refresh Token
- User Information

---

## Refresh Token

**POST**

```
/auth/refresh
```

Generates a new Access Token.

---

## Logout

**POST**

```
/auth/logout
```

Invalidates the current refresh token.

---

## Get Current User

**GET**

```
/auth/me
```

Returns the authenticated user's information.

---

# 6. User Module

## Get Profile

```
GET /users/profile
```

---

## Update Profile

```
PATCH /users/profile
```

Updates:

- Height
- Weight
- Gender
- Activity Level
- Goal Weight

---

# 7. Exercise Module

## List Exercises

```
GET /exercises
```

Supports:

- Search
- Category
- Muscle Group
- Equipment
- Difficulty

---

## Exercise Details

```
GET /exercises/:id
```

Returns complete exercise information.

---

# 8. Workout Module

## Create Workout

```
POST /workouts
```

Creates a new workout session.

---

## Get Workouts

```
GET /workouts
```

Supports:

- Pagination
- Date Range
- Search

---

## Get Workout

```
GET /workouts/:id
```

---

## Update Workout

```
PATCH /workouts/:id
```

---

## Delete Workout

```
DELETE /workouts/:id
```

---

# 9. Workout Exercise Module

## Add Exercise

```
POST /workouts/:id/exercises
```

---

## Update Exercise

```
PATCH /workout-exercises/:id
```

---

## Remove Exercise

```
DELETE /workout-exercises/:id
```

---

# 10. Workout Set Module

## Add Set

```
POST /workout-exercises/:id/sets
```

---

## Update Set

```
PATCH /sets/:id
```

---

## Delete Set

```
DELETE /sets/:id
```

---

# 11. Progress Module

## Dashboard Summary

```
GET /progress/dashboard
```

Returns:

- Weekly Volume
- Monthly Volume
- Personal Records
- Workout Count
- Goal Progress

---

## Personal Records

```
GET /progress/prs
```

---

## Analytics

```
GET /progress/analytics
```

Supports:

- Weekly
- Monthly
- Yearly

---

# 12. Weight Module

## Log Weight

```
POST /weight
```

---

## Weight History

```
GET /weight
```

---

## Delete Entry

```
DELETE /weight/:id
```

---

# 13. Fuel Module

## Nutrition Targets

```
GET /fuel/targets
```

Returns calculated:

- Maintenance Calories
- Fat Loss Calories
- Lean Bulk Calories
- Protein
- Carbohydrates
- Fat
- Fiber
- Water

---

## Food Library

```
GET /foods
```

Supports:

- Search
- Category

---

## Food Details

```
GET /foods/:id
```

Returns nutritional information and available serving sizes.

---

# 14. Goal Module

## Create Goal

```
POST /goals
```

---

## Get Goals

```
GET /goals
```

---

## Update Goal

```
PATCH /goals/:id
```

---

## Delete Goal

```
DELETE /goals/:id
```

---

# 15. Request Validation

All incoming requests are validated before reaching controllers.

Validation includes:

- Required fields
- Data types
- Length limits
- Numeric ranges
- Enum values

Invalid requests return **HTTP 400**.

---

# 16. Authentication Rules

Protected endpoints require:

```
Authorization: Bearer <access_token>
```

Unauthorized requests return:

```
401 Unauthorized
```

---

# 17. HTTP Status Codes

| Code | Meaning |
| --- | --- |
| 200 | Success |
| 201 | Resource Created |
| 204 | No Content |
| 400 | Validation Error |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Resource Not Found |
| 409 | Conflict |
| 422 | Business Rule Violation |
| 500 | Internal Server Error |

---

# 18. API Design Principles

- Resource-oriented endpoints.
- RESTful naming conventions.
- Predictable response formats.
- Stateless communication.
- JWT-based authentication.
- Consistent pagination and filtering.
- Versioned APIs (`/api/v1`).
- Thin controllers with business logic delegated to services.

---

# 19. Future API Modules

The following endpoints are reserved for future versions:

```
/friends

/challenges

/leaderboards

/notifications

/achievements

/health

/ai

/admin
```

These modules can be introduced without breaking existing clients because of API versioning.

---

# 20. API Philosophy

The GBUD API is designed to be simple, consistent, and scalable.

Every endpoint exists to support one or more of the platform's three core pillars:

- **Train** — Workout tracking and exercise management.
- **Fuel** — Body metrics and nutritional calculations.
- **Progress** — Analytics, goals, and measurable improvement.

By maintaining strict standards for routing, validation, authentication, and responses, the API provides a reliable foundation for the Web Application, Mobile Application, and future integrations.