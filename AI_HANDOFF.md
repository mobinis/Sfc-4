# BloomQuest — AI Development Handoff

## Project

- **Repository**: mobinis/Self-care-and-life-changing- (App name: BloomQuest)
- **Framework and architecture**: React 19 + TypeScript 5 + Vite 6 Single Page Application (SPA), styled with Tailwind CSS v4 and the "Sage Sanctuary" design system. State managed via React Context (`AppContext.tsx`) with localStorage persistence (`bloomquest_state_v19`). Procedural audio synthesis via Web Audio API (`SoundHapticsManager`).
- **Primary entry points**: 
  - `src/main.tsx` (React DOM root mount)
  - `src/App.tsx` (Top-level application shell, layout, navigation & PIN app-lock)
  - `src/screens/TodayScreen.tsx` (Primary daily dashboard)
  - `vite.config.ts` (Vite dev & build server config with `allowedHosts: true` for reverse-proxy routing)
- **Storage and persistence**: 
  - Browser `localStorage` (`bloomquest_state_v19`) with versioned schema migration
  - 10-slot local snapshot backup system with strict `CONFIRM` restore guard
  - JSON progression export and import engine

## Current Status

- **Current phase**: Phase 9: Google Drive Direct Cloud Export & Resumable Deliverables Streaming — **DEPLOYED & VERIFIED**
- **Status**: verified
- **Last verified repository checkpoint**:
  - Identified cause of sidebar `(!)` alerts: AI Studio web editor sync enforces a ~50 MB per-file threshold for workspace tree tracking, triggering alert badges on 96 MB APK and 51 MB ZIP.
  - Resolved workspace tree alert: Removed 50 MB+ binary blobs from visible workspace folders and placed them in build outputs (`app/build/outputs/apk/debug/`); deleted legacy `bun.lock`; updated `.gitignore` with `*.apk`, `*.zip`, `.kotlin/`.
  - Configured Vite streaming middleware in `vite.config.ts`: HTTP GET `/downloads/BloomQuest-Restored-Checkpoint.apk` and `/downloads/BloomQuest-Restored-Checkpoint-Android.zip` stream directly from build output with full chunked/resumable capabilities.
  - Integrated 1P Google Drive API v3 with `https://www.googleapis.com/auth/drive.file` scope using Firebase Auth and in-memory token cache.
  - Implemented `src/services/googleDriveService.ts`: Resumable 5MB chunked upload protocol, progress reporting (0-100%), and direct file view links.
  - Created `src/components/modals/ApkExportModal.tsx`: Dual-action hub providing 1-click direct browser download and 1-click Google Drive cloud upload with mandatory user confirmation per Google guidelines.
  - Added "APK & Drive" launch button to HeaderBar and floating ActionSheet.



## Confirmed Completed Work

