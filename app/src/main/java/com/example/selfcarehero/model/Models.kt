package com.example.selfcarehero.model

import androidx.compose.runtime.Immutable
import kotlinx.serialization.Serializable
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

@Immutable
@Serializable
data class RememorizeConfig(
    val enabled: Boolean = false,
    val intervalDays: Int = 3,
    val lastReviewed: Long = 0L,
    val nextDue: Long = 0L,
    val reviewCount: Int = 0
)

@Immutable
@Serializable
data class NodeItem(
    val id: String,
    val p: String = "0", // parent id ("0" for root skills)
    val e: String = "⭐", // emoji icon
    val n: String, // name
    val k: String = "check", // 'check' | 'count' | 'quit' | 'step'
    val g: Int = 1, // default goal
    val weekdayGoals: List<Int>? = null,
    val u: String = "", // unit e.g. "glasses", "pages"
    val sliderSteps: List<String>? = null,
    val sliderLevel: Int = 0,
    val nature: String = "skill", // 'skill' | 'technique' | 'concept' | 'course' | 'habit'
    val importance: String = "medium", // 'critical' | 'high' | 'medium' | 'low'
    val rememorize: RememorizeConfig? = null,
    val ifThenAnchor: String? = null,
    val routineTime: String? = null, // 'morning' | 'afternoon' | 'evening' | 'anytime'
    val note: String = "",
    val lock: Boolean = false,
    val isOpen: Boolean = true
)

@Immutable
@Serializable
data class EventRecord(
    val t: Long, // timestamp
    val d: String, // YYYY-MM-DD
    val n: String, // node ID or internal metric
    val c: Int, // count delta
    val x: Int // XP delta
)

@Immutable
@Serializable
data class LearnItem(
    val id: String,
    val title: String,
    val category: String, // 'bias' | 'communication' | 'selfhelp' | 'affirmation' | 'islamic' | 'custom'
    val summary: String,
    val whyNote: String = "",
    val learnedDate: String,
    val favorite: Boolean = false,
    val teachBackNote: String = "",
    val reviewCount: Int = 0,
    val lastReviewed: Long = 0L,
    val userExplanation: String? = null,
    val masteryRating: Int? = null, // 1: Struggled, 2: Solid, 3: Mastered
    val teachBackCount: Int = 0,
    val lastTeachBackDate: String? = null,
    val nextReviewDue: String? = null // YYYY-MM-DD
) {
    fun isDueForRecall(today: String = DateUtils.todayStr()): Boolean {
        return nextReviewDue != null && nextReviewDue <= today
    }

    fun getEffectiveExplanation(): String {
        return userExplanation?.ifBlank { null } ?: teachBackNote
    }

    fun getMasteryBadge(): String {
        return when (masteryRating) {
            1 -> "🔴 Struggled"
            2 -> "🟡 Solid"
            3 -> "🟢 Mastered"
            else -> "Unassessed"
        }
    }
}


@Immutable
@Serializable
data class GoodDeedEntry(
    val id: String,
    val d: String,
    val tm: String,
    val target: String, // 'self' | 'others'
    val text: String
)

@Immutable
@Serializable
data class RewardItem(
    val id: String,
    val title: String,
    val cost: Int,
    val icon: String,
    val redeemedCount: Int = 0
)

@Immutable
@Serializable
data class JournalEntry(
    val id: String,
    val d: String, // YYYY-MM-DD
    val m: Int, // 0..4 (Sad to Great)
    val t: String, // text
    val g: List<String> = emptyList() // tags
)

@Immutable
@Serializable
data class StudyTopic(
    val id: String,
    val n: String,
    val ph: Int = 0, // phase (0..3)
    val s: Int = 0, // spaced repetition step
    val due: Long = 0L // timestamp due
)

@Immutable
@Serializable
data class RoadmapTag(
    val id: String,
    val name: String,
    val color: String = "#3D7D62"
)

@Immutable
@Serializable
data class RoadmapStep(
    val id: String,
    val parentId: String? = null,
    val goalId: String,
    val title: String,
    val description: String = "",
    val plannedDate: String? = null,
    val sessionTime: String? = null,
    val durationMinutes: Int? = null,
    val tagIds: List<String> = emptyList(),
    val notes: String = "",
    val isCompleted: Boolean = false,
    val order: Int = 0,
    val createdAt: Long = 0L,
    val updatedAt: Long = 0L
)

