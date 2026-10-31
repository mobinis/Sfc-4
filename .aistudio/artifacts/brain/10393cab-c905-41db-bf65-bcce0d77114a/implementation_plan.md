# Evidence-Based Urge Surfing & Impulse Protocol

An evidence-based relapse prevention and distress tolerance protocol for Self-Care Hero, translating Marlatt & Gordon's Urge Surfing, ACT interoceptive defusion, and DBT distress tolerance into an offline, interactive 10-minute wave management and somatic tracking system.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural, UX, and session governance specifications were established for this implementation:

- **Wave Timer Protocol**: 10-minute active bell-curve wave timer with integrated somatic breathing guidance (Navy SEAL Box Breathing 4-4-4-4 or Dr. Weil 4-7-8 pacing option) to modulate sympathetic nervous system arousal.
- **Two-Step Measurement**: Pre-surf baseline intensity (1–10) assessed at wave onset; post-surf intensity (1–10) recorded upon timer completion or early resolution.
- **Somatic Interoception & DBT Taxonomy**: Quick-tap chips for localized bodily sensations (*Chest Tightness, Rapid Heart, Shallow Breath, Clenched Jaw, Restlessness, Stomach Tension, Flush/Heat*) paired with context cues (*Boredom, Fatigue, Social Friction, Solitude, Screen Trigger*).
- **Abstinence Violation Effect (AVE) Neutrality**: Non-punitive four-tier outcome taxonomy: `SURFED` (fully delayed & decayed), `RESISTED` (substituted with healthy alternative), `PARTIAL_LAPSE` (delayed with reduced harm), and `FULL_LAPSE` (mindfully logged as learning data without resetting global streaks or deducting coins).
- **Dynamic Gamification**: Dynamic Carrot-Coin reward computed as `Base (5 🪙) + Intensity Delta (1 🪙 per drop) + Completion Bonus (5 🪙)`, alongside +30 XP and urge resilience stats.
- **Mandatory Handoff Maintenance (`HANDOFF.md`)**: Strict post-execution contract requiring comprehensive updating of `HANDOFF.md` upon completion, detailing:
  1. What was built latest (components, schemas, ViewModel state).
  2. Current status of remaining features on the roadmap.
  3. Precise instructions on how the next session must pick up and continue.

---

## 1. Clinical & Behavioral Science Framework

### 1.1 Psychological Foundations
Standard urge logging treats cravings as binary, static occurrences. Clinical science demonstrates cravings follow a 15–30 minute biological rise, peak, and decay curve. Evidence-based behavioral models—specifically **Relapse Prevention (Marlatt & Gordon)**, **Dialectical Behavior Therapy (DBT Distress Tolerance)**, and **Acceptance and Commitment Therapy (ACT)**—frame impulses as dynamic, time-bound physiological and cognitive waves ("Urge Surfing").

| Science Principle | Theoretical Mechanism | Architectural Requirement |
| :--- | :--- | :--- |
| **Urge Surfing (Marlatt)** | Urges follow a bell curve: they rise, peak, and decay within 15–30 minutes if unreinforced. | Real-time dual-rating mode (Pre-surf vs. Post-surf intensity tracking) with built-in 10-minute timer. |
| **Defusion & Interoception (ACT/DBT)** | Naming somatic sensations (e.g., chest tightness, warm face) decouples the physical sensation from the catastrophic cognitive story ("I must act now"). | Schema supports categorized body-sensation tag arrays alongside open-text triggers. |
| **Abstinence Violation Effect (AVE)** | Viewing a lapse as absolute failure triggers complete relapse. Framing slips as data points maintains self-efficacy. | Explicit state classification (`RESISTED`, `SURFED`, `PARTIAL_LAPSE`, `FULL_LAPSE`) without punitive UI resets. |
| **Stimulus Control & Chain Analysis** | Triggers consist of Environment, Emotional State, Time, and Social Context. | Structured context taxonomy to enable predictive pattern mining over local data sets. |

---

## 2. Technical Data Architecture & Storage Schema

To preserve privacy in mental health applications, all urge logging operates **offline-first** via client-side storage (SharedPreferences JSON schema) with zero network dependency.

### 2.1 Entity Relationship Diagram (Logical Data Model)