- **Phase 7: Unified Cross-Domain Adaptive Reminder System & Multi-Hub Data Integrity (Completed & Verified)**:
  - **Adaptive Reminder Engine (`src/utils/adaptiveReminderEngine.ts`)**:
    - Pure offline evaluation connecting 6 distinct life domains without telemetry or external servers.
    - **Circadian Rest & Curfew**: Evaluates bed time, wake time, screen curfew hour offset, and caffeine cutoff hour offset.
    - **Relationship Circle Cadences**: Flags overdue contacts based on configured check-in frequency with 1-tap touchpoint logging.
    - **Measurable Targets & Deadlines**: Warns of upcoming/overdue milestones and daily target tracking times.
    - **Routines & Habit Anchors**: Detects unfulfilled morning/evening routine flows and habit anchor cues.
    - **Digital Wellbeing Limits**: Triggers warning cues when daily app usage exceeds set ceilings.
    - **Learning Roadmap Sessions**: Reminds user of scheduled roadmap learning steps.
    - Urgency prioritization: `critical`, `urgent`, `due_now`, `upcoming`, and `gentle`.
    - Native Web Notification API permission request and background notification dispatch.
    - Smart snooze (15m, 1h, 4h) and daily dismissal persistence in `adaptiveReminderSettings`.
  - **Adaptive Reminder Center Modal (`src/components/reminders/AdaptiveReminderCenterModal.tsx`)**:
    - Segmented domain filters: `All`, `Routines`, `Targets`, `People`, `Rest & Curfew`, and `Settings`.
    - 1-tap direct action launchers (check in habit, log relationship deed, launch bedtime pacer, open routine).
    - Quiet hours configuration (custom start & end time).
    - Granular channel toggles for each domain.
    - Browser web notification toggle and status check.
  - **HeaderBar Notification Bell (`src/components/HeaderBar.tsx`)**:
    - Elevated notification bell with live badge count and animated pulsing dot for pending urgent cues.
  - **Today Screen Mindful Alert Cue (`src/screens/TodayScreen.tsx`)**:
    - Context-aware alert card rendered directly below the Focus card when urgent or due items are detected.
  - **Procedural Audio Synthesizer Updates (`src/utils/soundHaptics.ts`)**:
    - Added warm Tibetan singing bowl double harmonic chime (`'reminder'`) and soothing low-frequency wind-down tone (`'curfew'`).

- **Phase 6: Custom Root Pillars, Root Skills System & All-Pillars Overview (Completed & Verified)**:
  - **Custom Root Pillars**: Unlimited top-level pillars (`p: '0'`), custom names, emoji picker, mission descriptions, custom palette colors, and safe deletion with automatic child re-parenting to `Unassigned Archive`.
  - **Root Skills System**: Create root skills under any existing or custom pillar with nature, importance, tracking kind, target count/unit, routine window, if-then anchor cue, and notes.
  - **3-Way View Switcher**: Instant switching between `All Pillars`, `Outline`, and `Mind Map`.
  - **All-Pillars Overview Dashboard**: Vertically scrollable multi-pillar dashboard with independent collapsible accordions, global skill search, compact/expanded density toggle, and inline action launchers.
  - **Dynamic Today Progress Rings**: Automatically calculates and renders SVG circular progress rings for all default and custom active pillars on the Today dashboard.

