# Design Overhaul, Warm Cream Palette & AI Copilot Tools Architecture

A comprehensive design and UI overhaul transforming Self-Care Hero into a warm, soothing, and high-efficiency companion. Adopts the ColorHunt warm cream & pastel blush palette (`#FFF4DE`, `#FFDDDD`, `#FFCED8`, `#FFE8C4`) across a dual-theme system (Soft Warm Cream light mode + Warm Velvet Espresso dark mode), streamlines screen layouts with clean card hierarchies and collapsible widgets, and elevates the AI Copilot with tool execution (one-tap habit logging, searching past journals/habits), behavioral diagnostic critique (*"What am I doing wrong?"*), smart next-step suggestions, and Android Text-to-Speech voice playback.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following directions were confirmed during Phase 1 interactive clarification:

- **Confirmed Palette & Theme System**:
  - **Light Theme**: Soft Warm Cream (`#FFF4DE` base background, `#FFDDDD` and `#FFE8C4` soothing card surfaces, `#FFCED8` soft blush accent, deep espresso `#2C221E` typography).
  - **Dark Mode**: Warm Velvet Espresso (`#1E1917` warm dark roast background, `#28221F` card surface, `#342D29` border, `#FFCED8` and `#FFE8C4` pastel accents, `#FAF4F0` warm linen text).
  - Instant 1-tap theme switcher in `HeaderBar` (`☀️`/`🌙`) persisted across sessions in `AppState.isDarkMode`.
- **Confirmed Layout & Visual Arrangement**:
  - Clean card hierarchy with categorized pill sections and collapsible widgets to eliminate visual clutter and cognitive fatigue.
  - Organized Today screen into:
    1. Unified Hero Stat Bar (Level, coins, streak, sound & theme toggles).
    2. Expandable Circadian & Daily Three Widget.
    3. Quick Action Bar (🌊 Urge Surf, ⏱️ Focus, ⚡ Quick Log, 🤖 Copilot).
    4. Categorized Routine Pills (🌅 Morning, ☀️ Afternoon, 🌙 Evening, 🔄 Flexible).
    5. Collapsible secondary sections (90-Day Sprint & Dopamine Anti-Goals).
- **Confirmed AI Copilot Capabilities**:
  - **Tool Calling & Interactive Actions**: The AI Copilot detects actionable intents and returns interactive buttons directly in chat:
    - `"Complete [Habit]"`: Ticking habits directly inside conversation.
    - `"Search [Term]"`: Finding past journals, habits, wisdom cards, and urge logs.
  - **Behavioral Diagnostics & Pattern Critique**: Answers *"What am I doing wrong?"* by computing correlation between missed habits and mood dips, late evening screen triggers, and urge surfing partial lapses without shame.
  - **Next Step Recommender**: Recommends the highest-leverage immediate action based on time of day and incomplete Daily Three pillars.
  - **Voice Audio**: Integrates Android `TextToSpeech` (TTS) allowing users to listen to the AI's guidance aloud.
  - **Privacy Boundary**: Operates 100% on-device with clear local security reassurance.

---

## 1. Overview & Visual Aesthetic Direction

### The "Warm Cream & Peach Blossom" Palette (ColorHunt)

| Token Name | Hex Code | Role in Light Theme | Role in Dark Theme |
| :--- | :--- | :--- | :--- |
| **Warm Cream** | `#FFF4DE` | App Canvas Background & Base | Warm text highlight / badges |
| **Soft Blush** | `#FFDDDD` | Secondary card fills & active tabs | Subtle card tint / status tags |
| **Peach Blossom** | `#FFCED8` | Primary interactive buttons & active pills | Primary accent & active ring glow |
| **Apricot Nectar** | `#FFE8C4` | Milestone badges, coins, streak fires | Golden highlights & XP medals |
| **Rich Espresso** | `#2C221E` | Primary typography & bold headings | Base background (`#1E1917`) |
| **Warm Sand** | `#E8D8C8` | Card borders & subtle dividers | Deep border (`#342D29`) |

### Before vs After Information Architecture

```
BEFORE (Congested & High-Contrast)          AFTER (Warm, Soothing & High-Efficiency)
┌─────────────────────────────────┐        ┌─────────────────────────────────┐
│ Dark Obsidian HeaderBar         │        │ Warm Cream / Espresso Top Bar   │
├─────────────────────────────────┤        │ (Level, Coins, Streak, ☀️/🌙)   │
│ Full-Width Life Sprint Card     │        ├─────────────────────────────────┤
│ Full-Width Circadian Pill       │        │ Quick Action Row (🌊 ⏱️ 🤖 ⚡)  │
│ Daily Three Card                │        ├─────────────────────────────────┤
│ Guided Rituals 3-card block     │        │ ☀️ Daily Three & Circadian Hero │
│ Urge Surfing Card               │        ├─────────────────────────────────┤
│ Habit Momentum Card             │        │ Filter Pills (All | ☀️ | 🌤️ | 🌙)│
│ Long list of 15+ habit cards    │        ├─────────────────────────────────┤
│ Anti-Goals Section              │        │ Clean Grouped Habit Cards       │
│ Pip Character Card              │        ├─────────────────────────────────┤
│ Low-Energy / Essentials Banner  │        │ Collapsible Sections:           │
└─────────────────────────────────┘        │ ▸ 90-Day Life Sprint            │
                                           │ ▸ Anti-Goals Dopamine Shield    │
                                           └─────────────────────────────────┘
```

