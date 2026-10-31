# BloomQuest: Progression Lab, Measurable Targets & Life Analytics

A unified personal progression engine that transforms BloomQuest from habit-tracking into a comprehensive, multi-dimensional life mastery studio. Users define measurable targets across physical training, deep reading, digital wellbeing, daily impact, and skill milestones with unified activity logging, progressive overload tracking, and evidence-based visual analytics—anchored in the Sage Sanctuary aesthetic.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The architectural direction below reflects the user's confirmed choices from Turn 1:

- **Confirmed Decision 1 (Access & Navigation)**: Progression Lab primary hub is integrated directly into the **Growth** section as a dedicated secondary tab, accompanied by an interactive **My Progress** summary card on the **Today** dashboard. No crowded extra bottom bar tabs.
- **Confirmed Decision 2 (Tagging Architecture)**: Hybrid tagging engine—a universal tag repository shared across all features (Skills, Future Learning Roadmap, Journal, Targets, Workouts) with optional domain-specific tag scopes (e.g., `#body` for workouts vs. `#deepwork` for screen-time vs. `#books` for reading).
- **Confirmed Decision 3 (Phase Rollout & Prioritization)**: Proceeding sequentially starting with **Stage A (Repository Audit & Architecture Review)**, followed immediately by **Stage B (Target Engine & Unified Daily Activity Log Core Foundation)**.

---

## 1. Overview & Core Concept

### What It Does
Progression Lab empowers users to set, track, and analyze quantitative goals beyond simple binary checkboxes. It supports six distinct target paradigms:
1. **Quantity**: Pages read, repetitions, sets, good deeds, practice drills.
2. **Duration**: Minutes spent deep working, reading, practicing, or meditating.
3. **Frequency**: Sessions per week, workouts per block, weekly consistency.
4. **Reduction**: Minimizing doomscrolling, late-night screen time, or impulsive habits.
5. **Milestone**: Multi-step hierarchical progression (e.g., Level 1 $\rightarrow$ Level 2 $\rightarrow$ Level 3).
6. **Consistency**: Maintaining consecutive days or weekly adherence blocks.

All entries feed into a single canonical **Unified Daily Activity Log**, powering real-time charts in **My Progress** with zero fabricated data.

### Target Audience
Self-directed learners, athletes, knowledge workers, and mindful individuals seeking concrete evidence of progress without judgment or punitive mechanics.

### Key Value
- Replaces disjointed spreadsheets and isolated trackers with a cohesive, offline-first personal dashboard.
- Links measurable targets directly to existing root pillars (`Learn`, `Build`, `Body`, `Mind`, `Care`, `Faith`) and Future Learning roadmap goals.

---

## 2. User Experience & Visual Design

### Key User Flows
1. **Target Creation**: User taps `+ New Target` inside Progression Lab (in Growth). They select a target type (Quantity, Duration, Frequency, Reduction, Milestone, Consistency), associate it with an existing skill or roadmap goal, assign universal or domain tags, set baseline and target values, and define a tracking period (Daily, Weekly, Monthly, Milestone).
2. **Quick Progress Logging**: From the Today screen's **My Progress** card or inside Progression Lab, the user taps `+ Log Entry`. They input the current value (e.g., 25 push-ups, 15 pages read, 45 minutes deep work), optionally add a dated session note with a clock timestamp, and receive instant XP/coin feedback.
3. **Target Inspection**: Tapping any target card opens its dedicated detail view with an SVG progress ring, milestone progression bar, recent dated entries timeline, historical chart, and edit/archive controls.
4. **Unified Timeline**: Users review chronological activity across workouts, reading, digital wellbeing, and good deeds with date, category, and tag filters.

### Visual Identity & Theme (Sage Sanctuary)
- **Palette**:
  - Dominant Canvas: Deep Warm Charcoal (`#121413` dark) / Soft Cream (`#F7F6F2` light)
  - Structural Surfaces: Card container (`#1B211E` dark / `#FFFFFF` light) with 1px border (`#384A41` dark / `#E5E3DA` light)
  - Primary Accent: Forest Sage (`#3D7D62` dark / `#2D6A4F` light) for progress rings, primary buttons, and active states
  - Milestone & Reward Accent: Warm Golden Amber (`#E5A93C`) for streaks, coins, and level progress
  - Reduction & Urgency: Warm Terracotta (`#D95D39`) for doomscrolling limits and slip avoidance
