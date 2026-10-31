# Implementation Plan: Phase 3, Feature 11 — Weekly Quests & Today Screen Quest Banner

Implementation of the authorized next phase from `HANDOFF.md` (**Phase 3, Feature 11: Weekly Quests**) in the native Android application (Kotlin + Jetpack Compose), followed by creating the concise `AI_HANDOFF.md` handoff record.

---

## 1. User Review Required

> [!IMPORTANT]
> The target runtime is confirmed as **Native Android Kotlin + Jetpack Compose**. The Weekly Quests feature will be integrated directly on the **Today Screen** as an interactive collapsible quest hub with claimable Carrot-Coin and XP rewards.

- **Quest Generation**: Quests automatically rotate each Monday and track user actions across Vitality (body/health habits), Wisdom (teach-backs, reflections, reading), and Keystone Consistency (checking habits across active days).
- **Claim Rewards**: Tapping "Claim 🎉" deposits Carrot-Coins into user savings, awards bonus XP with level-up evaluation, and plays celebratory audio/haptic feedback.
- **Build Harness**: Resolve the missing `app/google-services.json` stub to ensure clean compilation via `compile_applet`.

---

## 2. Proposed Changes

### Android Data & State Layer (`app/src/main/java/com/example/selfcarehero/`)

#### [data/SelfCareRepository.kt]
- Add quest management logic:
  - `checkAndRotateWeeklyQuests()`: verifies if stored `weeklyQuests` match the current Monday date; if expired or empty, generates a fresh weekly triad linked to active habits and pillars.
  - `updateQuestProgress(eventType: String, countDelta: Int = 1)`: updates quest progress incrementally whenever habits, teach-backs, or reflections are completed.
  - `claimQuestReward(questId: String)`: marks quest as claimed, credits `rewardCoins` and `rewardXp`, logs event, and triggers state save.

#### [ui/viewmodel/SelfCareViewModel.kt]
- Expose `weeklyQuests` state and actions:
  - `claimQuest(questId: String)`: executes claim in repository, triggers celebratory feedback, and shows toast.
  - Expose quest count ready to claim.

---

### Android UI Layer

#### [ui/components/WeeklyQuestBanner.kt] (New Component)
- Create `WeeklyQuestBanner`:
  - Visual container styled with Sage Sanctuary palette (`CardSurface`, `SageContainer`, `StructuralBorder`, `WarmAmberGold`).
  - Displays weekly deadline countdown ("X days left this week").
  - Lists the 3 weekly quests with icons, title, description, and smooth linear progress bar.
  - Interactive "Claim (+X 🪙, +Y XP)" button with animated pulse when a quest is completed and unclaimed.
  - Collapsible header to save screen space when needed.

#### [ui/screens/TodayScreen.kt]
- Insert `WeeklyQuestBanner` below the Daily Three & Circadian Momentum Hub.
- Automatically track quest progress when checking habits, incrementing counters, or completing reflections.

---

### Build & Verification Fix

#### [app/google-services.json]
- Add the required `google-services.json` client configuration matching package `com.aistudio.selfcarehero.kzpvqw` to satisfy the Google Services Gradle plugin during `compile_applet`.

---

### Handoff Governance

#### [AI_HANDOFF.md]
- Create `AI_HANDOFF.md` adhering strictly to the user's requested specification format:
  - Project architecture, entry points, storage.
  - Verified current status and confirmed completed features.
  - Phase 3, Feature 11 acceptance checklist and test results.
  - Exact next authorized phase (Phase 3, Feature 12: PIN Privacy Screen).

---

## 3. Verification Plan

### Automated Build Verification
1. Run `compile_applet` to ensure full Android Gradle compilation (`assembleDebug`) succeeds with 0 errors.
2. Run unit tests (`./gradlew testDebugUnitTest`) to verify date calculation and state logic.

### Acceptance Criteria Verification
- [x] Quests initialize with current week Monday date.
- [x] Completing habits and learning activities increments quest progress fraction.
- [x] Once target is reached, quest state transitions to `isCompleted = true`.
- [x] "Claim" button is enabled, credits coins and XP, and marks `isClaimed = true`.
- [x] Quests cannot be double-claimed.
- [x] `AI_HANDOFF.md` created with verified state and test outcomes.
