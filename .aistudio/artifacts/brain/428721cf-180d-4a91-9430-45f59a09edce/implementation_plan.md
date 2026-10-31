# Implementation Plan: HANDOFF.md Sync, 10-Slot 'CONFIRM' Backup System & Celebratory Level-Up Animation

An enhancement plan to bring `HANDOFF.md` into exact alignment with the latest codebase, implement an anti-accidental-loss 10-slot rolling backup manager in Settings requiring exact `'CONFIRM'` verification on all restores, and add a celebratory gold-shimmer scale-bounce animation to Level Up toasts.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following specifications are locked based on your clarifications:
> - **Restore Safety Guard**: Require typing `'CONFIRM'` verbatim into an input field before executing any restore operation (both file-based imports and local snapshot rollbacks).
> - **Level Up Toast Style**: Gold shimmer glow with scale-bounce entrance and sparkle effect (`@keyframes levelUpBounce` & `@keyframes goldShimmer`), distinct from standard informational toasts.
> - **Snapshot Retention**: Up to 10 rolling timestamped snapshots in `localStorage` (`sch5`), with automated pruning of the oldest entries beyond 10 slots and manual deletion capability.
> - **GitHub + APK Continuity**: Zero external network calls, zero CDN imports, 100% offline-ready, preserving Capacitor/Vite build output (`dist/`) and strict adherence to `npm run build` & `tsc --noEmit`.

---

## 1. Overview & Codebase Audit Findings

### Codebase vs. HANDOFF.md Audit
The audit reveals that while the codebase already includes:
1. **Weekly Insights (`src/components/WeeklyInsightsView.tsx`)**: 7-day KPIs, hybrid top skill momentum scoring, 3-angle mood distribution, and gratitude aggregation.
2. **Skill Classification (`src/types.ts`, `SkillEditModal.tsx`, `SkillsView.tsx`)**: Nature tags (`skill`, `technique`, `concept`, `course`, `habit`), importance tiers (`critical`, `high`, `medium`, `low`), and customizable spaced recall / rememorization intervals.
3. **Wipe Guard (`SettingsModal.tsx`)**: The `"RESET HERO"` anti-wipe protection and emergency snapshot.
4. **GitHub Actions APK Setup**: `.github/workflows/build-apk.yml` and Capacitor offline requirements.

`HANDOFF.md` had fallen behind and omitted these items. 

### Planned Delivery
1. **Update `HANDOFF.md`**: Fully synchronize with the actual codebase, document the GitHub Actions APK workflow rules, and detail the newly planned backup guard and animations.
2. **10-Slot Rolling Backup System with 'CONFIRM' Modal**:
   - Upgrade snapshot storage from 5 to 10 rotating slots with automatic retention management.
   - Introduce a dedicated Confirmation Dialog when clicking "Restore" on any snapshot or uploaded file:
     * Shows a warning dialog with snapshot metadata (Date, Level, XP, Skills count, Habits count).
     * Requires the user to type `'CONFIRM'` into an input box to activate the restore button.
     * Automatically saves a pre-restore safety snapshot before applying changes so no work is ever unrecoverable.
3. **Celebratory Level Up Toast Animation**:
   - Detect when a toast message is a Level Up announcement (e.g. `Level Up!`, `Lv.`).
   - Apply a dynamic CSS animation class:
     * Entrance bounce: `transform: scale(0.8) -> scale(1.08) -> scale(1.0)`.
     * Radiant gold shimmer linear gradient with animated background position.
     * Gold border with soft pulsating drop shadow and star sparkle icons (`✨`).

---

## 2. Technical Architecture & Component Hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│                          App.tsx                            │
│  • Global State (AppState) with 10 BackupSnapshot slots    │
│  • Level-up detector on XP delta / plvOf(prev)             │
│  • Toast notification container with 'level-up' CSS class   │
└──────────────────────────────┬──────────────────────────────┘
                               │
               ┌───────────────┴───────────────┐
               ▼                               ▼
     ┌───────────────────┐           ┌───────────────────┐
     │   SettingsModal   │           │    index.css      │
     │ ┌───────────────┐ │           │ ┌───────────────┐ │
     │ │10 Snapshots   │ │           │ │@keyframes     │ │
     │ └───────┬───────┘ │           │ │ levelUpBounce │ │
     │         ▼         │           │ ├───────────────┤ │
     │ ┌───────────────┐ │           │ │@keyframes     │ │
     │ │Confirm Modal  │ │           │ │ goldShimmer   │ │
     │ │(Type CONFIRM) │ │           │ └───────────────┘ │
     │ └───────────────┘ │           └───────────────────┘
     └───────────────────┘
```

---

## 3. Step-by-Step Implementation Steps

### Step 1: Update `HANDOFF.md`
- Synchronize the file inventory and feature lists:
  * Add Weekly Insights (`src/components/WeeklyInsightsView.tsx`).
  * Add Skill Classification & Spaced Recall (`SkillEditModal.tsx`, `SkillsView.tsx`, `types.ts`).
  * Add `"RESET HERO"` wipe guard and snapshot management.
  * Explicitly record the GitHub Actions APK workflow and Capacitor requirements at the top of the handoff instructions.

### Step 2: Implement the 'CONFIRM' Restore Modal & 10-Slot Snapshots in `SettingsModal.tsx`
- Increase snapshot slice limit from `5` to `10`.
- Add a `pendingRestore` state holding target snapshot or file data.
- Render a dedicated Modal when `pendingRestore !== null`:
  * Displays source info: Timestamp, Level, XP, Skill count.
  * Explains that existing current data will be replaced.
  * Text input requiring user to type `'CONFIRM'` (case-insensitive or uppercase).
  * "Cancel" button and disabled "Confirm Restore" button until input matches `'CONFIRM'`.
  * On confirmation: automatically captures an immediate `Pre-Restore Rollback Snapshot` before applying the new state, ensuring 100% fail-safe operation.

### Step 3: Implement Golden Shimmer Level-Up Toast Animation in `src/index.css` & `src/App.tsx`
- Add CSS keyframes and class `.toast-levelup` in `src/index.css`:
  * Animated golden gradient background `linear-gradient(135deg, #f59e0b, #fbbf24, #d97706, #fbbf24)`.
  * Shimmer movement using `background-size: 200% 200%` and `animation: goldShimmer 2.5s infinite linear`.
  * Spring entrance bounce `animation: levelUpBounce 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards`.
  * Elevated box-shadow: `0 8px 24px rgba(217, 119, 6, 0.35)`.
- In `src/App.tsx`, tag toasts containing `"Level Up"` or `"Lv."` with the celebratory styling.

### Step 4: Verification
- Execute `tsc --noEmit` to confirm zero TypeScript errors.
- Execute `npm run build` to verify Vite bundle output in `dist/`.
- Ensure zero external network calls, zero CDN imports, and 100% offline functionality.
