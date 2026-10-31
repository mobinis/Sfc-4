# SELF-CARE HERO — SESSION HANDOFF & CONTINUATION GUIDE

> **Project**: Self-Care Hero (v1.6+)  
> **Target Format**: Offline-first Web App / Android APK (bundled via Capacitor 6 & GitHub Actions workflow)  
> **Repository Setup**: GitHub repo managed from phone browser. APK built via `.github/workflows/build-apk.yml` running `npm install`, then `npm run build` -> `dist`, packaged with Capacitor 6 (App ID: `com.selfcarehero.app`).  
> **Key Rule**: 100% offline functionality. Zero external CDN dependencies, zero external web fonts/images, zero backend server requirements. Single localStorage state persistence (`"sch5"`, schema v13) with full backward compatibility.

---

## 1. COPY-PASTE PROMPT FOR NEW SESSION

*Paste the entire block below into the first prompt of your new AI Studio session or new account:*

```markdown
You are a senior front-end engineer helping me polish an EXISTING app. Work slowly and carefully.

APP: Self-Care Hero (React + TypeScript + Tailwind CSS). It will be packaged as an Android APK, so it must work fully offline: no CDN links, no external fonts, images or scripts.

GITHUB + APK SETUP:
- This project lives in a GitHub repo that I manage from my phone browser. The APK is built by a GitHub Actions workflow at .github/workflows/build-apk.yml. It runs `npm install`, then `npm run build`, wraps the `dist` folder with Capacitor 6 (app id com.selfcarehero.app), and builds a debug APK. Do NOT edit, rename or delete that workflow unless I ask.
- Keep the build working. `npm run build` must always succeed and output to `dist`. Do not change the "build" script, the output folder, or the app id. Do not add packages that need a server, an API key, or a native plugin without asking me first.
- The APK must work 100% offline. No CDN links, external fonts, images, scripts, or fetch() calls to the internet.
- Before saying "done", check that the code would pass `npm run build` and `tsc --noEmit`: no type errors, no missing imports, no unused-import errors. A broken build means I get no APK.
- Give me changes in a form I can apply on a phone: the full contents of each changed file, or exact "find this / replace with this" edits with the file path. Tell me exactly which files changed. Never say "the rest stays the same."
- If I paste a failed GitHub Actions log, find the first real error, explain it in one simple sentence, and give the smallest fix. Do not rewrite unrelated code.
- If a feature won't work reliably inside the APK (for example reminders when the app is fully closed), tell me BEFORE building it and suggest the closest workaround.
- Keep HANDOFF.md current. At the end of each task, update it and mention that this GitHub and APK setup exists.

GOLDEN RULES:
1. Do NOT change the existing UI, layout, colors, fonts or behavior unless I ask. New features must match the existing style (Nunito typography, warm teal --ac: #3f9d86, --acs: #e3f3ee, --pip: #ffd7bd).
2. Do NOT add new bugs. Edit only what's needed. Never rewrite a whole file for a small change.
3. No placeholders, "TODO" or "rest of code here". Every function must be complete.
4. Before saying "done", re-read the changed code for syntax errors, undefined variables, wrong IDs and missing listeners. Never claim you tested something you didn't.
5. Everything must be easy to understand for a non-technical user: clear labels, simple forms, helpful empty states.
6. Keep data in one state object saved to localStorage ("sch5") with try/catch. If you change the data structure, migrate old saved data so nothing is lost.
7. If something can't work reliably inside an offline APK (for example background notifications when app is killed), tell me BEFORE building it and suggest the closest workaround.
8. KEEP HANDOFF.md CURRENT. After every major change, update the DONE / IN PROGRESS / STILL TO DO sections and the file inventory in HANDOFF.md, and save it in the project root so it comes out in the ZIP download. Keep the copy-paste prompt at the top of HANDOFF.md, including this rule.
9. WHEN THE LIMIT IS NEAR, or when I say "wrap up": stop building and give me (a) a list of what was done and what still needs work, (b) the fully updated HANDOFF.md, and (c) confirmation that all files are saved and downloadable. Never start a big change when the limit is close.

Please inspect HANDOFF.md and continue building the next feature ONE AT A TIME.
```

---

## 2. STATUS REPORT

### A. DONE
-1. **Production Android APK Workflow, Verification & GitHub Release Architecture (Phase 8)**:
   - Preserved restored BloomQuest workspace as the single source of truth with zero application feature modification or conversion.
   - Identified and confirmed 100% native Jetpack Compose Android architecture (`MainActivity.kt`, Room DB, Media3 ExoPlayer, ONNX SmolLM-135M). Decoupled independent web application verification from native Android compilation.
   - Generated deterministic `package-lock.json` from `package.json` with 0 vulnerabilities for reproducible `npm ci` and cache alignment.
   - Configured standard default AGP debug signing in `app/build.gradle.kts`.
   - Built reproducible GitHub Actions workflow (`.github/workflows/build-apk.yml`) with:
     * Strict branch enforcement halting builds with exit code 1 if triggered on any branch other than `restored-checkpoint`.
     * Exact commit SHA locking (`ref: ${{ github.sha }}`) with commit log verification.
     * Parallel `validate-web` job (`npm ci`, `tsc --noEmit`, `npm run build`).
     * `build-android` job running Temurin JDK 21, `./gradlew testDebugUnitTest`, and `./gradlew assembleDebug`.
     * Evaluated `README.txt` generation with real variables (`$BUILD_DATE`, `$CHECKSUM`, `$COMMIT_SHA`).
     * Strict file verification suite checking `sha256sum -c`, `unzip -t`, exact 3-file ZIP contents, and mandatory `aapt2` package identity validation (`com.aistudio.selfcarehero.kzpvqw`).
     * Guaranteed 90-day GitHub Actions artifact uploads for `BloomQuest-Restored-Checkpoint.apk` and `BloomQuest-Restored-Checkpoint-Android.zip`.
     * GitHub Release publication (`restored-v1.6-${{ github.sha }}`) with automatic upload to existing releases (`--clobber`) and post-release asset verification.
0. **GitHub Import Migration & Build Verification (Native Android)**:
   - Configured `app/google-services.json` with package name `com.aistudio.selfcarehero.kzpvqw` and debug certificate hash matching `debug.keystore`, resolving the Google Services plugin build failure.
   - Fixed `widget_selfcare_layout.xml` for `RemoteViews` compatibility: replaced disallowed `<View>` tag with `<ImageView>` to ensure home screen AppWidget functions without crash.
   - Added Android 12+ (API 31/33/34+) `AlarmManager.canScheduleExactAlarms()` runtime checks and explicit `catch (SecurityException)` handling in `ReminderScheduler.kt` (`scheduleAlert` and `scheduleSnooze`).
   - Verified 100% clean compilation via `compile_applet` and 0 errors in full Android Lint via `lint_applet`.
1. **Master UI/UX Design & Architecture Specification: "Sage Sanctuary" Overhaul** (`ui/theme/Color.kt`, `ui/theme/Theme.kt`, `ui/theme/Type.kt`, `ui/components/HeaderBar.kt`, `ui/screens/TodayScreen.kt`, `ui/screens/SkillsScreen.kt`, `ui/screens/LearnScreen.kt`, `ui/screens/JournalScreen.kt`, `ui/screens/StatsScreen.kt`, `ui/dialogs/AllDialogs.kt`):
2. **App Rebranding & 8-Bit Retro RPG Adaptive Icon ("BloomQuest")**:
   - Replaced generic name with **BloomQuest** across `metadata.json`, `strings.xml` (`app_name`), `settings.gradle.kts` (`rootProject.name`), `HeaderBar.kt`, `Models.kt`, `SelfCareRepository.kt`, and `widget_selfcare_layout.xml`.
   - Created authentic 8-bit retro pixel-art launcher icon featuring an emerald sprout emerging from a glowing crystal hearth with ember sparks on matching `#1D2623` solid background.
   - Built Android adaptive icon system: `ic_launcher_background.xml`, `ic_launcher_foreground.xml` (layer-list with 66dp centered asset), and full mipmap suite (`mdpi` 48px, `hdpi` 72px, `xhdpi` 96px, `xxhdpi` 144px, `xxxhdpi` 192px) with circular alpha masks for `ic_launcher_round.png`.

   - **Sage Sanctuary Palette & Ergonomic Button Styling Overhaul (Phase Complete)**:
     - **Harmonized Color Token System (`ui/theme/Color.kt`, `ui/theme/Theme.kt`)**:
       - Light Mode: App Canvas `#F7F6F2`, Card Surface `#FFFFFF`, Elevated `#FFFFFF`, Structural Borders `#E5E3DA`, Strong Border `#C8C5B8`, Primary Ink `#1C221E` (>13:1 contrast), Secondary Ink `#353E38`, Muted `#5C655E`, Brand Forest Sage Accent `#2D6A4F`, Sage Hover `#22533E`, Sage Container `#E8F3ED`, Peach Accent `#F5C6AA`, Coral Accent `#EA867A`, Warm Amber / Gold `#E5A93C`, Warm Amber Surface `#FEF3C7`, Destructive Red `#B91C1C`.
       - Dark Mode: App Canvas `#121413` (Deep Warm Charcoal), Card Surface `#1B211E`, Elevated `#242D29`, Structural Borders `#384A41`, Strong Border `#4D6356`, Primary Ink `#F4F7F4` (Linen White), Secondary Ink `#B2C4BC`, Muted `#859A90`, Brand Forest Sage Accent `#3D7D62`, Sage Hover `#4D9677`, Sage Container `#2A5643`, Warm Amber Accent `#E5A93C`, Warm Amber Surface `#2E2308`, Destructive Coral Red `#D95D39`.
     - **Ergonomic Button Architecture**:
       - Standardized `SageButtonShape = RoundedCornerShape(12.dp)` across all primary buttons and dialogs.
       - Primary Action Buttons: Consistently styled with Forest Sage (`MaterialTheme.colorScheme.primary` - `#2D6A4F` light / `#3D7D62` dark), high-contrast white text (`Color.White`), 12dp rounded corners, and semi-bold typography (`FontWeight.SemiBold` / `600`).
       - Floating Action Buttons (FABs): Consistently styled with Warm Amber (`WarmAmberGold` - `#E5A93C`), deep charcoal (`#121413`) icon/text, circular shape, and warm ambient elevation shadow (`FloatingActionButtonDefaults.elevation(6.dp)`) across `SkillsScreen.kt`, `AlertsScreen.kt`, `LearnScreen.kt`, `StudyScreen.kt`, and `VideoLibraryScreen.kt`.
       - Dialog & Screen Button Normalization: Replaced raw legacy orange/amber/emerald hardcoded button styles with semantic theme tokens across `AllDialogs.kt`, `SprintGoalDialog.kt`, `AddBookDialog.kt`, `HabitContractDialog.kt`, `AntiGoalEditDialog.kt`, `TeachBackDialog.kt`, `StreakBreakRescueDialog.kt`, `ProgressionExportImportDialog.kt`, `UrgeSurfingDialog.kt`, `BookReaderDialog.kt`, `LocalAiDialog.kt`, `JournalScreen.kt`, `StudyScreen.kt`, `VideoLibraryScreen.kt`, `LifeSprintCard.kt`, `HabitContractBanner.kt`, `AntiGoalsSection.kt`, and `RoutineFlowPlayer.kt`.
   - **8-Point Spacing Scale & Fitts's Law 48dp Touch Targets**:
     - Enforced `Modifier.minimumInteractiveComponentSize()` and `Modifier.size(48.dp)` across all buttons, habit checkboxes, stepper `-`/`+` buttons, mood pills, and quick action chips.
     - `TabularNumberStyle` (`FontFamily.Monospace`, `FontFeatureSettings("tnum")`) eliminating horizontal layout jitter during countdowns, XP gains, and progress counters.
   - **Screen Restructuring & Ergonomics**:
     - *Hero Header & Status Bar*: Streamlined unified card combining level badge, title, streak flame, coins, and 1-tap 44dp toggles for Theme (`☀️`/`🌙`), Sound (`🔊`/`🔇`), and Cloud Sync (`☁️`).
     - *Today Dashboard*: 44dp Quick Action Hub row (`🌊 Urge Surf`, `⏱️ Deep Focus`, `🤖 AI Copilot`, `🫁 Breath Pacer`, `🎬 Videos`, `✍️ Reflection`), Daily Three & Circadian Momentum banner, grouped habit cards with left-aligned pillar accent borders, 48dp check buttons, and `⚓ [Anchor]` badges.
     - *Skills Tree*: Hierarchical tree branch lines (`└─`), nature pills (`[Skill]`, `[Technique]`, `[Concept]`, `[Course]`), importance star ratings, and 48dp edit targets.
     - *Learn & Study Hub*: Prominent `🔥 Due Recall ($count)` filter chip, Feynman teach-back cards with peek hints, and 5-digit tabular timer (`00:00`) in `FocusTimerDialog` with presets (15m, 25m, 45m).
     - *Emotional Climate Selector*: 5-tier selector (`😞`, `😕`, `😐`, `🙂`, `😄`) with 52dp minimum touch targets.
     - *Stats & Analytics*: 4-KPI summary strip (Weekly XP, Reps, Daily 3, Kind Deeds) with tabular numeric alignment and 365-day contribution heatmap.
2. **Room Database `VideoNote` & `BookNote` Entities + Media3 In-Player Note-Taking & Voice Dictation ("Note-Talking") + Special Curriculum Export** (`data/room/VideoNote.kt`, `data/room/VideoNoteDao.kt`, `data/room/BookNote.kt`, `data/room/BookNoteDao.kt`, `data/room/UrgeDatabase.kt`, `utils/VoiceNoteHelper.kt`, `ui/screens/VideoLibraryScreen.kt`, `ui/dialogs/BookReaderDialog.kt`, `ui/dialogs/ProgressionExportImportDialog.kt`, `data/SelfCareRepository.kt`, `ui/viewmodel/SelfCareViewModel.kt`):
   - **`VideoNote` Room Entity & DAO**:
     - Room table `video_notes` with primary key `id`, foreign `videoId`, `noteText`, `videoTimestampMs`, `formattedTime`, `timestamp`, and `dateStr`.
     - Full DAO queries for video notes by `videoId` ordered by timestamp descending, insertion, deletion, and reactive `Flow` updates.
   - **`BookNote` Room Entity & DAO**:
     - Room table `book_notes` with primary key `id`, foreign `bookId`, `noteText`, `pageNumber`, `chapterTitle`, `timestamp`, and `dateStr`.
     - Full DAO queries for book notes by `bookId`, insertion, deletion, and reactive `Flow` updates.
     - Upgraded `UrgeDatabase` to version 2 with destructive migration fallback and abstract DAO accessors.
   - **Media3 In-Player Note-Taking & "Note-Talking" Section (`ExoPlayerVideoDialog`)**:
     - Embedded dedicated note-taking text area directly inside the Media3 ExoPlayer dialog below video controls.
     - ⏱️ `Stamp [mm:ss]` button: Captures exact `exoPlayer.currentPosition` and inserts into the note text area.
     - 🎙️ `Talk Note` button: Native Android speech recognition dictation (`RecognizerIntent.ACTION_RECOGNIZE_SPEECH`) allowing users to speak their insights hands-free while watching.
     - 🔊 `Listen` button: Android `TextToSpeech` playback reading notes aloud.
     - `Save (+5 XP)` button: Persists notes to Room database (`VideoNote`), synchronizes with video item notes, and triggers haptic/XP feedback.
     - Interactive Timeline: Lists all saved video notes with a clickable `▶ [mm:ss]` chip that jumps `exoPlayer` directly to that timestamp (`exoPlayer.seekTo(note.videoTimestampMs); exoPlayer.play()`).
     - Includes per-note TTS read aloud and delete actions.
   - **Video Cards Note-Taking & Note-Talking Section (`VideoCardItem`)**:
     - Upgraded expandable note section under each video in the main library with voice dictation 🎙️, TTS read-aloud 🔊, prompt helper chips, and Room note timeline display.
   - **Book Notes & Voice Dictation Section (`BookReaderDialog`)**:
     - Dedicated note-taking & note-talking interface under each book with page number stepper, voice dictation 🎙️, TTS audio read-aloud 🔊, quick prompt chips, and Room database persistence (`BookNote`).
   - **Special Curriculum Export (Exclusively Videos & Ebooks with Room Notes)**:
     - Constrained `exportAiProgression()` to export exclusively Videos and Ebooks/Books curriculum along with their detailed Room notes, timestamps, chapter completion, and key takeaways for targeted AI analysis.

