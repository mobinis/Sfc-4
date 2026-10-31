# Custom Root Pillars, Root Skills & All-Pillars Overview

Implement a persistent custom pillar and root skill management system with an All-Pillars overview in BloomQuest, incorporating all confirmed user requirements and design system standards.

### User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural and UX decisions were confirmed by the user in Phase 1:
> - **Pillar Deletion Safeguard**: When a custom pillar with active skills is deleted, child skills are not permanently lost; they are automatically safely moved to an **Unassigned Archive** section (`📦 Unassigned Archive`) with an explicit confirmation step.
> - **Skills Section View Modes**: A prominent 3-way toggle in the Growth/Skills view switching between **All Pillars** (comprehensive overview), **Outline** (deep hierarchical tree), and **Mind Map** (radial branching SVG hub).
> - **Today Dashboard Integration**: Today screen's circular progress rings are upgraded to dynamically calculate and render progress across both default and custom active pillars.

---

### 1. Overview & Core Concept

- **What It Does**: Empowers users to customize BloomQuest beyond the default pillars (`Learn`, `Build`, `Body`, `Mind`, `Care`, `Faith`) by creating unlimited custom top-level pillars (e.g. `Career`, `Creative Arts`, `Family`, `Finance`, `Spirituality`) with custom emojis, colors, descriptions, and ordering. Users can add root skills under any pillar, nest multi-tier sub-skills/techniques/habits, move skills between pillars, and view their entire life architecture in an All-Pillars overview, Outline tree, or radial Mind Map.
- **Key Value**: Lifelong personal growth requires flexible taxonomies. Users gain total ownership over their life domains without losing BloomQuest's mindful gamification, XP progression, and daily habit tracking.

---

### 2. User Experience & Visual Design

- **Sage Sanctuary Aesthetics**: Adheres strictly to the `#121413` Dark / `#F7F6F2` Light theme, with Forest Sage `#3D7D62` accents, Warm Amber `#E5A93C` action highlights, 12dp rounded corners, and Fitts's Law 44–48dp touch targets.
- **View Switcher (3-Way Segmented Control)**:
  - Clean pill segmented bar: `[ 🌐 All Pillars | 📋 Outline | 🕸️ Mind Map ]`
  - Switches instantly with Web Audio click chimes without page reload.
- **All-Pillars Overview**:
  - Top action bar: `+ New Pillar` button (Warm Amber), global search bar (`🔍 Search skills across all pillars...`), and a `Compact / Expanded` density toggle.
  - Vertically scrollable stack of pillar cards. Each pillar card features:
    - Custom emoji, name, color accent pill, and item count badge (e.g. `5 root skills · 14 items`).
    - Expand/collapse chevron with multi-expand capability (all can be expanded simultaneously).
    - Quick `+ Add Root Skill` launcher right on the pillar card header.
    - Contextual menu: `Edit Pillar`, `Reorder`, `Archive`, or `Delete Pillar`.
    - Inside expanded card: Hierarchical list of root skills with nature badges, anchor tags, check/count interactive controls, and drill-down buttons.
- **Outline View**:
  - Hierarchical tree display with vertical connectors, nested sub-skills, importance badges, and contextual bottom sheet for quick actions (Add Sub-Skill, Check In Today, Edit, Move, Delete).
- **Mind Map View**:
  - Radial SVG connector graph updated with selectable pillar tabs (including all custom pillars).
  - Handles large trees with horizontal scrolling and responsive 2-column child node grids to prevent clipping.
- **Today Screen Progress Rings**:
  - Replaces hardcoded 3-pillar rings with a responsive, horizontally swipeable or grid-based display of dynamic SVG progress rings for all active pillars (both default and custom).
  - Shows custom pillar emoji, color ring, and live % calculation based on today's habit check-ins.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Storage Architecture & Backward Compatibility**:
  - *Chosen Approach*: Store pillars and skills within the existing unified `nodes: NodeItem[]` state array, where pillars have `p: '0'` and skills reference their parent pillar or parent skill via `p: parentId`. Extend `NodeItem` with optional pillar metadata (`color?: string`, `description?: string`, `isCustom?: boolean`, `isArchived?: boolean`, `order?: number`).
  - *Why*: 100% backward compatible with existing localStorage state migrations, Room database schema, backup snapshots, and AI Copilot diagnostics. Zero risk of breaking existing user data.
- **Decision 2: Child Reparenting on Deletion**:
  - *Chosen Approach*: On pillar deletion, any child skills with `p === deletedPillarId` are moved to an automatic `unassigned` archive pillar (`id: 'unassigned'`, `p: '0'`, `e: '📦'`, `n: 'Unassigned Archive'`) rather than cascaded into oblivion.
  - *Why*: Prevents accidental loss of months of habit tracking, notes, and XP records while honoring user preference.