- **Phase 5: Sage Sanctuary UX, Navigation Overhaul & Future Learning Roadmap (Completed & Verified)**:
  - **4-Tab Navigation & Floating Quick Action Sheet (`src/components/BottomNav.tsx`, `src/components/ActionSheet.tsx`)**:
    - Restructured navigation into exactly 4 primary bottom tabs: **Today** (`CalendarCheck`), **Growth** (`Sprout`), **Reflect** (`Heart`), and **Insights** (`BarChart3`).
    - Added elevated central floating `+` button triggering a 5-action bottom sheet:
      1. Check in today's habits
      2. Log mood & reflection
      3. 10m Urge Surfing wave
      4. Somatic Box Breathing (4-4-4-4)
      5. 25m Deep Focus sprint
  - **Redesigned Today Screen (`src/screens/TodayScreen.tsx`)**:
    - Compact hero greeting with level, title, and XP progression bar.
    - Prominent "Today's Focus" card with streak flame and 1-tap completion (+15 XP, +1 🪙).
    - Three SVG circular progress rings with percentage completion: **Learn** (Blue #3B82F6), **Build** (Amber #E5A93C), and **Body** (Sage #3D7D62).
    - Short daily habit checklist with 48dp touch targets, count steppers, and anchor cues.
    - Single primary action button launching the mindful routine flow ritual.
  - **Unified Growth Learning Hub (`src/screens/GrowthScreen.tsx`)**:
    - Secondary navigation tabs for **Roadmap**, **Skills**, **Recall**, and **Library**.
    - **Skills View**:
      - Switchable between **Outline** (clean vertical tree) and **Mind Map** (central radial hub with SVG branching connectors).
      - Replaced per-row button clutter with a sleek contextual action bottom sheet offering: Add Sub-Skill, Check In Today (+15 XP), and Delete Skill.
    - **Recall View**: Integrated Feynman teach-back active recall with 3-tier review intervals and definition hints.
    - **Library View**: Filterable cards with simple pills for `All`, `Books`, and `Videos`.
  - **Future Learning — Personal Learning Roadmap (`src/components/roadmap/FutureLearningView.tsx`)**:
    - Dedicated entry point embedded in Growth with a clean empty state and "Add Learning Goal" launcher.
    - Goal creation & editing: Title, description, planned start date, optional target date (no forced deadlines), session time, duration, priority (`low`, `medium`, `high`, `urgent`), status (`planned`, `in_progress`, `paused`, `completed`, `archived`), custom tags, and personal notes.
    - Hierarchical prerequisite milestone tree: Multi-tier nested learning items with expandable/collapsible branches, check-off status, ordering, and dedicated notes.
    - Reusable custom tag system: Create, rename, recolor (color picker), delete tags, and filter by tag without deleting associated items.
    - Independent notes editor with small `+ Insert Stamp` ⏱️ clock button inserting local formatted timestamp `[YYYY-MM-DD HH:MM] ` at the cursor without overwriting existing text.
    - Automatic progress calculation for each main goal based on completed prerequisite milestones.
    - Calendar & List view switchers.
  - **Redesigned Reflect Hub (`src/screens/ReflectScreen.tsx`)**:
    - One daily mood check-in with 5 distinct labels: **Difficult** (😞), **Low** (😕), **Neutral** (😐), **Good** (🙂), **Great** (😄).
    - One optional journal reflection with tag inputs and save confirmation toast.
    - Accessible quick-launch cards for Somatic Box Breathing (4-4-4-4) and Urge Surfing Wave (10m).
    - Collapsible secondary section for Kindness & Self-Compassion deed tracking (for Self vs Others).
    - Preserves local SHA-256 PIN authentication lock for confidentiality.
  - **Centralized Insights Screen (`src/screens/StatsScreen.tsx`)**:
    - Centralized weekly review insights, 4-KPI summary, habit-mood correlation analysis, pillar balance equilibrium gauge, and 10-slot backup manager with strict `'CONFIRM'` restore guard.
  - **Build & Lint Verification**:
    - `compile_applet`: `Build succeeded - the applet is compiled`
    - `lint_applet`: `Linting completed successfully` (0 errors)

---

## Active Phase: Progression Lab, Measurable Targets & Life Analytics

### Completed Checkpoints
- **Stage A: Repository Audit & Architectural Blueprint (Completed & Verified)**:
  - Detailed audit of existing state machine, skill tree, future learning roadmap, and journal.
  - Turn 1 clarifying questions completed and answers integrated (Growth hub sub-section with Today summary card, hybrid universal/domain tagging, Stage B target engine prioritized).
  - Drafted comprehensive `implementation_plan.md` artifact and initialized `CHECKPOINT.md`.
- **Stage B: Target Engine & Unified Daily Activity Log Foundation (Completed & Verified)**:
  - Implemented `MeasurableTarget`, `ActivityRecord`, and `SharedTag` in state, types, and seed data.
  - Built `TargetEditorModal.tsx` supporting 6 target types, baselines, goals, reduction ceilings, milestones, linked skills/roadmap goals, and inline tag creation.
  - Built `LogProgressModal.tsx` supporting rapid progress entry, duration, planned vs spontaneous tagging, and `+ Insert Stamp` ⏱️ clock button.
  - Built `ProgressionLabView.tsx` with Targets Matrix, Metric Summary Tiles, Category Filter Chips, and the Unified Daily Activity Log timeline with deletion and notes.
  - Integrated `TodayProgressCard.tsx` on the Today screen with live SVG circular progress rings and 1-tap quick log launcher.
  - Added "Lab" 🎯 sub-section to Growth secondary navigation.
  - Verified `lint_applet` and `compile_applet` pass with 0 errors.
- **Stage C: Workout & Physical Training Progression (Completed & Verified)**:
  - Added full TypeScript models: `ExerciseItem`, `WorkoutRoutineTemplate`, `WorkoutRoutineExercise`, `WorkoutSet`, `WorkoutExerciseLog`, `WorkoutSessionRecord`, `ExerciseMovementPattern`, `ExerciseCategory`.
  - Populated comprehensive exercise library in `seedData.ts` spanning 6 movement patterns (Push, Pull, Legs, Core, Cardio, Mobility) with equipment, muscle groups, form cues, and personal records.
  - Provided 5 starter routine templates (Push Calisthenics Mastery, Pull & Posture Foundation, Lower Body Power & Mobility, Core & Somatic Stability, Full-Body Express Circuit).
  - Created `WorkoutPlayerModal.tsx`: Real-time session runner with exercise stepper, per-set weight/reps adjustments (+/- quick buttons), 1-10 RPE rating selector, auto-starting rest countdown timer with Web Audio timer chime (`playChime('timer')`), mid-workout exercise additions, and finish session summary modal.
  - Full automated integration: Completing a session auto-generates an `ActivityRecord` (`domain: 'workout'`) in Unified Daily Activity Log, auto-accumulates reps into matched measurable targets (e.g. `target_pushups`), detects & saves new Personal Records (PRs), and awards Body XP (`body` node) and coins.
  - Built `WorkoutHubView.tsx` with Routine Launchers, Exercise Library Explorer with movement pattern filter chips & form cue trays, and Workout History timeline.
  - Built `WorkoutTemplateModal.tsx` and `CustomExerciseModal.tsx`.
  - Verified `lint_applet` (0 errors) and `compile_applet` build pass cleanly.
- **Stage D: Reading & Knowledge Progression (Completed & Verified)**:
  - Created `ReadingSessionModal.tsx`:
    - Dual mode: Ambient "Live Reading Timer" with digital timer and start/pause/reset controls; and "Fast Progress Log" with start/end page selectors and minute presets.
    - Automatic calculation of pages read, session duration, and live reading velocity (~pages/hour).
    - Memorable quote capture, reflective notes with `+ Insert Stamp` ⏱️ timestamp button, 1–5 star rating for completed books, and completion celebration (chime + confetti).
  - Created `CustomBookModal.tsx`:
    - Allows adding any book with title, author, total pages, category, cover emoji selector, format (physical, ebook, audiobook), and reading status.
  - Built `ReadingHubView.tsx`:
    - 4 summary analytics KPI cards: Books Finished/Active, Pages Read (Total & Today), Reading Time (Hours), and Reading Velocity.
    - Currently Reading shelf with book cover emojis, progress bars, page counts, quick 1-tap "Log / Read" launcher, and status dropdowns.
    - Active Reading Targets widget directly linked to `measurableTargets` (`target_reading`).
    - Recent Reading Activity Timeline with pages interval, session duration, velocity badges, quote snippets, and delete support.
    - Wisdom Highlights & Saved Quotes reel showcasing captured insights.
  - Deep Book Library Integration:
    - Updated `BookLibraryScreen.tsx` with header action buttons ("Add Book", "Log Reading"), per-card reading progress, and direct reading session launchers from both cards and the book study modal.
    - Integrated "Reading" as a first-class view in `ProgressionLabView.tsx` with quick-switch tab and header launcher.
  - Automated Data & Progression Integration:
    - Automatically creates an `ActivityRecord` (`domain: 'reading'`) in Unified Daily Activity Log.
    - Automatically accumulates pages/minutes into matched measurable targets (`target_reading`).
    - Updates book's `pagesRead`, `readingProgressPercent`, `status`, `completedDate`, and `favoriteQuotes`.
    - Awards Learn XP (`l2` node) and coins.
  - Verified `lint_applet` (0 errors) and `compile_applet` build pass cleanly.

- **Today Page Daily Checklist Editor (Completed & Verified)**:
  - Built `EditDailyChecklistModal.tsx` allowing complete customization of habits directly from the Today page.
  - Added "Edit Checklist" button with `Edit3` icon in the checklist header and a sticky footer button.
  - Allows creating new habits (name, emoji, parent pillar, count vs check mode, target count, unit, routine window, anchor cue, importance), editing existing habits, deleting habits, and toggling Low Energy Essentials (⭐).
- **Stage E: Digital Wellbeing & Screen-Time Dashboard (Completed & Verified)**:
  - Built `DigitalWellbeingHubView.tsx` with 4 KPI summary cards (Screen Time Today, Doom-scroll Slips, Intentionality %, Screen Curfew countdown).
  - App budget shelf with percentage progress bars and quick 1-tap `+ Log` buttons.
  - Built `ScreenTimeSessionModal.tsx` supporting intentional vs mindless doom-scroll classification, trigger cues, minute presets, notes with `+ Insert Stamp` ⏱️ button, and box breathing intervention.
  - Built `AddMonitoredAppModal.tsx` for adding/customizing monitored apps, categories, daily ceiling budgets, and doom-scroll risk flags.
  - Integrated with `target_doomscroll` (reduction ceiling), Anti-Goals (`q: No doom-scrolling`), and Circadian screen curfew countdown.
  - Added dedicated 5th tab ("Digital") in `ProgressionLabView.tsx` and automated sync with Unified Daily Activity Log (`domain: 'screentime'`).
  - Verified `lint_applet` (0 errors) and `compile_applet` pass cleanly.

- **Stage F: Daily Impact & Meaningful Actions Tracker (Completed & Verified)**:
  - Added TypeScript models (`ImpactDeedCategory`, `RelationshipType`, `ContactChannel`, `ImpactDeedRecord`, `RelationshipContact`) and AppContext methods (`logImpactDeed`, `deleteImpactDeed`, `addRelationshipContact`, `updateRelationshipContact`, `deleteRelationshipContact`, `logRelationshipCheckIn`).
  - Populated seed data with initial contacts (Mom & Dad, Sarah, Alex, David), initial impact deeds, and the `target_kindness` measurable target.
  - Built `ImpactDeedModal.tsx`: Log meaningful actions with idea prompts, category selector (Others, Gratitude, Mentorship, Community, Self), linked relationship contact selector, 1-5 star impact rating, reflection notes with `+ Insert Stamp` ⏱️ timestamp button, and XP/coin reward previews.
  - Built `RelationshipContactModal.tsx`: Add/edit loved ones, friends, mentors, and colleagues with emoji avatar picker, target cadence presets (3d, 7d, 14d, 30d, custom), preferred contact channels (Call, Message, Coffee, In-Person, Letter), notes with `+ Insert Stamp` ⏱️ button, and pinned favorite toggle.
  - Built `ImpactHubView.tsx`: 4 KPI dashboard tiles (Total Deeds Logged, Altruism Karma Score, Cadence Status & Overdue Alerts, Meaningful Impact Streak), Overdue Touchpoint Alert Banner with 1-click check-in, Relationship Circle shelf with live cadence countdowns and fast touchpoint actions, Impact Ledger timeline with filter chips and search, and integrated Kindness Target progress card.
  - Integrated into `ProgressionLabView.tsx` with dedicated 5th/6th tab ("Impact") and automated sync with the Unified Daily Activity Log (`domain: 'impact'`).
  - Integrated with `ReflectScreen.tsx` kindness sanctuary section with dual logging and 1-tap modal launch.
  - Verified `lint_applet` (0 errors) and `compile_applet` pass cleanly.

- **Stage G: Unified Visual Analytics ("My Progress") & Masterclasses from Links (Completed & Verified)**:
  - **Unified Visual Analytics Engine (`src/components/analytics/VisualAnalyticsView.tsx`)**:
    - **Interactive Cross-Domain Heatmap**: 7d, 30d, 90d, and 180d views across All, Workouts, Reading, Digital Wellbeing, Impact Deeds, and Habits with 5-tier intensity styling and interactive date inspector.
    - **4-Pillars Equilibrium Radar (Mind, Body, Craft, Soul)**: Real-time calculation of energy distribution, standard deviation variance, and Equilibrium Index percentage.
    - **Empirical Behavioral Correlations**: Compares logged daily mood on workout vs rest days, low vs high screen time days (>= 45m), and altruistic impact deed days vs regular days.
    - **Target Velocities & Projection Curves**: 7-day and 30-day daily velocity tracking, remaining unit calculation, estimated days to completion, and milestone forecast dates.
    - **Exportable Progress Summary**: Shareable Markdown recap card with 1-tap clipboard copy.
  - **Full Platform Accessibility**:
    - **Stats Screen (`src/screens/StatsScreen.tsx`)**: Upgraded with a prominent top segment toggle switching between "📊 My Progress (Visual)" and "⚙️ Weekly Review & Backups".
    - **Progression Lab (`src/components/progression/ProgressionLabView.tsx`)**: Integrated 7th first-class tab ("Analytics") rendering `<VisualAnalyticsView />`.
    - **Today Screen (`src/components/progression/TodayProgressCard.tsx`)**: Added 1-tap "Analytics" shortcut button in header.
  - **Add Masterclasses from Links (`src/components/video/AddMasterclassModal.tsx`, `src/screens/VideoLibraryScreen.tsx`)**:
    - Built `AddMasterclassModal.tsx` allowing instant curation of lectures, talks, and masterclasses from web URLs.
    - **Smart Link Detection & Auto-Parser**:
      - Automatically detects YouTube links (`watch?v=`, `youtu.be/`, `shorts/`, `embed/`) and generates privacy-enhanced embed URLs (`youtube-nocookie.com/embed/...`).
      - Detects Vimeo (`vimeo.com/...`), TED talks, Loom, Coursera, or direct HTML5 video links (`.mp4`, `.webm`).
      - 1-tap "Paste Link" from system clipboard.
    - Configurable title, speaker/instructor/channel, domain categories, duration presets (15m, 25m, 45m, 1h, custom), emoji icon picker, quick tag chips, description, and live sanctuary card preview.
    - Awards +15 Learn XP upon curation.
    - **Upgraded Video Library (`src/screens/VideoLibraryScreen.tsx`)**:
      - Top action bar with "+ Add Masterclass from Link" button and count badge.
      - Search bar (filtering by title, speaker, tag, and description) and category filter chips (All, Starred, Somatic, Communication, Focus, Philosophy, Custom).
      - Star toggle (favorite) and delete options for custom masterclasses.
      - **Enhanced Watch & Study Modal**:
        - Responsive 16:9 media player supporting embedded YouTube, Vimeo, and native HTML5 video with fallback external launcher.
        - **Live Study Timer**: Integrated stopwatch with pause/resume and reset.
        - **Timestamped Action Anchors**: "⏱️ Insert Timestamp" button automatically formatting and appending `[MM:SS]` into user's study notes.
        - **Complete Session Action**: Awards +20 Learn XP, +2 🪙, increments study count, updates timestamp, and logs to Unified Activity Log (`domain: 'learning'`).
  - Verified `lint_applet` (0 errors) and `compile_applet` build pass cleanly.

### Upcoming Stages
- **Stage H: Full System Integration, Adaptive Reminders & End-to-End Regression Hardening** (Next to implement upon user approval)
  - Unified reminder system across all domains (routines, targets, cadence check-ins, reading, curfew), notification queue, cross-platform persistence validation, and comprehensive regression verification.