- **Typography & Layout**:
  - Clear sans-serif typography with monospace tabular numerals (`font-mono tabular-nums`) for all metrics, timers, and step counters.
  - Zero-pill metadata: Unboxed clean text with `·` separators for timestamps, units, and categories.
  - Ergonomic touch targets: Full $\ge 44\text{px}$ touch targets across all mobile check buttons and steppers.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Canonical Unified Activity Log vs. Disconnected Event Stores**
  - *Chosen Approach*: Implement a single canonical `ActivityRecord` entity with typed payloads (`workout`, `reading`, `screen_time`, `good_deed`, `skill_practice`, `custom`) and stable references to parent targets and skills.
  - *Why*: Prevents double-counting, enables unified chronological filtering, and simplifies backup/restore operations.
  - *Alternatives Considered*: Storing activity inside each individual target array (leads to fragmented queries and sync bugs).

- **Decision 2: Manual Digital Wellbeing Logging vs. Native Device Inspection**
  - *Chosen Approach*: Beautiful, rapid manual session timer and category logger (Learning, Work, Social, Doomscrolling) with planned vs. unplanned flags. Honest UI stating it is user-reported.
  - *Why*: Running in a web browser sandbox cannot access OS-level background app usage without native Android privileges. Transparent, accurate user tracking preserves data integrity.

- **Decision 3: Progressive Overload without Automatic Forced Escalation**
  - *Chosen Approach*: The workout tracker calculates and visualizes volume/reps history and suggests progressive steps, but requires user tap to confirm increments.
  - *Why*: Prevents injury and cognitive pressure; respects user autonomy and physiological recovery days.

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        BloomQuest Application Shell                    │
├────────────────────────────────────────────────────────────────────────┤
│  Top Navigation (HeaderBar)  ·  BottomNav (Today, Growth, Reflect, Ins)│
│                                      │                                 │
│                   ┌──────────────────┴──────────────────┐              │
│                   ▼                                     ▼              │
│     [Today: My Progress Summary]         [Growth: Progression Lab]     │
│       • Daily Active Targets               • Target Engine (6 Types)   │
│       • Quick Progress Logging             • Workouts & Overload Plan  │
│       • Real-Time Progress Rings           • Reading Tracker (Pages)   │
│                                            • Digital Wellbeing (Timer) │
│                                            • Daily Impact Log          │
│                                            • Unified Activity Timeline │
└──────────────────────────────────────┬─────────────────────────────────┘
                                       │
                                       ▼
┌────────────────────────────────────────────────────────────────────────┐
│               Unified AppState & Reactive Context Store                │
├────────────────────────────────────────────────────────────────────────┤
│  • measurableTargets: MeasurableTarget[]                               │
│  • activityRecords: ActivityRecord[]                                   │
│  • workoutPlans: WorkoutPlan[]                                         │
│  • sharedTags: SharedTag[] (Universal + Domain Scoped)                │
│  • roadmapGoals / roadmapSteps / nodes (Linked via target.linkedId)    │
│  • localStorage Persistence ('bloomquest_state_v19') + 10-Slot Snapshots│
└────────────────────────────────────────────────────────────────────────┘
```

### Core Data Models
```typescript
export type TargetType = 'quantity' | 'duration' | 'frequency' | 'reduction' | 'milestone' | 'consistency';
export type TrackingPeriod = 'daily' | 'weekly' | 'monthly' | 'custom';
export type TargetStatus = 'active' | 'paused' | 'completed' | 'archived';

export interface TargetMilestone {
  id: string;
  title: string;
  targetValue: number;
  isCompleted: boolean;
  completedAt?: number;
}

export interface MeasurableTarget {
  id: string;
  title: string;
  description: string;
  type: TargetType;
  category: 'fitness' | 'reading' | 'learning' | 'wellbeing' | 'impact' | 'work' | 'custom';
  icon: string;
  linkedSkillId?: string | null;
  linkedGoalId?: string | null;
  tagIds: string[];
  unit: string;
  baselineValue: number;
  currentValue: number;
  targetValue: number;
  trackingPeriod: TrackingPeriod;
  startDate: string;
  targetDate?: string | null;
  status: TargetStatus;
  milestones: TargetMilestone[];
  isReductionTarget?: boolean;
  notes: string;
  createdAt: number;
  updatedAt: number;
}