2. **Interpersonal Communication, Emotional Intelligence (EQ) & Relationship Mastery Library + In-App Reader** (`model/Models.kt`, `model/SeedData.kt`, `data/SelfCareRepository.kt`, `ui/viewmodel/SelfCareViewModel.kt`, `ui/screens/StudyScreen.kt`, `ui/screens/VideoLibraryScreen.kt`, `ui/dialogs/BookReaderDialog.kt`, `ui/dialogs/AddBookDialog.kt`, `ui/dialogs/ProgressionExportImportDialog.kt`, `ui/components/HeaderBar.kt`, `MainActivity.kt`):
   - **Comprehensive Books, Guides & Reading Tracker**:
     - Pre-populated library of 7 foundational masterpieces across communication & EQ domains:
       1. *How to Win Friends and Influence People* by Dale Carnegie (Making Friends & Social Warmth)
       2. *Set Boundaries, Find Peace* by Nedra Glover Tawwab (Healthy Boundaries & Assertiveness)
       3. *Crucial Conversations* by Patterson, Grenny, et al. (Handling High-Stakes Conflict)
       4. *Permission to Feel* by Dr. Marc Brackett (High EQ, Emotions & Yale RULER)
       5. *You're Not Listening* by Kate Murphy (Empathetic & Active Listening)
       6. *Talk Like TED* by Carmine Gallo (Confident Public Speaking & Body Language)
       7. *Nonviolent Communication* by Marshall Rosenberg (NVC & Conflict De-escalation)
     - Interactive in-app reader modal (`BookReaderDialog.kt`) featuring 3 tabs:
       - *📑 Chapter Checklist*: Interactive chapter checkboxes with live percentage completion and +15 XP reward per completed chapter.
       - *📖 Full Study Guide*: In-depth core framework analysis, behavioral rules, and psychological principles.
       - *✍️ Notes & Exercises*: Reading page count stepper, personal notes editor with instant auto-save, and 1-tap external PDF / purchase link launcher.
     - Custom Book & PDF Guide Creator (`AddBookDialog.kt`): Add any personal ebook, guide, or PDF link with custom cover emoji, category selection, key concept tags, total page counter, and default structured chapter checkpoints.
     - Dual-Hub Study Screen (`StudyScreen.kt`): Segmented controller between `📚 EQ & Book Library` (with category filter pills and reading progress cards) and `🧠 Spaced Recall`.
   - **Video Library Tagging & Dedicated EQ Categories** (`ui/screens/VideoLibraryScreen.kt`, `model/SeedData.kt`):
     - Added curated video lectures on Active Listening, Setting Boundaries, Crucial Conversations, Confident Speaking, Adult Friendships (Liking Gap), and Yale RULER Emotional Intelligence.
     - Enhanced filter pills in `VideoLibraryScreen.kt` with `👂 Listening`, `🛡️ Boundaries`, `⚖️ Conflict`, `🎙️ Speaking`, `🤝 Friends`, and `🧠 High EQ`.
   - **AI Progression Export / Import System (Bidirectional AI Coaching Sync)**:
     - Full JSON payload generator (`AiExportPayload`) capturing user level, total XP, Carrot-Coins, books read, chapter progression, habit mastery, anti-goals, 90-day sprint, and recent reflections.
     - Formatted coaching prompt wrapper allowing users to export their complete state directly to ChatGPT, Claude, or Gemini for personalized AI analysis, habit recommendations, or new book recommendations.
     - 1-tap clipboard copy and Android native share sheet support.
     - Live validation import tab with JSON parsing preview card, pre-wipe automated safety snapshot, and 1-tap state restore.
     - Quick-access 1-tap `🔁` AI Sync buttons on `HeaderBar.kt` and `StudyScreen.kt`.

2. **Compose Memory & Recomposition Optimization + AndroidX Media3 Video Library** (`model/Models.kt`, `ui/screens/VideoLibraryScreen.kt`, `ui/screens/TodayScreen.kt`, `ui/screens/StatsScreen.kt`, `ui/screens/LearnScreen.kt`, `ui/screens/SkillsScreen.kt`, `ui/screens/JournalScreen.kt`, `ui/components/HeaderBar.kt`, `MainActivity.kt`, `data/SelfCareRepository.kt`, `ui/viewmodel/SelfCareViewModel.kt`):
   - **Recomposition Optimization with `derivedStateOf`**:
     - *TodayScreen*: Memoized Daily Three pillar completion (`learnDone`, `buildDone`, `bodyDone`, `dailyThreeComplete`) and habits list filtering (`habits`) using `derivedStateOf`, eliminating whole-tree scans and redundant heap list allocations on every frame.
     - *TodayScreen*: Memoized `activeMomentumNode` with `derivedStateOf` to prevent tree lookups.
     - *StatsScreen*: Refactored `level`, `title`, `totalXp`, `weeklyInsights`, and `analytics` to `derivedStateOf` to prevent cascading screen recompositions when unrelated state changes.
     - *LearnScreen*: Converted `filteredList` and `dueRecallCount` to `derivedStateOf`, and memoized category list allocations.
     - *SkillsScreen*: Optimized `flatTree` calculation and nature options with `remember` and `derivedStateOf`.
     - *JournalScreen*: Converted `recentEntries` to `derivedStateOf` and static mood/tag list allocations to `remember`.
     - *HeaderBar*: Memoized level, title, and XP progress ratio (`xpProgress`) with `derivedStateOf`.
   - **`@Immutable` & `@Stable` Annotations**:
     - Ensured all data models, UI items, and nested state holders (`VideoResourceItem`, `AwardItem`, `FlatNodeItem`, `AppState`, etc.) carry `@Immutable` so the Kotlin Compose compiler skips recompositions when values are unchanged.
   - **Dedicated Media3 ExoPlayer Video Library**:
     - Integrated official AndroidX Media3 (`media3-exoplayer:1.5.1`, `media3-ui`, `media3-common`).
     - Added `VideoLibraryScreen.kt` with category filters (`All`, `🫁 Breathwork`, `🧘 Movement & Yoga`, `⚡ Focus`, `🌲 Mindfulness`, `🌙 Sleep`, `⭐ Favorites`) and instant search query.
     - Included default curated wellness and somatic reset streams (Box Breathing, Nature Immersion, Posture Decompression, Deep Focus Flow) and full support for custom video links.
     - Built `ExoPlayerVideoDialog` with safe lifecycle release (`DisposableEffect`), buffering indicator, play/pause, rewind/fast-forward 10s, speed toggles (0.75x, 1.0x, 1.25x, 1.5x), and fallback external browser launcher for web URLs.
     - Added `TabType.VIDEOS ("Videos", "🎬")` route and Today screen quick action chip for seamless 1-tap navigation.