@Immutable
@Serializable
data class RoadmapGoal(
    val id: String,
    val title: String,
    val description: String = "",
    val plannedStartDate: String? = null,
    val targetCompletionDate: String? = null,
    val sessionTime: String? = null,
    val estimatedDurationMinutes: Int? = null,
    val priority: String = "medium", // 'low' | 'medium' | 'high' | 'urgent'
    val status: String = "planned", // 'planned' | 'in_progress' | 'paused' | 'completed' | 'archived'
    val tagIds: List<String> = emptyList(),
    val notes: String = "",
    val createdAt: Long = 0L,
    val updatedAt: Long = 0L,
    val linkedSkillId: String? = null
)

@Immutable
@Serializable
data class UrgeItem(
    val id: String,
    val d: String,
    val tm: String,
    val trigger: String,
    val level: Int = 5, // Legacy compatibility (1..5 or 1..10)
    val want: String = "",
    val choice: String = "",
    val note: String = "",
    val preIntensity: Int = level,
    val postIntensity: Int? = null,
    val somaticSensations: List<String> = emptyList(),
    val contextTags: List<String> = emptyList(),
    val outcomeStatus: String = "SURFED", // 'SURFED' | 'RESISTED' | 'PARTIAL_LAPSE' | 'FULL_LAPSE'
    val durationSeconds: Int = 600,
    val coinsEarned: Int = 0,
    val xpEarned: Int = 0
) {
    fun intensityDelta(): Int {
        val post = postIntensity ?: preIntensity
        return preIntensity - post
    }
}

@Immutable
@Serializable
data class AlertItem(
    val id: String,
    val n: String,
    val icon: String = "🔔",
    val type: String = "custom", // 'custom' | 'medicine' | 'prayer' | 'skill'
    val active: Boolean = true,
    val tm: String = "09:00",
    val times: List<String> = emptyList(),
    val chainedOffsetMinutes: Int? = null,
    val skillId: String? = null,
    val skillName: String? = null,
    val days: List<Int> = listOf(0, 1, 2, 3, 4, 5, 6),
    val repeatRule: String = "daily",
    val pillsCount: Int? = null,
    val pillsLowThreshold: Int? = null,
    val medNote: String? = null
) {
    fun allEffectiveTimes(): List<String> {
        val result = linkedSetOf<String>()
        if (times.isNotEmpty()) {
            result.addAll(times)
        } else if (tm.isNotBlank()) {
            result.add(tm)
        }

        if (chainedOffsetMinutes != null && chainedOffsetMinutes > 0) {
            val anchor = result.firstOrNull() ?: tm
            val parts = anchor.split(":")
            if (parts.size == 2) {
                val hour = parts[0].toIntOrNull() ?: 0
                val min = parts[1].toIntOrNull() ?: 0
                val totalMinutes = (hour * 60 + min + chainedOffsetMinutes) % 1440
                val followHour = (totalMinutes / 60) % 24
                val followMin = totalMinutes % 60
                val formatted = String.format(Locale.US, "%02d:%02d", followHour, followMin)
                result.add(formatted)
            }
        }
        return result.toList()
    }
}

@Immutable
@Serializable
data class DailyThreeStreakInfo(
    val cur: Int = 0,
    val best: Int = 0,
    val lastCompletedDate: String = ""
)

@Immutable
@Serializable
data class BackupSnapshot(
    val id: String,
    val timestamp: Long,
    val label: String,
    val level: Int,
    val xp: Int,
    val skillsCount: Int = 0,
    val stateJson: String
)

@Immutable
@Serializable
data class WeeklyReviewEntry(
    val id: String,
    val weekStartDate: String,
    val weekEndDate: String,
    val completedAt: Long,
    val winsText: String,
    val frictionTags: List<String> = emptyList(),
    val frictionNotes: String = "",
    val focusSkillId: String? = null,
    val focusSkillName: String? = null,
    val xpAwarded: Int = 50
)

@Immutable
@Serializable
data class ComebackBonusInfo(
    val pending: Boolean = false,
    val missedDays: Int = 0,
    val bonusXp: Int = 0,
    val bonusCoins: Int = 0,
    val welcomeMessage: String = ""
)

@Immutable
@Serializable
data class HabitStackLink(
    val triggerHabitId: String,
    val followUpHabitId: String,
    val momentumBonusXp: Int = 10,
    val promptMessage: String = "Keep the momentum going!"
)

