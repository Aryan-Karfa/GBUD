# GBUD – UI/UX Design System

**Version:** 2.0

**Status:** Official Design System

**Project:** GBUD – Strength & Body Progress Platform

---

# 1. Design Philosophy

GBUD is not a traditional fitness application.

It is a **personal fitness operating system** designed to help users train consistently, understand their bodies, and measure long-term progress.

Every interface should answer one question:

> **"What should I focus on right now?"**
> 

The experience should feel:

- Premium
- Calm
- Focused
- Motivating
- Modern
- Professional

The interface must never feel overwhelming or cluttered.

---

# 2. Core Design Principles

Every screen should follow these principles:

### Clarity First

Remove unnecessary elements.

Every component must have a purpose.

---

### Progress Over Perfection

Users should always see measurable progress.

Examples:

- Goal Rings
- Weekly Progress
- Current Streak
- Recent PR
- Weight Trend

---

### Information Before Decoration

Visual effects should never reduce readability.

Animations support the experience.

They never become the experience.

---

### Consistency

Buttons, cards, typography, spacing, and navigation must remain consistent throughout the application.

---

### Accessibility

Every screen must be usable with:

- Large Text
- Screen Readers
- High Contrast
- Reduced Motion

---

# 3. Visual Identity

GBUD should resemble a premium productivity application rather than a traditional gym application.

Keywords:

- Clean
- Minimal
- Premium
- Intelligent
- Structured
- Motivating

Avoid:

- Heavy gradients
- Gaming aesthetics
- Harsh neon colors
- Cluttered dashboards
- Excessive glassmorphism

---

# 4. Color System

## Primary Background

```
#09090B
```

---

## Secondary Background

```
#18181B
```

---

## Surface Cards

```
#27272A
```

---

## Primary Text

```
#FAFAFA
```

---

## Secondary Text

```
#A1A1AA
```

---

## Primary Accent

```
#3B82F6
```

Used for:

- Primary Buttons
- Active Navigation
- Charts
- Progress

---

## Success

```
#22C55E
```

---

## Warning

```
#F59E0B
```

---

## Danger

```
#EF4444
```

---

# 5. Typography

## Primary Font

Inter

Used for:

- Body
- Forms
- Navigation
- Buttons

---

## Display Font

Poppins SemiBold

Used for:

- Page Titles
- Dashboard Titles
- Statistics

---

## Number Font

Inter Bold

Used for:

- Calories
- Weight
- PR Numbers
- Statistics

---

# 6. Spacing System

Use an 8-point grid.

Standard spacing values:

- 8
- 16
- 24
- 32
- 40
- 48
- 64

No arbitrary spacing values should be introduced.

---

# 7. Corner Radius

Small

8px

Medium

16px

Large

24px

Cards and modals should use rounded corners consistently.

---

# 8. Elevation

Instead of thick borders and heavy shadows:

Use subtle elevation.

Cards should appear layered without becoming distracting.

---

# 9. Navigation

Bottom Navigation

- Home
- Train
- Fuel
- Progress
- Profile

Navigation should remain visible and predictable.

Avoid deep nested menus whenever possible.

---

# 10. Home Screen — Command Center

The application opens into the **Command Center**.

This screen provides an overview of the user's fitness journey.

Widgets include:

- Greeting
- Current Streak
- Today's Workout
- Goal Progress
- Current Weight
- Nutrition Targets
- Weekly Volume
- Personal Records
- Recent Activity

The Command Center should answer:

- What should I train today?
- How am I progressing?
- What does my body need today?

---

# 11. Card Design

Cards are the primary building block of the interface.

Each card focuses on one purpose only.

Examples:

- Workout Card
- Weight Card
- Goal Card
- Progress Card
- Nutrition Card
- Achievement Card

Cards should:

- Have generous padding
- Use subtle elevation
- Support animations
- Remain readable on all screen sizes

---

# 12. Motion System

Libraries:

- Anime.js
- ReactBits
- Aceternity UI
- KokonutUI

Motion Guidelines:

- Fast (150–250ms)
- Smooth
- Purposeful
- Interruptible

Animations include:

- Card Entrance
- Progress Ring Fill
- Number Counting
- Screen Transitions
- Button Feedback
- Success Confirmation

Avoid unnecessary or distracting animations.

---

# 13. Dashboard Components

Primary dashboard components include:

- Goal Ring
- Workout Summary
- Weight Trend Chart
- Weekly Volume Graph
- Nutrition Summary
- Current Streak
- Achievement Card
- Personal Record Card

Each component should function independently and be reusable across platforms.

---

# 14. Charts

Preferred chart styles:

- Line Charts
- Area Charts
- Circular Progress Rings
- Weekly Bar Charts

Charts should prioritize readability over decorative effects.

---

# 15. Empty States

Every module should include meaningful empty states.

Examples:

- No Workouts Logged
- No Goals Created
- No Weight Entries
- No Personal Records

Each empty state should guide the user toward the next meaningful action.

---

# 16. Loading States

Replace spinners with skeleton loaders wherever possible.

Use subtle shimmer effects for content loading.

---

# 17. Error States

Errors should:

- Clearly explain the issue.
- Suggest corrective actions.
- Avoid technical jargon.
- Maintain the application's visual consistency.

---

# 18. Responsive Design

The application must adapt seamlessly across:

- Android Phones
- iPhones
- Tablets
- Desktop Browsers

Content should reflow naturally without altering functionality.

---

# 19. Component Philosophy

All components must be:

- Reusable
- Accessible
- Responsive
- Theme-aware
- Well-documented
- Independently testable

Business logic should never exist inside UI components.

---

# 20. Developer Guidelines

Maintain:

- Consistent naming conventions
- Shared design tokens
- Centralized theme configuration
- Shared UI package
- Reusable components across Mobile and Web

The design system serves as the single source of truth for every visual element in GBUD.

---

# 21. User Experience Principles

Every interaction should leave the user feeling:

- Motivated
- In Control
- Informed
- Focused
- Encouraged

The application should celebrate consistency rather than perfection.

---

# 22. Final Design Statement

GBUD is not designed to impress users with visual complexity.

It is designed to earn trust through clarity, consistency, and meaningful feedback.

Every screen, component, animation, and interaction exists to support the platform's three pillars:

## **Train. Fuel. Progress.**

The user interface should act as a quiet, reliable companion that helps users build better habits and make measurable progress every day.