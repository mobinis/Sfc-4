# Implementation Plan: Warm Premium Design Overhaul & Multi-Time Chained Reminders

A comprehensive plan to remodel Self-Care Hero with a warm, premium color palette rooted in color theory, ergonomic touch targets, customizable multi-time & chained reminder schedules, and direct skill-to-reminder XP linking.

---

## 1. Architectural Overview & Color Theory

### A. Color Theory & Palette Architecture
The user selected: **Warm Amber & Deep Forest Sage with Warm Charcoal Background**.

```
+---------------------------------------------------------------------------------------+
| COLOR SCHEME HIERARCHY (60-30-10 Rule)                                                |
+---------------------------------------------------------------------------------------+
| 60% Base / Background:                                                                 |
|   • Deep Warm Charcoal / Obsidian Base: #121413 (rich, warm undertone, reduces strain)|
|   • Elevated Surface / Card Base: #1B211E (distinguishable depth, tonal contrast)     |
|   • Card Highlight / Variant: #242D29 (subtle elevation for secondary controls)       |
|                                                                                       |
| 30% Supporting / Structure:                                                           |
|   • Forest Sage Primary: #3D7D62 (grounding, calm, intentional growth)                |
|   • Sage Dark Accent: #2A5643 (borders, subtle active pill containers)               |
|   • Muted Sage Border: #384A41 (hairline separators, chip borders)                   |
|   • Text Primary: #F4F7F4 (warm off-white, high readability)                          |
|   • Text Secondary: #B2C4BC (soft sage mist, legible metadata)                        |
|                                                                                       |
| 10% Accent / Energy / Rewards:                                                        |
|   • Warm Amber Gold: #E5A93C (warm golden hour light, XP milestones, active icons)    |
|   • Honey Amber Light: #F9D98C (badges, streak flame text, active tabs)               |
|   • Deep Amber Bronze: #9E6B18 (pressed states, warning highlights)                   |
|   • Terracotta Red (Error/Urge): #D95D39 (warm urgency without alarming neon)         |
+---------------------------------------------------------------------------------------+
```

### B. Multi-Time & Chained Schedule Flow
Reminders support both **discrete clock times** and **relative chained follow-ups** (e.g. read 1 page at 10:00 PM -> chain 3 hours later at 1:00 AM; drink water at 1:00 AM, 3:00 AM, 5:00 AM).

```
                      +-----------------------------+
                      |   Alert / Habit Reminder    |
                      +--------------+--------------+
                                     |
               +---------------------+---------------------+
               |                                           |
               v                                           v
   [ Discrete Times ]                              [ Chained Follow-Up ]
   Times: ["01:00", "03:00"]                       Anchor: "22:00"
   Days: [Mon, Tue, Wed...]                        Offset: +180 min (3h)
               |                                   Target: "01:00" (+1 day)
               +---------------------+---------------------+
                                     |
                                     v
                      +-----------------------------+
                      |  ReminderScheduler (Alarm)  |
                      |  • Computes next epoch ms   |
                      |  • Exact midnight wrap math |
                      +--------------+--------------+
                                     |
                                     v
                      +-----------------------------+
                      | Notification + Action Chips |
                      | • "✓ Mark Done (+XP)"       |
                      | • "⏰ Snooze 10m"            |
                      | • Linked Skill Badge        |
                      +-----------------------------+
```

---

## 2. User Review Required

> [!NOTE]
> - **Chained Offset Behavior**: If a user sets an anchor at 10:00 PM and selects "+3 hours chained follow-up", it automatically schedules an alarm at 1:00 AM the next day. If the anchor is dismissed or completed early, the follow-up reminder still fires unless the habit's daily goal is already met.
> - **Direct Skill Completion**: Tapping "✓ Mark Done" on an alert linked to a skill/habit increments the skill count in `AppState.ev` and awards full XP + 2 Carrot Coins, matching in-app completion.

---

## 3. Proposed Changes

