# Life Transformation & Accountability Suite: Phased 'One Feature at a Time' Roadmap

A high-leverage life-transformation operating system built directly into **Self-Care Hero**, structured for strict **one-feature-at-a-time** implementation to guarantee stability, thorough testing, and zero cognitive overload.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The rollout is strictly partitioned into single-feature milestones:
> - **Execution Principle**: **One Feature at a Time**. Each milestone is built, wired to state, and verified via `compile_applet` before advancing to the next.
> - **Phase 1 (COMPLETED & VERIFIED)**: **Dopamine Shield & Anti-Goals Blacklist** (The "Not-To-Do" avoid list, friction delay timer, and on-device cognitive reframing via SmolLM Copilot).
> - **Phase 2 (COMPLETED & VERIFIED)**: **90-Day Life Sprint & Identity Compass** (Visual quarterly progress bar and daily identity affirmations).
> - **Phase 3 (COMPLETED & VERIFIED)**: **Circadian Sleep Architecture Clock** (Real-time device clock chronobiology, caffeine cut-off & screen curfew countdowns, and protocol customization).
> - **Phase 4 (NEXT UP)**: **Carrot-Coin Habit Staking Contracts** (Wager escrow, 1.5x streak multiplier payout, penalty vault forfeiture).
> - **Session Continuation**: Copy-pasteable prompts provided below for step-by-step cross-session execution.

---

## 1. Overview & Core Concept

### Feature 1 (Phase 1): Dopamine Shield & Anti-Goals Blacklist
- **The Inversion Principle**: Life transformation starts with elimination. Identifies compulsive negative behaviors (e.g. late-night doomscrolling, compulsive social media, junk snacking) to strictly avoid.
- **Friction Delay**: When feeling an urge to slip, a 5-minute friction delay triggers with deep breathing and an on-device SmolLM cognitive reframe.
- **Accountability**: Clean streak days award Carrot-Coins; logging a slip triggers a compassionate root-cause reflection rather than a guilt spiral.

### Feature 2 (Phase 2): 90-Day Life Sprint & Identity Compass
- **Quarterly Milestones**: Breaks intimidating annual resolutions into a focused 12-week sprint with a visible progress bar.
- **Identity Priming**: Anchors habits in identity statements ("I am someone who finishes what they start").

### Feature 3 (Phase 3): Circadian Sleep Architecture Clock
- **Chronobiology**: Dynamically calculates optimal morning sunlight windows, peak focus hours, caffeine cut-off countdown (10h before bed), and digital screen curfews.

### Feature 4 (Phase 4): Habit Staking Contracts
- **Behavioral Loss Aversion**: Wager Carrot-Coins on daily non-negotiables. Succeeding awards multiplier bonuses; failing deposits coins into the penalty vault.

---

## 2. User Experience & Visual Design (Phase 1 Focus)

### Anti-Goals Card & Friction Flow

```
┌────────────────────────────────────────────────────────────────────────┐
│ 🛡️ ANTI-GOALS (NOT-TO-DO LIST)                   [+ Add Boundary]     │
├────────────────────────────────────────────────────────────────────────┤
│ 🚫 No Phone in Bed Before Sleep            🔥 6 Clean Days  [✓ Clean]  │
│    Trigger: Boredom at 11 PM  •  Replace: Physical Paperback Book      │
│                                                                        │
│ 🚫 Zero Sugary Sodas                       🔥 12 Clean Days [✓ Clean]  │
│    Trigger: 3 PM Afternoon Slump  •  Replace: Sparkling Lemon Water    │
│                                                                        │
│ 🚫 Mindless Midday YouTube                 ⚠️ Slipped Today [Reframe]  │
│    Trigger: Work Friction  •  Replace: 2-Min Box Breathing             │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Strict Single-Feature Isolation**:
  - *Chosen Approach*: Only implement Phase 1 (Anti-Goals) first. Keep existing features (Routine Flow Player, Breath Pacer, Soundscape Engine, 10-Slot Backups) completely intact.
  - *Why*: Prevents regression, ensures fast compilation, and allows user to interact with the new feature immediately.
- **Decision 2: In-Memory + SharedPreferences Persistence**:
  - *Chosen Approach*: Store `antiGoals: List<AntiGoalItem>` in `AppState` alongside existing state, serialized via `kotlinx.serialization`.
  - *Why*: 100% offline, persistent, zero external server dependencies.

---

## 4. Technical Architecture & Data Strategy (Phase 1)

```
┌───────────────────────────────────────────────────────────────────────────┐
│                           JETPACK COMPOSE UI                             │
│       TodayScreen.kt  ───>  AntiGoalsCard.kt  ───>  AntiGoalEditDialog    │
└─────────────────────────────────────┬─────────────────────────────────────┘
                                      │
                                      ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                           SelfCareViewModel                              │