- **Decision 3: Mobile Touch Ergonomics**:
  - *Chosen Approach*: Creation and editing flows are housed in sleek bottom sheets (`PillarEditorModal` and `SkillEditorModal`) with large 48dp touch targets and preset emoji palettes rather than heavy nested dialogs.

---

### 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        BLOOMQUEST STATE STORE                          │
│                      (AppContext / localStorage)                       │
│                                                                        │
│  nodes: NodeItem[]                                                     │
│    ├── Pillar (p: '0', isCustom: true, color: '#...', order: 1)        │
│    │     └── Root Skill (p: pillarId, nature: 'skill', g: 1)           │
│    │           └── Sub-Skill / Habit (p: skillId, ifThenAnchor: '...') │
│    └── Unassigned Archive (p: '0', isArchived: true)                   │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
         ┌───────────────────────────┼───────────────────────────┐
         ▼                           ▼                           ▼
┌──────────────────┐       ┌──────────────────┐       ┌──────────────────┐
│   TODAY SCREEN   │       │   GROWTH SCREEN  │       │   MIND MAP VIEW  │
│                  │       │                  │       │                  │
│ • Dynamic Rings  │       │ 3-Way Switcher:  │       │ • Pillar Tabs    │
│   (Default +     │       │ [All|Tree|Mind]  │       │ • Central Hub    │
│    Custom)       │       │ • All Pillars    │       │ • SVG Connectors │
│ • Today's Focus  │       │   Overview View  │       │ • Sub-Tree Grid  │
│ • Daily Habits   │       │ • Hierarchical   │       └──────────────────┘
└──────────────────┘       │   Outline View   │
                           └─────────┬────────┘
                                     │ Contextual Actions
                                     ▼
                           ┌──────────────────┐
                           │   BOTTOM SHEETS  │
                           │ • PillarEditor   │
                           │ • SkillEditor    │
                           │ • MoveToPillar   │
                           └──────────────────┘
```

#### State Mutators in AppContext:
1. `createPillar(pillarData: { name: string; emoji: string; color?: string; description?: string })`
2. `updatePillar(id: string, updates: Partial<NodeItem>)`
3. `deletePillar(id: string)` -> reparents children to `unassigned` archive pillar.
4. `reorderPillars(orderedIds: string[])`
5. `addSkillNode(node: Partial<NodeItem>)` -> supports custom pillar parent IDs.
6. `moveSkillNode(nodeId: string, newParentId: string)`
7. `archivePillar(id: string, archive: boolean)`

---

### 5. Step-by-Step Implementation Plan

1. **Types & Schema**:
   - Update `NodeItem` in `src/types/index.ts` to include `color?: string`, `description?: string`, `isCustom?: boolean`, `isArchived?: boolean`, `order?: number`, `priority?: string`.
2. **AppContext State Methods**:
   - Implement `createPillar`, `updatePillar`, `deletePillar` (with unassigned archive transfer), `reorderPillars`, and `moveSkillNode` in `src/context/AppContext.tsx`.
3. **Pillar & Skill Creation Modals**:
   - Build `PillarEditorModal.tsx` for creating and editing pillars with custom name, emoji picker, color palette swatches, description, and delete button with confirmation.
   - Build/update `SkillEditorModal.tsx` supporting parent pillar selection (including custom pillars), priority, nature, anchor, and targets.
4. **All-Pillars Overview Component**:
   - Create `AllPillarsOverview.tsx` with multi-pillar expand/collapse accordion, item counters, search query filtering across all pillars and subskills, compact/expanded modes, inline `+ Add Root Skill` button, and contextual pillar action menu.
5. **GrowthScreen & SkillsScreen Integration**:
   - Upgrade the view switcher in `GrowthScreen.tsx` to a 3-way toggle: `All Pillars`, `Outline`, and `Mind Map`.
   - Update `Outline` view to support custom pillars and nested hierarchy.
   - Update `Mind Map` radial view to include custom pillars in horizontal tab selector and dynamically render their branches.
6. **Today Screen Dynamic Progress Rings**:
   - Update `TodayScreen.tsx` to dynamically iterate through all active pillars (`nodes.filter(n => n.p === '0' && !n.isArchived)`), compute progress from today's events, and display a smooth horizontal ring row / responsive grid.
7. **Verification & Testing**:
   - Verify creating, editing, renaming, and deleting custom pillars.
   - Verify creating root skills under custom pillars and moving existing skills.
   - Verify unassigned reparenting on pillar deletion.
   - Run `compile_applet` and `lint_applet` to confirm 0 errors.
