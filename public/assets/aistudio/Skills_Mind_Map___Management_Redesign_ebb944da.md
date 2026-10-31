# Skills Hub: Interactive Mind Map & Management Specification

## 1. UX Strategy & Visual Concept
The Skills Hub transitions from a rigid linear tree view into a dual-mode canvas interface. Users can seamlessly toggle between a **Mind Map (Visual Graph)** and a **Structured List (Outline View)**.

* **Node Interactivity**: Tapping a skill node reveals contextual actions (`+ Sub-Skill`, `✏️ Edit`, `🎯 Set Focus`, `🗑️ Delete`).
* **Visual Hierarchy**: Root skills appear as primary hubs with distinct pillar colors (Learn, Build, Body). Sub-skills radiate outward with connecting lines (`svg-curved-paths`).
* **Progress Visualization**: Nodes feature radial ring indicators displaying skill mastery percentage derived from completed reps or linked habits.

---

## 2. Interactive Mind Map Layout Mockup

```
+---------------------------------------------------------------------------------------+
|  SKILLS & KNOWLEDGE MAP                            [ 🗺️ Mind Map ]  [ 📋 Outline ]    |
+---------------------------------------------------------------------------------------+
|  [ + New Root Skill ]    [ 🔍 Zoom In ] [ 🔍 Zoom Out ] [ 🎯 Recenter ]               |
+---------------------------------------------------------------------------------------+
|                                                                                       |
|                               +------------------+                                    |
|                               |  🧠 Learn (Root) |                                    |
|                               +--------+---------+                                    |
|                                        |                                              |
|                      +-----------------+-----------------+                            |
|                      |                                   |                            |
|            +---------v----------+              +---------v----------+                 |
|            | System Architecture|              |   Web Development  |                 |
|            |     (75% Master)   |              |     (40% Master)   |                 |
|            +---------+----------+              +---------+----------+                 |
|                      |                                   |                            |
|         +------------+------------+            +---------+---------+                  |
|         |                         |            |                   |                  |
|  +------v------+           +------v------+  +--v-------+        +--v-------+          |
|  | Microservices|          | Cache Layers|  | React.js |        | Tail-CSS |          |
|  +--------------+          +-------------+  +----------+        +----------+          |
|  [ + Sub-Skill ]           [ + Sub-Skill ]  [+ Sub-Skill]       [+ Sub-Skill]         |
|                                                                                       |
+---------------------------------------------------------------------------------------+
| SELECTED NODE ACTION BAR (Drawer / Floating Panel)                                    |
| Selected: "Microservices" (Level 3 Skill)                                              |
| [ + Add Sub-Skill ]   [ ⚡ Link Routine ]   [ 🎯 Focus Mode ]   [ ✏️ Edit Node ]       |
+---------------------------------------------------------------------------------------+
```

---

## 3. UI Component Architecture & Logic

### A. Quick-Action Node Buttons
Every skill node on the canvas includes explicit, touch-friendly (+48dp) trigger zones:
1. **Root Add Button (`+ New Root Skill`)**: Positioned at the top header bar to create main parent skill pillars (e.g., *Software Design*, *Physical Fitness*, *Languages*).
2. **Sub-Skill Add Button (`+ Sub-Skill`)**: Embedded directly beneath each node box or accessible via node selection, opening an immediate inline creation modal pre-populated with `parentSkillId`.

### B. Interactive Node Component Anatomy
```
+---------------------------------------------------+
|  [Icon] Node Name                  (Level X)      |
|  [ Progress Bar / Ring ]           XP: 450 / 1000 |
| ------------------------------------------------- |
|  [ + Sub-Skill ]   [ 👁️ Expand ]   [ ⚙️ Options ]   |
+---------------------------------------------------+
```

---

## 4. Mind Map Data Structure & Actions

```typescript
// Core Data Interface for Mind Map Nodes
export interface SkillNode {
  id: string;
  parentId: string | null; // null indicates a Root Skill
  title: string;
  pillar: 'LEARN' | 'BUILD' | 'BODY';
  level: number;
  currentXp: number;
  targetXp: number;
  childrenIds: string[];
  isExpanded: boolean;
}

// Key Actions to Support in UI:
// - addRootSkill(title, pillar)
// - addSubSkill(parentId, title)
// - reassignParent(skillId, newParentId)
// - toggleNodeCollapse(skillId)
```

---

## 5. UI/UX Refinement Steps
1. **Canvas Navigation**: Enable smooth drag-to-pan and pinch-to-zoom controls for navigating large skill maps.
2. **Auto-Layout Graphing**: Apply a automatic tree layout algorithm so nodes automatically space out without overlapping.
3. **Pillar Accent System**: Color-code node borders matching the design tokens (`--pillar-learn`, `--pillar-build`, `--pillar-body`).