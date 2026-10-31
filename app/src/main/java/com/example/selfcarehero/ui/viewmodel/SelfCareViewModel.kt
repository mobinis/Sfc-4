package com.example.selfcarehero.ui.viewmodel

import android.app.Activity
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.selfcarehero.data.FirestoreSyncRepository
import com.example.selfcarehero.data.SelfCareRepository
import com.example.selfcarehero.model.*
import com.example.selfcarehero.utils.SoundHapticsManager
import com.example.selfcarehero.data.room.VideoNote
import com.example.selfcarehero.data.room.BookNote
import com.google.firebase.auth.FirebaseUser
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

enum class TabType(val label: String, val iconEmoji: String) {
    TODAY("Today", "⚡"),
    SKILLS("Skills", "🌳"),
    LEARN("Learn", "🧠"),
    VIDEOS("Videos", "🎬"),
    STUDY("Study", "📖"),
    JOURNAL("Journal", "✍️"),
    ALERTS("Alerts", "🔔"),
    STATS("Stats", "🏆")
}

class SelfCareViewModel(
    private val repository: SelfCareRepository,
    val soundHaptics: SoundHapticsManager? = null,
    val firestoreSync: FirestoreSyncRepository? = null
) : ViewModel() {
    val state: StateFlow<AppState> = repository.state

    private val _currentTab = MutableStateFlow(TabType.TODAY)
    val currentTab: StateFlow<TabType> = _currentTab.asStateFlow()

    private val _routineFilter = MutableStateFlow("all")
    val routineFilter: StateFlow<String> = _routineFilter.asStateFlow()

    private val _skillNatureFilter = MutableStateFlow("all")
    val skillNatureFilter: StateFlow<String> = _skillNatureFilter.asStateFlow()

    private val _statsViewMode = MutableStateFlow("insights") // "insights" or "heatmap"
    val statsViewMode: StateFlow<String> = _statsViewMode.asStateFlow()

    private val _toast = MutableStateFlow<String?>(null)
    val toast: StateFlow<String?> = _toast.asStateFlow()

    private val _soundEnabled = MutableStateFlow(soundHaptics?.isSoundEnabled ?: true)
    val soundEnabled: StateFlow<Boolean> = _soundEnabled.asStateFlow()

    private val _hapticsEnabled = MutableStateFlow(soundHaptics?.isHapticsEnabled ?: true)
    val hapticsEnabled: StateFlow<Boolean> = _hapticsEnabled.asStateFlow()

    // Cloud Sync State
    val currentUser: StateFlow<FirebaseUser?> = firestoreSync?.currentUser ?: MutableStateFlow(null)
    val syncStatus: StateFlow<String> = firestoreSync?.syncStatus ?: MutableStateFlow("Local Storage")
    val isSyncing: StateFlow<Boolean> = firestoreSync?.isSyncing ?: MutableStateFlow(false)
    var showCloudSyncDialog = MutableStateFlow(false)

    // Modals
    var editingNode = MutableStateFlow<NodeItem?>(null)
    var targetParentId = MutableStateFlow<String?>("0")
    var showEditNodeDialog = MutableStateFlow(false)
    var showFocusTimerDialog = MutableStateFlow(false)
    var showUrgeDialog = MutableStateFlow(false)
    var showUrgeSurfingScreen = MutableStateFlow(false)
    var showRewardShopDialog = MutableStateFlow(false)
    var showAddLearnDialog = MutableStateFlow(false)
    var showTeachBackDialog = MutableStateFlow(false)
    var teachBackTargetItem = MutableStateFlow<LearnItem?>(null)
    var showAddTopicDialog = MutableStateFlow(false)
    var showAddAlertDialog = MutableStateFlow(false)
    var showBackupDialog = MutableStateFlow(false)
    var showWeeklyReviewDialog = MutableStateFlow(false)

    // Safety Guards & Celebration Modals
    var pendingRestoreSnapshot = MutableStateFlow<BackupSnapshot?>(null)
    var showConfirmRestoreDialog = MutableStateFlow(false)
    var showResetHeroDialog = MutableStateFlow(false)

    var showCelebration = MutableStateFlow(false)
    var celebrationTitle = MutableStateFlow("")
    var celebrationSubtitle = MutableStateFlow("")

    // Mature Feature Dialogs: Routines, Breath, Copilot AI, Monthly Recap
    var activeRoutine = MutableStateFlow<RoutineFlow?>(null)
    var showRoutinePlayerDialog = MutableStateFlow(false)
    var showBreathPacerDialog = MutableStateFlow(false)
    var showLocalAiDialog = MutableStateFlow(false)
    var initialAiPrompt = MutableStateFlow<String?>(null)
    var showMonthlyRecapDialog = MutableStateFlow(false)

    // Anti-Goals & Dopamine Shield
    var editingAntiGoal = MutableStateFlow<AntiGoalItem?>(null)
    var showEditAntiGoalDialog = MutableStateFlow(false)

    // 90-Day Life Sprint & Identity Compass
    var showSprintGoalDialog = MutableStateFlow(false)

    // Circadian Sleep Architecture Clock
    var showCircadianSettingsDialog = MutableStateFlow(false)

    // Carrot-Coin Habit Staking Contracts
    var showHabitContractDialog = MutableStateFlow(false)
    var showRescueContractDialog = MutableStateFlow(false)
    var rescueContractTarget = MutableStateFlow<HabitContract?>(null)

    // PIN Privacy & Security (Phase 3, Feature 12)
    private val _isPinSessionUnlocked = MutableStateFlow(false)
    val isPinSessionUnlocked: StateFlow<Boolean> = _isPinSessionUnlocked.asStateFlow()
    var showPinSettingsDialog = MutableStateFlow(false)
    var showPinVerificationDialog = MutableStateFlow(false)
    var pinVerificationTitle = MutableStateFlow("Enter Privacy PIN")
    var pinVerificationSubtitle = MutableStateFlow("Unlock to access confidential section")
    var pendingPinSuccessAction: (() -> Unit)? = null

    // Dedicated Video Library & Player
    var showAddVideoDialog = MutableStateFlow(false)
    var selectedVideoForPlayback = MutableStateFlow<VideoResourceItem?>(null)
    private val _videoCategoryFilter = MutableStateFlow("all")
    val videoCategoryFilter: StateFlow<String> = _videoCategoryFilter.asStateFlow()

    fun setVideoCategoryFilter(category: String) {
        _videoCategoryFilter.value = category
    }

    fun playVideo(video: VideoResourceItem) {
        selectedVideoForPlayback.value = video
        repository.recordVideoPlayback(video.id)
        soundHaptics?.play(SoundHapticsManager.SoundType.COIN_REWARD, SoundHapticsManager.HapticType.MEDIUM_PULSE)
    }

    fun closeVideoPlayer() {
        selectedVideoForPlayback.value = null
    }

    fun addVideo(
        title: String,
        url: String,
        category: String,
        duration: String,
        description: String,
        tags: List<String>
    ) {
        repository.addVideoResource(title, url, category, duration, description, tags)
        soundHaptics?.play(SoundHapticsManager.SoundType.COIN_REWARD, SoundHapticsManager.HapticType.MEDIUM_PULSE)
        showToast("Video added to library! +15 XP 🎬")
    }

    fun deleteVideo(videoId: String) {
        repository.deleteVideoResource(videoId)
        soundHaptics?.play(SoundHapticsManager.SoundType.INCREMENT_COUNT, SoundHapticsManager.HapticType.LIGHT_CLICK)
        showToast("Video removed")
    }

    fun toggleFavoriteVideo(videoId: String) {
        repository.toggleFavoriteVideo(videoId)
        soundHaptics?.play(SoundHapticsManager.SoundType.INCREMENT_COUNT, SoundHapticsManager.HapticType.LIGHT_CLICK)
    }

    fun updateVideoNotes(videoId: String, notes: String) {
        repository.updateVideoNotes(videoId, notes)
        soundHaptics?.play(SoundHapticsManager.SoundType.CHECK_HABIT, SoundHapticsManager.HapticType.LIGHT_CLICK)
        showToast("Video notes saved! +5 XP 📝")
    }

    // Room Database Backed Video Notes
    fun getVideoNotes(videoId: String): Flow<List<VideoNote>> = repository.getVideoNotes(videoId)

    fun addVideoNote(
        videoId: String,
        noteText: String,
        videoTimestampMs: Long = 0L,
        formattedTime: String = "00:00"
    ) {
        if (noteText.isBlank()) return
        viewModelScope.launch {
            val note = VideoNote(
                videoId = videoId,
                noteText = noteText.trim(),
                videoTimestampMs = videoTimestampMs,
                formattedTime = formattedTime,
                timestamp = System.currentTimeMillis(),
                dateStr = DateUtils.todayStr()
            )
            repository.saveVideoNote(note)
            soundHaptics?.play(SoundHapticsManager.SoundType.CHECK_HABIT, SoundHapticsManager.HapticType.LIGHT_CLICK)
            showToast("Video note saved to Room! +5 XP 📝")
        }
    }

    fun deleteVideoNote(noteId: String) {
        viewModelScope.launch {
            repository.deleteVideoNote(noteId)
            soundHaptics?.play(SoundHapticsManager.SoundType.INCREMENT_COUNT, SoundHapticsManager.HapticType.LIGHT_CLICK)
            showToast("Video note removed")
        }
    }

    // Room Database Backed Book Notes
    fun getBookNotes(bookId: String): Flow<List<BookNote>> = repository.getBookNotes(bookId)

    fun addBookNote(
        bookId: String,
        noteText: String,
        pageNumber: Int = 0,
        chapterTitle: String = ""
    ) {
        if (noteText.isBlank()) return
        viewModelScope.launch {
            val note = BookNote(
                bookId = bookId,
                noteText = noteText.trim(),
                pageNumber = pageNumber,
                chapterTitle = chapterTitle,
                timestamp = System.currentTimeMillis(),
                dateStr = DateUtils.todayStr()
            )
            repository.saveBookNote(note)
            soundHaptics?.play(SoundHapticsManager.SoundType.CHECK_HABIT, SoundHapticsManager.HapticType.LIGHT_CLICK)
            showToast("Book note saved to Room! +10 XP 📝")
        }
    }

    fun deleteBookNote(noteId: String) {
        viewModelScope.launch {
            repository.deleteBookNote(noteId)
            soundHaptics?.play(SoundHapticsManager.SoundType.INCREMENT_COUNT, SoundHapticsManager.HapticType.LIGHT_CLICK)
            showToast("Book note removed")
        }
    }

    // ==========================================
    // Book, Guide & In-App Reader State
    // ==========================================
    var showAddBookDialog = MutableStateFlow(false)
    var selectedBookForReading = MutableStateFlow<BookResourceItem?>(null)
    var showAiExportImportDialog = MutableStateFlow(false)
    private val _bookCategoryFilter = MutableStateFlow("all")
    val bookCategoryFilter: StateFlow<String> = _bookCategoryFilter.asStateFlow()

    fun setBookCategoryFilter(category: String) {
        _bookCategoryFilter.value = category
    }

    fun openBookReader(book: BookResourceItem) {
        selectedBookForReading.value = book
        soundHaptics?.play(SoundHapticsManager.SoundType.INCREMENT_COUNT, SoundHapticsManager.HapticType.LIGHT_CLICK)
    }

    fun closeBookReader() {
        selectedBookForReading.value = null
    }

    fun toggleChapter(bookId: String, chapterTitle: String) {
        repository.toggleChapterRead(bookId, chapterTitle)
        // Refresh reader state
        selectedBookForReading.value = state.value.bookResources.firstOrNull { it.id == bookId }
        soundHaptics?.play(SoundHapticsManager.SoundType.CHECK_HABIT, SoundHapticsManager.HapticType.LIGHT_CLICK)
    }

    fun updateBookProgress(bookId: String, pagesRead: Int, notes: String, status: String) {
        repository.updateBookReadingProgress(bookId, pagesRead, notes, status)
        selectedBookForReading.value = state.value.bookResources.firstOrNull { it.id == bookId }
        soundHaptics?.play(SoundHapticsManager.SoundType.COIN_REWARD, SoundHapticsManager.HapticType.MEDIUM_PULSE)
        showToast("Reading progress updated! 📖")
    }

    fun updateBookNotes(bookId: String, notes: String) {
        repository.updateBookNotes(bookId, notes)
        if (selectedBookForReading.value?.id == bookId) {
            selectedBookForReading.value = selectedBookForReading.value?.copy(userNotes = notes)
        }
        soundHaptics?.play(SoundHapticsManager.SoundType.CHECK_HABIT, SoundHapticsManager.HapticType.LIGHT_CLICK)
        showToast("Book notes saved! +10 XP 📝")
    }

    fun addBook(
        title: String,
        author: String,
        category: String,
        desc: String,
        keyConcepts: List<String>,
        externalUrl: String = "",
        totalPages: Int = 200,
        guideContent: String = ""
    ) {
        repository.addBookResource(title, author, category, desc, keyConcepts, externalUrl, totalPages, guideContent)
        soundHaptics?.play(SoundHapticsManager.SoundType.COIN_REWARD, SoundHapticsManager.HapticType.MEDIUM_PULSE)
        showToast("Book added to your library! +20 XP 📚")
    }

    fun addBook(book: com.example.selfcarehero.model.BookResourceItem) {
        repository.addBookResource(book)
        soundHaptics?.play(SoundHapticsManager.SoundType.COIN_REWARD, SoundHapticsManager.HapticType.MEDIUM_PULSE)
        showToast("Book added to your library! +20 XP 📚")
    }

    fun deleteBook(bookId: String) {
        repository.deleteBookResource(bookId)
        if (selectedBookForReading.value?.id == bookId) {
            selectedBookForReading.value = null
        }
        soundHaptics?.play(SoundHapticsManager.SoundType.INCREMENT_COUNT, SoundHapticsManager.HapticType.LIGHT_CLICK)
        showToast("Book removed from library")
    }

    fun toggleFavoriteBook(bookId: String) {
        repository.toggleFavoriteBook(bookId)
        soundHaptics?.play(SoundHapticsManager.SoundType.INCREMENT_COUNT, SoundHapticsManager.HapticType.LIGHT_CLICK)
    }

    // ==========================================
    // AI Export & Import System
    // ==========================================

    fun exportProgressionJson(): String {
        return repository.exportAiProgressionJson()
    }

    fun importProgressionJson(jsonStr: String): Result<AiExportPayload> {
        val result = repository.importAiProgressionJson(jsonStr)
        if (result.isSuccess) {
            soundHaptics?.play(SoundHapticsManager.SoundType.LEVEL_UP, SoundHapticsManager.HapticType.CELEBRATION_BURST)
            showToast("Progression synced successfully from AI! 🎉 +30 XP")
        }
        return result
    }

    fun launchRoutine(routine: RoutineFlow) {
        activeRoutine.value = routine
        showRoutinePlayerDialog.value = true
        soundHaptics?.play(SoundHapticsManager.SoundType.INCREMENT_COUNT, SoundHapticsManager.HapticType.MEDIUM_PULSE)
    }

    fun launchRoutineById(routineId: String) {
        val found = state.value.routines.firstOrNull { it.id == routineId }
        if (found != null) {
            launchRoutine(found)
        }
    }

    fun saveRoutine(routine: RoutineFlow) {
        repository.saveRoutine(routine)
        activeRoutine.value = routine
        soundHaptics?.play(SoundHapticsManager.SoundType.CHECK_HABIT, SoundHapticsManager.HapticType.LIGHT_CLICK)
        showToast("Routine '${routine.name}' updated")
    }

    fun deleteRoutine(routineId: String) {
        repository.deleteRoutine(routineId)
        if (activeRoutine.value?.id == routineId) {
            activeRoutine.value = state.value.routines.firstOrNull()
        }
        showToast("Routine removed")
    }

    fun resetRoutinesToDefault() {
        repository.resetRoutinesToDefault()
        activeRoutine.value = state.value.routines.firstOrNull()
        showToast("Routines reset to default")
    }

    fun openBreathPacer() {
        showBreathPacerDialog.value = true
        soundHaptics?.play(SoundHapticsManager.SoundType.CHECK_HABIT, SoundHapticsManager.HapticType.LIGHT_CLICK)
    }

    fun openLocalAi(prompt: String? = null) {
        initialAiPrompt.value = prompt
        showLocalAiDialog.value = true
        soundHaptics?.play(SoundHapticsManager.SoundType.CHECK_HABIT, SoundHapticsManager.HapticType.LIGHT_CLICK)
    }

    fun openMonthlyRecap() {
        showMonthlyRecapDialog.value = true
        soundHaptics?.play(SoundHapticsManager.SoundType.CHECK_HABIT, SoundHapticsManager.HapticType.LIGHT_CLICK)
    }

    fun openUrgeSurfingScreen() {
        showUrgeSurfingScreen.value = true
        soundHaptics?.play(SoundHapticsManager.SoundType.CHECK_HABIT, SoundHapticsManager.HapticType.LIGHT_CLICK)
    }

    fun closeUrgeSurfingScreen() {
        showUrgeSurfingScreen.value = false
    }

    // Anti-Goals & Dopamine Shield Handlers
    fun markAntiGoalClean(id: String) {
        val ok = repository.markAntiGoalClean(id)
        if (ok) {
            soundHaptics?.play(SoundHapticsManager.SoundType.COIN_REWARD, SoundHapticsManager.HapticType.MEDIUM_PULSE)
            showToast("🛡️ Clean day secured! (+5 coins, +10 XP)")
        } else {
            showToast("Already logged clean for today!")
        }
    }

    fun logAntiGoalSlip(id: String) {
        val slipped = repository.logAntiGoalSlip(id)
        soundHaptics?.play(SoundHapticsManager.SoundType.CHECK_HABIT, SoundHapticsManager.HapticType.LIGHT_CLICK)
        if (slipped != null) {
            initialAiPrompt.value = "I slipped on my anti-goal '${slipped.name}'. Trigger: '${slipped.triggerCue}'. Help me reframe this slip with stoic cognitive reframing so I can get right back on track."
            showLocalAiDialog.value = true
            showToast("Logged slip. Opening Copilot for compassionate reframing...")
        }
    }

    fun saveAntiGoal(item: AntiGoalItem) {
        repository.addOrUpdateAntiGoal(item)
        showEditAntiGoalDialog.value = false
        editingAntiGoal.value = null
        soundHaptics?.play(SoundHapticsManager.SoundType.CHECK_HABIT, SoundHapticsManager.HapticType.LIGHT_CLICK)
        showToast("Boundary '${item.name}' saved")
    }

    fun deleteAntiGoal(id: String) {
        repository.deleteAntiGoal(id)
        showEditAntiGoalDialog.value = false
        editingAntiGoal.value = null
        showToast("Boundary removed")
    }

    fun openEditAntiGoal(item: AntiGoalItem? = null) {
        editingAntiGoal.value = item
        showEditAntiGoalDialog.value = true
    }

    // 90-Day Life Sprint Handlers
    fun saveSprintGoal(goal: LifeSprintGoal) {
        repository.updateSprintGoal(goal)
        showSprintGoalDialog.value = false
        soundHaptics?.play(SoundHapticsManager.SoundType.CHECK_HABIT, SoundHapticsManager.HapticType.LIGHT_CLICK)
        showToast("🚀 90-Day Sprint & Identity updated")
    }

    fun advanceSprintMilestone() {
        val ok = repository.advanceSprintMilestone()
        if (ok) {
            soundHaptics?.play(SoundHapticsManager.SoundType.COIN_REWARD, SoundHapticsManager.HapticType.CELEBRATION_BURST)
            showToast("🎯 Milestone completed! (+15 coins, +50 XP)")
        } else {
            showToast("All milestones completed for this sprint! 🎉")
        }
    }

    fun openEditSprintGoal() {
        showSprintGoalDialog.value = true
    }

    // Circadian Sleep Architecture Handlers
    fun openCircadianSettings() {
        showCircadianSettingsDialog.value = true
        soundHaptics?.play(SoundHapticsManager.SoundType.CHECK_HABIT, SoundHapticsManager.HapticType.LIGHT_CLICK)
    }

    fun saveCircadianConfig(config: CircadianConfig) {
        repository.updateCircadianConfig(config)
        showCircadianSettingsDialog.value = false
        soundHaptics?.play(SoundHapticsManager.SoundType.CHECK_HABIT, SoundHapticsManager.HapticType.LIGHT_CLICK)
        showToast("⏰ Circadian Sleep Clock updated")
    }

    fun toggleHabit(habitId: String) {
        incrementHabit(habitId)
    }

    fun incrementHabit(habitId: String) {
        val node = state.value.nodes.firstOrNull { it.id == habitId } ?: return
        if (node.k == "check") {
            repository.toggleCheckHabit(node)
        } else {
            repository.incrementCountHabit(node, 1)
        }
    }

    fun awardDirectXp(amount: Int, reason: String) {
        val today = DateUtils.todayStr()
        val ev = EventRecord(System.currentTimeMillis(), today, "xp_direct", 1, amount)
        repository.updateState { s ->
            s.copy(ev = s.ev + ev)
        }
        showToast("+$amount XP • $reason")
    }

    fun selectTab(tab: TabType) {
        _currentTab.value = tab
    }

    fun setRoutineFilter(filter: String) {
        _routineFilter.value = filter
    }

    fun setSkillNatureFilter(nature: String) {
        _skillNatureFilter.value = nature
    }

    fun setStatsViewMode(mode: String) {
        _statsViewMode.value = mode
    }

    fun toggleTheme() {
        val willBeDark = !state.value.isDarkMode
        repository.toggleDarkMode()
        soundHaptics?.play(SoundHapticsManager.SoundType.INCREMENT_COUNT, SoundHapticsManager.HapticType.LIGHT_CLICK)
        showToast(if (willBeDark) "🌙 Warm Espresso Dark Mode" else "☀️ Soft Warm Cream Light Mode")
    }

    fun toggleSound() {
        val next = !_soundEnabled.value
        _soundEnabled.value = next
        soundHaptics?.isSoundEnabled = next
        if (next) {
            soundHaptics?.play(SoundHapticsManager.SoundType.CHECK_HABIT)
        }
        showToast(if (next) "🔊 Sound feedback enabled" else "🔇 Sound muted")
    }

    fun toggleHaptics() {
        val next = !_hapticsEnabled.value
        _hapticsEnabled.value = next
        soundHaptics?.isHapticsEnabled = next
        if (next) {
            soundHaptics?.triggerHaptic(SoundHapticsManager.HapticType.LIGHT_CLICK)
        }
        showToast(if (next) "📳 Haptic vibrations enabled" else "📴 Haptics disabled")
    }

    fun showToast(msg: String) {
        _toast.value = msg
    }

    fun clearToast() {
        _toast.value = null
    }

    fun triggerCelebration(title: String, subtitle: String) {
        celebrationTitle.value = title
        celebrationSubtitle.value = subtitle
        showCelebration.value = true
        soundHaptics?.play(SoundHapticsManager.SoundType.LEVEL_UP, SoundHapticsManager.HapticType.CELEBRATION_BURST)
    }

    fun dismissCelebration() {
        showCelebration.value = false
    }

    // Weekly Insights & Review
    fun getWeeklyInsights(): WeeklyInsightsData = repository.getWeeklyInsights()

    fun completeWeeklyReview(
        winsText: String,
        frictionTags: List<String>,
        frictionNotes: String,
        focusSkillId: String?,
        focusSkillName: String?
    ) {
        repository.completeWeeklyReview(winsText, frictionTags, frictionNotes, focusSkillId, focusSkillName)
        showWeeklyReviewDialog.value = false
        triggerCelebration("🌟 Weekly Review Completed!", "+50 Bonus XP and 10 coins awarded. Keep compounding!")
    }

    // Weekly Quests
    fun claimWeeklyQuest(questId: String) {
        val (claimed, coins, xp) = repository.claimWeeklyQuest(questId)
        if (claimed) {
            soundHaptics?.play(SoundHapticsManager.SoundType.COIN_REWARD, SoundHapticsManager.HapticType.CELEBRATION_BURST)
            triggerCelebration("🎯 Weekly Quest Claimed!", "+$coins Carrot-Coins & +$xp XP added to your vault!")
            showToast("🎉 Quest reward claimed: +$coins 🪙 & +$xp XP")
        }
    }

    // PIN Privacy & Security Methods (Phase 3, Feature 12)
    fun unlockSessionWithPin(inputPin: String): Boolean {
        val isValid = repository.verifyPin(inputPin)
        if (isValid) {
            _isPinSessionUnlocked.value = true
            showPinVerificationDialog.value = false
            soundHaptics?.play(SoundHapticsManager.SoundType.CHECK_HABIT, SoundHapticsManager.HapticType.CELEBRATION_BURST)
            val action = pendingPinSuccessAction
            pendingPinSuccessAction = null
            action?.invoke()
            showToast("🔓 Unlocked successfully")
        } else {
            soundHaptics?.triggerHaptic(SoundHapticsManager.HapticType.MEDIUM_PULSE)
        }
        return isValid
    }

    fun lockSession() {
        _isPinSessionUnlocked.value = false
        showToast("🔒 Privacy lock engaged")
    }

    fun setPin(pin: String) {
        repository.setPin(pin)
        _isPinSessionUnlocked.value = true
        showPinSettingsDialog.value = false
        soundHaptics?.play(SoundHapticsManager.SoundType.CHECK_HABIT, SoundHapticsManager.HapticType.LIGHT_CLICK)
        showToast("🔐 4-Digit PIN configured and active")
    }

    fun disablePin() {
        repository.disablePin()
        _isPinSessionUnlocked.value = false
        showPinSettingsDialog.value = false
        showToast("🔓 PIN protection disabled")
    }

    fun updatePinSettings(enabled: Boolean, lockJournal: Boolean, lockUrges: Boolean, lockAppLaunch: Boolean) {
        repository.updatePinSettings(enabled, lockJournal, lockUrges, lockAppLaunch)
        showToast("🔐 Privacy settings updated")
    }

    fun requestPinUnlock(title: String, subtitle: String, onSuccess: () -> Unit) {
        if (!state.value.pinLockEnabled || _isPinSessionUnlocked.value) {
            onSuccess()
        } else {
            pinVerificationTitle.value = title
            pinVerificationSubtitle.value = subtitle
            pendingPinSuccessAction = onSuccess
            showPinVerificationDialog.value = true
        }
    }

    // Rememorization Spaced Recall
    fun updateRememorizeConfig(nodeId: String, enabled: Boolean, intervalDays: Int) {
        repository.updateRememorizeConfig(nodeId, enabled, intervalDays)
        showToast("🧠 Rememorization review interval updated (${intervalDays}d)")
    }

    fun markRememorized(nodeId: String) {
        repository.markRememorized(nodeId)
        soundHaptics?.play(SoundHapticsManager.SoundType.CHECK_HABIT, SoundHapticsManager.HapticType.LIGHT_CLICK)
        showToast("✨ Concept refreshed in memory! (+15 XP)")
    }

    fun getDueRememorizeSkills(): List<NodeItem> {
        val now = System.currentTimeMillis()
        return state.value.nodes.filter {
            it.rememorize?.enabled == true && it.rememorize.nextDue <= now
        }
    }

    // Cloud Sync Methods
    fun signInWithGoogle(activity: Activity) {
        firestoreSync?.signInWithGoogle(
            activity = activity,
            scope = viewModelScope,
            onSuccess = { user ->
                triggerCelebration("☁️ Cloud Sync Connected!", "Signed in as ${user.displayName ?: user.email}")
                syncWithCloud()
            },
            onError = { err ->
                showToast("❌ Google Sign-In: $err")
            }
        )
    }

    fun signOutFromCloud() {
        firestoreSync?.signOut(viewModelScope) {
            showToast("👋 Signed out from cloud sync")
        }
    }

    fun syncWithCloud() {
        if (firestoreSync?.isUserSignedIn() != true) {
            showToast("Please sign in with Google to sync")
            showCloudSyncDialog.value = true
            return
        }
        viewModelScope.launch {
            val success = firestoreSync.uploadToCloud(state.value)
            if (success) {
                soundHaptics?.play(SoundHapticsManager.SoundType.CHECK_HABIT, SoundHapticsManager.HapticType.LIGHT_CLICK)
                showToast("☁️ Cloud Backup Completed!")
            } else {
                showToast("❌ Cloud sync failed. Check internet.")
            }
        }
    }

    fun toggleCheckHabit(node: NodeItem) {
        val wasDone = isSkillDone(node)
        val prevLevel = getPlayerLevel()
        val prevDailyThree = isDailyThreeComplete()

        repository.toggleCheckHabit(node)

        if (!wasDone) {
            soundHaptics?.play(
                SoundHapticsManager.SoundType.CHECK_HABIT,
                SoundHapticsManager.HapticType.LIGHT_CLICK
            )
            if (!prevDailyThree && isDailyThreeComplete()) {
                triggerCelebration("🎉 Daily Three Complete!", "All 3 pillars mastered for today! +30 XP bonus awarded.")
            } else if (getPlayerLevel() > prevLevel) {
                val newLevel = getPlayerLevel()
                triggerCelebration("🌟 LEVEL UP! LEVEL $newLevel", getLevelTitle())
            }
        }
        showToast("✓ ${node.n} updated")
    }

    fun incrementCountHabit(node: NodeItem, delta: Int) {
        val prevLevel = getPlayerLevel()
        val prevDailyThree = isDailyThreeComplete()

        repository.incrementCountHabit(node, delta)

        if (delta > 0) {
            soundHaptics?.play(
                SoundHapticsManager.SoundType.INCREMENT_COUNT,
                SoundHapticsManager.HapticType.MEDIUM_PULSE
            )
            if (!prevDailyThree && isDailyThreeComplete()) {
                triggerCelebration("🎉 Daily Three Complete!", "All 3 pillars mastered for today! +30 XP bonus awarded.")
            } else if (getPlayerLevel() > prevLevel) {
                val newLevel = getPlayerLevel()
                triggerCelebration("🌟 LEVEL UP! LEVEL $newLevel", getLevelTitle())
            }
        }
        val action = if (delta > 0) "+$delta" else "$delta"
        showToast("$action ${node.u.ifEmpty { "reps" }} for ${node.n}")
    }

    fun updateSliderStep(node: NodeItem, newStep: Int) {
        repository.updateSliderStep(node, newStep)
        soundHaptics?.play(
            SoundHapticsManager.SoundType.INCREMENT_COUNT,
            SoundHapticsManager.HapticType.MEDIUM_PULSE
        )
        val stepLabel = node.sliderSteps?.getOrNull(newStep) ?: "Step $newStep"
        showToast("Advanced to: $stepLabel")
    }

    fun toggleLowEnergyMode() {
        repository.toggleLowEnergyMode()
        soundHaptics?.triggerHaptic(SoundHapticsManager.HapticType.LIGHT_CLICK)
        val isNowLow = !state.value.lowEnergyMode
        showToast(if (isNowLow) "🌿 Low-energy mode active (focusing on essentials)" else "⚡ Full list restored")
    }

    fun useRestDayToken() {
        repository.useRestDayToken()
        soundHaptics?.play(
            SoundHapticsManager.SoundType.COIN_REWARD,
            SoundHapticsManager.HapticType.CELEBRATION_BURST
        )
        showToast("🛡️ Streak protected with Rest-Day Token!")
    }

    fun openCreateNode(parentId: String = "0") {
        targetParentId.value = parentId
        editingNode.value = null
        showEditNodeDialog.value = true
    }

    fun openEditNode(node: NodeItem?, presetParentId: String? = null) {
        targetParentId.value = presetParentId ?: node?.p ?: "0"
        editingNode.value = node
        showEditNodeDialog.value = true
    }

    fun saveNode(node: NodeItem) {
        repository.addOrUpdateNode(node)
        showEditNodeDialog.value = false
        editingNode.value = null
        soundHaptics?.play(SoundHapticsManager.SoundType.CHECK_HABIT, SoundHapticsManager.HapticType.LIGHT_CLICK)
        showToast("Skill '${node.n}' saved")
    }

    fun deleteNode(id: String) {
        repository.deleteNode(id)
        showEditNodeDialog.value = false
        editingNode.value = null
        showToast("Skill deleted")
    }

    fun addLearnItem(item: LearnItem) {
        repository.addLearnItem(item)
        showAddLearnDialog.value = false
        soundHaptics?.play(SoundHapticsManager.SoundType.COIN_REWARD, SoundHapticsManager.HapticType.LIGHT_CLICK)
        showToast("💡 New wisdom added (+3 coins)")
    }

    fun toggleFavoriteLearn(id: String) {
        repository.toggleFavoriteLearn(id)
        soundHaptics?.triggerHaptic(SoundHapticsManager.HapticType.LIGHT_CLICK)
    }

    fun markLearnReviewed(id: String) {
        repository.markLearnReviewed(id)
        soundHaptics?.play(SoundHapticsManager.SoundType.CHECK_HABIT, SoundHapticsManager.HapticType.LIGHT_CLICK)
        showToast("🧠 Wisdom reviewed & refreshed")
    }

    fun openTeachBack(item: LearnItem) {
        teachBackTargetItem.value = item
        showTeachBackDialog.value = true
        soundHaptics?.play(SoundHapticsManager.SoundType.CHECK_HABIT, SoundHapticsManager.HapticType.LIGHT_CLICK)
    }

    fun submitTeachBack(
        learnId: String,
        explanation: String,
        masteryRating: Int,
        intervalDays: Int
    ) {
        val (coins, xp) = repository.submitTeachBack(learnId, explanation, masteryRating, intervalDays)
        showTeachBackDialog.value = false
        teachBackTargetItem.value = null
        soundHaptics?.play(SoundHapticsManager.SoundType.COIN_REWARD, SoundHapticsManager.HapticType.CELEBRATION_BURST)
        val masteryLabel = when (masteryRating) {
            1 -> "Struggled (Review in ${intervalDays}d)"
            2 -> "Solid (Review in ${intervalDays}d)"
            3 -> "Mastered (Review in ${intervalDays}d)"
            else -> "Recorded"
        }
        showToast("🧠 Feynman Teach-Back saved! +$xp XP, +$coins 🪙 ($masteryLabel)")
    }

    fun addJournalEntry(mood: Int, text: String, tags: List<String>) {
        repository.addJournalEntry(mood, text, tags)
        soundHaptics?.play(SoundHapticsManager.SoundType.DAILY_THREE_WIN, SoundHapticsManager.HapticType.CELEBRATION_BURST)
        showToast("✍️ Reflection saved (+15 XP, +4 coins)")
    }

    fun addGoodDeed(target: String, text: String) {
        repository.addGoodDeed(target, text)
        soundHaptics?.play(SoundHapticsManager.SoundType.CHECK_HABIT, SoundHapticsManager.HapticType.LIGHT_CLICK)
        showToast("❤️ Good deed recorded (+12 XP)")
    }

    fun logUrge(trigger: String, level: Int, want: String, choice: String, note: String) {
        repository.logUrge(trigger, level, want, choice, note)
        showUrgeDialog.value = false
        soundHaptics?.play(SoundHapticsManager.SoundType.URGE_CALM, SoundHapticsManager.HapticType.CALM_WAVE)
        showToast("🌊 Urge surfed successfully! (+20 XP, +5 coins)")
    }

    fun logUrgeSurfingWave(
        trigger: String,
        preIntensity: Int,
        postIntensity: Int,
        want: String,
        choice: String,
        note: String,
        somaticSensations: List<String>,
        contextTags: List<String>,
        outcomeStatus: String,
        durationSeconds: Int = 600
    ) {
        val (coins, xp) = repository.logUrgeSurfingWave(
            trigger = trigger,
            preIntensity = preIntensity,
            postIntensity = postIntensity,
            want = want,
            choice = choice,
            note = note,
            somaticSensations = somaticSensations,
            contextTags = contextTags,
            outcomeStatus = outcomeStatus,
            durationSeconds = durationSeconds
        )
        showUrgeDialog.value = false
        soundHaptics?.play(SoundHapticsManager.SoundType.URGE_CALM, SoundHapticsManager.HapticType.CELEBRATION_BURST)
        val outcomeMsg = when (outcomeStatus) {
            "SURFED" -> "🌊 Urge wave successfully surfed!"
            "RESISTED" -> "🛡️ Craving resisted with healthy substitution!"
            "PARTIAL_LAPSE" -> "🌱 Harm reduced & logged mindfully."
            "FULL_LAPSE" -> "Compassionate data point logged. Self-efficacy preserved."
            else -> "Urge wave recorded."
        }
        showToast("$outcomeMsg (+$coins 🪙, +$xp XP)")
    }

    fun addStudyTopic(name: String) {
        repository.addStudyTopic(name)
        showAddTopicDialog.value = false
        soundHaptics?.play(SoundHapticsManager.SoundType.CHECK_HABIT, SoundHapticsManager.HapticType.LIGHT_CLICK)
        showToast("📖 Study topic added")
    }

    fun advanceStudyTopic(id: String) {
        repository.advanceStudyTopic(id)
        soundHaptics?.play(SoundHapticsManager.SoundType.COIN_REWARD, SoundHapticsManager.HapticType.MEDIUM_PULSE)
        showToast("🎉 Topic phase advanced (+3 coins)")
    }

    fun toggleAlert(id: String) {
        repository.toggleAlert(id)
        soundHaptics?.triggerHaptic(SoundHapticsManager.HapticType.LIGHT_CLICK)
    }

    fun saveAlert(alert: AlertItem) {
        repository.addOrUpdateAlert(alert)
        showAddAlertDialog.value = false
        soundHaptics?.play(SoundHapticsManager.SoundType.CHECK_HABIT, SoundHapticsManager.HapticType.LIGHT_CLICK)
        showToast("🔔 Alert '${alert.n}' saved")
    }

    fun markAlertDone(alertId: String) {
        repository.handleAlertMarkDone(alertId)
        soundHaptics?.play(SoundHapticsManager.SoundType.CHECK_HABIT, SoundHapticsManager.HapticType.MEDIUM_PULSE)
        showToast("✓ Logged & XP awarded (+2 coins)")
    }

    fun deleteAlert(id: String) {
        repository.deleteAlert(id)
        showToast("Alert removed")
    }

    fun redeemReward(reward: RewardItem) {
        val success = repository.redeemReward(reward)
        if (success) {
            soundHaptics?.play(SoundHapticsManager.SoundType.COIN_REWARD, SoundHapticsManager.HapticType.CELEBRATION_BURST)
            showToast("🎁 Redeemed: ${reward.title}!")
        } else {
            soundHaptics?.triggerHaptic(SoundHapticsManager.HapticType.MEDIUM_PULSE)
            showToast("❌ Not enough coins! Need ${reward.cost}")
        }
    }

    fun dismissComebackBonus() {
        soundHaptics?.play(SoundHapticsManager.SoundType.DAILY_THREE_WIN, SoundHapticsManager.HapticType.CELEBRATION_BURST)
        repository.dismissComebackBonus()
    }

    // 10-Slot Snapshots with 'CONFIRM' Guard
    fun createBackupSnapshot(label: String) {
        repository.createSnapshot(label)
        soundHaptics?.play(SoundHapticsManager.SoundType.CHECK_HABIT, SoundHapticsManager.HapticType.LIGHT_CLICK)
        showToast("💾 Snapshot created (${state.value.snapshots.size}/10 slots)")
    }

    fun promptRestoreSnapshot(snapshot: BackupSnapshot) {
        pendingRestoreSnapshot.value = snapshot
        showConfirmRestoreDialog.value = true
    }

    fun executeConfirmedRestore() {
        val snapshot = pendingRestoreSnapshot.value ?: return
        val ok = repository.restoreSnapshotWithPreSafety(snapshot)
        showConfirmRestoreDialog.value = false
        pendingRestoreSnapshot.value = null
        if (ok) {
            triggerCelebration("✅ State Restored!", "Rollback safety snapshot auto-saved before restore.")
        } else {
            showToast("❌ Failed to restore snapshot")
        }
    }

    fun deleteSnapshot(snapshotId: String) {
        repository.deleteSnapshot(snapshotId)
        showToast("Snapshot deleted")
    }

    fun executeResetHero() {
        val ok = repository.resetHeroWithEmergencySnapshot()
        showResetHeroDialog.value = false
        if (ok) {
            triggerCelebration("🔄 Fresh Start Initialized", "Pre-wipe emergency snapshot created in slot 1.")
        }
    }

    fun playFocusBell() {
        soundHaptics?.play(SoundHapticsManager.SoundType.FOCUS_BELL, SoundHapticsManager.HapticType.CALM_WAVE)
    }

    fun isDailyThreeComplete(): Boolean {
        val today = DateUtils.todayStr()
        val s = state.value
        val learnDone = s.nodes.any { it.p == "learn" && isSkillDone(it) }
        val buildDone = s.nodes.any { it.p == "build" && isSkillDone(it) }
        val bodyDone = s.nodes.any { it.p == "body" && isSkillDone(it) }
        return learnDone && buildDone && bodyDone
    }

    fun getPlayerLevel(): Int = repository.getPlayerLevel(state.value)
    fun getLevelTitle(): String = repository.getLevelTitle(getPlayerLevel())
    fun getTotalXp(): Int = repository.getTotalXp(state.value)
    fun getXpProgress(): Pair<Int, Int> = repository.getXpProgressInLevel(state.value)
    fun isSkillDone(node: NodeItem): Boolean = repository.isSkillDoneToday(state.value, node)
    fun getSkillCount(skillId: String): Int = repository.getSkillCountToday(state.value, skillId)
    fun getAdvancedAnalytics(): AdvancedAnalyticsData = repository.getAdvancedAnalytics()

    // Habit Staking Contract Actions
    fun openHabitContractDialog() {
        showHabitContractDialog.value = true
        soundHaptics?.play(SoundHapticsManager.SoundType.CHECK_HABIT, SoundHapticsManager.HapticType.LIGHT_CLICK)
    }

    fun createHabitContract(habitId: String, habitName: String, stakedCoins: Int, targetDays: Int = 7) {
        val ok = repository.createHabitContract(habitId, habitName, stakedCoins, targetDays)
        showHabitContractDialog.value = false
        if (ok) {
            soundHaptics?.play(SoundHapticsManager.SoundType.COIN_REWARD, SoundHapticsManager.HapticType.MEDIUM_PULSE)
            showToast("🎯 Staked $stakedCoins coins on '$habitName' ($targetDays days commitment)!")
        } else {
            showToast("❌ Insufficient Carrot-Coins to place stake.")
        }
    }

    fun openRescueDialog(contract: HabitContract) {
        rescueContractTarget.value = contract
        showRescueContractDialog.value = true
        soundHaptics?.play(SoundHapticsManager.SoundType.INCREMENT_COUNT, SoundHapticsManager.HapticType.MEDIUM_PULSE)
    }

    fun redeemShieldForContract(contractId: String, specificDate: String? = null) {
        val ok = repository.redeemShieldForContract(contractId, specificDate)
        if (ok) {
            soundHaptics?.play(SoundHapticsManager.SoundType.COIN_REWARD, SoundHapticsManager.HapticType.CELEBRATION_BURST)
            showToast("🛡️ Streak Shield consumed! Contract rescued from forfeiture.")
            showRescueContractDialog.value = false
            rescueContractTarget.value = null
        } else {
            showToast("❌ No Rest-Day Shield Tokens available. Purchase in Reward Shop!")
        }
    }

    fun buyShieldAndRescueContract(contractId: String) {
        val ok = repository.buyShieldAndRescueContract(contractId)
        if (ok) {
            soundHaptics?.play(SoundHapticsManager.SoundType.COIN_REWARD, SoundHapticsManager.HapticType.CELEBRATION_BURST)
            showToast("🛡️ Purchased & consumed Streak Shield! Contract rescued.")
            showRescueContractDialog.value = false
            rescueContractTarget.value = null
        } else {
            showToast("❌ Insufficient Carrot-Coins (need 12 🪙 for a Shield Token).")
        }
    }

    fun forfeitContract(contractId: String) {
        val ok = repository.forfeitContract(contractId)
        if (ok) {
            soundHaptics?.play(SoundHapticsManager.SoundType.URGE_CALM, SoundHapticsManager.HapticType.MEDIUM_PULSE)
            showToast("⚠️ Contract forfeited. Staked coins moved to Penalty Vault.")
            showRescueContractDialog.value = false
            rescueContractTarget.value = null
        }
    }

    // Future Learning Roadmap UI State & Actions
    var showAddRoadmapGoalDialog = MutableStateFlow(false)
    var editingRoadmapGoal = MutableStateFlow<RoadmapGoal?>(null)
    var showAddRoadmapStepDialog = MutableStateFlow(false)
    var editingRoadmapStep = MutableStateFlow<RoadmapStep?>(null)
    var roadmapStepGoalId = MutableStateFlow("")
    var roadmapStepParentId = MutableStateFlow<String?>(null)
    var showRoadmapTagDialog = MutableStateFlow(false)

    fun openCreateRoadmapGoal() {
        editingRoadmapGoal.value = null
        showAddRoadmapGoalDialog.value = true
        soundHaptics?.play(SoundHapticsManager.SoundType.CLICK, SoundHapticsManager.HapticType.LIGHT_TICK)
    }

    fun openEditRoadmapGoal(goal: RoadmapGoal) {
        editingRoadmapGoal.value = goal
        showAddRoadmapGoalDialog.value = true
        soundHaptics?.play(SoundHapticsManager.SoundType.CLICK, SoundHapticsManager.HapticType.LIGHT_TICK)
    }

    fun saveRoadmapGoal(goal: RoadmapGoal) {
        if (editingRoadmapGoal.value != null) {
            repository.updateRoadmapGoal(goal)
            showToast("✏️ Updated learning goal '${goal.title}'")
        } else {
            repository.addRoadmapGoal(goal)
            showToast("🎯 Added future learning goal '${goal.title}' (+20 XP)")
            soundHaptics?.play(SoundHapticsManager.SoundType.LEVEL_UP, SoundHapticsManager.HapticType.CELEBRATION_BURST)
        }
        showAddRoadmapGoalDialog.value = false
        editingRoadmapGoal.value = null
    }

    fun deleteRoadmapGoal(goalId: String) {
        repository.deleteRoadmapGoal(goalId)
        showToast("🗑️ Removed learning goal and milestones")
        soundHaptics?.play(SoundHapticsManager.SoundType.DECREMENT_COUNT, SoundHapticsManager.HapticType.MEDIUM_PULSE)
    }

    fun openCreateRoadmapStep(goalId: String, parentId: String? = null) {
        roadmapStepGoalId.value = goalId
        roadmapStepParentId.value = parentId
        editingRoadmapStep.value = null
        showAddRoadmapStepDialog.value = true
        soundHaptics?.play(SoundHapticsManager.SoundType.CLICK, SoundHapticsManager.HapticType.LIGHT_TICK)
    }

    fun openEditRoadmapStep(step: RoadmapStep) {
        roadmapStepGoalId.value = step.goalId
        roadmapStepParentId.value = step.parentId
        editingRoadmapStep.value = step
        showAddRoadmapStepDialog.value = true
        soundHaptics?.play(SoundHapticsManager.SoundType.CLICK, SoundHapticsManager.HapticType.LIGHT_TICK)
    }

    fun saveRoadmapStep(step: RoadmapStep) {
        if (editingRoadmapStep.value != null) {
            repository.updateRoadmapStep(step)
            showToast("✏️ Updated milestone '${step.title}'")
        } else {
            repository.addRoadmapStep(step)
            showToast("🌱 Added milestone '${step.title}'")
            soundHaptics?.play(SoundHapticsManager.SoundType.INCREMENT_COUNT, SoundHapticsManager.HapticType.LIGHT_TICK)
        }
        showAddRoadmapStepDialog.value = false
        editingRoadmapStep.value = null
    }

    fun deleteRoadmapStep(stepId: String) {
        repository.deleteRoadmapStep(stepId)
        showToast("🗑️ Milestone removed")
        soundHaptics?.play(SoundHapticsManager.SoundType.DECREMENT_COUNT, SoundHapticsManager.HapticType.LIGHT_TICK)
    }

    fun toggleRoadmapStep(stepId: String) {
        val step = state.value.roadmapSteps.firstOrNull { it.id == stepId }
        val wasDone = step?.isCompleted == true
        repository.toggleRoadmapStepComplete(stepId)
        if (!wasDone) {
            soundHaptics?.play(SoundHapticsManager.SoundType.LEVEL_UP, SoundHapticsManager.HapticType.CELEBRATION_BURST)
            showToast("🎉 Milestone completed! +15 XP & +1 🪙")
        } else {
            soundHaptics?.play(SoundHapticsManager.SoundType.DECREMENT_COUNT, SoundHapticsManager.HapticType.LIGHT_TICK)
        }
    }

    fun addRoadmapTag(name: String, color: String) {
        val id = "tag_${System.currentTimeMillis()}"
        repository.addRoadmapTag(RoadmapTag(id, name, color))
        showToast("🏷️ Added tag '$name'")
    }

    fun deleteRoadmapTag(tagId: String) {
        repository.deleteRoadmapTag(tagId)
        showToast("🏷️ Removed tag")
    }

    fun toggleAiOnlineSearch(enabled: Boolean) {
        repository.setAiOnlineSearchEnabled(enabled)
        showToast(if (enabled) "🌐 Web Research Extension Enabled" else "🔒 Local-Only AI Mode (Offline)")
    }
}