```
┌───────────────────────────────┐
│           AppState            │
│  (Client Offline State Root)  │
└──────────────┬────────────────┘
               │ 1
               │
               │ 0..*
               ▼
┌────────────────────────────────────────────────────────────────────────┐
│                               UrgeItem                                 │
├────────────────────────────────────────────────────────────────────────┤
│ PK  id: String                    (UUID / Timestamp String)            │
│     d: String                     (YYYY-MM-DD Date Key)                │
│     tm: String                    (HH:mm 24-hr Timestamp)              │
│     trigger: String               (Primary Trigger Label)              │
│     want: String                  (Craving Object / Target)            │
│     choice: String                (Constructive Substitute / Action)   │
│     note: String                  (Cognitive Reframing Notes)          │
│     level: Int                    (Legacy Compat 1..5)                 │
│     preIntensity: Int             (Pre-Surf Rating: 1..10)             │
│     postIntensity: Int?           (Post-Surf Rating: 1..10)            │
│     outcomeStatus: String         (SURFED|RESISTED|PARTIAL|FULL_LAPSE) │
│     durationSeconds: Int          (Elapsed Protocol Time in Seconds)   │
│     coinsEarned: Int              (Calculated Dynamic Reward)          │
│     xpEarned: Int                 (Experience Reward)                  │
├──────────────────────────────┬─────────────────────────────────────────┤
│                              │                                         │
│ 0..*                         │ 0..*                                    │
▼                              ▼                                         ▼
┌───────────────────────────┐  ┌───────────────────────────┐  ┌───────────────────────────┐
│   somaticSensations       │  │       contextTags         │  │       EventRecord         │
│      (List<String>)       │  │      (List<String>)       │  │    (XP / Audit Ledger)    │
├───────────────────────────┤  ├───────────────────────────┤  ├───────────────────────────┤
│ - "Chest Tightness"       │  │ - "Solitude / Alone"      │  │ PK t: Long (Timestamp)    │
│ - "Rapid Heartbeat"       │  │ - "Late Evening"          │  │    d: String (Date)       │
│ - "Shallow Breath"        │  │ - "Social Friction"       │  │    n: "urge_surf_won"     │
│ - "Clenched Jaw"          │  │ - "Boredom / Aimless"     │  │    c: 1 (Completion Count)│
│ - "Stomach Tension"       │  │ - "Screen / Feed Trigger" │  │    x: xpEarned (XP Delta) │
│ - "Restlessness / Agitated│  │ - "Fatigue / Exhaustion"  │  └───────────────────────────┘
│ - "Flush / Facial Heat"   │  └───────────────────────────┘
└───────────────────────────┘
```

### 2.2 Entity Attribute Contracts & Validations

1. **`preIntensity`**: Integer $[1, 10]$. Represents perceived sympathetic craving intensity prior to wave surfing.
2. **`postIntensity`**: Nullable Integer $[1, 10]$. Captured immediately upon wave timer termination or voluntary completion.
3. **`outcomeStatus`**: Enforced enum string:
   - `SURFED`: Completed wave duration (or subsided early) with post-intensity $\le$ pre-intensity.
   - `RESISTED`: Successfully diverted craving via constructive substitution (`choice`).
   - `PARTIAL_LAPSE`: Reduced harm; delayed engagement with conscious mitigation.
   - `FULL_LAPSE`: Slipped into craving; logged mindfully for relapse prevention chain analysis with zero punitive coin/streak deduction.
4. **`coinsEarned` Formula**:
   $$\text{Coins} = \max\left(5, 5 + (\text{preIntensity} - (\text{postIntensity} \mathbin{?} \text{preIntensity}))\right) + (\text{if SURFED } 5 \text{ else } 0)$$

---

## 3. User Experience & Visual Design

### Key User Flows

```
[Trigger Felt / Impulse Spike]
         │
         ▼
[Step 1: Onset Assessment]
  - Pre-Intensity Slider (1-10) with reactive thermal indicator
  - Somatic Body Sensation Chips (Clenched Jaw, Chest Tightness, etc.)
  - Context & Trigger Selection (Boredom, Stress, Solitude, Digital Feed)
         │
         ▼
[Step 2: 10-Minute Wave Surfing Pacer]
  - Real-time Sine-Wave Visualizer with expanding/contracting breath aura
  - Somatic defusion guidance prompts: "Notice the sensation without judging."
  - Wave countdown with early check-in ("Urge Subsided" or "Emergency Quit")
         │
         ▼
[Step 3: Post-Surf Resolution & Defusion]
  - Post-Intensity Slider (1-10) showing Delta reduction
  - Outcome Classification: SURFED | RESISTED | PARTIAL_LAPSE | FULL_LAPSE
  - Cognitive Reframing Reflection / Notes
         │
         ▼
[Step 4: Reward & Resilience Ledger]
  - Dynamic Coin & XP Settlement (+5 to +15 Carrot-Coins, +30 XP)
  - Historical Analytics updated in StatsScreen (Wave Success Rate, Avg Drop)
```

### Visual Identity & Theme Alignment

