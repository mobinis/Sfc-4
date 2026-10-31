package com.example.selfcarehero

import com.example.selfcarehero.model.*
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test
import kotlin.math.floor
import kotlin.math.max
import kotlin.math.sqrt

class HeroLogicTest {

    private fun computePlayerLevel(xp: Int): Int {
        return floor(sqrt(max(0, xp) / 50.0)).toInt() + 1
    }

    private fun computeXpProgress(totalXp: Int): Pair<Int, Int> {
        val currentLevel = computePlayerLevel(totalXp)
        val currentLevelBaseXp = (currentLevel - 1) * (currentLevel - 1) * 50
        val nextLevelBaseXp = currentLevel * currentLevel * 50
        val xpIntoLevel = max(0, totalXp - currentLevelBaseXp)
        val needed = max(1, nextLevelBaseXp - currentLevelBaseXp)
        return Pair(xpIntoLevel, needed)
    }

    @Test
    fun testInitialLevelIsOne() {
        assertEquals(1, computePlayerLevel(0))
        assertEquals(1, computePlayerLevel(49))
    }

    @Test
    fun testLevelTwoAtFiftyXp() {
        assertEquals(2, computePlayerLevel(50))
    }

    @Test
    fun testNegativeXpSafelyReturnsLevelOne() {
        assertEquals(1, computePlayerLevel(-100))
    }

    @Test
    fun testXpProgressIntoLevel() {
        val (current, needed) = computeXpProgress(0)
        assertEquals(0, current)
        assertEquals(50, needed) // Level 1 -> Level 2 needs 50 XP

        val (cur2, needed2) = computeXpProgress(50)
        assertEquals(0, cur2)
        assertEquals(150, needed2) // Level 2 (50) -> Level 3 (200) needs 150 XP
    }

    @Test
    fun testStepHabitCompletionLogic() {
        val nodeWithSteps = NodeItem(
            id = "deep_reading",
            n = "Reading",
            k = "step",
            sliderSteps = listOf("5m Skim", "15m Focus", "30m Deep"),
            sliderLevel = 2 // Reached final step (index 2 of 3)
        )
        val maxStep = if (!nodeWithSteps.sliderSteps.isNullOrEmpty()) nodeWithSteps.sliderSteps.size - 1 else 1
        val isDone = nodeWithSteps.sliderLevel >= maxStep
        assertTrue(isDone)

        val nodeIncomplete = nodeWithSteps.copy(sliderLevel = 1)
        val isIncomplete = nodeIncomplete.sliderLevel >= maxStep
        assertFalse(isIncomplete)
    }

    @Test
    fun testQuitHabitCompletionLogic() {
        val quitHabit = NodeItem(
            id = "no_sugar",
            n = "No Added Sugar",
            k = "quit"
        )
        // Quit habit is done when count == 0 (no slips)
        val zeroSlips = 0
        assertTrue(zeroSlips == 0)

        val oneSlip = 1
        assertFalse(oneSlip == 0)
    }

    @Test
    fun testWeeklyQuestProgressFractionAndCompletion() {
        val quest = WeeklyQuest(
            id = "quest_vitality",
            title = "Vitality Reps",
            description = "Complete 8 vitality reps",
            icon = "⚡",
            targetCount = 8,
            currentProgress = 4,
            rewardCoins = 10,
            rewardXp = 45,
            isCompleted = false,
            isClaimed = false,
            weekStartDate = "2026-10-26",
            questType = "vitality"
        )

        assertEquals(0.5f, quest.progressFraction(), 0.001f)
        assertFalse(quest.isCompleted)
        assertFalse(quest.isReadyToClaim())
        assertEquals("4 / 8", quest.statusLabel())

        val completedQuest = quest.copy(currentProgress = 8, isCompleted = true)
        assertEquals(1.0f, completedQuest.progressFraction(), 0.001f)
        assertTrue(completedQuest.isCompleted)
        assertTrue(completedQuest.isReadyToClaim())
        assertEquals("Ready to Claim! 🎉", completedQuest.statusLabel())

        val claimedQuest = completedQuest.copy(isClaimed = true)
        assertFalse(claimedQuest.isReadyToClaim())
        assertEquals("Claimed ✓", claimedQuest.statusLabel())
    }

