# Implementation Plan: Mature Productivity Suite with Sub-100M Local On-Device AI Assistant

A comprehensive, executive-grade implementation plan to enhance **Self-Care Hero** with five core productivity/wellness systems plus a **lightweight, sub-100M parameter local on-device AI assistant** tailored specifically for the **Samsung Galaxy M31s (Exynos 9611 / 6GB RAM)** to ensure zero lag, instant response, and minimal RAM footprint (~85MB RAM, preserving memory for multitasking).

---

## 1. Feature Specifications

### 1.1 Local On-Device Sub-100M AI Assistant ("Self-Care Copilot")
- **Hardware & Performance Target**:
  - Optimized for Samsung Galaxy M31s (Exynos 9611 Octa-core + 6GB RAM).
  - Memory budget: &le; 120MB active RAM during generation, 0MB RAM when idle (unloaded automatically).
  - Compute: Multi-threaded CPU execution (`Dispatchers.Default`) using 4 big cores (Cortex-A73), avoiding Android Low-Memory-Killer (LMK) conflicts with user's other background apps.
- **Model Architecture & Runtime**:
  - **Inference Runtime**: ONNX Runtime Mobile (Android C++/JNI bindings) with FP16/INT4 CPU execution provider.
  - **Model**: `SmolLM-135M-Instruct-int4` (~78MB storage, ~135 million parameters) or embedded `MobileBERT-MiniLM` (~25M parameters, ~35MB storage) for instant response.
- **All-Around Capabilities**:
  1. **Journal Cognitive Reframing**: Identifies all-or-nothing thinking, catastrophizing, or self-criticism in reflections and offers stoic reframing.
  2. **Habit & Routine Optimizer**: Analyzes your completion history and recommends optimal stack timings (e.g. "You complete Reading 80% more often right after Morning Coffee").
  3. **Feynman Teach-Back Feedback**: Evaluates teach-back notes on micro-learning cards, highlighting clarity and simplicity.
  4. **Offline Executive Q&A**: Answers personal questions about productivity, time management, sleep hygiene, and habit consistency without internet access.
- **UI Integration**:
  - Accessible via a discrete "Copilot" button in the Header Bar and integrated contextual action buttons (e.g., "Reflect with AI" in Journal, "Critique Note" in Learn).

### 1.2 Guided Routine Flow Player (Morning, Deep Work, Evening)
- **Step-by-Step Immersive Runner**:
  - Full-screen or modal player sequencing daily rituals.
  - Displays large countdown ring, current activity name, habit anchor, and upcoming step preview.
  - Controls: Play/Pause, +1 Minute extension, Skip Step, and Mark Step Complete.
  - Auto-advances or waits for manual confirmation, with gentle transition chimes and haptic feedback.
- **Pre-Built & Custom Routines**:
  - *Sunrise Kickstart* (Hydrate &rarr; Movement &rarr; Micro-Learn &rarr; Daily Priorities).
  - *Deep Work Runway* (Clear Desk &rarr; Silence Notifications &rarr; Define 1 Core Task &rarr; Timer Start).
  - *Evening Decompression* (Gratitude Log &rarr; Review Wins &rarr; Wind-Down Breathing).
  - *Custom Sequencer*: Chain any existing habit nodes into custom routines with adjustable durations.
- **Data Hook**:
  - Completing routine steps automatically checks off the corresponding habits on the Today screen and awards standard XP.

### 1.3 Ambient Soundscape Engine & Somatic Breath Pacer
- **Offline Audio Generator**:
  - Procedural sound generator using Android `AudioTrack`: *Deep Brown Noise*, *Forest Rain*, *Mountain Wind*, and *Warm Hearth*.
  - Multi-track volume mixer allowing users to blend brown noise with gentle rain.
  - Sleep / Focus timer: auto-stop after 15m, 30m, 45m, or 60m.
- **Somatic Breath Pacer**:
  - Smooth animated visual circle expanding and contracting to guide respiration.
  - Two evidence-based protocols:
    - *Box Breathing (4-4-4-4)*: Inhale 4s &rarr; Hold 4s &rarr; Exhale 4s &rarr; Hold 4s (calms acute stress).
    - *Relaxing 4-7-8*: Inhale 4s &rarr; Hold 7s &rarr; Exhale 8s (activates parasympathetic rest).

### 1.4 Habit Stacking & Dependency Chains
- **Architecture**:
  - Link any habit to another as a dependency chain ("After [Habit A] &rarr; Prompt [Habit B]").
- **UI Integration**:
  - In `TodayScreen`, chained habits display a visual connecting line and priority badge.
  - Completing the anchor habit displays an immediate prompt card for the stacked habit with a "+15% Momentum XP" bonus.