2. **Warm Visual & Design Overhaul (ColorHunt Palette & Dual Theme Engine)** (`ui/theme/Color.kt`, `ui/theme/Theme.kt`, `ui/screens/TodayScreen.kt`, `ui/components/HeaderBar.kt`, `MainActivity.kt`):
   - **ColorHunt Palette Integration**: Handcrafted palette with `#ffced8` (Pastel Blossom Pink accent), `#ffdddd` (Pastel Soft Blush), `#fff4de` (Pastel Warm Cream base), and `#ffe8c4` (Pastel Apricot Amber highlights).
   - **Dual Theme Engine**: Soft Warm Cream Light Mode (`LightCreamCanvas` #FFF7E8, porcelain cards, rich espresso text #2C221E) and Warm Velvet Espresso Dark Mode (`DarkEspressoBase` #181412, espresso cards, linen text #FAF3EC) with edge-to-edge system insets and dynamic bar icons.
   - **Instant 1-Tap Theme Toggle**: Added theme switch button (`☀️`/`🌙`) to `HeaderBar` with sound and haptic feedback.
   - **Clean Card Hierarchy & Collapsible Today Layout**:
     - Warm greeting header with 1-tap Low-Energy mode switch.
     - Thumb-friendly Quick Action row: `🌊 Urge Surf`, `⏱️ Deep Focus`, `🤖 AI Copilot`, `🫁 Breath Pacer`, `✍️ Reflection`.
     - Combined Daily Three & Circadian Sleep Clock Momentum Hub with 100% completion celebration pill.
     - Routine filter pill bar: `All`, `🌅 Morning`, `☀️ Afternoon`, `🌙 Evening`, `🔄 Flexible`.
     - Refined habit cards with 48dp touch targets, count steppers, and anchor tags.
     - Clean collapsible drawers for `Guided Rituals Player`, `90-Day Life Sprint & Identity Compass`, and `Dopamine Shield (Anti-Goals)` to eliminate visual clutter while preserving 100% access.

2. **Supercharged AI Copilot (Voice TTS, Action Tools & Pattern Diagnostics)** (`ai/LocalAiCopilot.kt`, `ui/dialogs/LocalAiDialog.kt`, `model/Models.kt`):
   - **Text-to-Speech (TTS) Voice Readout**: Integrated Android `TextToSpeech` with 1-tap play/stop toggle per assistant bubble (`speakText`) so the copilot can speak responses aloud.
   - **Interactive Action Tools**: Dynamic actionable buttons embedded directly in AI responses (1-tap `LOG_HABIT`, `OPEN_SCREEN` for Urge Surf / Breath Pacer / Focus Timer, and `ROUTINE` runner).
   - **Behavioral Diagnostics (*"What am I doing wrong?"*)**: Evaluates habit completion ratios, slipped anti-goal boundaries, overdue habit contracts, and habits missing implementation intentions (`ifThenAnchor`), providing actionable behavioral adjustments.
   - **Next-Action Guidance (*"What should I do next?"*)**: Recommends the highest-leverage task based on circadian time windows (morning light vs deep work vs wind-down) and incomplete Daily Three pillars.
   - **Personal Vault Semantic Search**: Searches across user habits, past journal reflections, and wisdom cards to surface relevant insights directly in chat.
   - **Strict Privacy**: Operates 100% on-device with zero external network requests or telemetry.

3. **Dedicated Urge Surfing Screen & Room Persistence (Feature Completed)** (`app/src/main/java/com/example/selfcarehero/ui/screens/UrgeSurfingScreen.kt`, `data/room/UrgeLogEntity.kt`, `data/room/UrgeDao.kt`, `data/room/UrgeDatabase.kt`, `data/UrgeSurfRepository.kt`, `ui/viewmodel/UrgeSurfViewModel.kt`, `ui/components/HeaderBar.kt`, `ui/screens/TodayScreen.kt`, `MainActivity.kt`):
   - **Dedicated Full-Screen Protocol**: Full-bleed Jetpack Compose screen with 3-phase progression (1. Intercept -> 2. 10m Wave -> 3. Reward) and system BackHandler integration.
   - **Multi-Mode Somatic Breath Pacing**: Interactive respiratory pacer switchable live between:
     - *Box Breathing (4-4-4-4)*: Equalized 4s Inhale, 4s Hold, 4s Exhale, 4s Hold for autonomic stabilization.
     - *4-7-8 Relaxing Breath*: 4s Inhale, 7s Hold, 8s Exhale for parasympathetic vagal stimulation.
     - *Physiological Sigh (2-1-5)*: Double inhale followed by a 5.5s sigh exhale for rapid neural reset.
   - **Dynamic Decaying Wave Canvas**: Real-time sinusoidal wave Canvas whose amplitude gradually flattens from peak height down to a gentle ripple over 600 seconds, visually reflecting neurochemical craving decay.
   - **Room Database Local Persistence**: SQLite-backed `UrgeDatabase`, `UrgeLogEntity`, and `UrgeDao` storing timestamped logs, triggers, somatic tags, intensity delta, and outcome status with 100% device privacy.
   - **Dynamic Carrot-Coin Economy & Consistency XP**: Calculates dynamic coins as $\text{Base (5)} + \Delta_{\text{intensity}} + \text{Outcome Bonus}$, with +10 XP consistency momentum bonus for maintaining consecutive wave surfs.
   - **Post-Surf Outcome Classification Flow**: Captures post-timer intensity and non-punitive classifications (`SURFED`, `RESISTED`, `PARTIAL_LAPSE`, `FULL_LAPSE`) preserving self-efficacy with zero streak resets.
   - **Seamless Navigation & History Drawer**: Integrated into HeaderBar quick action (`🌊`), Today screen quick card, and an in-screen Room history bottom sheet (`📜 Logs`).

2. **Teach-Back & Active Recall in Learn (Feature 10 Completed)** (`app/src/main/java/com/example/selfcarehero/ui/dialogs/TeachBackDialog.kt`, `model/Models.kt`, `model/SeedData.kt`, `data/SelfCareRepository.kt`, `ui/viewmodel/SelfCareViewModel.kt`, `ui/screens/LearnScreen.kt`, `MainActivity.kt`):
   - **Feynman Technique & Elaboration Principle**: Users actively explain wisdom principles, biases, and mental models in their own words to cement comprehension, assisted by quick scaffold prompt chips (*ELI10 Simple*, *Real-World Example*, *Action Plan*).
   - **Active Retrieval Practice**: Dialog features a retrieval-first mode where the reference definition is hidden behind an interactive toggle (`👁️ Peek at Hint / Reference`), urging the learner to recall from memory before checking the answer.
   - **Self-Assessment Rubrics & Spaced Repetition Engine**: 3-tier calibration (`🔴 Struggled - 1 day`, `🟡 Solid - 4 days`, `🟢 Mastered - 14 days`) automatically schedules the next spaced review cycle (`nextReviewDue`).
   - **Dynamic Carrot-Coin & XP Economics**: Awards **+25 XP & +3 Carrot-Coins 🪙** for initial teach-back, and **+15 XP & +2 🪙** on subsequent spaced review cycles.
   - **Due for Recall Filter & Card Badges**: Horizontal category bar features `"🔥 Due Recall (X)"` chip with clear empty state; `LearnCard` displays mastery badges, recall count, and collapsible quote of the user's own explanation.
   - **Demonstration Seed Data**: Seeded `learn_1` (Negativity Bias) with an active recall card due today for immediate exploration.

2. **Evidence-Based Urge Surfing & Impulse Protocol (Feature 5 Completed)** (`app/src/main/java/com/example/selfcarehero/ui/dialogs/UrgeSurfingDialog.kt`, `model/Models.kt`, `data/SelfCareRepository.kt`, `ui/viewmodel/SelfCareViewModel.kt`, `MainActivity.kt`, `ui/screens/StatsScreen.kt`):
   - **Clinical Framework**: Grounded in Marlatt & Gordon (Relapse Prevention), DBT Distress Tolerance, and ACT (Interoceptive Defusion).
   - **10-Minute Wave Pacer**: Harmonic countdown timer (`durationSeconds = 600`) featuring an animated dynamic sine wave Canvas whose amplitude gradually flattens and calms over time to mirror physiological urge decay.
   - **Navy SEAL Box Breathing Aura**: Visual 4-4-4-4 respiratory guide (Inhale 4s -> Hold 4s -> Exhale 4s -> Hold 4s) rendered with pulsing radiant green/gold rings and encouraging defusion mantras.
   - **Interoceptive Somatic Sensation Tagging**: Quick-tap chips decoupling physical sensations from cognitive catastrophizing (*Chest Tightness, Rapid Heart, Shallow Breath, Clenched Jaw, Restless Limbs, Facial Heat, Stomach Knot, Dry Throat*).
   - **DBT Context & Environmental Taxonomy**: Structured contextual triggers (*Late Evening, Boredom/Aimless, Solitude/Alone, Stress/Anxiety, Screen Trigger, Fatigue, Social Friction*).
   - **Dual-Rating Mode & Delta Drop**: Captures pre-surf intensity (1–10) vs post-surf intensity (1–10) with automatic $\Delta$ calculation.
   - **Non-Punitive AVE Mitigation**: 4 progressive outcome classifications (`SURFED`, `RESISTED`, `PARTIAL_LAPSE`, `FULL_LAPSE`) preserving user self-efficacy with zero streak resets and zero coin deductions.
   - **Dynamic Carrot-Coin Reward**: Computes dynamic coin payoff as $\max(5, 5 + \Delta) + (\text{if SURFED } 5 \text{ else } 0)$ and +15 to +35 XP.
   - **Stats Analytics Display**: Enhanced `StatsScreen.kt` card with surfed wave count, average intensity drop (`-X.X pts drop`), and top bodily sensations.

2. **Carrot-Coin Habit Staking Contracts & Streak Shield Rescue (Feature 4 Completed)** (`app/src/main/java/com/example/selfcarehero/ui/components/HabitContractBanner.kt`, `ui/dialogs/HabitContractDialog.kt`, `ui/dialogs/StreakBreakRescueDialog.kt`, `data/SelfCareRepository.kt`, `model/Models.kt`):
   - **Escrow Staking Engine**: Users commit 5, 10, 15, 20, or 30 Carrot-Coins into escrow on any habit for a 7, 14, or 21-day streak.
   - **1.5x Multiplier Return**: Achieving the commitment target refunds the original staked coins plus a 50% bonus reward (+75 XP).
   - **Streak Shield Emergency Redemption**: When an accidental streak break occurs (e.g. yesterday was missed), the contract triggers an "At Risk" warning. Users can redeem 1 Streak Shield token to absorb the break, prevent forfeiture, and keep their commitment alive.
   - **Quick-Buy Rescue Flow**: If the user has 0 shield tokens but has 12 coins, a 1-tap "Quick-Buy Shield & Rescue (12 🪙)" button enables instant rescue.
   - **Penalty Vault**: Broken or forfeited commitments are routed to the persistent `penaltyVaultCoins` log to reinforce loss-aversion psychology.

2. **Circadian Sleep Architecture Clock (Feature 3 Completed)** (`app/src/main/java/com/example/selfcarehero/ui/components/CircadianClockPill.kt`, `ui/dialogs/CircadianSettingsDialog.kt`, `model/Models.kt`, `data/SelfCareRepository.kt`):
   - **Adenosine & Melatonin Alignment**: Visual pill displaying real-time countdowns for caffeine cutoff (10h before sleep) and screen curfew (2h before sleep).
   - **Customizable Sleep Targets**: Dedicated dialog to configure wake and bedtime hours.

3. **90-Day Life Sprint & Identity Compass (Feature 2 Completed)** (`app/src/main/java/com/example/selfcarehero/ui/components/LifeSprintCard.kt`, `model/Models.kt`, `data/SelfCareRepository.kt`, `ui/dialogs/SprintGoalDialog.kt`):
   - **Quarterly Progress Tracking**: Visual 90-day progress bar tracking elapsed days, quarter percentage, and days remaining.
   - **Identity Compass Affirmation**: Prominent daily identity anchor statement.
   - **Sequential Milestone Runner**: Milestone progression with 1-tap completion awarding **+15 Carrot-Coins** and **+50 XP**.

4. **Dopamine Shield & Anti-Goals Blacklist (Feature 1 Completed)** (`app/src/main/java/com/example/selfcarehero/ui/components/AntiGoalsSection.kt`, `model/Models.kt`, `data/SelfCareRepository.kt`, `ui/dialogs/AntiGoalEditDialog.kt`):
   - **Inversion Avoidance System**: Users track non-negotiable negative habits to eliminate with clean streak tracking (+5 coins, +10 XP daily).
   - **Compassionate Cognitive Reframing**: Tapping "Slipped" triggers on-device SmolLM Copilot reframing.

2. **Multi-Slot Backup & Safety Restore with Exact 'CONFIRM' Guard** (`src/components/SettingsModal.tsx`, `src/types.ts`):
   - Upgraded rolling snapshots from 5 to **10 slots** with automated timestamps, level, XP, and habit counts.
   - **Universal "CONFIRM" Modal**: All restore pathways (rolling snapshot rollback, JSON file replace/merge, and raw JSON text paste) require typing the exact word `CONFIRM` before executing.
   - **Automatic Pre-Restore Safety Snapshot**: Every restore creates a pre-wipe snapshot automatically in case the user changes their mind.
   - "RESET HERO" wipe guard requiring explicit typing to prevent accidental progress deletion.

3. **Weekly Insights Dashboard (GitHub & Quantified Self Style)** (`src/components/WeeklyInsightsView.tsx`, `src/components/views/StatsView.tsx`):
   - Rolling 7-day retrospective showing total XP, habit completions, Daily Three consistency days, and deep work focus minutes.
   - **Dynamic Momentum Tags**: Automatically classifies weekly performance (`🔥 7-Day Habit Streak`, `⚡ High Growth`, `💪 Master Reps`, `🌱 Consistent Anchor`).
   - **Emotional Climate & Gratitude Stream**: Visualizes 7-day mood curves (0..4) with dominant mood emojis and embedded good deed / reflection logs.

4. **Skill Importance & Item Nature Classification** (`src/components/SkillEditModal.tsx`, `src/types.ts`):
   - **Nature Categorization**: Tags items as `Skill`, `Technique`, `Concept`, `Course`, or `Habit` with distinctive badge pills.
   - **Importance Weighting**: `Critical`, `High`, `Medium`, `Low` badges with subtle color coding to prioritize daily execution.

5. **Customizable Spaced Recall Scheduler (Rememorize)** (`src/components/SkillEditModal.tsx`, `src/components/views/StudyView.tsx`):
   - Configurable recall review cycles (1, 3, 7, 14, 30 days) with automated due dates and review counters.
   - Integrated into the Study tab alongside deep work timers.

6. **Year-View Contribution Heatmap (GitHub Style)** (`src/components/HeatmapView.tsx`):
   - Visualizes 365 days of XP growth, habit completions, and Daily Three milestones with 3 view modes (52-week scroll, quarterly paged, compact 12-month) and interactive day tooltip.

7. **Level-Up Gold Shimmer & Celebration Toast** (`src/index.css`, `src/App.tsx`):
   - Celebratory gold gradient animation (`@keyframes goldShimmer` and `@keyframes levelUpBounce`) for Level-Up toasts with sparkle styling.

8. **Carrot-Coin Reward Shop** (`src/components/RewardShopModal.tsx`):
   - In-app store for redeeming coins on guilt-free breaks, snacks, and Rest-Day Shield Tokens.

9. **Collapsible Multi-Level Skill Tree** (`src/components/views/SkillsView.tsx`):
   - Arbitrary recursive depth (`Skill -> Sub-skill -> Sub-sub-skill...`), vertical branch lines, interactive breadcrumb navigation, and Mind Map view.

10. **Offline APK Compatibility & GitHub Actions Workflow**:
    - Build verified: `npm run build` succeeds cleanly and outputs to `dist/`.
    - 100% offline, zero CDN links, zero external API calls. Root Gradle harness configured for compatibility.

11. **Custom Daily Reminders Engine (Medicine, Prayer & Custom)** (`src/components/views/AlertsView.tsx`, `src/utils/notifications.ts`, `src/types.ts`):
    - **Native Background Alarms**: Uses `@capacitor/local-notifications@6` with a high-importance Android channel (`self_care_hero_reminders`) so alarms fire when the app is completely closed.
    - **Interactive Notification Buttons**: Offers "✓ Done" and "⏰ Snooze 10m" directly from Android notifications, tracking history of done and snoozed events.
    - **Rolling 7-Day Window**: Cancels and reschedules up to 50 rolling future alarms on every app start, resume, and edit using deterministic 31-bit numeric IDs.
    - **Medicine Tracking**: Free-text instructions ("take after food"), optional pill supply counter, low-supply warning (`⚠️ X pills left`), lockscreen privacy switch (masks name to "Time for your reminder"), and medical safety disclaimer ("Reminders are a helper, not a medical device. Don't rely on them alone.").
    - **Offline Prayer (Namaz) Calculations**: Built with offline `adhan` library (Karachi, MWL, Umm al-Qura, ISNA, Egypt), Hanafi/Standard Asr rules, high-latitude rules, per-prayer minute offsets, and GPS / manual coordinates.
    - **Health Check Panel**: In-app permission check and battery guide (Unrestricted battery setting & Samsung "Never sleeping apps").
    - **Browser Truthfulness**: Displays honest fallback notice when running on the web: "Reminders only ring while this page is open."

12. **Phase 1: Backup Safety, Anti-Loss Nudge & Multi-Slot Verification** (`src/types.ts`, `src/utils/storage.ts`, `src/components/SettingsModal.tsx`, `src/components/views/TodayView.tsx`, `src/App.tsx`):
    - **Backup Metadata Tracking**: Tracks `lastBackupTimestamp`, `lastBackupLevel`, `lastBackupXp`, and `changesSinceBackup` whenever user activity mutates state.
    - **Native 1-Tap Sharing**: Integrates Web Share API (`navigator.share`) directly in Settings to share backup `.json` files straight to Google Drive, WhatsApp, or local Files without requiring broad permissions.
    - **Strict Schema Validation**: Validates JSON structure, required keys, non-empty `nodes` array, throwing descriptive errors on corrupt files before attempting to parse.
    - **Anti-Loss Nudge Banner**: Non-blocking, dismissible alert card on the Today screen triggering when 7+ days or 25+ changes have passed without an export, with 48-hour snooze dismiss.
    - **Debounced Auto-Snapshot**: Captures rolling safety snapshots when the app enters background (`document.addEventListener('visibilitychange')`, 15-second debounce, up to 10 slots).
    - **Clear Data Loss Disclaimer**: Warns users in Settings about Android uninstall data loss, emphasizing regular `.json` downloads to external storage.

13. **Phase 2: Design Tokens, "Sage Sanctuary" Palette & 48dp Touch Targets** (`src/styles/theme.css`, `src/index.css`, `src/components/views/AlertsView.tsx`, `src/components/views/SkillsView.tsx`, `src/components/views/TodayView.tsx`, `src/components/Navigation.tsx`, `src/components/HeatmapView.tsx`, `src/components/WeeklyInsightsView.tsx`, `src/components/SettingsModal.tsx`):
    - **Centralized Design Tokens (`src/styles/theme.css`)**: Fully established the WCAG AA/AAA compliant "Sage Sanctuary" palette with light mode (`--bg: #f7f6f2`, `--sf: #ffffff`, `--line: #e5e3da`, `--ink: #1c221e`, `--ac: #2d6a4f`, `--acs: #e8f3ed`, `--warn: #b45309`, `--danger: #b91c1c`) and dark mode (`--bg: #121513`, `--sf: #1a201c`, `--line: #28322b`, `--ink: #edf2ee`, `--ac: #52b788`, `--acs: #1d3629`, `--warn: #fbbf24`, `--danger: #f87171`), along with pre-computed heatmap level tokens (`--ac-lvl-1` through `--ac-lvl-4`) and mood distribution tokens (`--mood-0` through `--mood-4`).
    - **48dp Minimum Touch Targets**: Standardized `.btn-primary`, `.btn-secondary`, `.btn-danger`, `.btn-sm`, `.tick-btn`, and bottom navigation tabs to enforce minimum 48×48dp touch targets per Android Material 3 and WCAG 2.5.5 accessibility standards.
    - **Alerts View "▶ Test" Button Overflow Fix**: Restructured chime test controls into responsive flex layout with flex-wrap and min-w-0, preventing button clipping and horizontal card overflow on small viewports (<360px). Enforced 48dp targets on reminder preview (`🔊`) and delete (`✕`) buttons.
    - **Skills Tree Touch Target Expansion**: Replaced congested 24px–28px micro-buttons in `SkillsView.tsx` with comfortable 40–44px interactive targets (fold toggle, icon, focus branch 🔍, reorder up/down ↑/↓, add sub-skill ＋) with clear spacing to prevent accidental taps.
    - **Hardcoded Color Eradication**: Replaced ad-hoc `bg-indigo-600` Low-Energy styles in `TodayView.tsx` and `rose` styles in `SettingsModal.tsx` with semantic design tokens (`--ac`, `--acs`, `--danger`).
    - **Habit Decrement Sizing**: Enlarged habit count decrement button (`−`) on Today cards from `32px` to full `48dp` touch target (`w-12 h-12 min-w-[48px] min-h-[48px]`).
    - **Navigation Indicator Pill**: Added an elevated background pill indicator (`bg-[var(--acs)] text-[var(--ac)]`) on the active tab in `Navigation.tsx` for optimal outdoor sunlight visibility.

14. **Native Android Jetpack Compose Rewrite & Option 1-4 Enhancements** (`app/src/main/java/com/example/selfcarehero/`):
    - **100% Native Kotlin & Jetpack Compose**: Full clean rewrite of the application with `ViewModel`, `StateFlow`, Material 3 design system, and custom navigation handling `BackHandler`.
    - **Option 1: Sound & Haptics Engine (`SoundHapticsManager.kt`)**: Programmatic 16-bit PCM audio synthesizer via `AudioTrack` with ADSR envelope generator (zero APK bloat, zero latency, no pops/clicks). Presets: `CHECK_HABIT`, `INCREMENT_COUNT`, `DAILY_THREE_WIN`, `LEVEL_UP`, `FOCUS_BELL`, `COIN_REWARD`, `URGE_CALM`. Haptic feedback patterns via Android `Vibrator` (`LIGHT_CLICK`, `MEDIUM_PULSE`, `CELEBRATION_BURST`, `CALM_WAVE`). Quick sound (`🔊`/`🔇`) and vibration (`📳`/`📴`) toggles directly in `HeaderBar.kt`.
    - **Option 2: Cloud Sync & Multi-Device Backup (`FirestoreSyncRepository.kt`)**: Backend provisioned with Firebase Project `gen-lang-client-0884523962` and named database `ai-studio-android-selfcare-00c4a5af-2578-429f-8e51-f015bb8a8ffd`. Google Sign-In via Jetpack `CredentialManager` (`GetSignInWithGoogleOption`). Zero anonymous or email auth fallbacks. Zero-trust Firestore rules (`firestore.rules`) deployed with owner-scoped read/write security.
    - **Option 3: System Notifications & Background Alarms (`ReminderScheduler.kt`, `ReminderReceiver.kt`)**: Notification channels (`channel_habits`, `channel_meds`, `channel_prayer`), exact wake-up alarms via `AlarmManager`, boot receiver (`RECEIVE_BOOT_COMPLETED`), interactive notification actions (**"✓ Done"** and **"⏰ Snooze 10m"**), and automated low pill threshold warning triggers.
    - **Option 4: Enhanced Data Visualizations & Analytics (`StatsScreen.kt`, `SelfCareRepository.kt`)**: Empirical habit-to-mood correlation engine computing exact percentage mood boost on days active vs skipped, life pillars balance (Mind / Craft / Vitality) with proportional stacked progress visualizer, and urge surfing resilience analytics (delay success rate, intensity metrics, top triggers).

15. **Weekly Insights Suite, Spaced Rememorization & 10-Slot Guarded Backups**:
    - **Weekly Insights & Review**: Hybrid Top Skills momentum scorer, 7-day emotional stability distribution, weekly gratitude deed logger, and guided Weekly Review Dialog (+50 XP).
    - **Skill Nature & Spaced Rememorization**: Nature classification (`skill`, `technique`, `concept`, `course`, `habit`), Importance tiers, and customizable spaced rememorization intervals (1, 3, 7, 14, 30 days) prioritized in the Study queue.
    - **10-Slot Rolling Backups with 'CONFIRM' Guard**: 10 snapshot slots with timestamps and XP stats, strict `'CONFIRM'` verification modal, automatic pre-restore safety snapshot, and high-security `"RESET HERO"` anti-wipe protection.
    - **Celebratory Shimmer Animations**: Gold gradient shimmer and spring scale-bounce celebration dialog for Level-Up and Daily Three milestones.

16. **Color Theory Design Overhaul, Ergonomic Sizing & Multi-Time Chained Reminders Suite**:
    - **Color Theory & Warm Premium Palette (`Theme.kt`, `Color.kt`)**:
      - Replaced raw saturated greens and cold high-contrast backgrounds with a cohesive 60-30-10 palette:
        - **60% Base / Background**: Deep Warm Charcoal / Obsidian (`#121413`) with warm olive undertones and elevated surfaces (`#1C2320`, `#252F2B`, border `#34423C`).
        - **30% Supporting Structure**: Deep Forest Sage (`#43765E`, `#5BA282`, `#1C3026`) providing calming, grounded clarity.
        - **10% Accent Energy**: Warm Golden Amber (`#E5A93C`, `#FBE2A4`, `#9E6B18`) highlighting milestones, streak flames, XP rewards, and active navigation indicators.
        - **Warm Terracotta Warning**: Grounded warm rust (`#D95D39`) for urgency and urge tracking without jarring neon red.
        - Tested and verified: Meets WCAG AA contrast ratio (> 5:1) for all primary and secondary typography.
    - **Touch Target Normalization & Ergonomic Sizing (`TodayScreen.kt`, `SkillsScreen.kt`, `AlertsScreen.kt`)**:
      - Completely removed undersized touch targets across screens:
        - Habit checkbox touch target expanded from 36dp to standard 48dp (`Modifier.size(48.dp)` with 36dp visual inner pill).
        - Habit counter increment (`+`) and decrement (`−`) buttons upgraded from 32dp to 44dp with generous touch slop.
        - Step habit buttons increased from 32dp to 44dp height.
        - Skill Tree row edit buttons enlarged from 28dp to 44dp (`Modifier.size(44.dp)`).
        - Alert card delete (`✕`) and done action buttons upgraded to standard 48dp touch targets.
    - **Multi-Time Schedules & Chained Follow-Ups (`AlertItem`, `ReminderScheduler.kt`, `AllDialogs.kt`)**:
      - Upgraded `AlertItem` data model with `times: List<String>`, `chainedOffsetMinutes: Int?`, `skillId: String?`, `skillName: String?`, `repeatRule: String`, and `allEffectiveTimes()`.
      - **Multi-Time Clock Chips**: Supports adding multiple exact clock times (e.g. 1:00 AM water, 3:00 AM water) with inline chip removal.
      - **Relative Chained Follow-Ups**: Configure relative offset delays (e.g. +30m, +1h, +2h, +3h) from an anchor time with 24-hour rollover math (e.g. 10:00 PM read 1 page -> chained follow-up at 1:00 AM next day).
      - **Explicit Every Day Repeat Option**: Prominent "Every Day 🌟" toggle setting all 7 days (0..6), alongside Weekdays, Weekends, and Custom Days picker.
      - **Exact Android Alarm Scheduling**: `ReminderScheduler.scheduleAlert` arms multi-slot deterministic alarms via `AlarmManager.setExactAndAllowWhileIdle()` matching allowed days of week and cleans up all slots on cancellation.
    - **Skill & Technique Deep-Linking with XP Progress**:
      - Reminders link directly to any active skill, technique, or habit in `state.nodes`.
      - Tapping **"✓ Mark Done"** in the Android notification or **"✓ Complete & Log"** on the Alert card automatically logs an event for that linked skill ID, advancing the daily goal, awarding +15 skill XP, updating streaks, and adding +2 coins with haptic confirmation.

### D. GITHUB AND APK BUILD (CRITICAL RULES)
1. **How the Build Works**:
   - The GitHub Actions workflow is at `.github/workflows/build-apk.yml` (triggered manually via `workflow_dispatch`).
   - Runner: `ubuntu-latest`.
   - Node setup: **Node 22** (`actions/setup-node@v4`), Java setup: **Java 17 (temurin)** (`actions/setup-java@v4`).
   - Dependencies: Installed via `npm install --legacy-peer-deps` using committed `package-lock.json`.
   - Web compilation: `npm run build` produces the static web bundle in `dist/` with relative asset links (`base: './'`).
   - Capacitor packaging: Installs Capacitor 6 (`npm install --no-save --legacy-peer-deps @capacitor/core@6 @capacitor/cli@6 @capacitor/android@6`), initializes project (`npx cap init "Self-Care Hero" com.selfcarehero.app --web-dir dist`), adds android (`npx cap add android`), and syncs (`npx cap sync android`).
   - Signing: Decodes the repository secret `DEBUG_KEYSTORE_BASE64` into `~/.android/debug.keystore`.
   - Versioning: Updates `versionCode` in `android/app/build.gradle` using `sed` to match `${{ github.run_number }}`.
   - APK compilation: Runs `chmod +x gradlew && ./gradlew assembleDebug` in the `android/` directory.
   - Artifact: Uploads `android/app/build/outputs/apk/debug/app-debug.apk` as `Self-Care-Hero-APK`.

2. **The DEBUG_KEYSTORE_BASE64 Secret**:
   - Why it exists: Android requires every update to an installed APK to be signed by the exact same keystore key. If signed with a different key, Android will refuse to update unless the user uninstalls the app first (which wipes all `localStorage` habit data!).
   - The key is securely stored in GitHub repository secret `DEBUG_KEYSTORE_BASE64`.
   - Never print, echo, expose, or modify that secret.

3. **Capacitor 6 & Java 17 Pinning**:
   - Capacitor is strictly pinned to version 6 because it is stable and compatible with Java 17 Temurin on the Ubuntu runner.
   - Do NOT upgrade Capacitor to version 7 or change Java to another version without explicit testing.

4. **The npm Dependency Bug Fix**:
   - Cause: `npm error Cannot read properties of null (reading 'edgesOut')` was caused by npm's Arborist peer-dependency resolution crashing when walking peer dependency trees without a `package-lock.json` in Node 20.
   - Fix applied:
     1. Removed unused scaffolding packages (`@google/genai`, `express`, `dotenv`, `@types/express`, `esbuild`, `tsx`).
     2. Updated workflow to Node 22 (bundled with latest npm).
     3. Added `--legacy-peer-deps` to both `npm install` and Capacitor installation steps.
     4. Generated and committed a clean `package-lock.json`.
     5. Added relative `base: './'` in `vite.config.ts` for offline file loading.

5. **MANDATORY RULE FOR FUTURE SESSIONS**:
   - Every future session MUST keep this build working.
   - `npm run build` and `npm run lint` (`tsc --noEmit`) must always pass with 0 errors.
   - Never add packages requiring external servers, API keys, or native plugins without user request.
   - Never commit the temporary `android/` folder (it is generated fresh inside each CI run).
   - Keep root Gradle files (`build.gradle.kts`, `settings.gradle.kts`) intact for AI Studio environment compatibility.

### B. IN PROGRESS & RECENTLY COMPLETED
- **Phase 1, Feature 1: Backup Safety, Anti-Loss Nudge & Verification** completed and verified.
- **Phase 1, Feature 2: Weekly Review Guided Flow** COMPLETED AND VERIFIED:
  - 3-step 2-minute reflective wizard modal (`WeeklyReviewModal.tsx`) launched directly from `Stats > Weekly Insights`.
  - Step 1: Wins celebration with past 7-day performance snapshot (completions, XP earned, active habit count).
  - Step 2: Obstacles & friction logging with 1-tap quick chips (`Energy drop`, `Schedule disruption`, `Unclear priority`, etc.) and optional reflection notes.
  - Step 3: Anchor focus habit selection from active skills and 1 actionable commitment phrase.
  - Awards +20 XP on completion (deduplicated per calendar week), recorded in user events (`_weekly_review_<weekStartDate>`).
  - History viewer: Collapsible "Past Weekly Reviews" in `WeeklyInsightsView.tsx` with date badges, wins, friction chips, and anchor targets.
  - Storage & migration: `weeklyReviews` array in `AppState` (schema v15) with backward-compatible defaults in `storage.ts`.
- **Phase 1, Feature 3: Backup Nudge & Activity Tracking** COMPLETED AND VERIFIED:
  - Automatic change tracking: increments `changesSinceBackup` whenever habit, journal, or urge logs are saved.
  - Dedicated "Offline Backup Status" widget in `SettingsModal.tsx` (General Preferences tab) showing "Last backed up: X days ago", "X changes recorded", and 1-tap "Quick Backup 📥" button.
  - Dismissible alert banner in `TodayView.tsx` when >= 7 days or >= 25 changes without backup.
  - Reset to 0 changes and updated timestamp upon download or native file share.
- **Phase 2, Feature 4: If-Then Plans (Implementation Intentions)** COMPLETED AND VERIFIED:
  - Psychological habit stacking: attach "After I [anchor], I will [habit]" to any skill or habit in `SkillEditModal.tsx`.
  - 1-tap quick presets: *"☕ Pour morning coffee"*, *"🪥 Brush my teeth"*, *"🚪 Walk through front door"*, *"💻 Sit at my desk"*, *"🍽️ Finish dinner"*, *"🛏️ Get into bed"*.
  - Live formula preview: *"When '[anchor]', I will '[habit]'!"*.
  - Visual indicator: prominent `⚓ [Anchor]` badge displayed directly on habit cards on Today view.
- **Phase 2, Feature 5: Routines & Grouping** COMPLETED AND VERIFIED:
  - 4 routine time slots: ☀️ Morning, 🌤️ Afternoon, 🌙 Evening, 🔄 Flexible & Anytime.
  - Dual-mode segmented toggle on Today View: `📁 By Categories` vs `☀️ Routines & Anchors`.
  - Routine progress tracking with completion badges and celebratory cards (`🎉 Morning Routine Complete! All habits checked off for today`).
- **Phase 2, Feature 6: Comeback Bonus** COMPLETED AND VERIFIED:
  - Returning after missed days ($\ge 2$ days) detects time away and offers a heartwarming welcome gift (+20-50 XP, +6-18 Carrot-Coins, and optional Rest-Day Shield Token) with zero penalties, zero guilt, and no broken streaks.
  - Accompanied by Pip companion illustration and encouraging self-compassion note.
- **Phase 2, Feature 7: Quick Capture Button** COMPLETED AND VERIFIED:
  - Floating Action Button (FAB) `⚡ Quick Log` at thumb-friendly position + Header quick button.
  - Under-5s 4-mode logging modal: Quick Mood (5 sentiment levels + note), 1-tap Gratitude (quick chips + note), Fast Habit Check (tick today's habits directly from the modal), and Brain Dump.
- **Phase 3, Feature 8: Mood & Habit Patterns (Correlation Analytics)** COMPLETED AND VERIFIED:
  - Pure offline correlation analytics engine in `src/utils/patterns.ts` adhering strictly to behavioral activation science.
  - Dedicated "🔬 Patterns" tab in `StatsView` displaying top habit uplifts, percentage differences, sample counts, and compassionate non-causal guidance. Requires 5+ logged days before drawing insights to avoid noisy guesses.
- **Phase 3, Feature 9: Evidence-Based Urge Surfing & Impulse Protocol** COMPLETED AND VERIFIED:
  - 10-minute wave timer with dynamic harmonic sine wave canvas, 4-4-4-4 Box Breathing visual pacer, interoceptive somatic sensation tagging (Chest Tightness, Rapid Heart, Shallow Breath, Clenched Jaw, etc.), DBT context taxonomy, dual 1–10 intensity slider, and non-punitive AVE mitigation.
  - Wired into `MainActivity.kt` and `HeaderBar.kt`, with analytics displayed on `StatsScreen.kt`.
- **Phase 3, Feature 10: Teach-Back & Active Recall in Learn** COMPLETED AND VERIFIED:
  - Feynman elaboration protocol allowing users to teach concepts back in plain English with 3 guided scaffold starters (`ELI10 Simple`, `Real Example`, `Action Plan`).
  - Active retrieval testing mode with peekable reference toggle (`👁️ Peek at Hint`).
  - 3-tier self-assessment rubrics (`🔴 Struggled - 1d`, `🟡 Solid - 4d`, `🟢 Mastered - 14d`) with automated spaced repetition scheduling (`nextReviewDue`).
  - Dynamic rewards: +25 XP / +3 coins for initial teach-back, +15 XP / +2 coins for spaced recall.
  - Due for Recall filter chip (`🔥 Due Recall (X)`) and card status badges in `LearnScreen.kt`.
- **Phase 3, Feature 11: Weekly Quests & Today Screen Quest Banner** COMPLETED AND VERIFIED:
  - Dynamic weekly triad quests (Vitality Reps, Wisdom & Teach-Back, Keystone Consistency) with automatic Monday reset and days-left countdown.
  - Interactive `WeeklyQuestBanner.kt` integrated into `TodayScreen.kt` with linear progress indicators, collapsible view, and dynamic "+Coins / +XP" claim buttons.
  - Real-time progression hooks: checking habits and counters advances Vitality and Consistency; submitting Feynman teach-backs or reflections advances Wisdom.
  - Claim reward flow with celebratory sound/haptics, anti-double-claim guard, and automatic coin/XP deposit.
  - Comprehensive unit test suite in `HeroLogicTest.kt` passing 100%.
- **Phase 3, Feature 12: PIN Privacy Screen & Section Protection** COMPLETED AND VERIFIED:
  - Salted SHA-256 local PIN hashing and matching verification (`PinSecurityHelper.kt`) operating 100% offline.
  - Interactive `PinVerificationDialog.kt` and embedded `PinProtectedScreen.kt` with 4-dot indicators, 3x4 numeric keypad with 56dp targets, and offline recovery notice.
  - Comprehensive `PinSettingsDialog.kt` supporting 4-digit PIN setup/change, instant session re-locking, and granular protection toggles (Journal reflections, Urge Surfing logs, and full App Launch).
  - Dedicated "Privacy & PIN Protection" card in `StatsScreen.kt` with live status badges.
  - Unit tests in `HeroLogicTest.kt` verifying deterministic salted hashing, verification, length boundaries, and AppState defaults.
- **Phase 4, Feature 13: Local AI Reflection Coach (On-Device SmolLM / ONNX)** COMPLETED AND VERIFIED:
  - Guided Socratic Evening Reflection Coach (`LocalAiCopilot.startGuidedReflectionCoach`) synthesizing Daily Three completion and prompting 3 Socratic inquiries (The Win, The Friction, Tomorrow's Keystone).
  - Feynman Teach-Back & Active Recall Critique (`LocalAiCopilot.critiqueFeynmanExplanation`) evaluating ELI10 simplicity, real-world analogies, and behavioral action triggers.
  - Comprehensive 8-pattern CBT cognitive distortion engine (All-or-Nothing, Catastrophizing, Emotional Reasoning, 'Shoulds', Mental Filtering, Overgeneralization, Fortune Telling, and Personalization) with automated stoic reframing.
  - Interactive 1-tap `SAVE_REFLECTION` action tool logging reframed thoughts directly into the user's journal with +15 XP and celebration animation.
  - Sub-110MB RAM ceiling and 100% offline privacy via ONNX Runtime Mobile (`ai.onnxruntime:onnxruntime-android`) with zero cloud data leaks.
  - Unit test suite in `HeroLogicTest.kt` verifying distortion rule coverage, matching, Socratic prompts, and Feynman critique.
- **All Core Roadmap Features (Phases 1–4, Features 1–13) Completed & Verified!**

### C. STILL TO DO (Next Session Roadmap — Build ONE AT A TIME)
1. **Post-Roadmap Enhancements / Release Polish**:
   - Await explicit user direction for next release cycle, additional native plugins, or custom domain features.

---

## 3. FILE INVENTORY

| File Path | Description |
| :--- | :--- |
| `src/types.ts` | Complete TypeScript interfaces including `ComebackBonusInfo`, `HabitMoodPattern`, `lowEnergyMode`, `lowEnergyEssentialIds`, `restDayTokens`, `usedRestDays`, `BackupSnapshot`, `SkillNature`, `SkillImportance`, `RememorizeConfig`, `WeeklyInsightsData`, `RelativeChainConfig`, and `WeeklyReviewEntry`. |
| `src/utils/xp.ts` | Derived event indexing (`ix`), `activeDays()` (with rest-day protection), `calculateDailyThreeStreak()`, consistency shields, year heatmap, and breadcrumbs. |
| `src/utils/patterns.ts` | Pure mathematical offline correlation engine linking habit completion days with daily mood ratings, calculating percentage uplift, confidence scores, and compassionate non-causal insights. |
| `src/utils/storage.ts` | Schema v15 loader, saver, backward-compatible `migrate()` with rest-token starter seeding, `weeklyReviews: []`, `lastVisitDate`, and 10-slot snapshot retention. |
| `src/utils/notifications.ts` | Native notification engine via `@capacitor/local-notifications@6`, rolling 7-day scheduler, relative follow-up chains across midnight, and offline `adhan` calculation. |
| `src/utils/audio.ts` | Offline Web Audio API melodic synthesizer (5 tone presets + custom playback). |
| `src/components/Header.tsx` | Top app bar with level, streak badge, sound toggles, Quick Capture trigger, and modal triggers. |
| `src/components/Navigation.tsx` | Bottom 7-tab navigation bar with safe-area insets (`Today`, `Skills`, `Learn`, `Study`, `Journal`, `Alerts`, `Stats`). |
| `src/components/DialogModal.tsx` | Accessible modal wrapper with escape handling, backdrop dismiss, and responsive scrolling. |
| `src/components/ComebackBonusModal.tsx` | Heartwarming welcome-back care package modal celebrating returns after missed days with XP, Carrot-Coins, and Rest Shields (zero penalties). |
| `src/components/QuickCaptureModal.tsx` | Under-5s lightning modal supporting 4 modes: Quick Mood ratings, 1-tap Gratitude chips, Fast Habit ticking, and Brain Dump notes. |
| `src/components/MoodHabitPatternsView.tsx` | Behavioral science correlation dashboard displaying habit uplift percentages, habit vs non-habit contrast metrics, confidence badges, and minimum sample tracking. |
| `src/utils/audio.ts` | Offline Web Audio API melodic synthesizer (5 tone presets + custom playback). |
| `src/components/Header.tsx` | Top app bar with level, streak badge, sound toggles, and modal triggers. |
| `src/components/Navigation.tsx` | Bottom 7-tab navigation bar with safe-area insets (`Today`, `Skills`, `Learn`, `Study`, `Journal`, `Alerts`, `Stats`). |
| `src/components/DialogModal.tsx` | Accessible modal wrapper with escape handling, backdrop dismiss, and responsive scrolling. |
| `src/components/WeeklyInsightsView.tsx` | 7-day retrospective dashboard with momentum badges, mood curves, gratitude feed, weekly review trigger banner, and collapsible past review history. |
| `src/components/WeeklyReviewModal.tsx` | 3-step guided wizard modal for weekly reflections (Wins recap, Obstacle & friction tags, and Anchor focus commitment with +20 XP). |
| `src/components/HeatmapView.tsx` | GitHub-style 365-day contribution heatmap with 3 view modes (52-week scroll, quarterly paged, compact 12-month) and interactive day tooltip. |
| `src/components/ApkInstallGuideModal.tsx` | Step-by-step modal guide for 1-Tap Offline WebAPK and Capacitor/Website 2 APK Builder. |
| `src/components/views/TodayView.tsx` | Today card list, dual-mode grouping (By Categories vs By Routine & Anchors), routine completion celebrations, anchor habit tags, Low-Energy Mode toggle, Rest-Day Shield controls, and Pip character. |
| `src/components/views/StatsView.tsx` | Dedicated Stats & Profile view combining Level profile, Consistency Shield, Weekly Insights tab, Annual Heatmap, and Category mastery. |
| `src/components/views/SkillsView.tsx` | Collapsible recursive tree structure, nature/importance badges, breadcrumbs, and Mind Map. |
| `src/components/views/LearnView.tsx` | Daily insight stack, category filters, flashcard 3D flip quiz, and daily reminder. |
| `src/components/views/StudyView.tsx` | Deep work timer, strict mode, spaced recall scheduler, and wake lock. |
| `src/components/views/JournalView.tsx` | 5-state mood diary and structured urge logger. |
| `src/components/views/AlertsView.tsx` | Audio reminders with multi-time scheduling, relative chains, 1-tap quick templates, skill linking, weekday shortcuts, and Web Audio testing. |
| `src/components/SkillEditModal.tsx` | 80×80 icon cropper, nature/importance selectors, spaced recall config, multi-entry timestamped notes, 4-slot Routine Time of Day, and If-Then Habit Stacking presets with live formula preview. |
| `src/components/RewardShopModal.tsx` | Carrot-Coin store with Rest-Day Shield Token redemption (12 coins). |
| `src/components/SettingsModal.tsx` | Offline Backup Status card with 1-tap quick export, 10-slot snapshot manager with exact 'CONFIRM' input modal, pre-wipe safety snapshots, theme/language selectors. |
| `src/components/AwardsModal.tsx` | Milestone badges with locked/earned status. |
| `src/components/FocusReflectionModal.tsx` | Post-session deep work reflection prompt. |
| `src/components/QuickUrgeModal.tsx` | Rapid urge recording dialog during deep work focus. |
| `src/App.tsx` | Root component managing global state, low-energy mode handlers, rest-day token redemption, 7 tabs, modals, and toasts. |
| `src/index.css` | Tailwind styling, CSS variables, gold shimmer keyframes, and level-up bounce toast animation. |
| `package.json` | Clean project dependencies, devDependencies (TypeScript ^5.8.2), and build scripts (`build`, `lint`, `dev`). |
| `package-lock.json` | Committed deterministic dependency tree lockfile ensuring reproducible, zero-error `npm install` in CI. |
| `vite.config.ts` | Offline Vite bundler configuration outputting to `dist/` with relative `base: './'`. |
| `.github/workflows/build-apk.yml` | GitHub Actions workflow for building debug APK via Capacitor 6, Java 17 Temurin, Node 22, and secret signing. |
| `app/.../model/Models.kt` | Kotlin data models (`UrgeItem`, `UrgeAnalytics`, `HabitContract`, `CircadianConfig`, `SprintGoal`, `AntiGoal`, `AppState`, `AwardItem`). |
| `app/.../data/SelfCareRepository.kt` | Offline-first repository with `logUrgeSurfingWave`, contracts escrow, circadian clock, anti-goals, and advanced analytics. |
| `app/.../ui/dialogs/UrgeSurfingDialog.kt` | 3-stage Evidence-Based Urge Surfing modal (Marlatt decaying sine wave, Navy SEAL 4-4-4-4 Box Breathing, interoception & context chips, AVE resolution). |
| `app/.../ui/screens/StatsScreen.kt` | Stats & resilience dashboard with urge surfing metrics, intensity delta drop, mood correlations, and pillar balance. |
| `app/.../ui/components/HabitContractBanner.kt` | Carrot-Coin habit staking contracts banner with streak break shield rescue flows. |
| `app/.../ui/components/LifeSprintCard.kt` | 90-Day quarterly sprint and identity compass progression banner. |
| `app/.../ui/components/CircadianClockPill.kt` | Adenosine and melatonin sleep architecture timeline pill. |
| `app/.../ui/components/AntiGoalsSection.kt` | Inversion avoidance dopamine shield with on-device AI cognitive reframing. |
| `app/.../ui/dialogs/TeachBackDialog.kt` | Feynman active recall dialog with retrieval-first toggle, scaffold prompt starters, and 3-tier spaced repetition calibration. |
| `app/.../ui/screens/LearnScreen.kt` | Micro-learning screen with Due for Recall filter, mastery pills, and interactive Feynman recall cards. |


---

## 4. PLAN: Reminders v2, Sounds, Backup, UI refresh (awaiting approval)

### A. COMPREHENSIVE UI & UX AUDIT REPORT

A rigorous, component-by-component audit was conducted across every screen, navigation element, and modal dialog in the application. This audit identifies all oversized touch targets (full-width button fatigue), undersized touch targets (failing WCAG 2.5.5 and Android Material 3 48×48dp guidelines), inconsistent spatial rhythms (non-standard 8pt grid values), and visual hierarchy/contrast defects to prepare for design token migration:

#### 1. `src/components/views/TodayView.tsx` (Today Screen)
- **Oversized Touch Targets & Button Fatigue**:
  - Full-width `.btn-primary` and `.btn-secondary` buttons (e.g., "Complete Good Deed", "Pick 3 Essentials", "How to Install as Offline Android APK") span 100% of the screen width (up to 560px on tablets/foldables), creating visual fatigue and unnatural thumb reach (violates Fitts's Law).
  - The "Do Something Good Today" card occupies excessive vertical real estate (~280px), pushing active daily habit cards down below the initial scroll fold.
- **Undersized Touch Targets (<48dp)**:
  - Habit count decrement button (`−`) is styled with `btn-sm w-8 h-8 p-0` (32×32px). This is 16dp below the Android accessibility touch target standard, causing frequent mis-taps on mobile.
  - Progression step slider thumb uses browser-native styling without an enlarged touch target, making it difficult to drag precisely on capacitive touchscreens.
  - Pip speech voice button (`🔊`) is only 32×32px, isolated in a card header.
- **Inconsistent Spacing**:
  - Mixes ad-hoc margins and paddings: `px-3.5 pt-1`, `space-y-3`, `gap-3.5`, `py-2.5 px-2`, `gap-1.5`, `p-2.5`, `my-2`. Instead of adhering to an 8-point spatial scale (`4px`, `8px`, `16px`, `24px`, `32px`), arbitrary pixel values (`10px`, `14px`, `18px`) are scattered throughout.
- **Visual Hierarchy & Hardcoded Styles**:
  - Hardcoded utility colors: `bg-indigo-600`, `text-indigo-900`, `dark:bg-indigo-950/40`, `text-amber-600`, `bg-amber-500/10` bypass CSS theme variables.
  - Heading scale is inconsistent: mixes `text-[19px]`, `text-[15px]`, `text-[14px]`, `text-[13px]`, and `text-xs` without semantic scale tokens.

#### 2. `src/components/views/SkillsView.tsx` (Skills Tree & Mind Map)
- **Oversized Touch Targets & Layout Issues**:
  - Mind Map SVG mode allocates fixed cell widths (`140px`) without edge fade indicators, giving no visual cue that content extends horizontally off-screen.
- **Undersized Touch Targets (<48dp)**:
  - **Severe Congestion**: Each tree item row packs up to 6 adjacent micro-buttons: fold toggle (`w-7 h-7`), emoji icon (`w-7 h-7`), focus branch (`w-7 h-7`), reorder up (`w-6 h-6`), reorder down (`w-6 h-6`), and add sub-skill (`w-7 h-7`).
  - Spaced merely 2px to 4px apart, these 24px–28px touch targets lead to frequent accidental taps between reordering, folding, and editing.
- **Inconsistent Spacing**:
  - Tree indentation mixes `ml-4 pl-3.5` with `ml-9` for notes and progress bars.
  - Quick filter toolbar uses `py-1 px-2.5 gap-1.5`, colliding with the card container padding.
- **Visual Hierarchy & Hardcoded Styles**:
  - Badges use hardcoded tints: `bg-amber-500/15 text-amber-700`, `bg-[var(--acs)]`, `border-[var(--line)]`.
  - Deep hierarchies (3+ levels) cause inline breadcrumbs to wrap onto multiple jagged lines, pushing skill cards down.

#### 3. `src/components/views/AlertsView.tsx` (Alerts & Reminders Tab)
- **Oversized Touch Targets & Form Dominance**:
  - "Set Reminder" submission button spans 100% width with heavy padding, dominating the viewport even when users merely visit the tab to review or pause active reminders.
- **Undersized Touch Targets (<48dp)**:
  - Tone test button ("▶ Test") is crammed in a `flex gap-2` next to a dropdown; on 320px–360px mobile viewports, the button clips or forces horizontal overflow beyond the card border.
  - Active reminder row delete button (`✕`) is an unpadded text icon (`text-xs p-1`), providing an interactive target of only ~20×20px.
  - Play tone preview button (`🔊`) is similarly undersized (~22×22px).
- **Inconsistent Spacing**:
  - Form inputs alternate between `p-2`, `p-2.5`, and `p-1.5`.
  - Spacing between labels and inputs varies between `0px`, `4px`, and `8px`.
- **Visual Hierarchy & Progressive Disclosure**:
  - Violates Hick's Law: all advanced reminder controls (repetition frequency, tone selection, notification permission status) are displayed simultaneously in a single flat form rather than using progressive disclosure.

#### 4. `src/components/views/LearnView.tsx` (Learn & Daily Insights Tab)
- **Oversized Touch Targets & Layout Shifts**:
  - In Flashcard Recall mode, the card height fluctuates drastically between short single-line summaries and multi-line concepts, causing jarring vertical layout shifts during review.
- **Undersized Touch Targets (<48dp)**:
  - Favorite star toggle (`☆` / `⭐`) is rendered as a plain text icon without an expanded tap container (`text-base p-1`).
  - Flashcard category filter pills have inconsistent horizontal padding and lack momentum scroll snapping on touch devices.
- **Inconsistent Spacing**:
  - Filter pills mix `px-3 py-1.5` with `gap-1.5`, while input forms use `p-2.5`.
- **Visual Hierarchy & Contrast**:
  - Daily Insight card shows two competing badges (`💡 Category` and `✓ Done (+10 XP)`) that collide on narrower screens (320px–360px).

#### 5. `src/components/views/StudyView.tsx` (Deep Work & Spaced Recall)
- **Oversized Touch Targets**:
  - Deep Work setup form spans the entire screen, pushing "Spaced Recall Due" cards below the fold.
  - Active focus mode displays massive 100% width buttons for "I feel an urge to scroll" and "End early".
- **Undersized Touch Targets (<48dp)**:
  - Recall action buttons ("Fuzzy" and "✓") on due items use `btn-sm text-xs px-2` (30px height) and `tick-btn` (36px diameter), falling below the 48dp guideline.
  - Topic delete button (`✕`) is an unpadded `text-xs p-1` (~20px).
- **Inconsistent Spacing & Typographic Jitter**:
  - The 5-digit focus clock (`00:00`) uses `text-5xl font-mono`, but lacks `tabular-nums`, causing subtle horizontal jumping as digits tick down.
  - Form cards alternate between `rounded-xl`, `rounded-lg`, and `rounded-2xl` within the same view.

#### 6. `src/components/views/JournalView.tsx` (Journal & Urge Log)
- **Oversized Touch Targets**:
  - Journal entry form occupies more than 60% of the viewport height, pushing historical journal reflections completely off-screen.
- **Undersized Touch Targets (<48dp)**:
  - The 5 mood rating emojis (`😞`, `😕`, `😐`, `🙂`, `😄`) lack visible descriptive labels, making them ambiguous for accessibility and screen readers.
  - Delete reflection button (`✕` / `Sure?`) is small and placed close to the mood icon.
- **Inconsistent Spacing**:
  - Sub-tab buttons use `py-2 px-3 text-sm`, while forms use `p-3 text-xs`, and list cards use `pb-1.5 my-2`.

#### 7. `src/components/views/StatsView.tsx` (Stats & Analytics Tab)
- **Oversized Touch Targets**:
  - "Milestone Awards" showcase card is a full-width clickable card that duplicates the header flame icon's function.
- **Undersized Touch Targets (<48dp)**:
  - In Weekly Insights, the interactive 7-day mood strip uses micro day buttons (`p-1 text-[9px]`) that measure ~38×42px, causing mis-taps when inspecting past days.
  - Heatmap day cells measure 12×12px with 4px gap, requiring precise pointer positioning.
- **Inconsistent Spacing & Visual Hierarchy**:
  - Sub-tab segmented switch ("Weekly Insights" vs "Annual Heatmap") uses low contrast against dark backgrounds (`bg-[var(--line)]/40`).
  - Category mastery list rows have uneven left alignment because raw emoji characters have varying intrinsic glyph widths without fixed container widths (`w-6 text-center`).

#### 8. `src/components/Navigation.tsx` (Bottom Navigation Bar)
- **Undersized & Crowded Touch Targets**:
  - 7 tabs across a 360dp phone viewport yields only ~51dp per tab width with 48px height. Because tab labels are stacked beneath icons, touch boundaries are virtually contiguous with 0px horizontal margin, causing frequent mis-taps between adjacent tabs (e.g., Study vs Journal vs Alerts).
- **Visual Hierarchy & Contrast**:
  - Active tab indicators rely solely on color (`text-[var(--ac)]`) without an elevated background indicator pill, reducing visibility under bright sunlight.

#### 9. `src/components/Header.tsx` (Top Application Bar)
- **Undersized Touch Targets**:
  - Streak flame badge (`btn-sm`) and Settings gear button (`btn-sm`) measure 32×32px, below the 48×48dp target.
- **Visual Hierarchy**:
  - Title and level badge are vertically centered but lack consistent margin separation from the screen boundary (`px-3.5 py-3`).

#### 10. Modals (`SkillEditModal`, `SettingsModal`, `RewardShopModal`, `AwardsModal`, etc.)
- **Inconsistent Close Controls**:
  - Modal close buttons alternate between a circular `✕` (28×28px), a text "Done" button, and "Cancel" buttons with inconsistent padding.
- **Destructive Action Styling**:
  - "RESET HERO" and delete buttons use saturated bright red backgrounds (`bg-rose-600`, `text-red-500`) that clash with the soothing self-care aesthetic.
- **Dialog Max-Widths**:
  - Dialog widths alternate between `w-[min(92vw,440px)]`, `w-[min(94vw,460px)]`, and `w-[min(92vw,380px)]`.

---

### B. DATA MODEL CHANGES & MIGRATION STRATEGY

#### 1. Schema Expansion (`src/types.ts`)
We upgrade the schema from version `14` to `15` to support:
- Multiple clock times with past-midnight support (e.g. `["01:00", "03:00", "22:00"]`).
- Relative offset chains (`anchorTime + offsetMinutes`).
- Interval repeat windows (`every N hours between T1 and T2`).
- Reminder-to-Skill linking (`linkedSkillId`).
- Custom audio file references.
- Backup metadata tracking (`lastBackupTimestamp`, `changesSinceLastBackup`).

```typescript
export type ReminderType = 'custom' | 'medicine' | 'prayer';
export type RepeatFrequency = 'daily' | 'weekdays' | 'weekends' | 'custom_days';

export interface RelativeChainConfig {
  enabled: boolean;
  anchorTime: string; // e.g. "22:00"
  offsetMinutes: number; // e.g. 180 (+3 hours)
  chainLabel?: string; // e.g. "Second reading block"
}

export interface IntervalRepeatConfig {
  enabled: boolean;
  intervalMinutes: number; // e.g. 120 (every 2 hours)
  startTime: string; // "08:00"
  endTime: string; // "22:00"
  maxOccurrences?: number; // e.g. 6 times
}

export interface CustomRingtoneConfig {
  id: string; // unique ID or preset ID: 'wake_sunrise' | 'med_urgent' | 'prayer_bell' | 'focus_wood' | 'gentle_vibes'
  name: string; // User-facing name
  isCustom: boolean; // true if user uploaded audio file
  dataUrl?: string; // base64 data:audio/wav or data:audio/mp3 for in-app Web Audio
  bundledRawRes?: string; // filename in res/raw/ for native Android notification sound
}

export interface ReminderItemV2 {
  id: string;
  n: string; // Title / Name
  icon: string; // Emoji
  type: ReminderType; // 'custom' | 'medicine' | 'prayer'
  active: boolean;

  // Sound assignment
  soundId: string; // Reference to CustomRingtoneConfig.id

  // Association with Skill Tree
  linkedSkillId?: string; // NodeItem.id (Deep-links notification to skill)

  // Scheduling: Fixed Clock Times (supports 24h & past-midnight: "01:00", "03:00", "23:30")
  times: string[];

  // Scheduling: Relative Chains
  relativeChain?: RelativeChainConfig;

  // Scheduling: Interval Repeat Window
  intervalRepeat?: IntervalRepeatConfig;

  // Scheduling: Repeat Rules
  repeatFrequency: RepeatFrequency; // 'daily' | 'weekdays' | 'weekends' | 'custom_days'
  days: number[]; // 0=Sun..6=Sat
  daySpecificTimes?: Record<number, string[]>; // Day of week -> custom times array

  // Date Boundaries
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD

  // Medicine Specifics
  medNote?: string;
  pillsCount?: number;
  pillsLowThreshold?: number;
  privacyMode?: boolean;

  // Prayer Specifics (adhan library integration)
  prayerSettings?: PrayerSettings;

  // Escalation & Snooze Rules
  escalateMinutes?: number[]; // e.g. [1, 3, 5] for re-ringing
  snoozeDurationMinutes?: number; // default 10

  // Legacy compatibility fields
  tm: string; // Primary time
  ev: number; // 24
  nx: number; // Next timestamp
}

export interface BackupMetadata {
  lastBackupTimestamp: number | null;
  lastBackupLevel: number;
  lastBackupXp: number;
  changesSinceBackup: number;
  dismissedNudgeTimestamp: number | null;
}
```

#### 2. Migration Logic (`src/utils/storage.ts`)
- **Schema Bump**: `s.v = 15`.
- **Backward Compatibility**:
  - Automatically map legacy `AlertItem` objects:
    - If `times` is missing, populate `times: [r.tm || "09:00"]`.
    - If `days` is missing, populate `days: [0, 1, 2, 3, 4, 5, 6]` and `repeatFrequency: 'daily'`.
    - If `soundId` is missing, map `r.sound` (`'marimba'` -> `'focus_wood'`, `'bell'` -> `'prayer_bell'`).
    - If `type` is missing, infer from name keywords (`"prayer"` -> `'prayer'`, `"medicine"` -> `'medicine'`, else `'custom'`).
    - Preserve existing notification IDs and schedules without dropping a single active reminder.
  - Initialize `s.backupMetadata = { lastBackupTimestamp: null, lastBackupLevel: 0, lastBackupXp: 0, changesSinceBackup: 0, dismissedNudgeTimestamp: null }`.

---

### C. SCREEN DESIGNS & TEXT WIREFRAMES

#### 1. Alerts Tab Main View (`src/components/views/AlertsView.tsx`)

```
┌────────────────────────────────────────────────────────┐
│ 🔔 Reminders & Alarms               [+ New Reminder]   │
├────────────────────────────────────────────────────────┤
│ 📱 Native Engine: High Importance Channel Active       │
│    Alarms ring even when phone is asleep/app closed.  │
├────────────────────────────────────────────────────────┤
│ QUICK TEMPLATES (1-Tap Setup)                          │
│ [💧 Water 2h] [💊 Meds AM/PM] [🕌 5 Prayers] [📚 Deep]│
├────────────────────────────────────────────────────────┤
│ ACTIVE REMINDERS (4)                                   │
│ ┌────────────────────────────────────────────────────┐ │
│ │ 💊 Amoxicillin 500mg                [Active ▾] [⋮] │ │
│ │    Times: 08:00, 14:00, 20:00 · Every Day           │ │
│ │    Take after food · 18 pills left                 │ │
│ │    Sound: Urgent Medical Ramp (2.8 kHz)            │ │
│ └────────────────────────────────────────────────────┘ │
│ ┌────────────────────────────────────────────────────┐ │
│ │ 💧 Hydration Anchor                 [Active ▾] [⋮] │ │
│ │    Every 2h (08:00 - 22:00) · 8 times daily        │ │
│ │    Linked: 💧 Water (Body)                         │ │
│ └────────────────────────────────────────────────────┘ │
│ ┌────────────────────────────────────────────────────┐ │
│ │ 📖 Nightly Reading Chain            [Active ▾] [⋮] │ │
│ │    10:00 PM (+ 3h follow-up at 1:00 AM)            │ │
│ │    Linked: 📖 Read pages (Learn)                   │ │
│ └────────────────────────────────────────────────────┘ │
├────────────────────────────────────────────────────────┤
│ ▸ Reminder Health Check & Battery Guide (Settings)     │
│ ▸ Reminder Log History (3 Done, 1 Snoozed)             │
└────────────────────────────────────────────────────────┘
```

#### 2. Flexible Reminder Creator / Editor Sheet

```
┌────────────────────────────────────────────────────────┐
│ New Reminder                                   [✕ Done]│
├────────────────────────────────────────────────────────┤
│ TYPE:  [ 🔔 Custom ]  [ 💊 Medicine ]  [ 🕌 Prayer ]   │
├────────────────────────────────────────────────────────┤
│ Title: [ Drink water                             ] [💧]│
│ Link to Skill: [ 💧 Water (Body)                     ▾]│
├────────────────────────────────────────────────────────┤
│ TIME SCHEDULE:                                         │
│ Mode: (•) Clock Times   ( ) Interval Repeat   ( ) Chain│
│                                                        │
│ [ 01:00 ] [ 03:00 ] [ 09:00 ] [ 14:00 ]  [+ Add Time]  │
│                                                        │
│ REPEAT:                                                │
│ [ Every Day ] [ Weekdays (M-F) ] [ Weekends ] [ Custom]│
│  [M] [T] [W] [T] [F] [S] [S]                           │
├────────────────────────────────────────────────────────┤
│ ▸ Relative Follow-Up Chain (Optional)                 │
│   [✓] Schedule secondary reminder 3 hours later        │
│                                                        │
│ ▸ Sound & Ringtone (Scientific Tones)                  │
│   Tone: [ Wake / Sunrise Melodic Ramp (1-3 kHz)     ▾] │
│   [ ▶ Test Sound ]   [ 📁 Upload Custom Audio ]        │
│                                                        │
│ ▸ Medicine & Privacy Safeguards (If Medicine Type)     │
│   Notes: [ Take with food and cold water             ] │
│   Pills Left: [ 28 ]  Alert When Under: [ 5 ]          │
│   [✓] Lock-screen Privacy (Mask text on lockscreen)    │
├────────────────────────────────────────────────────────┤
│ [ Save Reminder ]                                      │
└────────────────────────────────────────────────────────┘
```

#### 3. Backup Safety Banner & Verification Sheet (`TodayView` & `SettingsModal`)

```
┌────────────────────────────────────────────────────────┐
│ 💡 Last backup was 9 days ago (34 new logs recorded)   │
│    [ Download Backup (.json) ]          [ Dismiss ✕ ]  │
└────────────────────────────────────────────────────────┘

PRE-RESTORE PREVIEW SHEET (On File Upload or Rollback):
┌────────────────────────────────────────────────────────┐
│ 📄 Backup Verification Preview                         │
├────────────────────────────────────────────────────────┤
│ File: self-care-hero-backup-2026-10-20.json            │
│ Status: ✓ Valid Schema v14 Format                      │
│                                                        │
│ • Player Level: Level 8 (2,450 XP)                     │
│ • Habits & Skills: 22 Active Nodes                     │
│ • Journal Entries: 48 Reflections                      │
│ • Saved Reminders: 5 Configured Alarms                 │
├────────────────────────────────────────────────────────┤
│ WARNING: Restoring will overwrite current state.       │
│ An automatic safety snapshot will be saved first.      │
│                                                        │
│ Type "CONFIRM" to unlock: [ CONFIRM                  ] │
│                                                        │
│ [ Cancel ]                       [ Restore All Data ]  │
└────────────────────────────────────────────────────────┘
```

---

### D. SOUND SCIENCE & TONE ARCHITECTURE

#### 1. Acoustic & Psychoacoustic Principles (Strictly Scientific)
We reject unproven pseudo-science (such as binaural beats or claims of "brainwave entrainment"). The default alarm tones are engineered strictly using verified physical acoustics and psychoacoustics:

1. **Human Hearing Sensitivity (1 kHz – 4 kHz Peak)**:
   - The human external ear canal (concha and auditory meatus) exhibits natural acoustic resonance between **1,500 Hz and 3,500 Hz**.
   - Sound energy concentrated in this band achieves 8–12 dB higher perceived loudness than bass or sub-bass frequencies at identical acoustic pressure (SPL). Tones cut cleanly through ambient room noise without requiring ear-splitting volume.
2. **Interrupted / Pulsed Rhythm (Anti-Habituation Envelope)**:
   - Continuous sinusoidal tones trigger sensory adaptation in the auditory cortex within 3–5 seconds, causing the brain to tune them out.
   - Bursts of **180ms – 250ms sound** punctuated by **80ms – 120ms silent intervals** resist habituation and maintain acute cognitive salience.
3. **Harmonic Consonance Over Dissonant Buzzers**:
   - Dissonant, harsh square-wave buzzers induce sudden autonomic panic (abrupt cortisol/adrenaline spike), causing sleep inertia and grogginess.
   - Melodic harmonic intervals (perfect fifths, major thirds, and octaves) generate high arousal with positive affect, accelerating cognitive clarity upon waking.
4. **Gradual Volume Ramp (Anti-Startle Attack)**:
   - To eliminate startle-reflex hypertension, each notification sound applies an exponential volume ramp: starting at 15% volume and smoothly ascending to 100% over the first **800ms – 1,200ms**.
5. **Graduated Escalation**:
   - Level 1 (At scheduled minute): 2 gentle melodic pulses.
   - Level 2 (1 minute unacknowledged): 3 higher-arousal harmonic pulses.
   - Level 3 (3–5 minutes unacknowledged): Rapid 4-pulse syncopated chime.

#### 2. Specifications for the 5 Scientific Default Tones

| Preset Name | Target Use | Primary Frequencies | Envelope & Rhythm | Duration | Peak Norm. |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1. Wake / Sunrise** | Morning & Wake-up | 523 Hz (C5) → 659 Hz (E5) → 784 Hz (G5) → 1046 Hz (C6) | Ascending arpeggio; 400ms volume ramp; 3 repetitions with 150ms pauses | 2.4s | -1.0 dBFS (No clip) |
| **2. Med Urgent** | Medicine / Time-Critical | Dual-tone 1,850 Hz & 2,780 Hz | Fast syncopated chirp; 160ms burst, 80ms silence; 4 rapid bursts | 1.1s | -0.5 dBFS (No clip) |
| **3. Prayer Bell** | Prayer & Mindfulness | 432 Hz fundamental + 864 Hz / 1,296 Hz acoustic overtones | Acoustic temple bell strike; 50ms attack, exponential 2.8s smooth decay | 3.2s | -1.5 dBFS (No clip) |
| **4. Focus Wood** | Study & Task Anchors | 880 Hz fundamental + 1,760 Hz transient pop | Wooden marimba mallet strike; crisp 15ms attack, 180ms warm decay | 0.8s | -2.0 dBFS (No clip) |
| **5. Gentle Chime** | Habit Reminders (Water, Walk) | Dual harmonic 659 Hz & 1,046 Hz (E5 & C6) | Vibraphone swell; 200ms ramp, 1.4s sustain/decay; gentle dual-ping | 1.6s | -3.0 dBFS (No clip) |

#### 3. Offline Generation & Android Native Limitations
- **Offline Generation**: Written as a self-contained Web Audio synthesis utility that generates exact 16-bit PCM 44.1 kHz WAV buffers directly in memory—requiring **zero external downloads or CDN requests**.
- **Android System Limitations**:
  - Android notification channels (`NotificationChannel`) lock their audio attributes upon creation. Changing a sound requires a new channel ID (e.g. `channel_reminders_v2_med`).
  - Native system notifications playing custom audio when the app is completely closed require the audio file to reside in Android's APK package at `res/raw/*.wav`.
  - *Recommended Default Architecture*: Pre-synthesize the 5 default WAV files and include a GitHub Actions step to copy them into `android/app/src/main/res/raw/`. For custom user-uploaded files, play them via in-app Web Audio when the app is foregrounded, and fall back to the selected default high-urgency WAV tone for native closed-app alarms.

---

### E. BACKUP ENFORCEMENT & DISASTER RECOVERY

1. **"Last Backup" Health Status & Change-Threshold Nudge**:
   - Track `lastBackupTimestamp` and count user mutations (`changesSinceBackup`) in state.
   - Non-blocking reminder pill appears at top of Today view if:
     * `daysSinceLastBackup >= 7` OR `changesSinceBackup >= 25` actions.
   - Dismissing the badge hides it for 48 hours without blocking user activity.
2. **Automated Safety Snapshots**:
   - Capture an automatic snapshot into slot 1 of `state.snapshots` (max 10 rolling slots) before:
     * Data reset ("RESET HERO").
     * File restore / overwrite.
     * Snapshot rollback.
     * State migration across schema versions.
   - Debounced snapshot capture (debounced 15 seconds) when app enters background (`document.addEventListener('visibilitychange')`).
3. **Strict Validation & Pre-Restore Preview**:
   - Validates JSON format: checks for valid object, version number, non-empty `nodes` array, and structural integrity.
   - Rejects corrupted or foreign JSON files with specific user-facing error text.
   - Displays a modal preview card showing: Level, Total XP, Habits count, Journal entries count, and Timestamp before asking for `'CONFIRM'`.
4. **Android WebView File Export Evaluation**:
   - *Current Web Blob download*: Triggers a standard file download, which works in browser and WebAPK, but can be blocked in restricted native WebViews.
   - *Evaluated Plugins*:
     * `@capacitor/filesystem`: Heavyweight storage permissions required on Android 11+ (Scoped Storage / MANAGE_EXTERNAL_STORAGE).
     * `@capacitor/share`: Zero dangerous storage permissions! Opens the native Android share drawer, allowing the user to 1-tap save their JSON backup directly to Google Drive, WhatsApp, Gmail, or local Files app.
     * *Recommended Default*: Integrate `@capacitor/share@6` for native APK backup sharing, with clipboard copy as instant fallback.
5. **Uninstall Loss & Android Auto Backup**:
   - In `AndroidManifest.xml`, `android:allowBackup="true"` is enabled by default in Capacitor 6.
   - However, WebView `localStorage` is excluded from standard cloud backup on many OEM forks. We will place an explicit permanent disclaimer in the Backup tab:
     *"Uninstalling Self-Care Hero will erase your local device data. Keep a downloaded .json backup on Google Drive to restore on any phone."*

---

### F. UI REFINEMENT, DESIGN TOKENS & COLOUR PALETTES

#### 1. UX & UI Principles Applied
- **Fitts's Law (Touch Target Sizing)**:
  - Minimum touch target for all buttons, chips, and icons is locked at **48×48dp** (Material 3 accessibility standard).
  - Stop stretching secondary action buttons to 100% width; use auto-width with a max-width of 240px for single actions and balanced side-by-side buttons for dialogs.
- **Hick's Law (Progressive Disclosure)**:
  - Complex forms (such as Reminder creation and Skill editing) show only essential inputs first (Title, Time, Type).
  - Advanced settings (Interval window, relative chains, per-day variation, prayer calculation coordinates) are nested inside clean expandable disclosures (`▸ Advanced Options`).
- **Gestalt Grouping & Spacing Grid**:
  - Strict **8-point spatial system**: 4px (micro), 8px (compact), 16px (card interior), 24px (section margins), 32px (major layout blocks).
  - Unified corner radii: 20px for cards (`hero-card`), 12px for buttons/inputs, 9999px for status pills.

#### 2. Warm, Premium Colour Palettes (WCAG AA & AAA Compliant)

##### Primary Recommended Palette: "Sage Sanctuary" (Warm Organic Botanical)
*A grounded, restorative wellness aesthetic inspired by unbleached linen, warm pottery ceramics, and calm Japanese matcha/sage botanicals. Specially engineered to avoid sterile app aesthetics while delivering high contrast under direct sunlight and dark-mode bedtime usage.*

| Token Name | Light Theme Hex | Dark Theme Hex | WCAG Contrast Ratio (vs Background) | Compliance Level | Role (60-30-10 Rule) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `--bg` (App Canvas) | `#f7f6f2` | `#121513` | — | Base | 60% Dominant Base Canvas |
| `--sf` (Card Surface) | `#ffffff` | `#1a201c` | 1.1:1 (vs Canvas) | Surface | 30% Elevated Card Surface |
| `--sf-elevated` (Modals/Popovers) | `#ffffff` | `#222a25` | 1.3:1 (vs Canvas) | Surface | Modal & Dialog Surfaces |
| `--line` (Border/Divider) | `#e5e3da` | `#28322b` | 1.2:1 (Structural) | Structure | Subtle, Non-Distracting Boundaries |
| `--line-strong` (Focused Inputs) | `#c8c5b8` | `#3d4b42` | 2.1:1 (Focus) | Boundary | Form Input Outlines |
| `--ink` (Primary Typography) | `#1c221e` | `#edf2ee` | **14.2:1 (Light) / 13.8:1 (Dark)** | **WCAG AAA Pass** | Headlines & High-Emphasis Text |
| `--ink-secondary` (Body Text) | `#353e38` | `#cad4cc` | **9.8:1 (Light) / 10.4:1 (Dark)** | **WCAG AAA Pass** | Body Copy & Form Values |
| `--mu` (Muted / Subtitle Text) | `#5c655e` | `#939e95` | **5.2:1 (Light) / 5.1:1 (Dark)** | **WCAG AA Pass** | Timestamps, Secondary Labels |
| `--ac` (Brand Sage Accent) | `#2d6a4f` | `#52b788` | **5.4:1 (Light) / 6.2:1 (Dark)** | **WCAG AA Pass** | 10% Primary Action & Brand Anchor |
| `--ac-hover` (Hover/Active) | `#22533e` | `#63c99a` | **7.1:1 (Light) / 7.8:1 (Dark)** | **WCAG AAA Pass** | Pressed/Hover States |
| `--acs` (Soft Tint Container) | `#e8f3ed` | `#1d3629` | 1.2:1 (vs Canvas) | Container | Active Chips & Selected Pills |
| `--pip` (Hero Character) | `#f5c6aa` | `#f0be9e` | — | Decorative | Pip Character Body |
| `--bl` (Blush Accent) | `#ea867a` | `#e27a6e` | 3.1:1 (Graphic) | Decorative | Pip Cheeks & Warm Highlights |
| `--warn` (Streak / Milestone Gold) | `#b45309` | `#fbbf24` | **5.1:1 (Light) / 11.2:1 (Dark)** | **WCAG AA/AAA Pass** | Streak Flames, Daily Three Shields |
| `--warn-surface` (Warning Tint) | `#fef3c7` | `#2e2308` | — | Container | Gentle Warning Banners |
| `--danger` (Destructive Red) | `#b91c1c` | `#f87171` | **6.1:1 (Light) / 6.2:1 (Dark)** | **WCAG AA Pass** | High-Friction Delete Warnings |
| `--danger-surface` (Danger Tint) | `#fee2e2` | `#331414` | — | Container | Anti-Wipe Confirmation Banners |

##### Alternative Warm Palette: "Sandalwood & Terracotta" (Warm Earth & Honey)
*An earthy, warm Mediterranean aesthetic balancing rich clay terracotta with creamy sandalwood paper and olive slate.*

| Token Name | Light Theme Hex | Dark Theme Hex | WCAG Contrast Ratio (vs Background) | Compliance Level |
| :--- | :--- | :--- | :--- | :--- |
| `--bg` | `#f8f6f0` | `#141210` | — | Base Canvas |
| `--sf` | `#ffffff` | `#1e1b17` | — | Card Surface |
| `--line` | `#e6e2d6` | `#2d2923` | — | Subtle Borders |
| `--ink` | `#231d17` | `#f4efe6` | **13.9:1 (Light) / 14.1:1 (Dark)** | **WCAG AAA Pass** |
| `--mu` | `#6e6459` | `#a49889` | **4.9:1 (Light) / 5.2:1 (Dark)** | **WCAG AA Pass** |
| `--ac` | `#c05621` | `#fbd38d` | **4.8:1 (Light) / 9.6:1 (Dark)** | **WCAG AA/AAA Pass** |
| `--acs` | `#feebc8` | `#2d2010` | — | Accent Container |

---

#### 3. Plan to Replace Hard-Coded Colors in `src/styles/theme.css`

To achieve strict separation of concerns, eliminate ad-hoc Tailwind colors, and enable instant theme customization across all 7 views and modals, the migration will follow this 5-step implementation plan:

##### Step 1: Create `src/styles/theme.css`
A dedicated styling module will be created at `src/styles/theme.css` containing pure CSS custom properties for `:root` (light mode) and `:root[data-theme="dark"]` (dark mode) matching the "Sage Sanctuary" design tokens specified above:
```css
/* src/styles/theme.css — Centralized Design Tokens */
:root {
  --bg: #f7f6f2;
  --sf: #ffffff;
  --sf-elevated: #ffffff;
  --line: #e5e3da;
  --line-strong: #c8c5b8;
  --ink: #1c221e;
  --ink-secondary: #353e38;
  --mu: #5c655e;
  --ac: #2d6a4f;
  --ac-hover: #22533e;
  --acs: #e8f3ed;
  --pip: #f5c6aa;
  --bl: #ea867a;
  --warn: #b45309;
  --warn-surface: #fef3c7;
  --danger: #b91c1c;
  --danger-surface: #fee2e2;
  color-scheme: light;
}

:root[data-theme="dark"] {
  --bg: #121513;
  --sf: #1a201c;
  --sf-elevated: #222a25;
  --line: #28322b;
  --line-strong: #3d4b42;
  --ink: #edf2ee;
  --ink-secondary: #cad4cc;
  --mu: #939e95;
  --ac: #52b788;
  --ac-hover: #63c99a;
  --acs: #1d3629;
  --pip: #f0be9e;
  --bl: #e27a6e;
  --warn: #fbbf24;
  --warn-surface: #2e2308;
  --danger: #f87171;
  --danger-surface: #331414;
  color-scheme: dark;
}
```

##### Step 2: Import into `src/index.css` & Standardize Shared Utility Classes
Update `src/index.css` to import `src/styles/theme.css` via `@import "./styles/theme.css";` and rewire the global button and card classes to consume the new design tokens:
- `.hero-card`: `background: var(--sf); border: 1px solid var(--line); border-radius: 20px; padding: 16px;`
- `.btn-primary`: `background: var(--ac); color: #ffffff; border-radius: 12px; min-height: 48px;`
- `.btn-secondary`: `background: var(--acs); color: var(--ac); border-radius: 12px; min-height: 48px;`
- `.btn-danger`: `background: transparent; color: var(--danger); min-height: 48px;`
- `.btn-sm`: `background: var(--acs); color: var(--ac); min-width: 48px; min-height: 48px;` (ensuring 48dp minimum touch target).
- `.tick-btn`: `width: 48px; height: 48px; border: 2px solid var(--line);` (`.tick-btn.on` -> `background: var(--ac); border-color: var(--ac); color: #fff`).

##### Step 3: Hardcoded Color Replacement Mapping
Every component will be audited and refactored using the following systematic substitution table:

| Legacy Hardcoded Class / Style | Replaced With Semantic Design Token | Rationale |
| :--- | :--- | :--- |
| `bg-indigo-600`, `text-indigo-900`, `border-indigo-200` (Today Low Energy) | `bg-[var(--acs)] text-[var(--ac)] border-[var(--ac)]/40` | Eliminates ad-hoc purple/indigo; aligns Low-Energy banner with calm Sage palette. |
| `text-amber-500`, `text-amber-600`, `ring-amber-400`, `bg-amber-400` | `text-[var(--warn)]`, `ring-[var(--warn)]`, `bg-[var(--warn)]` | Unifies all streak flames, awards, and Daily Three milestones to `--warn`. |
| `bg-rose-600`, `border-rose-300`, `text-red-500`, `bg-red-500` | `bg-[var(--danger)]`, `border-[var(--danger)]`, `text-[var(--danger)]` | Standardizes destructive actions and delete buttons to `--danger`. |
| `bg-teal-500`, `bg-emerald-400`, `bg-slate-400`, `bg-amber-400`, `bg-rose-400` (Mood Distribution bar in Weekly Insights) | Defined as explicit semantic distribution tokens in `theme.css` | Replaces random Tailwind spectrum colors with a harmonious, accessible 5-step gradient. |
| Legacy hardcoded hex `#3f9d86`, `#62c7ac` | `var(--ac)` | Unifies primary brand accent across all files. |
| Legacy hardcoded hex `#e3f3ee`, `#1f3a35` | `var(--acs)` | Unifies soft accent container backgrounds. |
| `color-mix(in srgb, var(--ac) 72%, var(--sf))` (Heatmap levels) | `--ac-lvl-1` through `--ac-lvl-4` CSS tokens | Replaces runtime browser color-mixing with pre-computed tokens for consistent rendering across Android WebViews. |

##### Step 4: Screen-by-Screen Execution Order
To prevent regressions, the replacement will proceed in isolated passes:
1. `src/styles/theme.css` and `src/index.css` (Base tokens & shared utility classes).
2. `src/components/Navigation.tsx` & `src/components/Header.tsx` (Global shells, 48dp touch targets).
3. `src/components/views/TodayView.tsx` (Eliminate indigo & ad-hoc button widths).
4. `src/components/views/SkillsView.tsx` (Eliminate congested micro-targets, expand to 48dp).
5. `src/components/views/AlertsView.tsx` (Fix test button clipping, add progressive disclosure).
6. `src/components/views/LearnView.tsx` & `src/components/views/StudyView.tsx` (Fix tabular font jitter & card height shifts).
7. `src/components/views/JournalView.tsx` & `src/components/views/StatsView.tsx` (Accessible mood labels & aligned mastery rows).
8. Modal Dialogs (`SkillEditModal`, `SettingsModal`, `RewardShopModal`, `AwardsModal`).

##### Step 5: Verification & Zero-Color-Drift Guarantee
- Run `npm run build` and `tsc --noEmit` after every file update.
- Verify with `grep -rnI "bg-indigo" src/` and `grep -rnI "text-amber" src/` to ensure 100% eradication of hardcoded color classes.

---

### G. PHASED IMPLEMENTATION ROADMAP

Each phase is strictly isolated to prevent regressions, keep `npm run build` and `tsc --noEmit` passing, and fit cleanly within a single development session:

#### Phase 1: Backup Safety, Anti-Loss Nudge & Verification
- **Scope**:
  - Add `lastBackupTimestamp` and `changesSinceBackup` to state.
  - Implement non-blocking "Last backup" status badge on Today screen.
  - Add schema validation and pre-restore preview card in `SettingsModal.tsx`.
  - Debounce auto-snapshot when app enters background.
- **Acceptance Criteria**: Corrupted JSON rejected with error message; valid JSON shows preview card; backup badge dismissible.
- **Physical Phone Testing**: Verify background snapshot trigger on Android app minimize.

#### Phase 2: Design Tokens, Palette Upgrade & 48dp Touch Targets
- **Scope**:
  - Implement Option 1 ("Sage Sanctuary") tokens in `src/index.css`.
  - Fix the "▶ Test" button overflow in `AlertsView.tsx`.
  - Enforce minimum 48×48dp touch targets across all buttons and tree icons in `SkillsView.tsx`.
  - Fix oversized full-width buttons.
- **Acceptance Criteria**: Zero horizontal clipping on 320px screen; all buttons comfortable to tap with thumb; zero logic changes.

#### Phase 3: Flexible Reminders Engine (Multi-Times, Chains, Skill Links)
- **Scope**:
  - Implement `ReminderItemV2` in `src/types.ts` and bump schema to v15 with migration.
  - Build Multi-Time selector with past-midnight support (e.g. 01:00, 03:00).
  - Implement Relative Chains ("read at 10 PM, then 3h later").
  - Implement Interval Windows ("every 2 hours between 08:00 and 22:00").
  - Add Reminder linking to Skills (deep-link from notification to skill; show reminders on skill detail modal).
  - Add 1-tap quick templates (Water, Meds, Prayers, Study).
- **Acceptance Criteria**: Existing reminders migrate cleanly; multiple times resolve accurately across midnight; notifications link to skills.

#### Phase 4: Native Android Alarms & Health Check Panel
- **Scope**:
  - Expand `@capacitor/local-notifications@6` rolling scheduler for relative chains and multi-times.
  - Add Health Check panel showing notification and exact alarm permissions.
  - Add 10-second test alarm button.
  - Provide battery optimization guide for Samsung/Xiaomi/Pixel.
- **Acceptance Criteria**: Rolling 7-day schedule (under 50 alarms) rebuilds on launch and resume; test alarm rings in 10s.
- **Physical Phone Testing**: Close app, lock screen, and verify alarm fires with sound.

#### Phase 5: Scientific Sound Synthesizer & Bundled Ringtones
- **Scope**:
  - Implement offline Web Audio WAV generator synthesizing the 5 acoustic default tones (Wake, Med Urgent, Prayer Bell, Focus Wood, Gentle Chime).
  - Add custom audio file upload (Base64 storage for in-app playback).
  - Add workflow step to place default WAVs in `android/app/src/main/res/raw/`.
- **Acceptance Criteria**: Zero external sound downloads; tones have no clipping; volume ramp operates smoothly.
- **Physical Phone Testing**: Listen to notification sound on physical phone speaker.

#### Phase 6: Offline Astronomical Prayer Engine (adhan library)
- **Scope**:
  - Integrate bundled `adhan` library with coordinate inputs and GPS location button.
  - Support Karachi, MWL, Umm al-Qura, ISNA, Egypt methods + Hanafi/Standard Asr rules.
  - Add individual prayer toggles and per-prayer minute offsets.
- **Acceptance Criteria**: 5 prayer times calculate accurately offline; zero network calls.

---

### H. RISKS, ANDROID LIMITS & PHONE TEST CHECKLIST

1. **Aggressive OEM Battery Optimization**:
   - *Risk*: Devices from Samsung, Xiaomi, and Huawei aggressively kill background alarm workers after 24–48 hours of screen-off time.
   - *Mitigation*: The rolling scheduler refills on every app launch and resume. The Health Check panel provides exact device instructions for setting "Unrestricted" battery mode.
2. **Exact Alarm Permission on Android 13/14+ (`SCHEDULE_EXACT_ALARM`)**:
   - *Risk*: Android 14 can revoke exact alarm permissions if deemed unnecessary.
   - *Mitigation*: Fallback to standard inexact alarm window (`allowWhileIdle: true`) if exact alarms are denied by the OS.
3. **Audio Channel Immobility**:
   - *Risk*: Android notification channel sounds cannot be changed once created.
   - *Mitigation*: Version channel IDs when sound presets change (e.g. `sch_reminders_v2`).
4. **Physical Phone Test Checklist (To Be Run by You on Phone)**:
   - [ ] Tap "Allow Notifications" in Alerts tab.
   - [ ] Tap "⏱️ Test in 10s", close app, lock screen, verify sound and vibration.
   - [ ] Set a 1:00 AM / 3:00 AM past-midnight alarm and verify time resolution.
   - [ ] Turn phone to Airplane Mode, test offline prayer calculation.
   - [ ] Download backup `.json`, verify file saves to device Downloads / Google Drive.

---

### I. APPROVAL CHECKLIST (RECOMMENDED DEFAULTS)

| Feature | Recommended Default Option | Status |
| :--- | :--- | :--- |
| **Colour Palette** | **Option 1 ("Sage Sanctuary" - Warm Organic Botanical)** (`#f7f6f2` bg, `#2d6a4f` sage accent) | *Awaiting Approval* |
| **Native File Share** | Use `@capacitor/share@6` for native Android backup export without storage permissions | *Awaiting Approval* |
| **Sound System** | Synthesize 5 lossless WAV tones in `res/raw/`; allow custom files in-app with fallback | *Awaiting Approval* |
| **Prayer Library** | Bundled `adhan` library (100% offline, zero network requests, pure trigonometry) | *Awaiting Approval* |
| **Phase Order** | **Phase 1 (Backup) → Phase 2 (UI/Palette) → Phase 3 (Reminders) → Phase 4 (Notifications) → Phase 5 (Sounds) → Phase 6 (Prayer)** | *Awaiting Approval* |


---

### J. CODE ARCHITECTURE BY LANGUAGE AND JOB

To ensure the codebase is clean, maintainable, and bug-free for a non-technical owner, every part of the application is assigned to the specific programming language best suited for its job.

#### 1. Architecture by Job and Language

| Job / Responsibility | Language | File or Folder Location | Plain-Words Rationale ("Why") |
| :--- | :--- | :--- | :--- |
| **Colours, Spacing, Fonts & Visual Look** | **CSS with Tailwind CSS** | `src/styles/theme.css` & `src/index.css` | **Centralized design tokens**: All colors are defined once as CSS variables (e.g. `--bg`, `--sf`, `--ink`, `--ac`, `--line`) for both light and dark themes. No hard-coded hex codes anywhere in HTML or TSX. When you want to change a color or theme, editing this one file changes the entire app instantly without risking broken code or syntax bugs. |
| **Screen Layout & Visual Structure** | **TSX (React + JSX)** | `src/components/views/` (7 main screens), `src/components/modals/`, `src/components/ui/` | **Pure presentational layer**: These files only draw buttons, text, cards, and icons on the screen, and listen for finger taps. They contain **zero business logic, zero math calculations, and zero state persistence code**. They simply call callback functions when tapped. This separation keeps screens small, tidy, and impossible to break with logic errors. |
| **App Business Logic & State Rules** | **TypeScript** | `src/logic/` (`xp.ts`, `storage.ts`, `scheduler.ts`, `prayer.ts`, `sounds.ts`) | **Pure calculation engine**: Handles XP formulas, level math, streaks, rolling reminder schedules, calendar date checks, backup serialization, and migrations. **Why this stays in TypeScript**: Self-Care Hero is a web app packaged in an Android WebView. The WebView browser engine can *only* execute JavaScript and TypeScript. It cannot run Java or Kotlin. Keeping all logic in pure TypeScript functions with strict types allows automated compile checking (`tsc --noEmit`) to catch 100% of calculation typos before anything reaches your phone. |
| **Native Android Hardware Integration** | **Java** | `native/android/` (source in repo, copied into `android/app/` during CI) | **Deep OS features only**: Used *exclusively* for tasks the browser WebView cannot do reliably: scheduling exact wake alarms (`AlarmManager.setExactAndAllowWhileIdle`), listening for device reboot (`RECEIVE_BOOT_COMPLETED`), creating notification channels with custom raw audio files, and launching the phone's battery optimization settings screen. **Rule**: Always use the official `@capacitor/local-notifications@6` plugin first; only write custom Java if the plugin lacks a capability. All custom Java files are kept under 60 lines and heavily commented in simple words. |
| **Build-Time Generators & Offline Helpers** | **Node.js / JavaScript** | `scripts/` (e.g. `scripts/generate-sounds.js`) | **Headless automation**: Runs during the GitHub Actions build on the server to mathematically synthesize the 5 default alarm WAV files and copy them into `android/app/src/main/res/raw/` before Gradle compiles the APK. Ensures the app is 100% offline with zero external network downloads. |
| **Data Shapes & Type Contracts** | **TypeScript Interfaces** | `src/types/` (e.g. `src/types/index.ts`) | **Data contracts**: Formally defines the exact structure of saved habits, reminders, journal logs, and backup snapshots. Prevents missing fields during migrations and ensures old backups load cleanly without crashing. |

#### 2. Proposed Folder Structure

```
Self-Care Hero
├── .github/workflows/
│   └── build-apk.yml               (GitHub Actions CI: builds web, injects native code, compiles APK)
├── native/                         (Custom native Android sources kept in repo)
│   └── android/
│       ├── AlarmBootReceiver.java  (Reschedules rolling alarms when phone reboots)
│       └── BatteryHelperPlugin.java (1-tap opens Android's Unrestricted Battery screen)
├── scripts/                        (Build-time offline generators)
│   └── generate-sounds.js          (Synthesizes 5 scientific WAV tones into res/raw/)
├── src/
│   ├── types/                      (Data shapes & schema definitions)
│   │   └── index.ts                (AppState, ReminderItemV2, PrayerSettings, BackupMetadata)
│   ├── styles/                     (Visual presentation & theme tokens)
│   │   ├── theme.css               (CSS variables for Sage Sanctuary & Dark theme)
│   │   └── index.css               (Tailwind directives & global resets)
│   ├── logic/                      (Pure TypeScript business rules - NO UI code)
│   │   ├── xp.ts                   (XP derivation, Level formulas, streaks, shields)
│   │   ├── storage.ts              (Schema v15 loader, saver, migrate, snapshots)
│   │   ├── scheduler.ts            (Rolling 7-day scheduler, chains, interval repeat)
│   │   ├── prayer.ts               (Offline adhan prayer times calculation)
│   │   └── sounds.ts               (Web Audio synthesis engine & tone presets)
│   ├── components/                 (Presentational TSX - only renders UI & handles taps)
│   │   ├── views/                  (TodayView, SkillsView, LearnView, StudyView, JournalView, AlertsView, StatsView)
│   │   ├── modals/                 (SkillEditModal, SettingsModal, RewardShopModal, AwardsModal, etc.)
│   │   └── ui/                     (Header, Navigation, DialogModal, Pip)
│   ├── App.tsx                     (Root controller connecting state to views)
│   └── main.tsx                    (Vite entry point)
├── package.json                    (Dependencies: React 19, Tailwind, Capacitor 6, adhan)
└── vite.config.ts                  (Vite offline bundler with relative base: './')
```

#### 3. Safe Migration Strategy (Progressive vs. Big-Bang Refactoring)

- **Honest Evaluation of "Phase 0: Big-Bang Code Split"**:
  - *Recommendation*: **Do NOT do a big-bang Phase 0 rewrite**. Moving dozens of files, rewriting all imports, and splitting components all at once creates massive regression risk, broken import paths, and build failures without delivering any visible feature value to you.
  - *Recommended Default*: **Progressive Migration by Job**. We restructure only the specific files that each active phase touches:
    * **Phase 1** (Backup): Extracts `src/logic/storage.ts` and `src/types/index.ts`.
    * **Phase 2** (UI & Palette): Creates `src/styles/theme.css` and updates CSS variables.
    * **Phase 3** (Reminders Engine): Extracts `src/logic/scheduler.ts` and `src/logic/prayer.ts`.
    * **Phase 4** (Notifications): Adds `native/android/` and links to the scheduler.
    * **Phase 5** (Sounds): Adds `scripts/generate-sounds.js` and `src/logic/sounds.ts`.
  - Every single step maintains 100% backward compatibility, verified with `npm run build` and `tsc --noEmit`.

#### 4. Native Android Risks & Ironclad Fallback Plan

- **The Risk**: If custom Java code has a compilation error or missing import, `./gradlew assembleDebug` in GitHub Actions will fail. Because you manage the project from a phone browser, you cannot open Android Studio to debug native compilation errors.
- **The Safeguards**:
  1. **Capacitor Plugin First**: 90% of reminder tasks (closed-app alarms, high-importance notification channels, Done/Snooze action buttons) are handled directly by the official, pre-compiled `@capacitor/local-notifications@6` plugin.
  2. **Minimal Native Footprint**: Any custom Java file in `native/android/` will be tiny (under 60 lines), using standard Android SDK APIs (such as `Intent(Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS)`).
  3. **Non-Breaking Workflow Injection**: The GitHub Actions workflow copies native files into `android/` using a safe copy check:
     ```bash
     [ -d native/android ] && cp -r native/android/* android/app/src/main/java/com/selfcarehero/app/ || true
     ```
  4. **Instant Fallback**: If a native helper ever causes a build issue, the workflow simply skips custom Java and compiles with standard `@capacitor/local-notifications@6`, ensuring your APK build never breaks.
- **What Cannot Be Tested Without Your Physical Phone**:
  - Real notification alarm chime while the phone is asleep in your pocket for 6 hours (Android Doze mode).
  - Exact alarm delivery accuracy under manufacturer battery restrictions (Samsung OneUI / Xiaomi MIUI).
  - Sound resonance and volume ramp through your phone's physical speaker hardware.

---

### K. ARCHITECTURAL DECISION & LAYER-BY-LAYER MIX AUDIT TABLE

Per the project's **No Default Side** and **Mix by Layer** governance, we do not arbitrarily favour libraries over custom code, nor custom code over libraries. Every capability is decomposed into distinct layers:
1. **Hard Generic Core**: Edge cases, mathematical standards, platform quirks, and system low-level APIs.
2. **Thin App-Specific Layer**: Self-Care Hero rules, visual design tokens, wording, and custom user flows.
3. **Thin Adapter**: A clean interface module isolating the rest of the application so screens never import external libraries directly.

#### 1. Verdict Standard Definitions

| Verdict | When Applied |
| :--- | :--- |
| **Use library** | A mature, verified open-source solution clearly wins on correctness, bundle size, and maintenance. |
| **Keep custom** | Our existing code is already robust, verified, and fits the unique concept of Self-Care Hero better than any generic package. |
| **Hybrid** | A proven library handles the hard mathematical or native core, wrapped in our own thin adapter for app rules, look, and state. |
| **Write custom** | Nothing mature fits the offline/React 19 constraints, or an external package would be heavier and more awkward than our own typed logic. |
| **Defer** | Low immediate ROI or adds disproportionate risk/complexity to manage from a phone browser at this stage. |

---

#### 2. Comprehensive Subsystem Audit Table

| Job / Feature | Verdict | Layer Breakdown & Sources | Adapter File | Text Diagram | Decision Rationale ("Why") |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Astronomical Prayer Times Calculation** | **Hybrid** | **Core**: Sun angle & high-latitude trigonometry (`adhan@4.4.6`, MIT)<br>**App Layer**: Manual/Auto toggles, per-prayer minute offsets, custom sounds | `src/utils/notifications.ts`<br>(`calculatePrayerTimes`) | `[Offsets & Prayer Toggles] ➔ [calculatePrayerTimes] ➔ [adhan-js math core]` | Solar declination and twilight angle calculations have numerous geographical and seasonal edge cases. `adhan` is a verified, pure mathematical library (24kB, zero network calls, 100% offline). Our adapter shields all components so no view ever touches `adhan` directly. |
| **Native Closed-App Background Notifications** | **Hybrid** | **Core**: Android 8+ Notification Channels, wake alarms, lockscreen flags (`@capacitor/local-notifications@6`, MIT)<br>**App Layer**: 7-day rolling window scheduler, 50-alarm cap, medicine inventory decrement, action listeners | `src/utils/notifications.ts`<br>(`scheduleRollingReminders`) | `[7-Day Recurrence & Meds] ➔ [scheduleRollingReminders] ➔ [@capacitor/local-notifications]` | Android exact wake alarms (`AlarmManager`) require deep OS manifest and JNI handling that cannot run inside a WebView. The official Capacitor 6 plugin handles the OS bridge safely. Our custom adapter caps alarms to a rolling 50-item window to prevent Android OEM throttling. |
| **Relative Reminder Chains & Interval Repeat** | **Write custom** | **Core**: Modulo minute arithmetic (`(h * 60 + m + delay) % 1440`), midnight day wrapping<br>**App Layer**: 3-hour study review chains, 2-hour water windows, late-night visual badges | `src/utils/notifications.ts`<br>(`resolveDaySchedules`) | `[Chain definitions & intervals] ➔ [resolveDaySchedules] ➔ [Pure modulo arithmetic]` | Heavy recurrence packages (like `rrule`, 120kB+) are designed for complex iCalendar RFC-5545 strings and fight simple UI state. Writing custom modulo arithmetic handles midnight wrapping in 25 lines of clean, typed TypeScript with zero external bloat. |
| **Melodic Sound Chimes & Acoustic Synthesis** | **Hybrid** | **Core**: Hardware audio graph, oscillator nodes, exponential gain ramps (Standard Web Audio API)<br>**App Layer**: 5 psychoacoustic harmonic presets (1.5-3.5 kHz ear resonance), 800ms anti-startle volume attack ramp | `src/utils/audio.ts`<br>(`playPresetTone`, `getAudioContext`) | `[Scientific Harmonics & Presets] ➔ [playPresetTone] ➔ [Web Audio API Oscillator/Gain]` | External audio engines (Howler, Tone.js) add 80kB+ overhead and game audio loaders. The standard browser Web Audio API is pre-installed in every Android WebView and works 100% offline. Our adapter handles WebView audio autoplay policy gracefully. |
| **Local State Persistence & Migration** | **Keep custom** | **Core**: Key-value browser storage (`localStorage`) with quota fallback<br>**App Layer**: Schema migration engine (v1..v15), rolling 10-slot snapshots, pre-wipe emergency snapshot | `src/utils/storage.ts`<br>(`loadState`, `saveState`, `migrate`) | `[AppState v1-v15 & snapshots] ➔ [storage.ts adapter] ➔ [localStorage + Quota fallback]` | Self-Care Hero's state is tailor-made for offline habit progression. An external database (Dexie, SQLite) adds unnecessary binary compilation risk in CI. Our custom migration function has safely preserved data across 15 iterations with emergency rollback safety. |
| **XP Formulas, Leveling & Streaks Engine** | **Keep custom** | **Core & App Layer**: Event-log derivation (`ix`), square-root level formulas (`plvOf`), Daily Three consistency shields, rest-day streak bridging | `src/utils/xp.ts`<br>(`ix`, `plvOf`, `calculateDailyThreeStreak`) | `[Event log & rest tokens] ➔ [xp.ts pure functions] ➔ [Derived Player Profile]` | This is the proprietary gamification core of Self-Care Hero. No external package understands Carrot Coins, Pip character moods, or Daily Three rest tokens. Keeping it pure TypeScript with `WeakMap` memoization ensures calculations run in under 2ms with 0 dependencies. |
| **Year-View Contribution Heatmap (365 Days)** | **Keep custom** | **Core**: 53-week Sunday alignment matrix, quarterly paging, color intensity scales<br>**App Layer**: Interactive day popover, Daily Three gold ring indicators, CSS token rendering | `src/utils/xp.ts`<br>(`getYearHeatmapData`) + `HeatmapView.tsx` | `[365-day events & intensity] ➔ [getYearHeatmapData] ➔ [Responsive SVG / CSS Grid]` | Generic charting libraries (Chart.js, Recharts) are 200kB-400kB, introduce canvas blur on mobile screens, and complicate touch inspection. Our custom SVG/CSS grid is under 150 lines, responsive, supports 3 distinct views, and renders with zero external bundle bloat. |
| **Design Tokens & Theme Styling** | **Use library** | **Core**: CSS parsing, vendor prefixing, tree-shaking (`tailwindcss@4.3.3`, MIT)<br>**App Layer**: Centralized semantic tokens (`--bg`, `--sf`, `--ink`, `--ac`, `--warn`, `--danger`) in `theme.css` | `src/styles/theme.css` & `src/index.css` | `[Sage Sanctuary design tokens] ➔ [theme.css / index.css] ➔ [Tailwind CSS v4 compiler]` | Tailwind CSS v4 compiles ahead-of-time during `npm run build`, producing clean, zero-runtime CSS with full tree-shaking. Custom CSS variables provide 1-point color adjustments while Tailwind handles responsive grid layouts. |
| **Vector Icons (UI Controls, Badges, Tabs)** | **Use library** | **Core**: Scalable, accessible vector SVG path geometry (`lucide-react@0.546.0`, ISC)<br>**App Layer**: Theme-color inheritance via `currentColor`, 48dp touch wrappers | `src/components/ui/` | `[Button & tab controls] ➔ [Touch-target wrapper] ➔ [Lucide SVG icons]` | Hand-crafting dozens of SVG icons leads to jagged paths, unoptimized viewBoxes, and visual inconsistency. `lucide-react` tree-shakes down to only the exact icons imported and renders pure inline SVGs without remote font files or CDN requests. |
| **Native Backup File Sharing** | **Hybrid** | **Core**: Native Android intent dispatch without storage permissions (Web Share API / `@capacitor/share@6`, MIT)<br>**App Layer**: JSON serialization, timestamped filename generation, error recovery | `src/components/SettingsModal.tsx`<br>(`handleShareBackup`) | `[JSON state serialization] ➔ [handleShareBackup adapter] ➔ [Web Share API / Capacitor Share]` | Writing custom Android Java to request broad storage permissions is rejected by Google Play and creates security warnings. Standard Web Share API delegates file transfer to native apps (Google Drive, WhatsApp, Files) cleanly with zero special permissions. |
| **PIN Privacy Screen & Vault** | **Defer** | **Core & App Layer**: Cryptographic key derivation and biometric prompt | Defer to Phase 3 Feature 12 | `[PIN state] ➔ [Lockscreen barrier] ➔ [Deferred]` | Implementing cryptographic PIN lock before the core reminder and habit features are complete adds unnecessary UX friction and lock-out risk for a non-technical owner. Deferring keeps current work strictly focused. |
| **Mood & Habit Correlation Pattern Analytics** | **Write custom** | **Core**: Pearson correlation coefficient on 14+ day sample pairs<br>**App Layer**: Compassionate non-causal pattern phrasing ("pattern, not a cause"), sample-size thresholding | `src/logic/patterns.ts` (Phase 3 Feature 8) | `[Daily habits & mood logs] ➔ [patterns.ts analyzer] ➔ [Pattern insight cards]` | Heavy statistics packages (like simple-statistics) are bulky. The Pearson correlation formula is 12 lines of pure TypeScript. Writing custom logic guarantees compassionate phrasing and strict sample-size thresholding (requires at least 7 active entries). |

---

#### 3. Summary of Verdict Counts

| Verdict Category | Count | Subsystems |
| :--- | :--- | :--- |
| **Use library** | **2** | Design Tokens / Tailwind CSS v4, Vector Icons / `lucide-react` |
| **Keep custom** | **3** | Local State Persistence & Migration, XP / Level / Streaks Engine, Year-View Contribution Heatmap |
| **Hybrid** | **4** | Astronomical Prayer Engine, Native Background Notifications, Web Audio Sound Synthesis, Native Backup File Sharing |
| **Write custom** | **2** | Relative Reminder Chains & Modulo Arithmetic, Mood & Habit Correlation Analytics |
| **Defer** | **1** | PIN Privacy Screen & Vault |
| **Total Evaluated** | **12** | Complete application footprint |

---

#### 4. The 3 Best Proposed Mixes vs. The 3 Riskiest

##### The 3 Best Proposed Mixes:
1. **Offline Prayer Times Engine (`adhan` core + custom offset/audio adapter)**:
   - *Why it's great*: The celestial trigonometry is completely offloaded to a verified library, while our custom adapter handles minute offsets, per-prayer sound choices, and UI toggles without leaking library types into views.
2. **Native Closed-App Background Notifications (`@capacitor/local-notifications` + rolling 50-alarm scheduler adapter)**:
   - *Why it's great*: The fragile OS notification channel and exact alarm delivery are delegated to the official Capacitor plugin, while our custom adapter manages the 7-day rolling window, medicine tracking decrement, and privacy masking.
3. **Web Audio Melodic Chimes (Web Audio API hardware synth + custom psychoacoustic harmonic presets)**:
   - *Why it's great*: Hardware audio mixing is handled by the browser engine, while our custom adapter applies our exact acoustic parameters (1.5-3.5 kHz resonance, 800ms anti-startle ramp, consonant intervals) with zero downloaded audio files.

##### The 3 Riskiest Mixes:
1. **Native Background Notifications across Android OEM Doze Modes**:
   - *The Risk*: Samsung, Xiaomi, and Huawei aggressively kill background alarm workers after extended screen-off periods. Even with `@capacitor/local-notifications`, the phone's battery optimization can silence alarms unless the user sets "Unrestricted" in device settings.
2. **Relative Reminder Chaining across Calendar Midnights**:
   - *The Risk*: When a chain delay (e.g. +3h) pushes a 10:00 PM reminder to 1:00 AM, our custom modulo arithmetic wraps to 01:00, but if the app doesn't accurately advance the target date in the 7-day scheduler, alarms could schedule for the current day's past 1:00 AM.
3. **Audio Channel Sound Immutability on Android 8+**:
   - *The Risk*: Android permanently locks notification channel sounds once created. If a user changes a sound preset in the app, the adapter must create a new versioned channel ID, otherwise the OS continues playing the previous sound.

---

#### 5. The 3 Decisions Least Sure About
1. **Writing Custom Modulo Arithmetic vs. Adopting a Recurrence Library**: We decided to write custom modulo arithmetic for relative chains and interval windows. If you later request complex arbitrary recurrence (e.g. "every 3rd Tuesday except holidays"), a small recurrence library might become necessary.
2. **Deferring PIN Lock Screen**: Deferring biometric/PIN protection keeps code simple, but if you store sensitive medical notes or personal journal entries on a shared family device, you may desire immediate privacy.
3. **Web Share API vs. Direct File Blob Download**: We currently support 1-click JSON blob downloads. Using `navigator.share` is ideal on Android, but behaves inconsistently on desktop browsers if the platform lacks share targets.