Strictly conforms to the established **Warm Charcoal & Deep Forest Sage** design system:
- **Base Canvas**: `WarmCharcoal950` (#121413) with `WarmSurface800` (#1C2320) cards.
- **Wave Graphic & Accents**: `ForestSage400` (#5BA282) fluid wave gradient with `WarmAmberGold` (#E5A93C) peak highlights.
- **Urge Risk Indicator**: Soft `WarmTerracotta` (#D95D39) accents for high intensity, transitioning into serene `ForestSage500` as the wave subsides.
- **Typography**: M3 typography with high-contrast `TextPrimary` (#F5F7F5) and calming muted support tokens.

---

## 4. Key Product Decisions & Trade-Offs

### Decision 1: Dedicated UrgeSurfingDialog vs. In-Screen Player
- **Chosen Approach**: Full-focus modal dialog with immersive canvas wave animations and breath pacer, dismissible with confirmation.
- **Why**: An urge represents an acute executive function crisis; isolating the screen eliminates competing distractors.
- **Alternative Considered**: Embedding inline in `TodayScreen`. Rejected because background tabs and lists cause cognitive overload during acute craving states.

### Decision 2: Backward Compatibility with Existing `UrgeItem` Schema
- **Chosen Approach**: Upgrade `UrgeItem` with non-breaking optional fields (`preIntensity`, `postIntensity`, `somaticTags`, `contextTags`, `outcomeStatus`, `durationSeconds`) and automatic conversion from legacy entries.
- **Why**: Protects existing user data and 10-slot backup snapshots from JSON deserialization breakage.

### Decision 3: Gamification Balance for Lapses
- **Chosen Approach**: Award baseline participation XP and partial coins even on `PARTIAL_LAPSE` and `FULL_LAPSE` for logging honestly within 15 minutes of occurrence.
- **Why**: Clinical literature confirms that penalizing honest lapse logging leads to app abandonment and relapse concealment (AVE).

---

## 5. Technical Architecture & Component Mapping

### System Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Jetpack Compose UI Layer                        │
├───────────────────────────────┬────────────────────────────────────────┤
│ TodayScreen / HeaderBar Quick │ StatsScreen: Urge Resilience & Curves  │
│ [🌊 Surf Urge Button]         │ - Intensity Drop Averages              │
├───────────────────────────────┴────────────────────────────────────────┤
│                  UrgeSurfingDialog (3-Stage Modal)                     │
│  ┌────────────────────┐  ┌──────────────────┐  ┌────────────────────┐  │
│  │ 1. Onset Intercept │─▶│ 2. Wave Pacer    │─▶│ 3. Post Resolution │  │
│  │ (Sensations/Chips) │  │ (Timer + Breath) │  │ (Delta + Outcome)  │  │
│  └────────────────────┘  └──────────────────┘  └────────────────────┘  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ ViewModel StateFlow
┌───────────────────────────────────▼────────────────────────────────────┐
│                  SelfCareViewModel & Repository                        │
│ - startUrgeWaveSession(trigger, preLevel, sensations, context)         │
│ - completeUrgeWave(postLevel, outcome, notes)                          │
│ - calculateDynamicReward(pre, post, outcome): Pair<Coins, XP>          │
├────────────────────────────────────────────────────────────────────────┤
│                       AppState Persistent Layer                        │
│ - urges: List<UrgeItem> (Extended schema with dual ratings & tags)     │
│ - Offline SharedPreferences JSON storage ("sch_state_v16")             │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Session Continuity & `HANDOFF.md` Maintenance Protocol

> [!IMPORTANT]
> To guarantee unbroken continuity across development sessions and mobile browser handoffs, the following protocol will be strictly executed upon completion of the implementation:

1. **Document Exact Completed Changes**:
   - Record the addition of the Evidence-Based Urge Surfing & Impulse Protocol in the `DONE` section of `HANDOFF.md`.
   - Detail the modified files (`Models.kt`, `SelfCareRepository.kt`, `SelfCareViewModel.kt`, `TodayScreen.kt`, `StatsScreen.kt`, and the newly created `UrgeSurfingDialog.kt`).
2. **Document What Remains on the Roadmap**:
   - Detail the next pending roadmap items (e.g., Feynman Teach-Back Audio Reflections, Habit Loop Audio Anchors, Advanced Spaced Repetition Study Engine).
3. **Session Re-Entry Guidance**:
   - Provide explicit, copy-paste ready instructions for the next session engineer on how to load state, verify builds, and begin the next task.
4. **Preserve Repository & Workflow Integrity**:
   - Maintain the offline APK rules, GitHub Actions build script integrity, and theme consistency rules intact in `HANDOFF.md`.

---

## 7. Verification Plan & Deterministic Harness

### Dual-Process Scaffold Reasoning ($S, A, I$)
- **Scaffold ($S_1$)**: Edge cases covering early cancellation (user quits after 2 minutes), zero-intensity drops (craving remains flat), negative drops (craving increased under distress), and empty somatic selections.
- **Scaffold ($S_2$)**: Reference reward logic:
  $$\text{Coins} = \max(5, 5 + (\text{preIntensity} - \text{postIntensity})) + (\text{if SURFED } 5 \text{ else } 0)$$
- **Scaffold ($S_3$)**: State transitions across Step 1 $\rightarrow$ Step 2 $\rightarrow$ Step 3 preserve input fields during recomposition or backgrounding.

### Static Verification & Hallucination Suppression ($SSA$)
- Static use-def trace ensuring all `postIntensity` accesses guard against `null` with default fallbacks.
- Strictly reuse established theme tokens (`WarmSurface800`, `WarmAmberGold`, `WarmCharcoal950`, `ForestSage400`).

### Deterministic Test Criteria
1. **Compilation Verification**: Clean build with `compile_applet` with zero unresolved references.
2. **State Serialization**: Round-trip JSON encode/decode verifying legacy and upgraded `UrgeItem` payloads.
3. **Escrow & Coin Ledger Integrity**: Ensure awarded coins increment `AppState.coins` correctly and create audit events in `AppState.ev`.
