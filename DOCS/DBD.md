# GBUD – Database Design Document (DBD)

**Version:** 1.0

**Project:** GBUD – Strength & Body Progress Platform

---

# 1. Purpose

The Database Design Document (DBD) defines the complete relational database structure for GBUD.

It serves as the single source of truth for all persistent data used across the Mobile App, Web Application, and Backend API.

The database is designed to be scalable, normalized, and maintainable while supporting future expansion without major structural changes.

---

# 2. Database Technology

**Database Engine**

- PostgreSQL

**ORM**

- Prisma ORM

**Design Principles**

- Third Normal Form (3NF)
- Referential Integrity
- Indexed Search
- Scalable Relationships
- UUID Primary Keys
- Audit Fields
- Soft Deletes (where applicable)

---

# 3. Database Modules

The database is divided into logical domains.

### Authentication

- User
- RefreshToken

---

### User Management

- UserProfile
- UserPreference

---

### Workout System

- Workout
- WorkoutExercise
- WorkoutSet
- Exercise

---

### Progress System

- WeightLog
- PersonalRecord
- ProgressSnapshot

---

### Fuel System

- NutritionTarget
- Food
- FoodServing

---

### Goals

- Goal

---

### Future Expansion

- Friend
- Challenge
- Leaderboard
- Notification
- Achievement
- AIInsight
- HealthIntegration

---

# 4. Primary Entities

## User

Stores account information.

Fields

- id
- email
- username
- passwordHash
- createdAt
- updatedAt

Relationships

- One User → Many Workouts
- One User → Many Goals
- One User → Many WeightLogs
- One User → One Profile
- One User → One NutritionTarget

---

## UserProfile

Stores personal fitness information.

Fields

- userId
- age
- gender
- height
- currentWeight
- targetWeight
- activityLevel
- bodyFatPercentage (optional)

Relationships

- One Profile belongs to One User

---

## Exercise

Master exercise library.

Fields

- id
- name
- category
- primaryMuscle
- secondaryMuscles
- equipment
- difficulty
- instructions

Relationships

- One Exercise → Many WorkoutExercises

---

## Workout

Represents a complete workout session.

Fields

- id
- userId
- title
- startTime
- endTime
- duration
- notes
- createdAt

Relationships

- One Workout → Many WorkoutExercises

---

## WorkoutExercise

Represents one exercise performed during a workout.

Fields

- id
- workoutId
- exerciseId
- order

Relationships

- One WorkoutExercise → Many WorkoutSets

---

## WorkoutSet

Represents an individual set.

Fields

- id
- workoutExerciseId
- weight
- reps
- volume
- restTime
- completed

---

## WeightLog

Tracks body weight over time.

Fields

- id
- userId
- weight
- recordedAt

---

## Goal

Stores user goals.

Examples

- Target Weight
- Target Bench
- Target Squat
- Target Deadlift

Fields

- id
- userId
- type
- currentValue
- targetValue
- deadline

---

## PersonalRecord

Stores lifetime PRs.

Fields

- id
- userId
- exerciseId
- recordType
- value
- achievedAt

---

## NutritionTarget

Stores calculated daily targets.

Fields

- id
- userId
- maintenanceCalories
- cuttingCalories
- bulkingCalories
- protein
- carbohydrates
- fats
- fiber
- water