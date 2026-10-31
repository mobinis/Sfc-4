# Comprehensive Enhancement Plan: Weekly Insights, Skill Classification & Advanced Backup

An integrated expansion to Self-Care Hero that introduces a **Weekly Insights** analytics suite in the Stats view, enriches the **Skill Tree** with importance ratings, item nature types (*Skill*, *Technique*, *Concept*, *Course*), and customizable *Rememorization / Spaced Recall* schedules, and upgrades the **Backup & Restore System** into a multi-slot, file-based manager with pre-wipe rollback protection.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following enhancements are incorporated based on your latest requirements:
> - **Weekly Insights Placement**: Dedicated tab toggle between **Weekly Insights** and **Annual Heatmap** in the Stats view.
> - **Clever Hybrid Top Skills**: Scores skills via `(XP × 1.5) + (Completions × 10) + (Active Days × 15)` with dynamic momentum tags (*7-Day Streak*, *High Growth*, *Master Reps*, *Consistent Anchor*).
> - **3-Angle Moods & Gratitude**: Dominant mood badge + trend note, frequency distribution bar, interactive 7-day strip, plus a dedicated Gratitude Reflection highlight card.
> - **Skill Nature & Importance**:
>   - *Importance Level*: `Essential / Critical`, `High`, `Medium`, `Low` (visual indicator + priority sorting).
>   - *Item Nature*: `Skill` (applied ability), `Technique` (actionable routine/trick), `Concept` (mental model/theory), `Course` (video course/book series), or `Habit` (daily routine).
> - **Customizable Rememorization & Spaced Recall**:
>   - Flag for items you might forget and need to review.
>   - Customizable review interval (e.g., 1 day, 3 days, 7 days, 14 days, 30 days, or custom days).
>   - Scheduled refresher chime and direct sync into the Study spaced repetition review queue.
> - **Advanced Backup & Anti-Wipe Safety**:
>   - **File Management**: 1-click JSON file download (`self-care-hero-backup-YYYY-MM-DD.json`) and drag-and-drop file upload with schema verification and content preview (Level, XP, Habits count, Backup date).
>   - **Rolling Local Snapshots**: 5 local snapshot slots with 1-tap save and 1-tap rollback.
>   - **Anti-Accidental Wipe Guard**: Destructive reset requires typing `"RESET HERO"`, accompanied by a mandatory pre-wipe safety snapshot automatically saved before any deletion.

---

## 1. Overview & Core Concept

1. **Weekly Insights (`WeeklyInsightsView.tsx`)**:
   - Gives users a 7-day retrospective on habits checked, total XP earned, Daily Three consistency, deep work minutes, and gratitude logged.
   - Highlights emotional stability through a 7-day mood frequency breakdown, dominant emotional tone, and interactive daily mood log.

2. **Skill Tree Classification & Memory Refresher (`SkillEditModal.tsx` & `SkillsView.tsx`)**:
   - Empowers users to categorize knowledge into **Skills**, **Techniques**, **Concepts**, or **Courses**.
   - Enables priority tagging (Essential, High, Medium, Low) so critical habits stand out.
   - Adds a **Spaced Rememorization Scheduler** for concepts or techniques that fade quickly from memory.

3. **Advanced Backup & Disaster Recovery (`SettingsModal.tsx`)**:
   - Replaces bare copy/paste text with a full file-based backup manager.
   - Features downloadable `.json` files, pre-restore previews, 5 local snapshot slots, and ironclad anti-accidental-deletion protection.

---

## 2. User Experience & Visual Design

### Flow A: Weekly Insights in Stats View
1. Open **Stats** tab.
2. Select **"Weekly Insights"** on the segmented toggle:
   - **4-KPI Strip**: XP Earned (`+240 XP`), Completions (`18`), Daily Three (`5/7 days`), Focus (`90 mins`).
   - **Clever Hybrid Top Skills**: Ranked list with rank badges, category tags, momentum badges, and XP/completion breakdown.
   - **7-Day Mood Analytics**: Dominant mood badge, frequency proportion bar, and 7-day interactive day-by-day mood strip.
   - **Gratitude Highlights**: Curated cards showing weekly gratitude notes and kind deeds.

### Flow B: Skill Importance, Nature & Rememorization
1. Open any skill editor (or add new sub-skill / concept):
   - **Item Nature Selector**: Pill buttons for `🌳 Skill`, `⚡ Technique`, `💡 Concept`, `🎓 Course`, `🔁 Habit`.
   - **Importance Selector**: `🔥 Critical`, `⭐ High`, `🔷 Medium`, `⚪ Low`.
   - **Rememorization Toggle**: Toggle on "Needs Spaced Rememorization".
   - **Custom Review Interval**: Quick selector (`Tomorrow (1d)`, `3 Days`, `1 Week`, `2 Weeks`, `1 Month`, or custom number of days).
2. On the **Skills Tree View**:
   - Visual nature badge (e.g. `[Concept]`, `[Technique]`) and importance star so the user instantly distinguishes actionable habits from knowledge to review.
   - Quick filter by nature (`All`, `Skills`, `Techniques`, `Concepts`, `Courses`) or priority.
