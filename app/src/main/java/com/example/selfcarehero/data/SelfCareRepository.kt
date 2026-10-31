package com.example.selfcarehero.data

import android.content.Context
import android.content.SharedPreferences
import com.example.selfcarehero.model.*
import com.example.selfcarehero.utils.ReminderScheduler
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.runBlocking
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import kotlin.math.floor
import kotlin.math.max
import kotlin.math.roundToInt
import kotlin.math.sqrt

class SelfCareRepository(context: Context) {
    private val appContext: Context = context.applicationContext
    private val prefs: SharedPreferences = appContext.getSharedPreferences("self_care_hero_prefs", Context.MODE_PRIVATE)
    private val json = Json {
        ignoreUnknownKeys = true
        prettyPrint = false
        isLenient = true
        coerceInputValues = true
        encodeDefaults = true
    }

    private val _state = MutableStateFlow(loadInitialState())
    val state: StateFlow<AppState> = _state.asStateFlow()

    private val roomDb = com.example.selfcarehero.data.room.UrgeDatabase.getDatabase(appContext)
    val videoNoteDao = roomDb.videoNoteDao()
    val bookNoteDao = roomDb.bookNoteDao()

    init {
        checkComebackBonus()
        try {
            ReminderScheduler.scheduleAllReminders(appContext, _state.value.rm)
        } catch (_: Exception) {}
    }

    private fun loadInitialState(): AppState {
        val raw = prefs.getString("sch_state_v17", null)
            ?: prefs.getString("sch_state_v16", null)
            ?: prefs.getString("sch_state_v15", null)
            ?: prefs.getString("sch_state_v14", null)
            ?: prefs.getString("sch_state_v13", null)
        val loaded = if (!raw.isNullOrBlank()) {
            try {
                json.decodeFromString<AppState>(raw)
            } catch (e: Exception) {
                SeedData.createInitialState()
            }
        } else {
            SeedData.createInitialState()
        }
        val currentMonday = DateUtils.currentWeekMondayStr()
        val questsValid = loaded.weeklyQuests.isNotEmpty() && loaded.weeklyQuests.all { it.weekStartDate == currentMonday }
        val quests = if (questsValid) loaded.weeklyQuests else SeedData.getInitialWeeklyQuests()

        val withDefaults = loaded.copy(
            v = 19,
            antiGoals = if (loaded.antiGoals.isEmpty()) SeedData.getInitialAntiGoals() else loaded.antiGoals,
            activeSprint = loaded.activeSprint ?: SeedData.getInitialLifeSprint(),
            habitContracts = if (loaded.habitContracts.isEmpty()) SeedData.getInitialHabitContracts() else loaded.habitContracts,
            urges = if (loaded.urges.isEmpty()) SeedData.getInitialUrges() else loaded.urges,
            weeklyQuests = quests,
            videoResources = if (loaded.videoResources.isEmpty()) SeedData.getInitialVideos() else loaded.videoResources,
            bookResources = if (loaded.bookResources.isEmpty()) SeedData.getInitialBooks() else loaded.bookResources,
            roadmapGoals = if (loaded.roadmapGoals.isEmpty()) SeedData.getInitialRoadmapGoals() else loaded.roadmapGoals,
            roadmapSteps = if (loaded.roadmapSteps.isEmpty()) SeedData.getInitialRoadmapSteps() else loaded.roadmapSteps,
            roadmapTags = if (loaded.roadmapTags.isEmpty()) SeedData.getInitialRoadmapTags() else loaded.roadmapTags
        )
        saveState(withDefaults)
        return withDefaults
    }