---

## 2. Technical Architecture & AI Tool Calling

### AI Copilot Tool Calling System

```
┌────────────────────────────────────────────────────────────┐
│                    LocalAiDialog.kt                        │
│                                                            │
│  User Input: "What should I do next?"                      │
│       │                                                    │
│       ▼                                                    │
│  LocalAiCopilot.kt                                         │
│       ├── Pattern Analyzer (Correlates mood & habits)       │
│       ├── Intent & Tool Dispatcher                         │
│       │     ├── Tool: FIND_JOURNAL                         │
│       │     ├── Tool: LOG_HABIT                            │
│       │     ├── Tool: DIAGNOSE_PATTERNS                    │
│       │     └── Tool: SUGGEST_NEXT_ACTION                  │
│       └── Text-To-Speech (TTS) Speaker Engine              │
│                                                            │
│  UI Response: Rich Markdown + Interactive Action Buttons   │
│  [✓ Tick Drink Water (+15 XP)]  [🔍 View Rough Days Logs]   │
└────────────────────────────────────────────────────────────┘
```

### Data Structures & Theme Integration

- **`Theme.kt` & `Color.kt`**:
  - `WarmCreamLightColorScheme`: Uses `#FFF4DE` background, `#FFFFFF` / `#FFDDDD` surfaces, `#FFCED8` buttons, `#2C221E` typography.
  - `WarmEspressoDarkColorScheme`: Uses `#1E1917` background, `#28221F` surfaces, `#FFCED8` accents, `#FAF4F0` linen typography.
  - Dynamic status bar and navigation bar insets updating with theme switch.
- **`AppState` & `SelfCareViewModel`**:
  - `isDarkMode: Boolean = false`: Persisted key in state so user's light/dark preference is remembered on launch.
  - `toggleTheme()`: 1-tap switch in `HeaderBar`.
- **`LocalAiCopilot` Enhancements**:
  - `evaluateUserPatterns(state: AppState): DiagnosticReport`: Computes slip frequencies, most common obstacle time of day, and top uplifting habits.
  - `executeCopilotTool(toolName: String, params: Map<String, String>)`: Dispatches habit completion, journal searches, and topic lookups directly into `SelfCareViewModel`.
  - Android `TextToSpeech` manager for listening to copilot feedback.

---

## 3. Implementation Plan & Execution Sequence

1. **Palette Tokens & Theme Engine (`Color.kt`, `Theme.kt`, `Models.kt`)**:
   - Define exact ColorHunt pastel tokens and warm espresso dark mode tokens.
   - Build `WarmCreamLightColorScheme` and `WarmEspressoDarkColorScheme`.
   - Add `isDarkMode: Boolean` to `AppState` with automatic persistence in `SelfCareRepository`.
2. **Header & Navigation Refinement (`HeaderBar.kt`, `MainActivity.kt`)**:
   - Add instant ☀️ / 🌙 theme toggle button to the top app bar.
   - Style bottom navigation tabs with soft rounded pill indicator using `#FFCED8`.
3. **Today Screen Information Architecture (`TodayScreen.kt`)**:
   - Refactor Today screen into clean visual zones:
     - Header quick action row (`🌊 Urge Surf`, `⏱️ Focus`, `🤖 AI Copilot`, `⚡ Quick Log`).
     - Compact Daily Three & Circadian widget.
     - Pill segment bar (`🌅 Morning`, `☀️ Afternoon`, `🌙 Evening`, `🔄 Flexible`).
     - Soft card list with 48dp touch targets and pastel badges.
     - Collapsible drawers for 90-Day Sprint and Anti-Goals.
4. **AI Copilot Supercharging (`LocalAiCopilot.kt`, `LocalAiDialog.kt`)**:
   - Implement tool calling parser (`LOG_HABIT`, `SEARCH_DATA`, `DIAGNOSTIC_CRITIQUE`, `SUGGEST_NEXT`).
   - Add interactive action buttons directly inside AI chat messages so users can act in 1 tap.
   - Add Android `TextToSpeech` audio playback with Play/Stop toggle.
5. **Screen Styling Harmonization (`SkillsScreen.kt`, `JournalScreen.kt`, `StatsScreen.kt`, `LearnScreen.kt`)**:
   - Update cards, headers, and tabs across screens to leverage semantic M3 theme tokens so both Light Cream and Espresso Dark modes look stunning.
6. **Compilation & Verification (`compile_applet`)**:
   - Verify 0 compilation errors and update `HANDOFF.md`.