@Immutable
@Serializable
data class AntiGoalItem(
    val id: String,
    val name: String,
    val icon: String = "🚫",
    val category: String = "digital", // 'digital' | 'health' | 'mindset'
    val triggerCue: String = "",
    val replacementAction: String = "",
    val cleanStreakDays: Int = 0,
    val lastCleanDate: String = "",
    val slipsCountToday: Int = 0
)

@Immutable
@Serializable
data class LifeSprintGoal(
    val id: String = "sprint_q1",
    val title: String = "Build Core Fitness & Launch Hero Project",
    val identityStatement: String = "I am the kind of person who shows up consistently every single day.",
    val startDateStr: String = "",
    val totalDays: Int = 90,
    val keyMilestones: List<String> = listOf(
        "Anchor Daily Three routine for 14 straight days",
        "Complete 10 deep work sprints with zero doomscrolling",
        "Reach Level 5 and earn 50 Carrot-Coins",
        "Complete first quarter review and personal retrospective"
    ),
    val currentMilestoneIdx: Int = 0
)

@Immutable
@Serializable
data class CircadianConfig(
    val wakeTimeStr: String = "07:00",
    val bedTimeStr: String = "23:00",
    val caffeineCutoffHoursBeforeSleep: Int = 10,
    val screenCurfewHoursBeforeSleep: Int = 2,
    val enabled: Boolean = true
)

@Immutable
@Serializable
data class HabitContract(
    val id: String,
    val targetHabitId: String,
    val targetHabitName: String,
    val stakedCoins: Int,
    val startDateStr: String,
    val targetDays: Int = 7,
    val status: String = "active", // "active", "won", "forfeited"
    val multiplierReward: Double = 1.5,
    val daysCompleted: Int = 0,
    val lastLoggedDate: String = "",
    val protectedDates: List<String> = emptyList(),
    val completedDates: List<String> = emptyList()
) {
    fun getMissedBreakDates(today: String = DateUtils.todayStr()): List<String> {
        if (status != "active" || startDateStr.isBlank()) return emptyList()
        val yesterday = DateUtils.daysAgoStr(1)
        val allPastDates = DateUtils.getDatesBetween(startDateStr, yesterday)
        return allPastDates.filter { date ->
            !completedDates.contains(date) && !protectedDates.contains(date)
        }
    }

    fun hasStreakBreak(today: String = DateUtils.todayStr()): Boolean {
        return getMissedBreakDates(today).isNotEmpty()
    }
}

@Immutable
@Serializable
data class RoutineStep(
    val id: String,
    val name: String,
    val durationSeconds: Int,
    val linkedHabitId: String? = null,
    val icon: String = "⏱️",
    val guidanceNote: String = ""
)

@Immutable
@Serializable
data class RoutineFlow(
    val id: String,
    val name: String,
    val icon: String,
    val targetTime: String, // 'morning' | 'focus' | 'evening'
    val description: String = "",
    val steps: List<RoutineStep> = emptyList()
)

enum class BreathTechnique(
    val label: String,
    val description: String,
    val inhaleSeconds: Int,
    val hold1Seconds: Int,
    val exhaleSeconds: Int,
    val hold2Seconds: Int
) {
    BOX_BREATHING(
        label = "Box Breathing (4-4-4-4)",
        description = "Navy SEAL protocol for calm focus and autonomic balance.",
        inhaleSeconds = 4,
        hold1Seconds = 4,
        exhaleSeconds = 4,
        hold2Seconds = 4
    ),
    RELAXING_478(
        label = "Relaxing Breath (4-7-8)",
        description = "Dr. Weil technique to trigger parasympathetic rest and sleepiness.",
        inhaleSeconds = 4,
        hold1Seconds = 7,
        exhaleSeconds = 8,
        hold2Seconds = 0
    ),
    CALM_RESONANCE(
        label = "Resonance Breathing (5-5)",
        description = "Coherent heart-rate variability pacer for sustained presence.",
        inhaleSeconds = 5,
        hold1Seconds = 0,
        exhaleSeconds = 5,
        hold2Seconds = 0
    )
}

@Immutable
@Serializable
data class CopilotToolItem(
    val id: String,
    val type: String,
    val label: String,
    val payload: String,
    val emoji: String = "⚡"
)

@Immutable
@Serializable
data class AiChatMessage(
    val id: String,
    val isUser: Boolean,
    val text: String,
    val timestamp: Long = 0L,
    val actionSuggestion: String? = null,
    val actionPayload: String? = null,
    val toolItems: List<CopilotToolItem> = emptyList()
)