    private fun saveState(s: AppState) {
        try {
            prefs.edit().putString("sch_state_v17", json.encodeToString(s)).apply()
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    @Synchronized
    fun updateState(updater: (AppState) -> AppState) {
        val current = _state.value
        val updated = updater(current)
        _state.value = updated
        saveState(updated)
    }

    private fun checkComebackBonus() {
        val today = DateUtils.todayStr()
        val current = _state.value
        val lastVisit = current.lastVisitDate
        if (lastVisit.isNotBlank() && lastVisit != today) {
            val dayDiff = DateUtils.daysBetween(lastVisit, today)
            if (dayDiff >= 2 && current.comebackBonus == null) {
                val bonusXp = 35
                val bonusCoins = 12
                updateState {
                    it.copy(
                        lastVisitDate = today,
                        coins = it.coins + bonusCoins,
                        restDayTokens = it.restDayTokens + 1,
                        comebackBonus = ComebackBonusInfo(
                            pending = true,
                            missedDays = dayDiff,
                            bonusXp = bonusXp,
                            bonusCoins = bonusCoins,
                            welcomeMessage = "Welcome back! Taking space is healthy and normal. Let’s pick back up gently with some bonus energy."
                        )
                    )
                }
            } else {
                updateState { it.copy(lastVisitDate = today) }
            }
        } else if (lastVisit.isBlank()) {
            updateState { it.copy(lastVisitDate = today) }
        }
    }

    fun dismissComebackBonus() {
        updateState { it.copy(comebackBonus = null) }
    }

    // Calculations
    fun getTotalXp(state: AppState): Int {
        val eventSum = state.ev.sumOf { it.x }
        val dailyThreeBonus = state.dailyThreeStreak.cur * 30
        val weeklyReviewsBonus = state.weeklyReviews.sumOf { it.xpAwarded }
        return eventSum + dailyThreeBonus + weeklyReviewsBonus
    }

    fun getPlayerLevel(state: AppState): Int {
        val xp = getTotalXp(state)
        return floor(sqrt(max(0, xp) / 50.0)).toInt() + 1
    }

    fun getLevelTitle(level: Int): String = when {
        level <= 2 -> "Novice Guardian 🌱"
        level <= 5 -> "Mindful Explorer 🌿"
        level <= 9 -> "Steadfast Hero 🛡️"
        level <= 14 -> "Master of Self 🌟"
        else -> "Transcendent Sage 👑"
    }

    fun getXpProgressInLevel(state: AppState): Pair<Int, Int> {
        val currentLevel = getPlayerLevel(state)
        val currentLevelBaseXp = (currentLevel - 1) * (currentLevel - 1) * 50
        val nextLevelBaseXp = currentLevel * currentLevel * 50
        val total = getTotalXp(state)
        val xpIntoLevel = max(0, total - currentLevelBaseXp)
        val needed = max(1, nextLevelBaseXp - currentLevelBaseXp)
        return Pair(xpIntoLevel, needed)
    }

    fun getSkillCountToday(state: AppState, skillId: String, date: String = DateUtils.todayStr()): Int {
        return state.ev.filter { it.d == date && it.n == skillId }.sumOf { it.c }
    }

    fun isSkillDoneToday(state: AppState, node: NodeItem, date: String = DateUtils.todayStr()): Boolean {
        val count = getSkillCountToday(state, node.id, date)
        val goal = node.g
        return when (node.k) {
            "check" -> count >= 1
            "count" -> count >= goal
            "quit" -> count == 0
            "step" -> {
                val maxStep = if (!node.sliderSteps.isNullOrEmpty()) node.sliderSteps.size - 1 else 1
                node.sliderLevel >= maxStep
            }
            else -> count >= 1
        }
    }

    fun isHabitDoneToday(habitId: String): Boolean {
        val node = _state.value.nodes.firstOrNull { it.id == habitId } ?: return false
        return isSkillDoneToday(_state.value, node)
    }

    fun toggleHabit(habitId: String) {
        val node = _state.value.nodes.firstOrNull { it.id == habitId } ?: return
        toggleCheckHabit(node)
    }

    fun toggleCheckHabit(node: NodeItem) {
        val today = DateUtils.todayStr()
        val current = _state.value
        val isDone = isSkillDoneToday(current, node, today)
        if (isDone) {
            updateState { s ->
                val newEv = s.ev.filterNot { it.d == today && it.n == node.id }
                s.copy(
                    ev = newEv,
                    activeMomentumHabitId = if (s.activeMomentumHabitId == node.id) null else s.activeMomentumHabitId
                )
            }
        } else {
            // Check if this completes an active momentum stack
            val isMomentumActive = current.activeMomentumHabitId == node.id
            val bonusXp = if (isMomentumActive) 15 else 10
            val event = EventRecord(System.currentTimeMillis(), today, node.id, 1, bonusXp)

            // Check if this habit triggers the NEXT stacked habit
            val nextStack = current.habitStacks.firstOrNull { it.triggerHabitId == node.id }
            val nextHabitId = nextStack?.followUpHabitId

            updateState { s ->
                val base = s.copy(
                    ev = s.ev + event,
                    coins = s.coins + 2,
                    activeMomentumHabitId = nextHabitId
                )
                val contractUpdated = evaluateContractsOnHabitCompletion(base, node.id, today)
                recalcDailyThreeStreak(contractUpdated)
            }

            // Advance weekly quests: vitality if body/care, consistency for any habit check
            val isVitality = node.p == "body" || node.p == "care" || node.id in listOf("w", "m1", "m2", "c1", "c2")
            if (isVitality) {
                advanceWeeklyQuest("vitality", 1)
            }
            advanceWeeklyQuest("consistency", 1)
        }
    }

    fun incrementCountHabit(node: NodeItem, delta: Int) {
        val today = DateUtils.todayStr()
        val currentCount = getSkillCountToday(_state.value, node.id, today)
        if (currentCount + delta < 0) return

        val event = EventRecord(System.currentTimeMillis(), today, node.id, delta, if (delta > 0) 5 * delta else 0)
        updateState { s ->
            val base = s.copy(
                ev = s.ev + event,
                coins = if (delta > 0) s.coins + delta else s.coins
            )
            val contractUpdated = if (delta > 0) evaluateContractsOnHabitCompletion(base, node.id, today) else base
            recalcDailyThreeStreak(contractUpdated)
        }

        if (delta > 0) {
            val isVitality = node.p == "body" || node.p == "care" || node.id in listOf("w", "m1", "m2", "c1", "c2")
            if (isVitality) {
                advanceWeeklyQuest("vitality", delta)
            }
            advanceWeeklyQuest("consistency", 1)
        }
    }

    fun updateSliderStep(node: NodeItem, newStep: Int) {
        val today = DateUtils.todayStr()
        updateState { s ->
            val updatedNodes = s.nodes.map {
                if (it.id == node.id) it.copy(sliderLevel = newStep) else it
            }
            val event = EventRecord(System.currentTimeMillis(), today, node.id, 1, 8)
            val updated = s.copy(nodes = updatedNodes, ev = s.ev + event, coins = s.coins + 1)
            recalcDailyThreeStreak(updated)
        }
    }

    private fun recalcDailyThreeStreak(state: AppState): AppState {
        val today = DateUtils.todayStr()
        val learnDone = state.nodes.any { it.p == "learn" && isSkillDoneToday(state, it, today) }
        val buildDone = state.nodes.any { it.p == "build" && isSkillDoneToday(state, it, today) }
        val bodyDone = state.nodes.any { it.p == "body" && isSkillDoneToday(state, it, today) }

        if (learnDone && buildDone && bodyDone) {
            val streak = state.dailyThreeStreak
            if (streak.lastCompletedDate != today) {
                val daysSinceLast = if (streak.lastCompletedDate.isNotBlank()) {
                    DateUtils.daysBetween(streak.lastCompletedDate, today)
                } else 1

                val newCur = if (daysSinceLast <= 1) {
                    streak.cur + 1
                } else {
                    // Check if gap was covered by used rest days
                    val missedDates = DateUtils.getDatesBetween(
                        DateUtils.daysAgoStr(daysSinceLast - 1),
                        DateUtils.daysAgoStr(1)
                    )
                    val allCovered = missedDates.isNotEmpty() && missedDates.all { state.usedRestDays.contains(it) }
                    if (allCovered) streak.cur + 1 else 1
                }

                val newBest = max(streak.best, newCur)
                return state.copy(
                    dailyThreeStreak = DailyThreeStreakInfo(newCur, newBest, today),
                    coins = state.coins + 5
                )
            }
        }
        return state
    }

    fun useRestDayToken() {
        val today = DateUtils.todayStr()
        val current = _state.value
        if (current.restDayTokens > 0 && !current.usedRestDays.contains(today)) {
            updateState {
                it.copy(
                    restDayTokens = it.restDayTokens - 1,
                    usedRestDays = it.usedRestDays + today,
                    dailyThreeStreak = it.dailyThreeStreak.copy(
                        cur = it.dailyThreeStreak.cur + 1,
                        lastCompletedDate = today
                    )
                )
            }
        }
    }

    fun toggleLowEnergyMode() {
        updateState { it.copy(lowEnergyMode = !it.lowEnergyMode) }
    }

    fun toggleDarkMode() {
        updateState { it.copy(isDarkMode = !it.isDarkMode) }
    }

    // Weekly Insights Algorithm
    fun getWeeklyInsights(): WeeklyInsightsData {
        val s = _state.value
        val datesLast7Days = (0..6).map { DateUtils.daysAgoStr(it) }
        val startDate = datesLast7Days.last()
        val endDate = datesLast7Days.first()

        val weeklyEvents = s.ev.filter { it.d in datesLast7Days && !it.n.startsWith("_") }
        val totalXp = weeklyEvents.sumOf { it.x }
        val totalCompletions = weeklyEvents.sumOf { it.c }

        // Daily Three days in last 7 days
        var dailyThreeDays = 0
        for (d in datesLast7Days) {
            val lDone = s.nodes.any { it.p == "learn" && isSkillDoneToday(s, it, d) }
            val bDone = s.nodes.any { it.p == "build" && isSkillDoneToday(s, it, d) }
            val boDone = s.nodes.any { it.p == "body" && isSkillDoneToday(s, it, d) }
            if (lDone && bDone && boDone) dailyThreeDays++
        }

        // Hybrid Top Skills: (XP * 1.5) + (Completions * 10) + (ActiveDays * 15)
        val topSkills = s.nodes.filter { it.p != "0" }.mapNotNull { node ->
            val nodeEvents = weeklyEvents.filter { it.n == node.id }
            if (nodeEvents.isEmpty()) null
            else {
                val xp = nodeEvents.sumOf { it.x }
                val comps = nodeEvents.sumOf { it.c }
                val activeDays = nodeEvents.map { it.d }.distinct().size
                val hybridScore = (xp * 1.5) + (comps * 10.0) + (activeDays * 15.0)

                val momentum = when {
                    activeDays >= 6 -> "🔥 7-Day Habit Streak"
                    xp >= 50 -> "⚡ High Growth"
                    comps >= 12 -> "💪 Master Reps"
                    else -> "🌱 Consistent Anchor"
                }

                WeeklyTopSkill(
                    id = node.id,
                    name = node.n,
                    emoji = node.e,
                    nature = node.nature,
                    importance = node.importance,
                    xpEarned = xp,
                    completionCount = comps,
                    activeDays = activeDays,
                    hybridScore = hybridScore,
                    momentumTag = momentum
                )
            }
        }.sortedByDescending { it.hybridScore }.take(5)

        // Mood Analytics
        val weeklyJournals = s.jr.filter { it.d in datesLast7Days }
        val moodCounts = MutableList(5) { 0 }
        for (j in weeklyJournals) {
            if (j.m in 0..4) moodCounts[j.m]++
        }
        val dominantIdx = moodCounts.indices.maxByOrNull { moodCounts[it] } ?: 3
        val moodEmojis = listOf("😢", "😕", "😐", "🙂", "😄")
        val moodLabels = listOf("Rough", "Low", "Neutral", "Good", "Great")
        val avgMood = if (weeklyJournals.isNotEmpty()) weeklyJournals.map { it.m }.average() else 3.0

        val weeklyGratitude = s.goodDeeds.filter { it.d in datesLast7Days }

        return WeeklyInsightsData(
            startDate = startDate,
            endDate = endDate,
            totalXp = totalXp,
            totalCompletions = totalCompletions,
            dailyThreeDays = dailyThreeDays,
            topSkills = topSkills,
            moodCounts = moodCounts,
            dominantMoodIndex = dominantIdx,
            dominantMoodEmoji = moodEmojis[dominantIdx],
            dominantMoodLabel = moodLabels[dominantIdx],
            averageMood = avgMood,
            gratitudeEntries = weeklyGratitude
        )
    }

    fun completeWeeklyReview(
        winsText: String,
        frictionTags: List<String>,
        frictionNotes: String,
        focusSkillId: String?,
        focusSkillName: String?
    ) {
        val today = DateUtils.todayStr()
        val review = WeeklyReviewEntry(
            id = "wrev_${System.currentTimeMillis()}",
            weekStartDate = DateUtils.daysAgoStr(6),
            weekEndDate = today,
            completedAt = System.currentTimeMillis(),
            winsText = winsText,
            frictionTags = frictionTags,
            frictionNotes = frictionNotes,
            focusSkillId = focusSkillId,
            focusSkillName = focusSkillName,
            xpAwarded = 50
        )
        updateState { s ->
            s.copy(
                weeklyReviews = listOf(review) + s.weeklyReviews,
                coins = s.coins + 10
            )
        }
    }

    // Advanced Data Visualizations & Analytics
    fun getAdvancedAnalytics(): AdvancedAnalyticsData {
        val s = _state.value
        val dateMoodMap: Map<String, Int> = s.jr.associate { it.d to it.m }

        // 1. Habit-to-Mood Correlations
        val computedCorrelations = s.nodes.filter { it.p != "0" }.mapNotNull { node ->
            val nodeEvents = s.ev.filter { it.n == node.id }
            val doneDates = nodeEvents.map { it.d }.toSet()
            val doneMoods: List<Double> = dateMoodMap.filterKeys { it in doneDates }.values.map { it.toDouble() }
            val notDoneMoods: List<Double> = dateMoodMap.filterKeys { it !in doneDates }.values.map { it.toDouble() }

            if (doneMoods.isNotEmpty()) {
                val avgDone = doneMoods.average()
                val avgNotDone = if (notDoneMoods.isNotEmpty()) notDoneMoods.average() else 3.0
                val delta = if (avgNotDone > 0.0) (((avgDone - avgNotDone) / avgNotDone) * 100.0).toInt() else 0
                if (delta > 0) {
                    HabitMoodCorrelation(
                        habitName = node.n,
                        habitEmoji = if (node.e.isNotBlank()) node.e else "⚡",
                        avgMoodDone = avgDone,
                        avgMoodNotDone = avgNotDone,
                        deltaPercent = delta,
                        totalDoneDays = doneMoods.size
                    )
                } else null
            } else null
        }.sortedByDescending { it.deltaPercent }

        val correlations = if (computedCorrelations.isNotEmpty()) {
            computedCorrelations.take(4)
        } else {
            // Baseline insights for new or low-entry profiles
            listOf(
                HabitMoodCorrelation("Morning Hydration", "💧", 4.2, 3.4, 24, 6),
                HabitMoodCorrelation("Deep Work (20m)", "🎯", 4.0, 3.3, 21, 5),
                HabitMoodCorrelation("Daily Three Pillars", "🔥", 4.5, 3.8, 18, 4)
            )
        }

        // 2. Pillar Distribution Balance
        val learnXp = s.ev.filter { ev -> s.nodes.any { it.id == ev.n && it.p == "learn" } }.sumOf { it.x } + 40
        val buildXp = s.ev.filter { ev -> s.nodes.any { it.id == ev.n && it.p == "build" } }.sumOf { it.x } + 35
        val bodyXp = s.ev.filter { ev -> s.nodes.any { it.id == ev.n && it.p == "body" } }.sumOf { it.x } + 35
        val totalPillars = maxOf(1, learnXp + buildXp + bodyXp)

        val learnPct = ((learnXp.toDouble() / totalPillars) * 100).toInt()
        val buildPct = ((buildXp.toDouble() / totalPillars) * 100).toInt()
        val bodyPct = maxOf(0, 100 - learnPct - buildPct)
        val dominant = when {
            learnPct >= buildPct && learnPct >= bodyPct -> "Learn (Mind)"
            buildPct >= bodyPct -> "Build (Craft)"
            else -> "Body (Vitality)"
        }
        val pillarBalance = PillarBalance(learnPct, buildPct, bodyPct, dominant)

        // 3. Urge Analytics
        val totalUrges = s.urges.size
        val avgIntensity = if (totalUrges > 0) s.urges.map { it.preIntensity }.average() else 0.0
        val delayedCount = s.urges.count { it.outcomeStatus in listOf("SURFED", "RESISTED") || it.choice.isNotBlank() }
        val successRate = if (totalUrges > 0) ((delayedCount.toDouble() / totalUrges) * 100).toInt() else 100
        val topTriggers = s.urges.groupBy { it.trigger }.map { it.key to it.value.size }
            .sortedByDescending { it.second }.take(3)
        val completedSurfs = s.urges.filter { it.postIntensity != null }
        val avgIntensityDrop = if (completedSurfs.isNotEmpty()) completedSurfs.map { it.intensityDelta() }.average() else 0.0
        val surfedCount = s.urges.count { it.outcomeStatus == "SURFED" }
        val allSomatic = s.urges.flatMap { it.somaticSensations }
        val topSomaticSensations = allSomatic.groupBy { it }.map { it.key to it.value.size }
            .sortedByDescending { it.second }.take(3)

        val urgeAnalytics = UrgeAnalytics(
            totalUrges = totalUrges,
            avgIntensity = avgIntensity,
            delayedCount = delayedCount,
            successRate = successRate,
            topTriggers = topTriggers,
            avgIntensityDrop = avgIntensityDrop,
            surfedCount = surfedCount,
            topSomaticSensations = topSomaticSensations
        )

        return AdvancedAnalyticsData(correlations, pillarBalance, urgeAnalytics)
    }

    // Rememorization Spaced Recall
    fun updateRememorizeConfig(nodeId: String, enabled: Boolean, intervalDays: Int) {
        updateState { s ->
            val updatedNodes = s.nodes.map { node ->
                if (node.id == nodeId) {
                    node.copy(
                        rememorize = RememorizeConfig(
                            enabled = enabled,
                            intervalDays = intervalDays,
                            lastReviewed = System.currentTimeMillis(),
                            nextDue = System.currentTimeMillis() + (intervalDays * 86400000L),
                            reviewCount = node.rememorize?.reviewCount ?: 0
                        )
                    )
                } else node
            }
            s.copy(nodes = updatedNodes)
        }
    }

    fun markRememorized(nodeId: String) {
        updateState { s ->
            val updatedNodes = s.nodes.map { node ->
                if (node.id == nodeId && node.rememorize != null) {
                    val count = node.rememorize.reviewCount + 1
                    val nextDue = System.currentTimeMillis() + (node.rememorize.intervalDays * 86400000L)
                    node.copy(
                        rememorize = node.rememorize.copy(
                            reviewCount = count,
                            lastReviewed = System.currentTimeMillis(),
                            nextDue = nextDue
                        )
                    )
                } else node
            }
            val event = EventRecord(System.currentTimeMillis(), DateUtils.todayStr(), nodeId, 1, 15)
            s.copy(nodes = updatedNodes, ev = s.ev + event, coins = s.coins + 3)
        }
    }

    // ==========================================
    // Weekly Quests Progression & Reward Engine
    // ==========================================

    fun advanceWeeklyQuest(questType: String, delta: Int = 1) {
        val currentMonday = DateUtils.currentWeekMondayStr()
        updateState { s ->
            val quests = if (s.weeklyQuests.isEmpty() || s.weeklyQuests.any { it.weekStartDate != currentMonday }) {
                SeedData.getInitialWeeklyQuests()
            } else {
                s.weeklyQuests
            }
            val updatedQuests = quests.map { quest ->
                if ((quest.questType == questType || quest.category == questType || (questType == "all" && !quest.isCompleted)) && !quest.isCompleted) {
                    val newProgress = (quest.currentProgress + delta).coerceAtMost(quest.targetCount)
                    val completed = newProgress >= quest.targetCount
                    quest.copy(
                        currentProgress = newProgress,
                        isCompleted = completed
                    )
                } else quest
            }
            s.copy(weeklyQuests = updatedQuests)
        }
    }

    fun claimWeeklyQuest(questId: String): Triple<Boolean, Int, Int> {
        var claimed = false
        var coinsEarned = 0
        var xpEarned = 0
        updateState { s ->
            val target = s.weeklyQuests.firstOrNull { it.id == questId }
            if (target != null && target.isCompleted && !target.isClaimed) {
                claimed = true
                coinsEarned = target.rewardCoins
                xpEarned = target.rewardXp
                val updatedQuests = s.weeklyQuests.map {
                    if (it.id == questId) it.copy(isClaimed = true) else it
                }
                val event = EventRecord(
                    t = System.currentTimeMillis(),
                    d = DateUtils.todayStr(),
                    n = "quest_claim_${target.id}",
                    c = 1,
                    x = xpEarned
                )
                s.copy(
                    weeklyQuests = updatedQuests,
                    coins = s.coins + coinsEarned,
                    ev = s.ev + event
                )
            } else {
                s
            }
        }
        return Triple(claimed, coinsEarned, xpEarned)
    }

    // ==========================================
    // PIN Privacy & Security Engine (Phase 3, Feature 12)
    // ==========================================

    fun setPin(pin: String) {
        val hash = com.example.selfcarehero.utils.PinSecurityHelper.hashPin(pin)
        updateState { s ->
            s.copy(
                pinLockEnabled = true,
                pinHash = hash
            )
        }
    }

    fun disablePin() {
        updateState { s ->
            s.copy(
                pinLockEnabled = false,
                pinHash = ""
            )
        }
    }

    fun verifyPin(inputPin: String): Boolean {
        val storedHash = _state.value.pinHash
        return com.example.selfcarehero.utils.PinSecurityHelper.verifyPin(inputPin, storedHash)
    }

    fun updatePinSettings(
        enabled: Boolean,
        lockJournal: Boolean,
        lockUrges: Boolean,
        lockAppLaunch: Boolean
    ) {
        updateState { s ->
            s.copy(
                pinLockEnabled = enabled,
                lockJournal = lockJournal,
                lockUrges = lockUrges,
                lockAppLaunch = lockAppLaunch
            )
        }
    }

    // Node operations
    fun addOrUpdateNode(node: NodeItem) {
        updateState { s ->
            val exists = s.nodes.any { it.id == node.id }
            val newNodes = if (exists) {
                s.nodes.map { if (it.id == node.id) node else it }
            } else {
                s.nodes + node
            }
            s.copy(nodes = newNodes)
        }
    }

    fun deleteNode(id: String) {
        updateState { s ->
            s.copy(nodes = s.nodes.filterNot { it.id == id || it.p == id })
        }
    }

    // Learn operations
    fun addLearnItem(item: LearnItem) {
        updateState { it.copy(learnStack = listOf(item) + it.learnStack, coins = it.coins + 3) }
    }

    fun toggleFavoriteLearn(id: String) {
        updateState { s ->
            s.copy(learnStack = s.learnStack.map {
                if (it.id == id) it.copy(favorite = !it.favorite) else it
            })
        }
    }

    fun markLearnReviewed(id: String) {
        updateState { s ->
            s.copy(
                learnStack = s.learnStack.map {
                    if (it.id == id) it.copy(
                        reviewCount = it.reviewCount + 1,
                        lastReviewed = System.currentTimeMillis()
                    ) else it
                },
                coins = s.coins + 2
            )
        }
    }

    fun submitTeachBack(
        learnId: String,
        explanation: String,
        masteryRating: Int,
        intervalDays: Int
    ): Pair<Int, Int> {
        val today = DateUtils.todayStr()
        val nextDue = DateUtils.daysFromNowStr(intervalDays)
        var earnedCoins = 0
        var earnedXp = 0

        updateState { s ->
            val currentItem = s.learnStack.firstOrNull { it.id == learnId }
            val isFirstTime = (currentItem?.teachBackCount ?: 0) == 0
            earnedCoins = if (isFirstTime) 3 else 2
            earnedXp = if (isFirstTime) 25 else 15

            val updatedStack = s.learnStack.map { item ->
                if (item.id == learnId) {
                    item.copy(
                        userExplanation = explanation,
                        teachBackNote = explanation,
                        masteryRating = masteryRating,
                        teachBackCount = item.teachBackCount + 1,
                        lastTeachBackDate = today,
                        nextReviewDue = nextDue,
                        reviewCount = item.reviewCount + 1,
                        lastReviewed = System.currentTimeMillis()
                    )
                } else item
            }

            val event = EventRecord(
                t = System.currentTimeMillis(),
                d = today,
                n = "teach_back_$learnId",
                c = 1,
                x = earnedXp
            )

            s.copy(
                learnStack = updatedStack,
                coins = s.coins + earnedCoins,
                ev = s.ev + event
            )
        }
        advanceWeeklyQuest("wisdom", 1)
        return Pair(earnedCoins, earnedXp)
    }

    // Journal operations
    fun addJournalEntry(mood: Int, text: String, tags: List<String>) {
        val today = DateUtils.todayStr()
        val entry = JournalEntry(
            id = "jr_${System.currentTimeMillis()}",
            d = today,
            m = mood,
            t = text,
            g = tags
        )
        val event = EventRecord(System.currentTimeMillis(), today, "_j", 1, 15)
        updateState { it.copy(jr = listOf(entry) + it.jr, ev = it.ev + event, coins = it.coins + 4) }
        advanceWeeklyQuest("wisdom", 1)
    }

    fun addGoodDeed(target: String, text: String) {
        val today = DateUtils.todayStr()
        val entry = GoodDeedEntry(
            id = "gd_${System.currentTimeMillis()}",
            d = today,
            tm = DateUtils.nowTimeStr(),
            target = target,
            text = text
        )
        val event = EventRecord(System.currentTimeMillis(), today, "_gooddeed", 1, 12)
        updateState { it.copy(goodDeeds = listOf(entry) + it.goodDeeds, ev = it.ev + event, coins = it.coins + 3) }
    }

    // Urges
    fun logUrge(trigger: String, level: Int, want: String, choice: String, note: String) {
        val today = DateUtils.todayStr()
        val urge = UrgeItem(
            id = "urg_${System.currentTimeMillis()}",
            d = today,
            tm = DateUtils.nowTimeStr(),
            trigger = trigger,
            level = level,
            want = want,
            choice = choice,
            note = note,
            preIntensity = level,
            postIntensity = level
        )
        val event = EventRecord(System.currentTimeMillis(), today, "_urge", 1, 20)
        updateState { it.copy(urges = listOf(urge) + it.urges, ev = it.ev + event, coins = it.coins + 5) }
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
    ): Pair<Int, Int> {
        val today = DateUtils.todayStr()
        val delta = maxOf(0, preIntensity - postIntensity)
        val baseCoins = 5
        val deltaBonus = delta
        val surfBonus = if (outcomeStatus == "SURFED") 5 else if (outcomeStatus == "RESISTED") 3 else 0
        val coinsEarned = baseCoins + deltaBonus + surfBonus
        val xpEarned = when (outcomeStatus) {
            "SURFED" -> 35
            "RESISTED" -> 30
            "PARTIAL_LAPSE" -> 20
            "FULL_LAPSE" -> 15
            else -> 25
        }

        val urge = UrgeItem(
            id = "urg_${System.currentTimeMillis()}",
            d = today,
            tm = DateUtils.nowTimeStr(),
            trigger = trigger,
            level = preIntensity,
            want = want,
            choice = choice,
            note = note,
            preIntensity = preIntensity,
            postIntensity = postIntensity,
            somaticSensations = somaticSensations,
            contextTags = contextTags,
            outcomeStatus = outcomeStatus,
            durationSeconds = durationSeconds,
            coinsEarned = coinsEarned,
            xpEarned = xpEarned
        )

        val event = EventRecord(
            t = System.currentTimeMillis(),
            d = today,
            n = "urge_surf_${outcomeStatus.lowercase()}",
            c = 1,
            x = xpEarned
        )

        updateState { s ->
            s.copy(
                urges = listOf(urge) + s.urges,
                ev = s.ev + event,
                coins = s.coins + coinsEarned
            )
        }
        return Pair(coinsEarned, xpEarned)
    }

    // Study topics
    fun addStudyTopic(name: String) {
        val topic = StudyTopic(
            id = "st_${System.currentTimeMillis()}",
            n = name,
            ph = 0,
            s = 0,
            due = System.currentTimeMillis() + 86400000L
        )
        updateState { it.copy(st = it.st + topic) }
    }

    fun advanceStudyTopic(id: String) {
        updateState { s ->
            s.copy(
                st = s.st.map {
                    if (it.id == id) {
                        val nextPh = (it.ph + 1).coerceAtMost(3)
                        it.copy(
                            ph = nextPh,
                            s = it.s + 1,
                            due = System.currentTimeMillis() + (86400000L * (nextPh + 1) * 2)
                        )
                    } else it
                },
                coins = s.coins + 3
            )
        }
    }

    // Alerts
    fun toggleAlert(id: String) {
        updateState { s ->
            val updated = s.rm.map { if (it.id == id) it.copy(active = !it.active) else it }
            val item = updated.firstOrNull { it.id == id }
            if (item != null) {
                if (item.active) ReminderScheduler.scheduleAlert(appContext, item)
                else ReminderScheduler.cancelAlert(appContext, item.id)
            }
            s.copy(rm = updated)
        }
    }

    fun addOrUpdateAlert(alert: AlertItem) {
        updateState { s ->
            val exists = s.rm.any { it.id == alert.id }
            val newAlerts = if (exists) {
                s.rm.map { if (it.id == alert.id) alert else it }
            } else {
                s.rm + alert
            }
            if (alert.active) ReminderScheduler.scheduleAlert(appContext, alert)
            else ReminderScheduler.cancelAlert(appContext, alert.id)
            s.copy(rm = newAlerts)
        }
    }

    fun deleteAlert(id: String) {
        ReminderScheduler.cancelAlert(appContext, id)
        updateState { s -> s.copy(rm = s.rm.filterNot { it.id == id }) }
    }

    fun handleAlertMarkDone(alertId: String) {
        val today = DateUtils.todayStr()
        val targetAlert = _state.value.rm.firstOrNull { it.id == alertId }
        val linkedSkillId = targetAlert?.skillId

        val reminderEvent = EventRecord(System.currentTimeMillis(), today, "_reminder_done", 1, 10)
        val linkedSkillEvent = if (!linkedSkillId.isNullOrBlank()) {
            EventRecord(System.currentTimeMillis(), today, linkedSkillId, 1, 15)
        } else null

        updateState { s ->
            val updatedAlerts = s.rm.map { alert ->
                if (alert.id == alertId && alert.type == "medicine" && alert.pillsCount != null) {
                    alert.copy(pillsCount = maxOf(0, alert.pillsCount - 1))
                } else alert
            }
            val newEvents = if (linkedSkillEvent != null) {
                s.ev + reminderEvent + linkedSkillEvent
            } else {
                s.ev + reminderEvent
            }
            s.copy(rm = updatedAlerts, ev = newEvents, coins = s.coins + 2)
        }
    }

    // Rewards
    fun redeemReward(reward: RewardItem): Boolean {
        val current = _state.value
        if (current.coins < reward.cost) return false

        updateState { s ->
            val newCoins = s.coins - reward.cost
            val newRestTokens = if (reward.id == "rew_rest_token") s.restDayTokens + 1 else s.restDayTokens
            val updatedShop = s.rewardShop.map {
                if (it.id == reward.id) it.copy(redeemedCount = it.redeemedCount + 1) else it
            }
            s.copy(coins = newCoins, restDayTokens = newRestTokens, rewardShop = updatedShop)
        }
        return true
    }

    // Advanced 10-Slot Backup & Safety Snapshots
    fun createSnapshot(label: String): BackupSnapshot {
        val current = _state.value
        val snapshot = BackupSnapshot(
            id = "snap_${System.currentTimeMillis()}",
            timestamp = System.currentTimeMillis(),
            label = label.ifBlank { "Manual Snapshot #${current.snapshots.size + 1}" },
            level = getPlayerLevel(current),
            xp = getTotalXp(current),
            skillsCount = current.nodes.size,
            stateJson = json.encodeToString(current)
        )
        updateState { it.copy(snapshots = (listOf(snapshot) + it.snapshots).take(10)) }
        return snapshot
    }

    fun deleteSnapshot(snapshotId: String) {
        updateState { s ->
            s.copy(snapshots = s.snapshots.filterNot { it.id == snapshotId })
        }
    }

    fun restoreSnapshotWithPreSafety(snapshot: BackupSnapshot): Boolean {
        return try {
            val current = _state.value
            // 1. Mandatory Auto Pre-Restore Rollback Snapshot
            val safetySnapshot = BackupSnapshot(
                id = "pre_restore_${System.currentTimeMillis()}",
                timestamp = System.currentTimeMillis(),
                label = "🛡️ Pre-Restore Safety Snapshot",
                level = getPlayerLevel(current),
                xp = getTotalXp(current),
                skillsCount = current.nodes.size,
                stateJson = json.encodeToString(current)
            )
            val restored = json.decodeFromString<AppState>(snapshot.stateJson)
            // Preserve the safety snapshot in the restored state's snapshot list
            val mergedSnapshots = (listOf(safetySnapshot) + restored.snapshots).take(10)
            val finalState = restored.copy(snapshots = mergedSnapshots)
            updateState { finalState }
            true
        } catch (e: Exception) {
            false
        }
    }

    fun resetHeroWithEmergencySnapshot(): Boolean {
        return try {
            val current = _state.value
            val emergencySnapshot = BackupSnapshot(
                id = "pre_wipe_${System.currentTimeMillis()}",
                timestamp = System.currentTimeMillis(),
                label = "🚨 Emergency Pre-Wipe Snapshot",
                level = getPlayerLevel(current),
                xp = getTotalXp(current),
                skillsCount = current.nodes.size,
                stateJson = json.encodeToString(current)
            )
            val freshState = SeedData.createInitialState().copy(
                snapshots = listOf(emergencySnapshot)
            )
            updateState { freshState }
            true
        } catch (e: Exception) {
            false
        }
    }

    // Routine Customization Persistence
    fun saveRoutine(routine: RoutineFlow) {
        updateState { s ->
            val exists = s.routines.any { it.id == routine.id }
            val updated = if (exists) {
                s.routines.map { if (it.id == routine.id) routine else it }
            } else {
                s.routines + routine
            }
            s.copy(routines = updated)
        }
    }

    fun deleteRoutine(routineId: String) {
        updateState { s ->
            s.copy(routines = s.routines.filterNot { it.id == routineId })
        }
    }

    fun resetRoutinesToDefault() {
        updateState { s ->
            s.copy(routines = SeedData.getInitialRoutines())
        }
    }

    // Anti-Goals & Dopamine Shield
    fun markAntiGoalClean(id: String): Boolean {
        val today = DateUtils.todayStr()
        var awarded = false
        updateState { s ->
            val updated = s.antiGoals.map { item ->
                if (item.id == id && item.lastCleanDate != today) {
                    awarded = true
                    item.copy(
                        cleanStreakDays = item.cleanStreakDays + 1,
                        lastCleanDate = today
                    )
                } else item
            }
            if (awarded) {
                s.copy(
                    antiGoals = updated,
                    coins = s.coins + 5,
                    ev = s.ev + EventRecord(
                        t = System.currentTimeMillis(),
                        d = today,
                        n = "antigoal_$id",
                        c = 1,
                        x = 10
                    )
                )
            } else {
                s.copy(antiGoals = updated)
            }
        }
        return awarded
    }

    fun logAntiGoalSlip(id: String): AntiGoalItem? {
        val today = DateUtils.todayStr()
        var slippedItem: AntiGoalItem? = null
        updateState { s ->
            val updated = s.antiGoals.map { item ->
                if (item.id == id) {
                    val slipped = item.copy(
                        slipsCountToday = item.slipsCountToday + 1,
                        cleanStreakDays = 0,
                        lastCleanDate = today
                    )
                    slippedItem = slipped
                    slipped
                } else item
            }
            s.copy(antiGoals = updated)
        }
        return slippedItem
    }

    fun addOrUpdateAntiGoal(item: AntiGoalItem) {
        updateState { s ->
            val exists = s.antiGoals.any { it.id == item.id }
            val list = if (exists) {
                s.antiGoals.map { if (it.id == item.id) item else it }
            } else {
                s.antiGoals + item
            }
            s.copy(antiGoals = list)
        }
    }

    fun deleteAntiGoal(id: String) {
        updateState { s ->
            s.copy(antiGoals = s.antiGoals.filterNot { it.id == id })
        }
    }

    // 90-Day Life Sprint & Identity Compass
    fun updateSprintGoal(goal: LifeSprintGoal) {
        updateState { s ->
            s.copy(activeSprint = goal)
        }
    }

    fun advanceSprintMilestone(): Boolean {
        val today = DateUtils.todayStr()
        var completed = false
        updateState { s ->
            val sprint = s.activeSprint ?: return@updateState s
            if (sprint.currentMilestoneIdx < sprint.keyMilestones.size - 1) {
                val nextIdx = sprint.currentMilestoneIdx + 1
                val updatedSprint = sprint.copy(currentMilestoneIdx = nextIdx)
                completed = true
                s.copy(
                    activeSprint = updatedSprint,
                    coins = s.coins + 15,
                    ev = s.ev + EventRecord(System.currentTimeMillis(), today, "sprint_milestone", 1, 50)
                )
            } else {
                s
            }
        }
        return completed
    }

    // Circadian Sleep Architecture Clock
    fun updateCircadianConfig(config: CircadianConfig) {
        updateState { s ->
            s.copy(circadianConfig = config)
        }
    }

    // Carrot-Coin Habit Staking Contracts & Escrow
    fun createHabitContract(
        targetHabitId: String,
        targetHabitName: String,
        stakedCoins: Int,
        targetDays: Int = 7
    ): Boolean {
        val current = _state.value
        if (current.coins < stakedCoins || stakedCoins <= 0) return false

        val today = DateUtils.todayStr()
        val newContract = HabitContract(
            id = "contract_${System.currentTimeMillis()}",
            targetHabitId = targetHabitId,
            targetHabitName = targetHabitName,
            stakedCoins = stakedCoins,
            startDateStr = today,
            targetDays = targetDays,
            status = "active",
            multiplierReward = 1.5,
            daysCompleted = 0,
            lastLoggedDate = "",
            protectedDates = emptyList(),
            completedDates = emptyList()
        )

        updateState { s ->
            s.copy(
                coins = s.coins - stakedCoins, // Deduct staked coins into escrow
                habitContracts = s.habitContracts + newContract,
                ev = s.ev + EventRecord(
                    t = System.currentTimeMillis(),
                    d = today,
                    n = "contract_stake_${newContract.id}",
                    c = 1,
                    x = 10
                )
            )
        }
        return true
    }

    fun evaluateContractsOnHabitCompletion(s: AppState, habitId: String, today: String): AppState {
        var bonusCoins = 0
        val bonusXpEvents = mutableListOf<EventRecord>()
        val updatedContracts = s.habitContracts.map { contract ->
            if (contract.targetHabitId == habitId && contract.status == "active") {
                if (!contract.completedDates.contains(today)) {
                    val newCompletedDates = contract.completedDates + today
                    val newDaysCompleted = newCompletedDates.size + contract.protectedDates.size
                    if (newDaysCompleted >= contract.targetDays) {
                        // Commitment won! Refund stake + 50% bonus
                        val refund = (contract.stakedCoins * contract.multiplierReward).roundToInt()
                        bonusCoins += refund
                        bonusXpEvents.add(
                            EventRecord(
                                t = System.currentTimeMillis(),
                                d = today,
                                n = "contract_won_${contract.id}",
                                c = 1,
                                x = 75
                            )
                        )
                        contract.copy(
                            status = "won",
                            daysCompleted = newDaysCompleted,
                            lastLoggedDate = today,
                            completedDates = newCompletedDates
                        )
                    } else {
                        contract.copy(
                            daysCompleted = newDaysCompleted,
                            lastLoggedDate = today,
                            completedDates = newCompletedDates
                        )
                    }
                } else {
                    contract
                }
            } else {
                contract
            }
        }

        return if (bonusCoins > 0 || bonusXpEvents.isNotEmpty()) {
            s.copy(
                coins = s.coins + bonusCoins,
                habitContracts = updatedContracts,
                ev = s.ev + bonusXpEvents
            )
        } else {
            s.copy(habitContracts = updatedContracts)
        }
    }

    fun redeemShieldForContract(contractId: String, specificDate: String? = null): Boolean {
        val today = DateUtils.todayStr()
        var redeemed = false
        updateState { s ->
            if (s.restDayTokens <= 0) return@updateState s
            val target = s.habitContracts.firstOrNull { it.id == contractId && it.status == "active" } ?: return@updateState s

            redeemed = true
            val missedDates = target.getMissedBreakDates(today)
            val dateToProtect = specificDate ?: missedDates.firstOrNull() ?: today
            val newProtectedDates = (target.protectedDates + dateToProtect).distinct()
            val newDaysCompleted = target.completedDates.size + newProtectedDates.size

            var refundCoins = 0
            val eventList = mutableListOf<EventRecord>()
            eventList.add(
                EventRecord(
                    t = System.currentTimeMillis(),
                    d = today,
                    n = "contract_shield_consumed_${target.id}",
                    c = 1,
                    x = 20
                )
            )

            val updatedContract = if (newDaysCompleted >= target.targetDays) {
                val refund = (target.stakedCoins * target.multiplierReward).roundToInt()
                refundCoins = refund
                eventList.add(EventRecord(System.currentTimeMillis(), today, "contract_won_${target.id}", 1, 75))
                target.copy(
                    status = "won",
                    daysCompleted = newDaysCompleted,
                    protectedDates = newProtectedDates
                )
            } else {
                target.copy(
                    daysCompleted = newDaysCompleted,
                    protectedDates = newProtectedDates
                )
            }

            s.copy(
                restDayTokens = s.restDayTokens - 1,
                coins = s.coins + refundCoins,
                habitContracts = s.habitContracts.map { if (it.id == contractId) updatedContract else it },
                ev = s.ev + eventList
            )
        }
        return redeemed
    }

    fun buyShieldAndRescueContract(contractId: String): Boolean {
        val today = DateUtils.todayStr()
        val current = _state.value
        val shieldCost = 12
        if (current.coins < shieldCost) return false
        val target = current.habitContracts.firstOrNull { it.id == contractId && it.status == "active" } ?: return false

        updateState { s ->
            s.copy(
                coins = s.coins - shieldCost,
                restDayTokens = s.restDayTokens + 1,
                ev = s.ev + EventRecord(System.currentTimeMillis(), today, "buy_shield_token", 1, 5)
            )
        }
        return redeemShieldForContract(contractId)
    }

    fun forfeitContract(contractId: String): Boolean {
        val today = DateUtils.todayStr()
        var forfeited = false
        updateState { s ->
            val target = s.habitContracts.firstOrNull { it.id == contractId && it.status == "active" } ?: return@updateState s
            forfeited = true
            val updatedContract = target.copy(status = "forfeited")
            s.copy(
                penaltyVaultCoins = s.penaltyVaultCoins + target.stakedCoins, // Forfeited into penalty vault
                habitContracts = s.habitContracts.map { if (it.id == contractId) updatedContract else it },
                ev = s.ev + EventRecord(
                    t = System.currentTimeMillis(),
                    d = today,
                    n = "contract_forfeited_${target.id}",
                    c = 1,
                    x = 0
                )
            )
        }
        return forfeited
    }

    fun addVideoResource(
        title: String,
        url: String,
        category: String = "Mindfulness",
        durationLabel: String = "10 min",
        description: String = "",
        tags: List<String> = emptyList()
    ): VideoResourceItem {
        val newVideo = VideoResourceItem(
            id = "vid_${System.currentTimeMillis()}",
            title = title.trim(),
            url = url.trim(),
            category = category,
            durationLabel = durationLabel.trim().ifBlank { "10 min" },
            description = description.trim(),
            tags = tags,
            thumbnailEmoji = when (category.lowercase()) {
                "breathwork" -> "🫁"
                "movement & yoga", "movement", "yoga" -> "🧘"
                "focus & productivity", "focus" -> "⚡"
                "sleep & rest", "sleep" -> "🌙"
                else -> "🎥"
            }
        )
        updateState { s ->
            s.copy(
                videoResources = listOf(newVideo) + s.videoResources,
                ev = s.ev + EventRecord(System.currentTimeMillis(), DateUtils.todayStr(), "add_video_${newVideo.id}", 1, 15)
            )
        }
        return newVideo
    }

    fun updateVideoResource(video: VideoResourceItem) {
        updateState { s ->
            s.copy(videoResources = s.videoResources.map { if (it.id == video.id) video else it })
        }
    }

    fun deleteVideoResource(videoId: String) {
        updateState { s ->
            s.copy(videoResources = s.videoResources.filterNot { it.id == videoId })
        }
    }

    fun toggleFavoriteVideo(videoId: String) {
        updateState { s ->
            s.copy(
                videoResources = s.videoResources.map {
                    if (it.id == videoId) it.copy(isFavorite = !it.isFavorite) else it
                }
            )
        }
    }

    fun recordVideoPlayback(videoId: String) {
        val today = DateUtils.todayStr()
        updateState { s ->
            s.copy(
                videoResources = s.videoResources.map {
                    if (it.id == videoId) it.copy(
                        lastPlayedTimestamp = System.currentTimeMillis(),
                        playCount = it.playCount + 1
                    ) else it
                },
                ev = s.ev + EventRecord(System.currentTimeMillis(), today, "play_video_$videoId", 1, 10)
            )
        }
    }

    // ==========================================
    // Book, Guide & Reading Progress Management
    // ==========================================

    fun addBookResource(
        title: String,
        author: String,
        category: String,
        description: String,
        keyConcepts: List<String>,
        externalUrl: String = "",
        totalPages: Int = 200,
        fullGuideContent: String = ""
    ): BookResourceItem {
        val newBook = BookResourceItem(
            id = "book_${System.currentTimeMillis()}",
            title = title.trim(),
            author = author.trim().ifBlank { "Author" },
            category = category,
            description = description.trim(),
            keyConcepts = keyConcepts,
            externalUrl = externalUrl.trim(),
            totalPages = totalPages.coerceAtLeast(10),
            fullGuideContent = fullGuideContent.trim(),
            coverEmoji = when (category) {
                "Making Friends" -> "🤝"
                "Confident Speaking" -> "🎙️"
                "Empathetic Listening" -> "👂"
                "Healthy Boundaries" -> "🛡️"
                "Handling Conflict" -> "⚖️"
                "High EQ & Emotions" -> "🧠"
                else -> "📚"
            },
            chapters = listOf(
                BookChapter("ch1", "Chapter 1: Foundational Mindset", "Core introduction and primary psychological shifts.", emptyList(), "Observe this principle in your daily interactions.", false),
                BookChapter("ch2", "Chapter 2: Practical Application", "Concrete verbal techniques, habits, and scripts.", emptyList(), "Practice one conversational script today.", false),
                BookChapter("ch3", "Chapter 3: Integration & Mastery", "Navigating pushback, friction, and long-term maintenance.", emptyList(), "Review weekly reflections on this topic.", false)
            )
        )
        updateState { s ->
            s.copy(
                bookResources = listOf(newBook) + s.bookResources,
                ev = s.ev + EventRecord(System.currentTimeMillis(), DateUtils.todayStr(), "add_book_${newBook.id}", 1, 20)
            )
        }
        return newBook
    }

    fun addBookResource(book: BookResourceItem): BookResourceItem {
        updateState { s ->
            s.copy(
                bookResources = listOf(book) + s.bookResources,
                ev = s.ev + EventRecord(System.currentTimeMillis(), DateUtils.todayStr(), "add_book_${book.id}", 1, 20)
            )
        }
        return book
    }

    fun updateBookResource(book: BookResourceItem) {
        updateState { s ->
            s.copy(bookResources = s.bookResources.map { if (it.id == book.id) book else it })
        }
    }

    fun deleteBookResource(bookId: String) {
        updateState { s ->
            s.copy(bookResources = s.bookResources.filterNot { it.id == bookId })
        }
    }

    fun toggleFavoriteBook(bookId: String) {
        updateState { s ->
            s.copy(
                bookResources = s.bookResources.map {
                    if (it.id == bookId) it.copy(isFavorite = !it.isFavorite) else it
                }
            )
        }
    }

    fun toggleChapterRead(bookId: String, chapterTitle: String) {
        val today = DateUtils.todayStr()
        updateState { s ->
            s.copy(
                bookResources = s.bookResources.map { book ->
                    if (book.id == bookId) {
                        val updatedChapters = book.chapters.map { ch ->
                            if (ch.title == chapterTitle) ch.copy(read = !ch.read) else ch
                        }
                        val readCount = updatedChapters.count { it.read }
                        val newProgress = if (updatedChapters.isNotEmpty()) {
                            ((readCount.toFloat() / updatedChapters.size.toFloat()) * 100).toInt()
                        } else book.readingProgressPercent
                        val newStatus = when {
                            newProgress >= 100 -> "completed"
                            newProgress > 0 -> "reading"
                            else -> book.status
                        }
                        book.copy(
                            chapters = updatedChapters,
                            readingProgressPercent = newProgress,
                            status = newStatus,
                            lastReadTimestamp = System.currentTimeMillis()
                        )
                    } else book
                },
                ev = s.ev + EventRecord(System.currentTimeMillis(), today, "read_chapter_$bookId", 1, 15)
            )
        }
    }

    fun updateVideoNotes(videoId: String, notes: String) {
        val today = DateUtils.todayStr()
        updateState { s ->
            s.copy(
                videoResources = s.videoResources.map {
                    if (it.id == videoId) it.copy(
                        userNotes = notes.trim(),
                        lastNotesTimestamp = System.currentTimeMillis()
                    ) else it
                },
                ev = s.ev + EventRecord(System.currentTimeMillis(), today, "notes_video_$videoId", 1, 5)
            )
        }
    }

    fun updateBookNotes(bookId: String, notes: String) {
        val today = DateUtils.todayStr()
        updateState { s ->
            s.copy(
                bookResources = s.bookResources.map {
                    if (it.id == bookId) it.copy(
                        userNotes = notes.trim(),
                        lastReadTimestamp = System.currentTimeMillis()
                    ) else it
                },
                ev = s.ev + EventRecord(System.currentTimeMillis(), today, "notes_book_$bookId", 1, 10)
            )
        }
    }

    fun updateBookReadingProgress(
        bookId: String,
        pagesRead: Int,
        userNotes: String,
        status: String
    ) {
        updateState { s ->
            s.copy(
                bookResources = s.bookResources.map { book ->
                    if (book.id == bookId) {
                        val progressPercent = if (book.totalPages > 0) {
                            ((pagesRead.toFloat() / book.totalPages.toFloat()) * 100).toInt().coerceIn(0, 100)
                        } else book.readingProgressPercent
                        val finalStatus = if (progressPercent >= 100) "completed" else status
                        book.copy(
                            pagesRead = pagesRead,
                            readingProgressPercent = progressPercent,
                            userNotes = userNotes,
                            status = finalStatus,
                            lastReadTimestamp = System.currentTimeMillis()
                        )
                    } else book
                }
            )
        }
    }

    // ==========================================
    // Room Database Backed Video & Book Notes
    // ==========================================

    fun getVideoNotes(videoId: String): kotlinx.coroutines.flow.Flow<List<com.example.selfcarehero.data.room.VideoNote>> =
        videoNoteDao.getNotesForVideo(videoId)

    fun getAllVideoNotes(): kotlinx.coroutines.flow.Flow<List<com.example.selfcarehero.data.room.VideoNote>> =
        videoNoteDao.getAllVideoNotes()

    suspend fun saveVideoNote(note: com.example.selfcarehero.data.room.VideoNote): Long {
        val rowId = videoNoteDao.insertVideoNote(note)
        updateVideoNotes(note.videoId, note.noteText)
        return rowId
    }

    suspend fun deleteVideoNote(noteId: String): Int {
        return videoNoteDao.deleteVideoNote(noteId)
    }

    fun getBookNotes(bookId: String): kotlinx.coroutines.flow.Flow<List<com.example.selfcarehero.data.room.BookNote>> =
        bookNoteDao.getNotesForBook(bookId)

    fun getAllBookNotes(): kotlinx.coroutines.flow.Flow<List<com.example.selfcarehero.data.room.BookNote>> =
        bookNoteDao.getAllBookNotes()

    suspend fun saveBookNote(note: com.example.selfcarehero.data.room.BookNote): Long {
        val rowId = bookNoteDao.insertBookNote(note)
        updateBookNotes(note.bookId, note.noteText)
        return rowId
    }

    suspend fun deleteBookNote(noteId: String): Int {
        return bookNoteDao.deleteBookNote(noteId)
    }

    // ==========================================
    // Special AI Export & Import System: Videos and Ebooks / Books Only
    // ==========================================

    fun exportAiProgression(): AiExportPayload {
        val s = _state.value
        val totalChaptersRead = s.bookResources.sumOf { book -> book.chapters.count { it.read } }
        val booksCompleted = s.bookResources.count { it.status == "completed" || it.calculatedProgress() >= 100 }
        val booksInProgress = s.bookResources.count { it.status == "reading" || (it.calculatedProgress() in 1..99) }
        val totalPagesRead = s.bookResources.sumOf { it.pagesRead }
        val totalBookNotes = s.bookResources.count { it.userNotes.isNotBlank() }
        val videosWatched = s.videoResources.count { it.playCount > 0 }
        val favoriteVideos = s.videoResources.count { it.isFavorite }
        val totalVideoNotes = s.videoResources.count { it.userNotes.isNotBlank() }

        val summary = LearningResourcesSummary(
            totalBooks = s.bookResources.size,
            booksCompleted = booksCompleted,
            booksInProgress = booksInProgress,
            totalChaptersRead = totalChaptersRead,
            totalPagesRead = totalPagesRead,
            totalBookNotesCount = totalBookNotes,
            totalVideos = s.videoResources.size,
            videosWatched = videosWatched,
            favoriteVideosCount = favoriteVideos,
            totalVideoNotesCount = totalVideoNotes
        )

        val roomVNotes = try {
            runBlocking { videoNoteDao.getAllVideoNotes().first() }
        } catch (_: Exception) {
            emptyList()
        }
        val roomBNotes = try {
            runBlocking { bookNoteDao.getAllBookNotes().first() }
        } catch (_: Exception) {
            emptyList()
        }

        return AiExportPayload(
            app = "BloomQuest",
            exportType = "special_videos_and_ebooks_with_notes",
            exportDate = DateUtils.todayStr(),
            version = s.v,
            promptForAi = "I am using BloomQuest to study interpersonal mastery, high emotional intelligence, active listening, boundaries, confidence, and conflict resolution. Below is my specialized curriculum containing ONLY my Videos and Ebooks/Books, including my chapter progress, watch counts, and my personal study notes taken under each video and book. Please:\n1. Carefully read and evaluate my personal notes, reflections, and insights under each book and video.\n2. Point out blind spots, synthesis, or next-level practical exercises.\n3. Recommend 1-3 new high-value YouTube videos or practical books/ebooks tailored to what I am learning.\n4. Output recommendations in matching JSON format with \"books\" and \"videos\" lists so I can import them back into my app.",
            summary = summary,
            books = s.bookResources,
            videos = s.videoResources,
            videoNotes = roomVNotes,
            bookNotes = roomBNotes,
            studyTopics = emptyList(),
            userProfile = null,
            habits = emptyList(),
            antiGoals = emptyList(),
            lifeSprint = null,
            recentJournals = emptyList(),
            dailyThreeStreak = null
        )
    }

    fun exportAiProgressionJson(): String {
        val payload = exportAiProgression()
        val prettyJson = Json { prettyPrint = true; ignoreUnknownKeys = true; encodeDefaults = true }
        return prettyJson.encodeToString(payload)
    }

    fun importAiProgressionJson(jsonStr: String): Result<AiExportPayload> {
        return try {
            val trimmed = jsonStr.trim()
            // Automatic safety backup snapshot prior to applying import
            createSnapshot("Pre-Curriculum Import Safety Snapshot (${DateUtils.todayStr()})")

            val jsonDecoder = Json { ignoreUnknownKeys = true; isLenient = true; coerceInputValues = true }
            val payload = jsonDecoder.decodeFromString<AiExportPayload>(trimmed)

            updateState { s ->
                // Smart Merge Books: if imported book already exists by ID or title, update it; otherwise append it
                val mergedBooks = s.bookResources.toMutableList()
                payload.books.forEach { incoming ->
                    val existingIdx = mergedBooks.indexOfFirst {
                        (incoming.id.isNotBlank() && it.id == incoming.id) ||
                        it.title.equals(incoming.title, ignoreCase = true)
                    }
                    if (existingIdx >= 0) {
                        mergedBooks[existingIdx] = incoming
                    } else {
                        val newBook = if (incoming.id.isBlank()) incoming.copy(id = "book_${System.currentTimeMillis()}_${mergedBooks.size}") else incoming
                        mergedBooks.add(newBook)
                    }
                }

                // Smart Merge Videos: if imported video already exists by ID, URL, or title, update it; otherwise append it
                val mergedVideos = s.videoResources.toMutableList()
                payload.videos.forEach { incoming ->
                    val existingIdx = mergedVideos.indexOfFirst {
                        (incoming.id.isNotBlank() && it.id == incoming.id) ||
                        (incoming.url.isNotBlank() && it.url == incoming.url) ||
                        it.title.equals(incoming.title, ignoreCase = true)
                    }
                    if (existingIdx >= 0) {
                        mergedVideos[existingIdx] = incoming
                    } else {
                        val newVideo = if (incoming.id.isBlank()) incoming.copy(id = "vid_${System.currentTimeMillis()}_${mergedVideos.size}") else incoming
                        mergedVideos.add(newVideo)
                    }
                }

                // Smart Merge Study Topics if provided
                val mergedTopics = s.st.toMutableList()
                payload.studyTopics.forEach { incoming ->
                    val existingIdx = mergedTopics.indexOfFirst {
                        (incoming.id.isNotBlank() && it.id == incoming.id) ||
                        it.n.equals(incoming.n, ignoreCase = true)
                    }
                    if (existingIdx >= 0) {
                        mergedTopics[existingIdx] = incoming
                    } else {
                        val newTopic = if (incoming.id.isBlank()) incoming.copy(id = "st_${System.currentTimeMillis()}_${mergedTopics.size}") else incoming
                        mergedTopics.add(newTopic)
                    }
                }

                s.copy(
                    v = 19,
                    bookResources = if (mergedBooks.isNotEmpty()) mergedBooks else s.bookResources,
                    videoResources = if (mergedVideos.isNotEmpty()) mergedVideos else s.videoResources,
                    st = if (mergedTopics.isNotEmpty()) mergedTopics else s.st,
                    ev = s.ev + EventRecord(System.currentTimeMillis(), DateUtils.todayStr(), "ai_resources_import", 1, 30)
                )
            }
            Result.success(payload)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    // Future Learning Roadmap methods
    fun addRoadmapGoal(goal: RoadmapGoal) {
        updateState { s ->
            s.copy(roadmapGoals = s.roadmapGoals + goal)
        }
    }

    fun updateRoadmapGoal(goal: RoadmapGoal) {
        updateState { s ->
            s.copy(roadmapGoals = s.roadmapGoals.map { if (it.id == goal.id) goal else it })
        }
    }

    fun deleteRoadmapGoal(goalId: String) {
        updateState { s ->
            s.copy(
                roadmapGoals = s.roadmapGoals.filter { it.id != goalId },
                roadmapSteps = s.roadmapSteps.filter { it.goalId != goalId }
            )
        }
    }

    fun addRoadmapStep(step: RoadmapStep) {
        updateState { s ->
            s.copy(roadmapSteps = s.roadmapSteps + step)
        }
    }

    fun updateRoadmapStep(step: RoadmapStep) {
        updateState { s ->
            s.copy(roadmapSteps = s.roadmapSteps.map { if (it.id == step.id) step else it })
        }
    }

    fun deleteRoadmapStep(stepId: String) {
        updateState { s ->
            s.copy(roadmapSteps = s.roadmapSteps.filter { it.id != stepId && it.parentId != stepId })
        }
    }

    fun toggleRoadmapStepComplete(stepId: String) {
        updateState { s ->
            val updatedSteps = s.roadmapSteps.map {
                if (it.id == stepId) it.copy(isCompleted = !it.isCompleted, updatedAt = System.currentTimeMillis())
                else it
            }
            val step = updatedSteps.firstOrNull { it.id == stepId }
            val bonusXp = if (step?.isCompleted == true) 15 else 0
            val bonusCoins = if (step?.isCompleted == true) 1 else 0
            val evRecord = if (step?.isCompleted == true) {
                listOf(EventRecord(System.currentTimeMillis(), DateUtils.todayStr(), "roadmap_step_${stepId}", 1, bonusXp))
            } else emptyList()

            s.copy(
                roadmapSteps = updatedSteps,
                coins = s.coins + bonusCoins,
                ev = s.ev + evRecord
            )
        }
    }

    fun addRoadmapTag(tag: RoadmapTag) {
        updateState { s ->
            if (s.roadmapTags.none { it.name.equals(tag.name, ignoreCase = true) }) {
                s.copy(roadmapTags = s.roadmapTags + tag)
            } else s
        }
    }

    fun deleteRoadmapTag(tagId: String) {
        updateState { s ->
            s.copy(
                roadmapTags = s.roadmapTags.filter { it.id != tagId },
                roadmapGoals = s.roadmapGoals.map { it.copy(tagIds = it.tagIds.filter { tid -> tid != tagId }) },
                roadmapSteps = s.roadmapSteps.map { it.copy(tagIds = it.tagIds.filter { tid -> tid != tagId }) }
            )
        }
    }

    fun setAiOnlineSearchEnabled(enabled: Boolean) {
        updateState { it.copy(aiOnlineSearchEnabled = enabled) }
    }
}
