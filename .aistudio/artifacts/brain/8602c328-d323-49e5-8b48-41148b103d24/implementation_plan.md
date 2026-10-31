# BloomQuest — Final Approved Workflow Verification & Implementation Plan

---

## 1. Confirmed Application Identity & Architecture

- **Target APK Architecture**: **100% Native Jetpack Compose (Kotlin)** (`com.example.selfcarehero.MainActivity`).
- **Identity Distinction**:
  - **Kotlin Namespace**: `com.example.selfcarehero` (governs internal Kotlin code package and `R` class generation).
  - **Android Application ID**: `com.aistudio.selfcarehero.kzpvqw` (governs external OS package identity and device installation).
  - **Launcher Activity**: `com.example.selfcarehero.MainActivity`.
  - **Application Label**: `BloomQuest` (defined in `@string/app_name`).
- **UI & Subsystems Driving the APK**:
  - Material 3 Compose screens: `TodayScreen`, `SkillsScreen`, `LearnScreen`, `VideoLibraryScreen`, `StudyScreen`, `JournalScreen`, `AlertsScreen`, `StatsScreen`.
  - Room SQLite Database, Media3 ExoPlayer, ONNX Runtime Mobile (`onnxruntime-android:1.19.2`), and `AlarmManager`.
- **Web Project Separation**: The React 19 + TypeScript + Vite 6 code in `src/` is an independent web application for browser and AI Studio preview. It is not loaded by native Android, and is not a prerequisite for building the Android APK.

---

## 2. Toolchain Compatibility & Version Preservation Protocol

- **Existing Versions Preserved**:
  - Gradle Wrapper: `gradle-9.3.1-bin.zip`
  - Android Gradle Plugin (AGP): `8.7.3` (`gradle/libs.versions.toml`)
  - Kotlin: `2.0.21` (`gradle/libs.versions.toml`)
  - KSP: `2.0.21-1.0.28` (`gradle/libs.versions.toml`)
  - JDK Target: Temurin JDK `21`
  - Android SDK: `compileSdk = 35`, `targetSdk = 35`, `minSdk = 24`
- **Accurate Status of Checks**:
  - *Already Executed in Container*: Gradle configuration evaluation (`./gradlew tasks`) parsed successfully. This verifies syntax and plugin declarations only; it does **not** prove full compilation.
  - *Deferred to GitHub Actions*: Full unit testing (`./gradlew testDebugUnitTest`) and full compilation (`./gradlew assembleDebug`) will execute on the GitHub Actions runner where the Android SDK is present.
  - *Failure Policy*: If either task fails due to toolchain incompatibility, the workflow stops immediately with the exact compiler logs before any version adjustments are considered.

---

## 3. Strict Branch & Commit Source Locking

- **Hard Failure on Branch Mismatch**:
  ```bash
  if [ "${{ github.ref_name }}" != "restored-checkpoint" ]; then
    echo "FATAL: Build aborted. This workflow must ONLY execute on branch 'restored-checkpoint'."
    echo "Current branch is '${{ github.ref_name }}'."
    exit 1
  fi
  ```
- **Commit Pinning**: `actions/checkout@v4` with `ref: ${{ github.sha }}` ensures that the checked-out tree matches the exact triggering commit SHA.

---

## 4. Deliverable Packaging & Exact-Content Verification Suite

### A. Accurate README.txt Generation
- `README.txt` is generated **strictly after** both `./gradlew testDebugUnitTest` and `./gradlew assembleDebug` have exited with code 0.
- Contains the verified commit SHA, build timestamp, package ID, and SHA256 digest.

### B. Strict Verification Suite (Before Upload)
1. **SHA256 Checksum Verification**:
   `sha256sum -c BloomQuest-Restored-Checkpoint.apk.sha256`
2. **ZIP Archive Integrity Check**:
   `unzip -t BloomQuest-Restored-Checkpoint-Android.zip`
3. **ZIP Exact-Content Check**:
   - Asserts that `unzip -Z -1` returns **exactly 3 files**:
     - `BloomQuest-Restored-Checkpoint.apk`
     - `README.txt`
     - `BloomQuest-Restored-Checkpoint.apk.sha256`
   - Immediately halts with exit code 1 if any file is missing, duplicate, or extra.