### Component 1: Theme & Color Palette Redesign (`Theme.kt`, `Color.kt`)
- **File**: `app/src/main/java/com/example/selfcarehero/ui/theme/Color.kt`
  - Introduce warm charcoal neutrals: `WarmCharcoal950 = #121413`, `WarmCharcoal900 = #171B19`, `WarmSurface800 = #1E2522`, `WarmSurface700 = #27302C`.
  - Introduce deep forest sage tones: `ForestSage600 = #3D7D62`, `ForestSage500 = #4D9677`, `ForestSage800 = #244637`.
  - Introduce warm amber accents: `WarmAmber500 = #E5A93C`, `WarmAmber400 = #F3BD5B`, `WarmAmberLight = #FBE2A4`, `WarmAmberDark = #9E6B18`.
  - Replace harsh bright greens and saturated borders with balanced tonal contrasts adhering to WCAG AA contrast (contrast ratio > 4.5:1 for text).
- **File**: `app/src/main/java/com/example/selfcarehero/ui/theme/Theme.kt`
  - Update `DarkColorScheme` mapping `primary = ForestSage500`, `secondary = WarmAmber500`, `background = WarmCharcoal950`, `surface = WarmSurface800`, `outline = WarmBorder`.
  - Set status bar and navigation bar to seamless dark warm charcoal.

### Component 2: Data Model Upgrades (`Models.kt`)
- **File**: `app/src/main/java/com/example/selfcarehero/model/Models.kt`
  - Upgrade `AlertItem`:
    ```kotlin
    data class AlertItem(
        val id: String,
        val n: String,
        val icon: String = "🔔",
        val type: String = "custom", // 'custom' | 'medicine' | 'prayer' | 'skill'
        val active: Boolean = true,
        val tm: String = "09:00", // Anchor / primary time
        val times: List<String> = emptyList(), // Multi-times e.g. ["01:00", "03:00"]
        val chainedOffsetMinutes: Int? = null, // e.g. 180 for 3 hours later
        val skillId: String? = null, // Linked skill/habit node ID
        val skillName: String? = null, // Cached display label
        val days: List<Int> = listOf(0, 1, 2, 3, 4, 5, 6), // 0=Sun..6=Sat
        val repeatRule: String = "daily", // 'daily' | 'weekdays' | 'weekends' | 'custom'
        val pillsCount: Int? = null,
        val pillsLowThreshold: Int? = null,
        val medNote: String? = null
    )
    ```
  - Ensure backward compatibility: if `times` is empty, fallback to `listOf(tm)`.

### Component 3: Alarm Scheduler Engine (`ReminderScheduler.kt`)
- **File**: `app/src/main/java/com/example/selfcarehero/utils/ReminderScheduler.kt`
  - Support multi-alarm registration: For each time $t$ in `alert.effectiveTimes()`, schedule an exact alarm with deterministic request code `(alert.id.hashCode() * 31 + timeIndex)`.
  - Compute chained follow-up times: If `alert.chainedOffsetMinutes != null`, calculate anchor + offset with 24-hour wrap-around (`(hour * 60 + minute + offset) % 1440`).
  - Filter day-of-week: Verify `alert.days.contains(calendarDay)` before arming rolling alarm.
  - Enrich notification intent with `EXTRA_LINKED_SKILL_ID` and `EXTRA_LINKED_SKILL_NAME`.

### Component 4: Reminder Receiver & One-Tap Skill Completion (`ReminderReceiver.kt`, `SelfCareRepository.kt`)
- **File**: `app/src/main/java/com/example/selfcarehero/utils/ReminderReceiver.kt`
  - When user clicks action "✓ Mark Done", broadcast or handle action in background repository.
- **File**: `app/src/main/java/com/example/selfcarehero/repository/SelfCareRepository.kt`
  - Update `handleAlertMarkDone(alertId: String)`:
    - Check if alert has `skillId`.
    - If `skillId != null`, invoke `recordNodeEvent(skillId, countDelta = 1)` to automatically advance habit goal, award skill XP, update daily streak, and add 2 coins.
    - If alert is `medicine`, decrement `pillsCount`.