3. In **Study View**:
   - Skills flagged for rememorization appear in the Spaced Review queue with a "Review Memory" card when their due date arrives.

### Flow C: Advanced Backup, Local Snapshots & Anti-Wipe Protection
1. Open **Settings** (⚙️):
   - **File Download**: Tap "Download Backup File (.json)" to save a timestamped file locally.
   - **File Restore**: Drag & drop or select any backup `.json` file. The app validates the file and displays a **Backup Preview Sheet**:
     * App Version, Level, Total XP, Number of Skills, Journal Entries.
     * Choice: **Replace All Data** or **Merge New Skills**.
   - **Local Rolling Snapshots (5 Slots)**:
     * Shows auto-saved snapshot history with timestamps and XP.
     * "Create Manual Snapshot" button.
     * 1-tap "Restore This Snapshot".
   - **Protected Data Wipe**:
     * Red danger zone button: "Erase All Data & Reset".
     * Triggers a high-friction confirmation modal requiring the user to type `"RESET HERO"`.
     * Even if confirmed, the app **automatically captures a pre-wipe emergency snapshot** into localStorage before wiping, with an immediate "Emergency Undo" banner.

---

## 3. Technical Architecture & Component Hierarchy

```
┌────────────────────────────────────────────────────────┐
│                      AppState                          │
│  • nodes: [..., nature, importance, rememorize, ...]   │
│  • snapshots: [AutoSnapshotSlot × 5]                   │
│  • ev, jr, urges, st, ach, dailyThreeStreak            │
└──────────────────────────────────┬─────────────────────┘
                                   │
         ┌─────────────────────────┼────────────────────────┐
         ▼                         ▼                        ▼
┌──────────────────┐      ┌──────────────────┐    ┌────────────────────┐
│    StatsView     │      │   SkillsView     │    │   SettingsModal    │
│  ┌────────────┐  │      │  ┌────────────┐  │    │  ┌──────────────┐  │
│  │Tab Toggle  │  │      │  │Type Badges │  │    │  │Download/Upld │  │
│  └──────┬─────┘  │      │  │Priority    │  │    │  ├──────────────┤  │
│    ┌────┴────┐   │      │  └─────┬──────┘  │    │  │5 Snapshots   │  │
│    ▼         ▼   │      │        ▼         │    │  ├──────────────┤  │
│ Weekly    Annual │      │ SkillEditModal   │    │  │"RESET HERO"  │  │
│ Insights  Heatmap│      │ (Nature, Recall) │    │  │Auto-Backup   │  │
└──────────────────┘      └──────────────────┘    └────────────────────┘
```

### Key Data Additions (`src/types.ts`):
```typescript
export type SkillNature = 'skill' | 'technique' | 'concept' | 'course' | 'habit';
export type SkillImportance = 'critical' | 'high' | 'medium' | 'low';

export interface RememorizeConfig {
  enabled: boolean;
  intervalDays: number;
  lastReviewed?: number; // timestamp
  nextDue: number; // timestamp
  reviewCount: number;
}

export interface BackupSnapshot {
  id: string;
  timestamp: number;
  label: string; // e.g., "Pre-Reset Safety Snapshot", "Weekly Auto-Save"
  stateSnapshot: string; // serialized JSON
  level: number;
  xp: number;
  skillsCount: number;
}
```

### Module Upgrades:
1. `src/types.ts`: Define `SkillNature`, `SkillImportance`, `RememorizeConfig`, and `BackupSnapshot`.
2. `src/utils/xp.ts`: Add `getWeeklyInsights(state, today)` returning KPIs, hybrid top skills, 3-angle mood metrics, and gratitude notes.
3. `src/components/WeeklyInsightsView.tsx`: Build weekly summary KPIs, hybrid top skills cards, mood frequency/distribution/strip, and gratitude cards.
4. `src/components/views/StatsView.tsx`: Integrate segmented toggle between Weekly Insights and Annual Heatmap.
5. `src/components/SkillEditModal.tsx`: Add Nature picker, Importance selector, and Rememorization interval scheduler.
6. `src/components/views/SkillsView.tsx`: Render nature pills (`💡 Concept`, `⚡ Technique`), priority stars, and quick filter controls.
7. `src/components/SettingsModal.tsx`:
   - Add `.json` file download (`Blob` + download link).
   - Add file upload reader with schema validation & preview card.
   - Add 5-slot snapshot manager (create, rollback, delete).
   - Add strict `"RESET HERO"` anti-wipe modal with automatic emergency snapshot creation.
8. `src/utils/storage.ts`: Update `migrate()` to safely support schema v12 with snapshot slots and skill nature defaults.
9. `HANDOFF.md`: Fully document all changes for continuation.

---

## 4. Verification Plan
- Verify clean compilation via `compile_applet`.
- Verify TypeScript types and strict zero-external-dependency adherence.
- Test export JSON file download and restore verification.
- Test auto-safety snapshot creation before reset.
- Test Weekly Insights calculations and mood aggregations.