4. **Mandatory APK Package Identity Check via `aapt2`**:
   - Asserts `ANDROID_HOME` is set; fails with code 1 if absent.
   - Locates `aapt2`; fails with code 1 if missing.
   - Extracts package identity from `BloomQuest-Restored-Checkpoint.apk`.
   - Asserts exact equality with `com.aistudio.selfcarehero.kzpvqw`; fails with code 1 on mismatch.

---

## 5. GitHub Release Asset Verification & Artifact Preservation

1. The standalone APK and ZIP are uploaded first to GitHub Actions artifacts (`actions/upload-artifact@v4`) with 90-day retention.
2. In the release step:
   - If the release tag `restored-v1.6-${{ github.sha }}` exists, uploads with `--clobber`.
   - If not, creates the release with both files attached.
3. The workflow queries `gh release view "$RELEASE_TAG" --json assets` to verify that both `BloomQuest-Restored-Checkpoint.apk` and `BloomQuest-Restored-Checkpoint-Android.zip` are present.
4. Reports explicit `SUCCESS` only when both release assets are verified. If release publication fails, reports the condition while confirming that the 90-day GitHub Actions artifacts remain safely preserved.

---

## 6. Corrected GitHub Actions Workflow (`.github/workflows/build-apk.yml`)

```yaml
name: Build Android APK & Publish Release

on:
  push:
    branches: [ restored-checkpoint ]
  workflow_dispatch:

permissions:
  contents: write
  actions: read

jobs:
  validate-web:
    name: Validate Web Application
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Restored Checkpoint Source
        uses: actions/checkout@v4
        with:
          ref: ${{ github.sha }}

      - name: Verify Branch Identity
        run: |
          if [ "${{ github.ref_name }}" != "restored-checkpoint" ]; then
            echo "ERROR: Web validation must run on 'restored-checkpoint'. Found: '${{ github.ref_name }}'."
            exit 1
          fi
          echo "Validating Web Checkpoint Commit: ${{ github.sha }}"
          git log -1 --stat

      - name: Set up Node.js 22
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'npm'

      - name: Install Dependencies
        run: npm ci

      - name: TypeScript Type Check
        run: npm run lint

      - name: Production Web Build
        run: npm run build

  build-android:
    name: Build Native Android APK
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Restored Checkpoint Source
        uses: actions/checkout@v4
        with:
          ref: ${{ github.sha }}

      - name: Strict Branch & Commit Verification
        run: |
          echo "================================================"
          echo "Building BloomQuest Restored Checkpoint"
          echo "Target Branch: ${{ github.ref_name }}"
          echo "Target Commit SHA: ${{ github.sha }}"
          echo "Triggered By: ${{ github.event_name }}"
          echo "================================================"
          if [ "${{ github.ref_name }}" != "restored-checkpoint" ]; then
            echo "FATAL: Build aborted. This workflow must ONLY execute on branch 'restored-checkpoint'."
            echo "Current branch is '${{ github.ref_name }}'."
            exit 1
          fi
          git status
          git log -1 --stat

      - name: Set up JDK 21
        uses: actions/setup-java@v4
        with:
          distribution: temurin
          java-version: 21

      - name: Setup Gradle
        uses: gradle/actions/setup-gradle@v3

      - name: Grant execute permission for gradlew
        run: chmod +x gradlew

      - name: Run Native Android Unit Tests
        run: ./gradlew testDebugUnitTest --stacktrace

      - name: Build Android Debug APK
        run: ./gradlew assembleDebug --stacktrace

      - name: Verify Deliverables & Package Archive
        run: |
          APK_PATH="app/build/outputs/apk/debug/app-debug.apk"
          if [ ! -s "$APK_PATH" ]; then
            echo "ERROR: APK does not exist or is empty at $APK_PATH"
            exit 1
          fi
          
          cp "$APK_PATH" BloomQuest-Restored-Checkpoint.apk
          sha256sum BloomQuest-Restored-Checkpoint.apk > BloomQuest-Restored-Checkpoint.apk.sha256
          
          BUILD_DATE=$(date -u '+%Y-%m-%d %H:%M:%S UTC')
          CHECKSUM=$(awk '{print $1}' BloomQuest-Restored-Checkpoint.apk.sha256)
          COMMIT_SHA="${{ github.sha }}"
          
          cat << EOF > README.txt
          Application: BloomQuest
          Package ID: com.aistudio.selfcarehero.kzpvqw
          Source Checkpoint: Restored Google AI Studio Workspace
          Commit SHA: ${COMMIT_SHA}
          Build Type: Android Debug APK
          Build Date: ${BUILD_DATE}
          Architecture: 100% Native Jetpack Compose (Kotlin 2.0 / Room / Media3 / ONNX SmolLM)
          
          Tests Executed:
          - Android Unit Tests (./gradlew testDebugUnitTest): PASSED
            * DateUtilsTest
            * HeroLogicTest
            * LocalAiEngineTest
            * StateSerializationTest
          - Android Debug APK Assembly (./gradlew assembleDebug): PASSED
          
          SHA256 Checksum:
          ${CHECKSUM}  BloomQuest-Restored-Checkpoint.apk
          
          Limitations:
          - Physical device installation testing was not performed (headless CI runner).
          - GitHub Actions workflow artifacts are retained for 90 days.
          EOF
          
          echo "=== Generated README.txt Content ==="
          cat README.txt
          echo "===================================="
          
          zip -j BloomQuest-Restored-Checkpoint-Android.zip \
            BloomQuest-Restored-Checkpoint.apk \
            README.txt \
            BloomQuest-Restored-Checkpoint.apk.sha256

      - name: Mandatory Deliverable & Exact ZIP Content Verification
        run: |
          echo "1. Verifying SHA256 Checksum..."
          sha256sum -c BloomQuest-Restored-Checkpoint.apk.sha256
          
          echo "2. Verifying ZIP Archive Integrity..."
          unzip -t BloomQuest-Restored-Checkpoint-Android.zip
          
          echo "3. Verifying Exact ZIP Contents (strictly 3 files)..."
          ZIP_FILES=$(unzip -Z -1 BloomQuest-Restored-Checkpoint-Android.zip | sort)
          EXPECTED_FILES=$(printf "BloomQuest-Restored-Checkpoint.apk\nBloomQuest-Restored-Checkpoint.apk.sha256\nREADME.txt" | sort)
          
          echo "ZIP entries found:"
          echo "$ZIP_FILES"
          
          if [ "$ZIP_FILES" != "$EXPECTED_FILES" ]; then
            echo "FATAL: ZIP contains unexpected entries or missing files!"
            echo "Expected exactly:"
            echo "$EXPECTED_FILES"
            exit 1
          fi
          
          ZIP_COUNT=$(unzip -Z -1 BloomQuest-Restored-Checkpoint-Android.zip | wc -l)
          if [ "$ZIP_COUNT" -ne 3 ]; then
            echo "FATAL: ZIP entry count is $ZIP_COUNT (expected exactly 3)."
            exit 1
          fi
          
          echo "4. Mandatory APK Package Identity Verification via aapt2..."
          if [ -z "$ANDROID_HOME" ]; then
            echo "FATAL: ANDROID_HOME environment variable is not defined."
            exit 1
          fi
          
          AAPT2_BIN=$(find "$ANDROID_HOME/build-tools" -name aapt2 | sort -V | tail -n 1)
          if [ -z "$AAPT2_BIN" ] || [ ! -x "$AAPT2_BIN" ]; then
            echo "FATAL: aapt2 executable not found in $ANDROID_HOME/build-tools."
            exit 1
          fi
          echo "Using aapt2 binary at: $AAPT2_BIN"
          
          EXTRACTED_PKG=$("$AAPT2_BIN" dump badging BloomQuest-Restored-Checkpoint.apk | grep "package: name=" | sed -E "s/.*package: name='([^']*)'.*/\1/")
          EXPECTED_PKG="com.aistudio.selfcarehero.kzpvqw"
          
          echo "Extracted Package Name: '$EXTRACTED_PKG'"
          echo "Expected Package Name:  '$EXPECTED_PKG'"
          
          if [ "$EXTRACTED_PKG" != "$EXPECTED_PKG" ]; then
            echo "FATAL: Package identity mismatch! Expected '$EXPECTED_PKG', found '$EXTRACTED_PKG'."
            exit 1
          fi
          
          echo "=========================================================="
          echo "SUCCESS: All deliverable verifications passed strictly."
          echo "- SHA256 matches"
          echo "- ZIP archive integrity verified"
          echo "- Exactly 3 required files present in ZIP"
          echo "- Package ID '$EXTRACTED_PKG' matches expected configuration"
          echo "=========================================================="

      - name: Upload Standalone APK Artifact
        uses: actions/upload-artifact@v4
        with:
          name: BloomQuest-Restored-Checkpoint-APK
          path: BloomQuest-Restored-Checkpoint.apk
          retention-days: 90

      - name: Upload Verification ZIP Artifact
        uses: actions/upload-artifact@v4
        with:
          name: BloomQuest-Restored-Checkpoint-Android-ZIP
          path: BloomQuest-Restored-Checkpoint-Android.zip
          retention-days: 90

      - name: Publish GitHub Release
        id: release_step
        continue-on-error: true
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          RELEASE_TAG="restored-v1.6-${{ github.sha }}"
          if gh release view "$RELEASE_TAG" 2>/dev/null; then
            echo "Release '$RELEASE_TAG' exists. Uploading deliverables to existing release..."
            gh release upload "$RELEASE_TAG" \
              BloomQuest-Restored-Checkpoint.apk \
              BloomQuest-Restored-Checkpoint-Android.zip \
              --clobber
          else
            echo "Creating GitHub Release '$RELEASE_TAG'..."
            gh release create "$RELEASE_TAG" \
              BloomQuest-Restored-Checkpoint.apk \
              BloomQuest-Restored-Checkpoint-Android.zip \
              --title "BloomQuest — Restored Checkpoint APK" \
              --notes "Automated release compiled from restored checkpoint commit \`${{ github.sha }}\`. Contains verified native Android debug APK, README.txt, and SHA256 checksums."
          fi

      - name: Verify GitHub Release Assets & Report Status
        run: |
          RELEASE_TAG="restored-v1.6-${{ github.sha }}"
          echo "Verifying release assets attached to '$RELEASE_TAG'..."
          RELEASE_ASSETS=$(gh release view "$RELEASE_TAG" --json assets --jq '.assets.[].name' 2>/dev/null || true)
          echo "Attached assets found in release:"
          echo "$RELEASE_ASSETS"
          
          HAS_APK=$(echo "$RELEASE_ASSETS" | grep -w "BloomQuest-Restored-Checkpoint.apk" || true)
          HAS_ZIP=$(echo "$RELEASE_ASSETS" | grep -w "BloomQuest-Restored-Checkpoint-Android.zip" || true)
          
          if [ -n "$HAS_APK" ] && [ -n "$HAS_ZIP" ]; then
            echo "SUCCESS: Both expected release assets (APK and ZIP) are confirmed attached to GitHub Release '$RELEASE_TAG'."
          else
            echo "NOTICE: GitHub Release asset verification did not confirm both assets."
            echo "Standalone APK and ZIP are preserved as GitHub Actions workflow artifacts (90-day retention)."
          fi
```

---

## 7. Exact Files to be Modified / Created

1. `package-lock.json` *(New file)*: Deterministic npm lockfile generated directly from restored `package.json`.
2. `.github/workflows/build-apk.yml` *(Updated file)*: Upgraded with the final approved workflow.
3. `app/build.gradle.kts` *(Updated file)*: Removed custom `debugConfig` block so `debug` uses standard default AGP debug signing (`~/.android/debug.keystore`).
4. `AI_HANDOFF.md` & `HANDOFF.md` *(Updated files)*: Complete documentation of workflow execution and download instructions.

*(Zero modifications to application source code, UI composables, theme tokens, models, or screen logic).*