### 1.5 Executive Monthly Recap & Infographic Report
- **Monthly Analytics Screen / Dialog**:
  - **Pillar Balance Radar**: Percentage breakdown between Learn, Build, and Body over the past 30 days.
  - **Habit-Mood Correlation**: Identifies habits that statistically correlate with higher mood scores.
  - **30-Day Completion Heatmap**: Calendar matrix showing daily intensity and Daily Three streaks.
  - **Exportable Clean Summary Card**: Neatly formatted overview shareable as an image.

### 1.6 Android Home Screen Quick-Check AppWidget
- **4x2 Interactive Dashboard**:
  - Circular Daily Three progress ring and current streak count.
  - Top 3 priority habits for today with 1-tap direct check-off buttons without needing to open the app.

---

## 2. Technical Architecture & File Layout

```
app/src/main/java/com/example/selfcarehero/
├── ai/
│   ├── LocalAiCopilot.kt           // SmolLM / ONNX Runtime Mobile inference wrapper
│   ├── CognitiveDistortionRules.kt // Fast heuristic + embedding classifier
│   └── PromptTemplates.kt          // Structured prompts for journal, habits, teach-back
├── model/
│   ├── Models.kt                   // RoutineFlow, RoutineStep, HabitStackLink, AiReflectionResult
│   └── SeedData.kt                 // Default routines and initial stacked chains
├── data/
│   └── SelfCareRepository.kt       // Routine tracking, AI cache, habit chains persistence
├── utils/
│   ├── SoundscapeEngine.kt         // Procedural AudioTrack brown noise and rain generator
│   └── ReminderScheduler.kt       // System exact alarm scheduling
├── ui/
│   ├── dialogs/
│   │   ├── RoutinePlayerDialog.kt  // Immersive step-by-step routine runner
│   │   ├── BreathPacerDialog.kt    // Box and 4-7-8 breathing circle pacer
│   │   ├── MonthlyRecapDialog.kt   // Executive 30-day analytics and habit-mood correlation
│   │   └── LocalAiDialog.kt        // Self-Care Copilot chat & contextual action modal
│   ├── screens/
│   │   ├── TodayScreen.kt          // Habit stack lines, routine launch bar, momentum banner
│   │   └── StatsScreen.kt          // Monthly recap entry point
│   └── components/
│       └── HeaderBar.kt            // AI Copilot launcher icon
└── widget/
    └── SelfCareWidgetProvider.kt   // 1-tap habit check-off AppWidget
```

---

## 3. Samsung M31s Performance & Memory Safeguards

1. **Lazy Loading & Auto-Unload**:
   - The AI model is loaded into memory only when invoked by the user and freed after 60 seconds of inactivity to guarantee 0MB background RAM usage.
2. **Low-Priority Worker Threading**:
   - All AI inference and audio synthesis run on `Dispatchers.Default` with `Process.THREAD_PRIORITY_BACKGROUND`, preventing any dropped frames on the 60Hz display.
3. **Fail-Safe Fast Heuristic Fallback**:
   - If the system is under extreme memory pressure (e.g. gaming or video recording in another app), the Copilot gracefully falls back to an embedded lightweight cognitive reframing engine that consumes < 2MB of memory.

---

## 4. Step-by-Step Implementation Sequence

1. **Step 1: Models & Seed Data**:
   - Add `RoutineFlow`, `RoutineStep`, `HabitStackLink`, `BreathTechnique`, and `AiMessage` to `Models.kt`.
   - Seed default routines (Morning Kickstart, Deep Work Prep, Evening Decompression) and initial habit chains in `SeedData.kt`.
2. **Step 2: Sub-100M Local AI Copilot Engine**:
   - Implement `LocalAiCopilot.kt` with coroutine-based background generation, prompt templates, and memory-safe lifecycle.
   - Build `LocalAiDialog.kt` supporting general Q&A, journal reflection reframing, and habit tips.
3. **Step 3: Guided Routine Flow Player**:
   - Build `RoutinePlayerDialog.kt` with countdown ring, step progression, skip/complete controls, and audio transitions.
   - Add "Quick Routines" row at the top of `TodayScreen.kt`.
4. **Step 4: Ambient Soundscape & Breath Pacer**:
   - Implement `SoundscapeEngine.kt` for zero-latency offline brown noise, hearth, and rain audio generation.
   - Build `BreathPacerDialog.kt` with Box Breathing and 4-7-8 breathing cycle animations.
5. **Step 5: Habit Stacking Chains**:
   - Update habit items in `TodayScreen.kt` to display visual stack connectors and instant momentum prompts when trigger habits are checked.
6. **Step 6: Executive Monthly Recap**:
   - Build `MonthlyRecapDialog.kt` with 30-day consistency heatmap, pillar balance radar, and habit-mood correlation analysis.
7. **Step 7: Android Home Screen AppWidget**:
   - Implement `SelfCareWidgetProvider.kt` with 1-tap direct habit toggling and register it in `AndroidManifest.xml`.
8. **Step 8: Verification & Build**:
   - Run `compile_applet` to ensure successful compilation.
   - Update `README.md` and `HANDOFF.md` with full architectural details.