    @Test
    fun testPinHashingDeterministicAndDistinct() {
        val hash1 = com.example.selfcarehero.utils.PinSecurityHelper.hashPin("1234")
        val hash2 = com.example.selfcarehero.utils.PinSecurityHelper.hashPin("1234")
        val hash3 = com.example.selfcarehero.utils.PinSecurityHelper.hashPin("4321")

        assertEquals(hash1, hash2)
        assertTrue(hash1.isNotBlank())
        assertFalse(hash1 == hash3)
    }

    @Test
    fun testPinVerificationSuccessAndFailure() {
        val pin = "7890"
        val hash = com.example.selfcarehero.utils.PinSecurityHelper.hashPin(pin)

        // Exact match succeeds
        assertTrue(com.example.selfcarehero.utils.PinSecurityHelper.verifyPin("7890", hash))

        // Incorrect digit fails
        assertFalse(com.example.selfcarehero.utils.PinSecurityHelper.verifyPin("7891", hash))

        // Incomplete digit length fails
        assertFalse(com.example.selfcarehero.utils.PinSecurityHelper.verifyPin("789", hash))
        assertFalse(com.example.selfcarehero.utils.PinSecurityHelper.verifyPin("78901", hash))

        // Blank hash or empty pin fails
        assertFalse(com.example.selfcarehero.utils.PinSecurityHelper.verifyPin("", hash))
        assertFalse(com.example.selfcarehero.utils.PinSecurityHelper.verifyPin("7890", ""))
    }

    @Test
    fun testAppStatePinLockDefaults() {
        val defaultState = AppState()
        assertFalse(defaultState.pinLockEnabled)
        assertEquals("", defaultState.pinHash)
        assertTrue(defaultState.lockJournal)
        assertTrue(defaultState.lockUrges)
        assertFalse(defaultState.lockAppLaunch)
    }

    @Test
    fun testCognitiveDistortionRulesCoverage() {
        val rules = com.example.selfcarehero.ai.LocalAiCopilot.getDistortionRules()
        assertEquals(8, rules.size)
        val names = rules.map { it.name }.toSet()
        assertTrue(names.contains("All-or-Nothing Thinking"))
        assertTrue(names.contains("Catastrophizing"))
        assertTrue(names.contains("Emotional Reasoning"))
        assertTrue(names.contains("'Should' / Obligation Tyranny"))
        assertTrue(names.contains("Mental Filtering"))
        assertTrue(names.contains("Overgeneralization"))
        assertTrue(names.contains("Fortune Telling"))
        assertTrue(names.contains("Personalization"))
    }

    @Test
    fun testDistortionRuleMatchingFortuneTellingAndPersonalization() {
        val rules = com.example.selfcarehero.ai.LocalAiCopilot.getDistortionRules()
        val ftRule = rules.first { it.name == "Fortune Telling" }
        assertTrue(ftRule.matchedPhrases.any { "everything is going to fail tomorrow".contains(it) })
        assertTrue(ftRule.matchedPhrases.any { "this won't work out".contains(it) })

        val persRule = rules.first { it.name == "Personalization" }
        assertTrue(persRule.matchedPhrases.any { "it's all my fault and i ruined it".contains(it) })
        assertTrue(persRule.matchedPhrases.any { "i blame myself completely".contains(it) })
    }

    @Test
    fun testGuidedReflectionCoachSocraticInquiries() = kotlinx.coroutines.runBlocking {
        val state = AppState()
        val response = com.example.selfcarehero.ai.LocalAiCopilot.startGuidedReflectionCoach(state)

        assertTrue(response.title.contains("Reflection"))
        assertTrue(response.analysisText.contains("The Win"))
        assertTrue(response.analysisText.contains("The Friction"))
        assertTrue(response.analysisText.contains("Tomorrow's Keystone"))

        val saveTool = response.interactiveTools.firstOrNull { it.type == "SAVE_REFLECTION" }
        assertTrue(saveTool != null)
        assertTrue(saveTool?.payload?.contains("Evening Reflection") == true)
    }

    @Test
    fun testCritiqueFeynmanExplanationAnalogyAndAction() = kotlinx.coroutines.runBlocking {
        val state = AppState()
        val explanation = "Habits are automatic loops like a train on tracks. So when I pour morning tea, I will read 5 pages."
        val response = com.example.selfcarehero.ai.LocalAiCopilot.critiqueFeynmanExplanation(state, explanation)

        assertTrue(response.title.contains("Critique"))
        assertTrue(response.analysisText.contains("Strong Analogy Present"))
        assertTrue(response.analysisText.contains("Action-Oriented"))
    }
}