│   • markAntiGoalClean()   • logAntiGoalSlip()   • addOrUpdateAntiGoal()   │
└───────────────────────┬─────────────────────────────┬─────────────────────┘
                        │                             │
                        ▼                             ▼
┌──────────────────────────────────────┐  ┌─────────────────────────────────┐
│        SelfCareRepository            │  │        OnnxSmolLmEngine         │
│  • AppState.antiGoals persistence    │  │  • Reframe slip on-device       │
└──────────────────────────────────────┘  └─────────────────────────────────┘
```

### Phase 1 Data Model (`model/Models.kt`)
```kotlin
@Serializable
data class AntiGoalItem(
    val id: String,
    val name: String,
    val category: String = "digital", // 'digital' | 'health' | 'mindset'
    val triggerCue: String = "",
    val replacementAction: String = "",
    val cleanStreakDays: Int = 0,
    val lastCleanDate: String = "",
    val slipsCountToday: Int = 0
)
```

---

## 5. Phased Continuation Roadmap & Next Session Prompts

### Step 1: Execute Phase 1 Now (Anti-Goals & Dopamine Shield)
When you click **Proceed**, I will build Phase 1 exclusively:
1. Add `AntiGoalItem` to `Models.kt` & `SeedData.kt`.
2. Add repository & ViewModel methods (`markAntiGoalClean`, `logAntiGoalSlip`, `saveAntiGoal`).
3. Add `AntiGoalsCard.kt` and integrate into `TodayScreen.kt`.
4. Connect the "Reframe" button to the on-device SmolLM Copilot.
5. Verify via `compile_applet`.

---

### Step 2: Prompt for Feature 2 (Next Session: 90-Day Life Sprint)
*Copy this when ready for Feature 2 in a future session:*

```markdown
You are a senior Android engineer working on Self-Care Hero.
We are following the phased "One Feature at a Time" roadmap. Phase 1 (Anti-Goals) is already completed.

TASK FOR THIS SESSION: Implement Feature 2 (90-Day Life Sprint & Identity Compass):
1. Add `LifeSprintGoal` data model to `Models.kt` (title, identityStatement, startDate, 90 days total, key milestones).
2. Add repository & ViewModel handlers to manage the active quarterly sprint.
3. Build `LifeSprintCard.kt` with a visual 90-day progress ring, milestone tracker, and daily identity affirmation.
4. Integrate the card onto `TodayScreen.kt`.
5. Verify with `compile_applet`. Keep all existing features intact.
```

---

### Step 3: Prompt for Feature 3 (Future Session: Circadian Clock)
*Copy this when ready for Feature 3:*

```markdown
You are a senior Android engineer working on Self-Care Hero.
TASK FOR THIS SESSION: Implement Feature 3 (Circadian Sleep Architecture Clock):
1. Add `CircadianConfig` to `Models.kt` (wake time, sleep time, caffeine cutoff, screen curfew).
2. Calculate live dynamic countdowns anchored to user's wake time.
3. Build `CircadianClockPill.kt` on `TodayScreen.kt` displaying current circadian phase and countdowns.
4. Verify with `compile_applet`.
```

---

### Step 4: Prompt for Feature 4 (Future Session: Habit Contracts)
*Copy this when ready for Feature 4:*

```markdown
You are a senior Android engineer working on Self-Care Hero.
TASK FOR THIS SESSION: Implement Feature 4 (Carrot-Coin Habit Staking Contracts):
1. Add `HabitContract` to `Models.kt` (target habit, staked coins, status, forfeiture rules).
2. Implement coin escrow and loss-aversion settlement in repository.
3. Build `HabitContractBanner.kt` and staking dialog.
4. Verify with `compile_applet`.
```