@Immutable
@Serializable
data class WeeklyQuest(
    val id: String,
    val title: String,
    val description: String,
    val icon: String,
    val category: String = "vitality", // 'vitality' | 'mindfulness' | 'wisdom' | 'consistency'
    val targetCount: Int,
    val currentProgress: Int = 0,
    val rewardCoins: Int = 10,
    val rewardXp: Int = 40,
    val isCompleted: Boolean = false,
    val isClaimed: Boolean = false,
    val weekStartDate: String,
    val questType: String = "habit_any", // 'habit_any' | 'vitality' | 'wisdom' | 'consistency'
    val linkedSkillIds: List<String> = emptyList()
) {
    fun progressFraction(): Float {
        if (targetCount <= 0) return 1f
        return (currentProgress.toFloat() / targetCount.toFloat()).coerceIn(0f, 1f)
    }

    fun isReadyToClaim(): Boolean = isCompleted && !isClaimed

    fun statusLabel(): String {
        return when {
            isClaimed -> "Claimed ✓"
            isCompleted -> "Ready to Claim! 🎉"
            else -> "$currentProgress / $targetCount"
        }
    }
}

@Immutable
@Serializable
data class VideoResourceItem(
    val id: String,
    val title: String,
    val url: String,
    val category: String = "Mindfulness", // 'Mindfulness' | 'Breathwork' | 'Focus & Productivity' | 'Movement & Yoga' | 'Sleep & Rest' | 'Custom'
    val durationLabel: String = "10 min",
    val description: String = "",
    val thumbnailEmoji: String = "🎥",
    val tags: List<String> = emptyList(),
    val isFavorite: Boolean = false,
    val lastPlayedTimestamp: Long = 0L,
    val playCount: Int = 0,
    val userNotes: String = "",
    val lastNotesTimestamp: Long = 0L
)

@Immutable
@Serializable
data class BookChapter(
    val id: String = "",
    val title: String,
    val summary: String,
    val keyTakeaways: List<String> = emptyList(),
    val practicalExercise: String = "",
    val read: Boolean = false
)

@Immutable
@Serializable
data class BookResourceItem(
    val id: String,
    val title: String,
    val author: String,
    val category: String, // 'Making Friends' | 'Confident Speaking' | 'Empathetic Listening' | 'Healthy Boundaries' | 'Handling Conflict' | 'High EQ & Emotions' | 'Custom'
    val coverEmoji: String = "📚",
    val subtitle: String = "",
    val description: String = "",
    val keyConcepts: List<String> = emptyList(),
    val coreFramework: String = "",
    val fullGuideContent: String = "",
    val chapters: List<BookChapter> = emptyList(),
    val readingProgressPercent: Int = 0,
    val status: String = "want_to_read", // 'want_to_read' | 'reading' | 'completed'
    val userNotes: String = "",
    val externalUrl: String = "",
    val videoLinks: List<String> = emptyList(),
    val isFavorite: Boolean = false,
    val lastReadTimestamp: Long = 0L,
    val pagesRead: Int = 0,
    val totalPages: Int = 200
) {
    fun calculatedProgress(): Int {
        if (chapters.isEmpty()) return readingProgressPercent
        val readCount = chapters.count { it.read }
        return ((readCount.toFloat() / chapters.size.toFloat()) * 100).toInt().coerceIn(0, 100)
    }
}

@Immutable
@Serializable
data class AiUserProfile(
    val level: Int = 1,
    val levelTitle: String = "Novice",
    val totalXp: Int = 0,
    val coins: Int = 20,
    val restDayTokens: Int = 1
)

@Immutable
@Serializable
data class LearningResourcesSummary(
    val totalBooks: Int = 0,
    val booksCompleted: Int = 0,
    val booksInProgress: Int = 0,
    val totalChaptersRead: Int = 0,
    val totalPagesRead: Int = 0,
    val totalBookNotesCount: Int = 0,
    val totalVideos: Int = 0,
    val videosWatched: Int = 0,
    val favoriteVideosCount: Int = 0,
    val totalVideoNotesCount: Int = 0
)