export interface ActivityRecord {
  id: string;
  targetId?: string | null;
  skillId?: string | null;
  category: string;
  timestamp: number;
  dateStr: string; // YYYY-MM-DD
  durationMinutes?: number;
  valueChange: number;
  unit: string;
  notes: string;
  tagIds: string[];
  isPlanned?: boolean;
}
```

---

## 5. Stage A: Repository Audit & Baseline Findings

### Current Status & What Exists
- **App Core**: React 19 + TypeScript 5 + Tailwind CSS v4 running Vite SPA on port 3000.
- **Navigation**: Clean 4-tab bottom navigation (`Today`, `Growth`, `Reflect`, `Insights`) + floating `+` ActionSheet.
- **Today Screen**: Compact greeting, level/XP, Today's Focus card, 3 SVG progress rings (Learn, Build, Body), short habit checklist, routine launcher.
- **Growth Hub**: Unified learning center with secondary tabs (`Roadmap`, `Skills`, `Recall`, `Library`).
- **Future Learning Roadmap**: Hierarchical prerequisite milestones, Calendar/List views, custom tags, notes with `+ Insert Stamp` ⏱️ clock button.
- **Reflect Hub**: 5-point daily mood check-in (Difficult, Low, Neutral, Good, Great), optional journal with tags, Box Breathing, 10m Urge Surfing, kindness log.
- **Insights**: Analytics, weekly review, habit-mood correlation, 10-slot backup manager with `CONFIRM` guard.

### What is Broken, Duplicated, or Missing for Progression Lab
1. **Target Rigidity**: Current habits only support boolean check, simple count stepper, or single slider level. There is no concept of baseline-to-target tracking, reduction targets (doomscrolling ceilings), or multi-stage progressive overload.
2. **Tag Siloing**: `RoadmapTag` was confined to Future Learning; it needs promotion to a unified `SharedTag` system with domain scoping (Universal, Fitness, Reading, Learning, Mind).
3. **Fragmented Event History**: Events in `state.ev` store only `{ t, d, n, c, x }`. They do not store session duration, detailed notes, planned/unplanned flags, or links across targets.
4. **Workout & Reading Depth**: Workouts currently lack set-by-set recording, rest intervals, and exercise variations; Books track chapters but lack individual session duration and page velocity tracking.

### Features That Must Be Preserved 100%
- Existing skill relationships (`state.nodes`) across 6 root pillars.
- Existing XP calculation, level progression, Carrot-Coins, and streak counts.
- 10-slot backup snapshots and strict JSON export/import.
- Offline-first operation with 100% device privacy.
- SHA-256 PIN authentication for confidential sections.

### Proposed Implementation Order
- **Stage A (Current)**: Architecture audit, data model specification, and handoff synchronization. *(This stage)*
- **Stage B**: Target Engine Core (creation, 6 target types, dated progress entries, milestones, and Unified Daily Activity Log).
- **Stage C**: Workout & Physical Training Progression (exercise lists, sets/reps, progressive overload, rest timer).
- **Stage D**: Reading & Knowledge Progression (pages/chapters velocity, session logs, reading timeline).
- **Stage E**: Digital Wellbeing & Screen Time (category tracker, manual timer, doomscrolling ceiling, planned vs. unplanned).
- **Stage F**: Daily Impact & Positive Actions (meaningful deed templates, impact rating, reflections).
- **Stage G**: "My Progress" Visual Analytics (interactive charts, target-vs-actual rings, date-range filters, evidence-based insights).
- **Stage H**: Full System Integration, Reminders, and Regression Verification.

### Acceptance Criteria for Stage B (Next Immediate Implementation)
1. `MeasurableTarget` and `ActivityRecord` data models integrated into `AppState` with backward-compatible schema migrations.
2. Shared tagging system extended to support both universal and domain-scoped tags.
3. Progression Lab tab accessible inside Growth with target list, type filters, and `+ New Target` modal.
4. Target creation supports Quantity, Duration, Frequency, Reduction, Milestone, and Consistency types with units, baselines, and targets.
5. Quick logging modal records dated entries with optional clock timestamp notes into the Unified Daily Activity Log.
6. Target detail view displaying progress percentage, baseline vs target, and recent activity entries.
7. Interactive "My Progress" summary widget rendered on Today screen.
8. Zero regression on existing skills, roadmap goals, journal, or 10-slot backups.
9. Verification via `compile_applet` and `lint_applet` passing with 0 errors.

### Files Likely to Be Affected in Stage B
- `src/types/index.ts` (Add `MeasurableTarget`, `ActivityRecord`, `SharedTag`, `TargetMilestone`)
- `src/data/seedData.ts` (Provide starter targets and activity logs)
- `src/context/AppContext.tsx` (Target CRUD, progress entry logging, schema migration)
- `src/screens/GrowthScreen.tsx` (Add Progression Lab sub-section)
- `src/components/progression/ProgressionLabView.tsx` (New target list, filter, and detail components)
- `src/components/progression/TargetEditorModal.tsx` (New multi-type target creator)
- `src/components/progression/LogProgressModal.tsx` (New activity entry logger)
- `src/screens/TodayScreen.tsx` (Add My Progress summary card)
- `AI_HANDOFF.md` & `CHECKPOINT.md` (Stage progress tracking)