### Component 5: Dialogs & UI Touch Target Normalization (`AllDialogs.kt`, `AlertsScreen.kt`, `TodayScreen.kt`, `SkillsScreen.kt`)
- **File**: `app/src/main/java/com/example/selfcarehero/ui/dialogs/AllDialogs.kt`
  - Upgrade `AddAlertDialog` / `EditAlertDialog`:
    - Multi-time chip editor: Users can add multiple exact times (e.g., `01:00`, `03:00`) with quick chip removal `✕`.
    - Chained follow-up switch: "+ Chained follow-up after X minutes/hours" with preset pills (+30m, +1h, +2h, +3h).
    - Repeat selector: `Daily`, `Weekdays (Mon-Fri)`, `Weekends (Sat-Sun)`, `Specific Days (S M T W T F S)`.
    - Skill link picker dropdown: Select from active habits/skills so reminder directly logs progress.
- **File**: `app/src/main/java/com/example/selfcarehero/ui/screens/AlertsScreen.kt`
  - Redesign `AlertItemCard`:
    - Display all active times in elegant badges: `01:00 AM`, `03:00 AM` + `🔗 Water Hydration (+1 glass)`.
    - Show repeat badge: `Daily`, `Weekdays`, or days chips.
    - Quick "Mark Complete Now" button (48dp touch target) to test and log from the alerts tab directly.
- **File**: `app/src/main/java/com/example/selfcarehero/ui/screens/TodayScreen.kt`
  - Fix oversized/undersized buttons:
    - Increase `−` (decrement) button touch area from 32dp to minimum **48dp** interactive area (`Modifier.size(48.dp)` with centered 36dp pill visual).
    - Constrain full-width action buttons on wide screens with `Modifier.widthIn(max = 480.dp)`.
    - Add subtle warm amber shimmer border to active daily three goals.
- **File**: `app/src/main/java/com/example/selfcarehero/ui/screens/SkillsScreen.kt`
  - Enhance touch targets on skill cards (`+ Log`, edit icon, collapse chevron) to standard 48dp minimum.
  - Update badges to warm amber and sage tones.

### Component 6: Documentation (`HANDOFF.md`)
- **File**: `/HANDOFF.md`
  - Add Section **2.A.16**: Warm Amber & Forest Sage Color Theory redesign, button sizing audit, and Multi-Time Chained Alert system.
  - Detail color tokens, typography scales, touch target benchmarks, and alarm scheduling formulas for future maintenance.

---

## 4. Verification Plan

### Automated Verification
- Run `compile_applet` to ensure:
  - Kotlin compilation passes without errors.
  - Model serialization and deserialization compatibility preserved.
  - Resource and color references resolve cleanly.

### Manual Verification Steps (Emulator / Browser)
1. **Color Palette Verification**:
   - Inspect app header, bottom navigation, card backgrounds, and buttons across `Today`, `Skills`, `Alerts`, and `Stats`.
   - Confirm dark charcoal background (#121413), forest sage primary accents, and warm golden amber highlights.
2. **Multi-Time Reminder Flow**:
   - Open `Alerts` tab -> Tap `+`.
   - Create alert "Water Hydration": add `01:00`, add `03:00`, link to "Drink Water" habit.
   - Verify card displays both times and linked habit badge.
   - Tap "✓ Done" on card -> Verify "Drink Water" habit increments by 1 and XP is awarded.
3. **Chained Follow-Up Flow**:
   - Create alert "Night Reading": set time `22:00`, toggle chained follow-up "+3 hours" (yielding 01:00 next day).
   - Verify schedule calculates 180-minute offset correctly.
4. **Day-of-Week Repeating**:
   - Select `Weekdays` or custom days (e.g. Mon, Wed, Fri); verify only active on selected days.
5. **Touch Target Sizing**:
   - Check Today screen habit counter `−` and `+` buttons: ensure smooth, generous 48dp touch zones.