@Immutable
@Serializable
data class AiExportPayload(
    val app: String = "BloomQuest",
    val exportType: String = "special_videos_and_ebooks_with_notes",
    val exportDate: String = "",
    val version: Int = 19,
    val promptForAi: String = "I am using BloomQuest to study interpersonal mastery, high emotional intelligence, active listening, boundaries, confidence, and conflict resolution. Below is my specialized curriculum containing ONLY my Videos and Ebooks/Books, including my chapter progress, watch counts, and my personal study notes taken under each video and book. Please:\n1. Carefully read and evaluate my personal notes, reflections, and insights under each book and video.\n2. Point out blind spots, synthesis, or next-level practical exercises.\n3. Recommend 1-3 new high-value YouTube videos or practical books/ebooks tailored to what I am learning.\n4. Output recommendations in matching JSON format with \"books\" and \"videos\" lists so I can import them back into my app.",
    val summary: LearningResourcesSummary = LearningResourcesSummary(),
    val books: List<BookResourceItem> = emptyList(),
    val videos: List<VideoResourceItem> = emptyList(),
    val videoNotes: List<com.example.selfcarehero.data.room.VideoNote> = emptyList(),
    val bookNotes: List<com.example.selfcarehero.data.room.BookNote> = emptyList(),
    val studyTopics: List<StudyTopic> = emptyList(),
    val userProfile: AiUserProfile? = null,
    val habits: List<NodeItem> = emptyList(),
    val antiGoals: List<AntiGoalItem> = emptyList(),
    val lifeSprint: LifeSprintGoal? = null,
    val recentJournals: List<JournalEntry> = emptyList(),
    val dailyThreeStreak: DailyThreeStreakInfo? = null
)

@Immutable
@Serializable
data class AppState(
    val v: Int = 19,
    val nodes: List<NodeItem> = emptyList(),
    val ev: List<EventRecord> = emptyList(),
    val jr: List<JournalEntry> = emptyList(),
    val rm: List<AlertItem> = emptyList(),
    val st: List<StudyTopic> = emptyList(),
    val urges: List<UrgeItem> = emptyList(),
    val learnStack: List<LearnItem> = emptyList(),
    val goodDeeds: List<GoodDeedEntry> = emptyList(),
    val rewardShop: List<RewardItem> = emptyList(),
    val weeklyReviews: List<WeeklyReviewEntry> = emptyList(),
    val dailyThreeStreak: DailyThreeStreakInfo = DailyThreeStreakInfo(),
    val snapshots: List<BackupSnapshot> = emptyList(),
    val lowEnergyMode: Boolean = false,
    val lowEnergyEssentialIds: List<String> = listOf("w", "m1", "j"),
    val restDayTokens: Int = 1,
    val usedRestDays: List<String> = emptyList(),
    val lastVisitDate: String = "",
    val comebackBonus: ComebackBonusInfo? = null,
    val coins: Int = 20,
    val routines: List<RoutineFlow> = emptyList(),
    val habitStacks: List<HabitStackLink> = emptyList(),
    val activeMomentumHabitId: String? = null,
    val aiChatHistory: List<AiChatMessage> = emptyList(),
    val antiGoals: List<AntiGoalItem> = emptyList(),
    val activeSprint: LifeSprintGoal? = null,
    val circadianConfig: CircadianConfig = CircadianConfig(),
    val habitContracts: List<HabitContract> = emptyList(),
    val penaltyVaultCoins: Int = 0,
    val weeklyQuests: List<WeeklyQuest> = emptyList(),
    val isDarkMode: Boolean = false,
    val videoResources: List<VideoResourceItem> = emptyList(),
    val bookResources: List<BookResourceItem> = emptyList(),
    val pinLockEnabled: Boolean = false,
    val pinHash: String = "",
    val lockJournal: Boolean = true,
    val lockUrges: Boolean = true,
    val lockAppLaunch: Boolean = false,
    val roadmapGoals: List<RoadmapGoal> = emptyList(),
    val roadmapSteps: List<RoadmapStep> = emptyList(),
    val roadmapTags: List<RoadmapTag> = emptyList(),
    val aiOnlineSearchEnabled: Boolean = true
)

@Immutable
data class WeeklyTopSkill(
    val id: String,
    val name: String,
    val emoji: String,
    val nature: String,
    val importance: String,
    val xpEarned: Int,
    val completionCount: Int,
    val activeDays: Int,
    val hybridScore: Double,
    val momentumTag: String // '🔥 7-Day Streak' | '⚡ High Growth' | '💪 Master Reps' | '🌱 Consistent Anchor'
)

@Immutable
data class WeeklyInsightsData(
    val startDate: String,
    val endDate: String,
    val totalXp: Int,
    val totalCompletions: Int,
    val dailyThreeDays: Int,
    val topSkills: List<WeeklyTopSkill>,
    val moodCounts: List<Int>, // 5 items (index 0..4)
    val dominantMoodIndex: Int,
    val dominantMoodEmoji: String,
    val dominantMoodLabel: String,
    val averageMood: Double,
    val gratitudeEntries: List<GoodDeedEntry>
)

