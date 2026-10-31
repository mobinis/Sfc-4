# Sage Sanctuary Palette & Ergonomic Button Styling Overhaul

Re-apply and enforce the exact **Sage Sanctuary** restorative palette and ergonomic button styling specifications across the native Android Jetpack Compose application (`BloomQuest` / `Self-Care Hero`). This replaces disparate raw orange/indigo utility colors with a harmonious, WCAG AAA compliant duo: **Forest Sage** for focused primary action buttons and **Warm Amber** for prominent Floating Action Buttons (FABs).

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural decisions were confirmed through interactive clarification and govern the implementation:

- **Confirmed Decision 1 (Runtime Architecture)**: All styling adjustments will be applied directly to the **native Android Jetpack Compose** codebase (`Color.kt`, `Theme.kt`, Compose button styles, dialog action bars, and screen FABs).
- **Confirmed Decision 2 (Button Color Hierarchy)**:
  - **Primary Action Buttons**: Styled with **Forest Sage** (`#2D6A4F` in light theme, `#3D7D62` in dark theme), crisp white text, `12.dp` rounded corners, and `FontWeight.SemiBold` (`600`).
  - **Floating Action Buttons (FABs)**: Styled with **Warm Amber** (`#E5A93C`), dark charcoal (`#121413`) icon/text, circular shape, and warm ambient elevation shadow (`4.dp` elevation).

---

## 1. Overview & Core Concept

- **What It Does**: Unifies the visual language of the entire Android application around the restorative "Sage Sanctuary" design system. All interactive buttons, action bars, FABs, and screen surfaces adhere to an intentional, calming palette that balances mindful focus (Forest Sage) with energizing milestones and actions (Warm Amber).
- **Target Audience / Persona**: Users seeking a distraction-free, calming self-care companion who value visual clarity, clean typography, and tactile button ergonomics.
- **Key Value**: Eliminates harsh, jarring color mismatches (raw orange/indigo) and ensures tactile Fitts's law compliance (minimum 48dp touch targets, consistent 12dp rounded pill shapes, and high-contrast readable states).

---

## 2. User Experience & Visual Design

### Visual Identity & Theme Tokens

The app features full dual-theme support (Soft Warm Parchment light mode + Deep Organic Charcoal dark mode) configured directly in `Color.kt` and `Theme.kt`:

#### Light Palette (Restorative Parchment)
- **Canvas / Background (`--bg`)**: `#F7F6F2` (Soft warm parchment)
- **Card Surface (`--sf`)**: `#FFFFFF` (Pure porcelain)
- **Elevated Surface (`--sf-elevated`)**: `#FFFFFF`
- **Structural Border (`--line`)**: `#E5E3DA`
- **Border Strong (`--line-strong`)**: `#C8C5B8`
- **Primary Ink (`--ink`)**: `#1C221E` (High-contrast charcoal green, >13:1)
- **Secondary Ink (`--ink-secondary`)**: `#353E38`
- **Muted Text (`--mu`)**: `#5C655E`
- **Primary Sage Accent (`--ac`)**: `#2D6A4F` (Forest Sage)
- **Sage Hover/Active (`--ac-hover`)**: `#22533E`
- **Sage Container (`--acs`)**: `#E8F3ED` (Soft sage pill container)
- **Warm Amber (`--warn`)**: `#E5A93C` (Warm golden amber)
- **Warm Amber Surface (`--warn-surface`)**: `#FEF3C7`
- **Destructive Red (`--danger`)**: `#B91C1C`
- **Danger Surface (`--danger-surface`)**: `#FEE2E2`

#### Dark Palette (Velvet Organic Charcoal)
- **Canvas / Background (`--bg`)**: `#121413` (Deep warm charcoal)
- **Card Surface (`--sf`)**: `#1B211E` (Pine graphite surface)
- **Elevated Surface (`--sf-elevated`)**: `#242D29`
- **Structural Border (`--line`)**: `#384A41`
- **Border Strong (`--line-strong`)**: `#4D6356`
- **Primary Ink (`--ink`)**: `#F4F7F4` (Linen white)
- **Secondary Ink (`--ink-secondary`)**: `#B2C4BC`
- **Muted Text (`--mu`)**: `#859A90`
- **Primary Sage Accent (`--ac`)**: `#3D7D62` (Forest Sage Primary)
- **Sage Hover/Active (`--ac-hover`)**: `#4D9677`
- **Sage Container (`--acs`)**: `#2A5643`
- **Warm Amber (`--warn`)**: `#E5A93C` (Warm amber accent)
- **Warm Amber Surface (`--warn-surface`)**: `#2E2308`
- **Destructive Red (`--danger`)**: `#D95D39`
- **Danger Surface (`--danger-surface`)**: `#331414`

### Button Hierarchy & Ergonomics