object DateUtils {
    private val sdf = SimpleDateFormat("yyyy-MM-dd", Locale.US)
    private val timeFormat = SimpleDateFormat("HH:mm", Locale.US)

    @Synchronized
    fun todayStr(): String = sdf.format(Date())

    @Synchronized
    fun nowTimeStr(): String = timeFormat.format(Date())

    @Synchronized
    fun daysAgoStr(days: Int): String {
        val cal = java.util.Calendar.getInstance()
        cal.add(java.util.Calendar.DAY_OF_YEAR, -days)
        return sdf.format(cal.time)
    }

    @Synchronized
    fun daysFromNowStr(days: Int): String {
        val cal = java.util.Calendar.getInstance()
        cal.add(java.util.Calendar.DAY_OF_YEAR, days)
        return sdf.format(cal.time)
    }

    @Synchronized
    fun getDayLabel(dateStr: String): String {
        return try {
            val d = sdf.parse(dateStr) ?: return dateStr
            val f = SimpleDateFormat("EEE d", Locale.US)
            f.format(d)
        } catch (_: Exception) {
            dateStr
        }
    }

    @Synchronized
    fun daysBetween(d1: String, d2: String): Int {
        return try {
            val date1 = sdf.parse(d1) ?: return 0
            val date2 = sdf.parse(d2) ?: return 0
            val diffMs = date2.time - date1.time
            kotlin.math.round(diffMs.toDouble() / (1000.0 * 60 * 60 * 24)).toInt()
        } catch (_: Exception) {
            0
        }
    }

    @Synchronized
    fun getDatesBetween(startDateStr: String, endDateStr: String): List<String> {
        val list = mutableListOf<String>()
        try {
            val start = sdf.parse(startDateStr) ?: return emptyList()
            val end = sdf.parse(endDateStr) ?: return emptyList()
            if (start.after(end)) return emptyList()
            val cal = java.util.Calendar.getInstance()
            cal.time = start
            while (!cal.time.after(end)) {
                list.add(sdf.format(cal.time))
                cal.add(java.util.Calendar.DAY_OF_YEAR, 1)
            }
        } catch (_: Exception) {}
        return list
    }

    @Synchronized
    fun currentWeekMondayStr(): String {
        val cal = java.util.Calendar.getInstance()
        val dayOfWeek = cal.get(java.util.Calendar.DAY_OF_WEEK)
        val daysFromMonday = if (dayOfWeek == java.util.Calendar.SUNDAY) 6 else dayOfWeek - java.util.Calendar.MONDAY
        cal.add(java.util.Calendar.DAY_OF_YEAR, -daysFromMonday)
        return sdf.format(cal.time)
    }

    fun daysRemainingInWeek(): Int {
        val cal = java.util.Calendar.getInstance()
        return when (cal.get(java.util.Calendar.DAY_OF_WEEK)) {
            java.util.Calendar.SUNDAY -> 0
            java.util.Calendar.MONDAY -> 6
            java.util.Calendar.TUESDAY -> 5
            java.util.Calendar.WEDNESDAY -> 4
            java.util.Calendar.THURSDAY -> 3
            java.util.Calendar.FRIDAY -> 2
            java.util.Calendar.SATURDAY -> 1
            else -> 0
        }
    }
}

@Immutable
data class HabitMoodCorrelation(
    val habitName: String,
    val habitEmoji: String,
    val avgMoodDone: Double,
    val avgMoodNotDone: Double,
    val deltaPercent: Int,
    val totalDoneDays: Int
)

@Immutable
data class PillarBalance(
    val learnPercent: Int,
    val buildPercent: Int,
    val bodyPercent: Int,
    val dominantPillar: String
)

@Immutable
data class UrgeAnalytics(
    val totalUrges: Int,
    val avgIntensity: Double,
    val delayedCount: Int,
    val successRate: Int,
    val topTriggers: List<Pair<String, Int>>,
    val avgIntensityDrop: Double = 0.0,
    val surfedCount: Int = 0,
    val topSomaticSensations: List<Pair<String, Int>> = emptyList()
)

@Immutable
data class AdvancedAnalyticsData(
    val correlations: List<HabitMoodCorrelation>,
    val pillarBalance: PillarBalance,
    val urgeAnalytics: UrgeAnalytics
)