| Component | Background Color | Text/Icon Color | Shape & Corner Radius | Elevation / Shadow |
| :--- | :--- | :--- | :--- | :--- |
| **Primary Action Button** | Forest Sage (`#2D6A4F` / `#3D7D62`) | `#FFFFFF` | `RoundedCornerShape(12.dp)` | `ButtonDefaults.buttonElevation(defaultElevation = 2.dp)` |
| **Secondary / Neutral Button** | Sage Container (`#E8F3ED` / `#2A5643`) | Primary Ink (`#1C221E` / `#F4F7F4`) | `RoundedCornerShape(12.dp)` | 0.dp (flat outline or surface) |
| **Floating Action Button (FAB)** | Warm Amber (`#E5A93C`) | `#121413` (Deep Charcoal) | `CircleShape` | `FloatingActionButtonDefaults.elevation(defaultElevation = 6.dp)` |
| **Destructive / Danger Button** | Destructive Red (`#B91C1C` / `#D95D39`) | `#FFFFFF` | `RoundedCornerShape(12.dp)` | `ButtonDefaults.buttonElevation(defaultElevation = 2.dp)` |

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Native Jetpack Compose Token System vs. Hybrid CSS**:
  - *Chosen Approach*: Update `Color.kt` and `Theme.kt` with the exact token values, and create reusable Compose button style helpers (`SagePrimaryButtonColors`, `SageFabColors`, `SageSecondaryButtonColors`).
  - *Why*: The application is running natively on Android with Jetpack Compose. Centralizing tokens in Compose provides instant hot reload, native ripple states, dark mode responsiveness, and complete type safety without webview performance overhead.
  - *Alternatives Considered*: Injecting CSS classes into an offline webview — rejected because the entire application interface is written in native Kotlin Compose.
- **Decision 2: Floating Action Button Color Assignment**:
  - *Chosen Approach*: Use Warm Amber (`#E5A93C`) with deep charcoal `#121413` glyphs for all FABs (`fab_add_skill`, `fab_add_alert`, etc.).
  - *Why*: Floating action buttons serve as the primary screen-level affordance for creation (adding skills, setting reminders). Giving FABs Warm Amber creates an intentional warm pop against the restful Forest Sage canvas, maintaining visual hierarchy without overpowering reading content.

---

## 4. Technical Architecture & Implementation Strategy

```
┌────────────────────────────────────────────────────────┐
│                   Theme Architecture                   │
│                                                        │
│  ┌───────────────────────┐   ┌──────────────────────┐  │
│  │   Color.kt            │   │   Theme.kt           │  │
│  │   - SageLight* tokens │──▶│   - LightColorScheme │  │
│  │   - SageDark* tokens  │   │   - DarkColorScheme  │  │
│  │   - Pillar Accents    │   │   - SelfCareHeroTheme│  │
│  └───────────────────────┘   └──────────┬───────────┘  │
│                                         │              │
└─────────────────────────────────────────┼──────────────┘
                                          ▼
┌────────────────────────────────────────────────────────┐
│                 Component Styling Layer                │
│                                                        │
│  ┌────────────────────────┐  ┌──────────────────────┐  │
│  │  Primary Buttons       │  │  Floating Buttons    │  │
│  │  - Background: Sage Ac │  │  - Bg: Warm Amber    │  │
│  │  - Shape: 12.dp radius │  │  - Content: #121413  │  │
│  │  - Text: White, 600 wt │  │  - Shape: CircleShape│  │
│  └────────────────────────┘  └──────────────────────┘  │
│               │                          │             │
│               ▼                          ▼             │
│  ┌────────────────────────┐  ┌──────────────────────┐  │
│  │  Dialogs & Screens     │  │  FABs in Screens     │  │
│  │  - AllDialogs.kt       │  │  - SkillsScreen.kt   │  │
│  │  - TodayScreen.kt      │  │  - AlertsScreen.kt   │  │
│  │  - LearnScreen.kt      │  │  - VideoLibraryScreen│  │
│  │  - JournalScreen.kt    │  │  - StudyScreen.kt    │  │
│  └────────────────────────┘  └──────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

### Step-by-Step Implementation Sequence

1. **`Color.kt` Token Refinement**:
   - Update `SageLightAc` to `#2D6A4F`, `SageLightWarn` to `#E5A93C`, `SageLightBg` to `#F7F6F2`, `SageLightSf` to `#FFFFFF`, `SageLightLine` to `#E5E3DA`, `SageLightDanger` to `#B91C1C`.
   - Update `SageDarkAc` to `#3D7D62`, `SageDarkWarn` to `#E5A93C`, `SageDarkBg` to `#121413`, `SageDarkSf` to `#1B211E`, `SageDarkLine` to `#384A41`, `SageDarkDanger` to `#D95D39`.
   - Add centralized composable helper functions or constants for standard button styling:
     - `SageButtonShape = RoundedCornerShape(12.dp)`
     - `primaryButtonColors()` and `fabColors()`.
2. **`Theme.kt` Color Scheme Harmonization**:
   - Align `primary`, `onPrimary`, `secondary`, `onSecondary`, `tertiary`, `surface`, `surfaceVariant`, and `outline` bindings with the revised tokens.
3. **Screen Floating Action Buttons (FABs)**:
   - In `SkillsScreen.kt`, update `fab_add_skill` to use Warm Amber container color (`#E5A93C`), `#121413` content color, and `FloatingActionButtonDefaults.elevation()`.
   - In `AlertsScreen.kt`, update `fab_add_alert` to use Warm Amber container color and `#121413` content color.
   - Audit and style any remaining screen-level floating action buttons.
4. **Primary Action Buttons across Screens & Dialogs**:
   - Audit and update `AllDialogs.kt` (Save, Add, Confirm, Start Timer, Rescue Streak) to ensure primary action buttons use Forest Sage (`primary`), `#FFFFFF` text, `RoundedCornerShape(12.dp)`, and `FontWeight.SemiBold`.
   - Ensure secondary cancel/dismiss buttons use tonal or text button styling (`onSurfaceVariant` / `primaryContainer`).
   - Audit and normalize action buttons in `TodayScreen.kt`, `JournalScreen.kt`, `StudyScreen.kt`, and `LearnScreen.kt`.
5. **Documentation & Verification**:
   - Update `HANDOFF.md` with the finalized Sage Sanctuary design token specification and button styling guidelines.
   - Run `compile_applet` to ensure full build success with zero errors.
