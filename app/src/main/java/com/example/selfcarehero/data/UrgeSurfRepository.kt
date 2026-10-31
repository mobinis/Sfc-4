package com.example.selfcarehero.data

import android.content.Context
import com.example.selfcarehero.data.room.SomaticPacerMode
import com.example.selfcarehero.data.room.SurfOutcome
import com.example.selfcarehero.data.room.UrgeDao
import com.example.selfcarehero.data.room.UrgeDatabase
import com.example.selfcarehero.data.room.UrgeLogEntity
import com.example.selfcarehero.data.room.UrgeSession
import com.example.selfcarehero.data.room.PostSurfOutcome
import com.example.selfcarehero.model.DateUtils
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.withContext

/**
 * Privacy-focused local repository for clinical urge surfing sessions,
 * backed by Room Database with synchronization to the global SelfCareRepository
 * for Carrot-Coins, XP progression, and streak health.
 */
class UrgeSurfRepository(
    private val urgeDao: UrgeDao,
    private val globalRepository: SelfCareRepository? = null
) {
    constructor(context: Context, globalRepository: SelfCareRepository? = null) : this(
        UrgeDatabase.getDatabase(context).urgeDao(),
        globalRepository
    )

    val allUrgeLogs: Flow<List<UrgeLogEntity>> = urgeDao.getAllUrges()
    val surfedCount: Flow<Int> = urgeDao.getSurfedCount()
    val avgIntensityDrop: Flow<Double?> = urgeDao.getAvgIntensityDrop()
    val totalSessionsCount: Flow<Int> = urgeDao.getTotalLogsCount()

    /**
     * Calculates the dynamic Carrot-Coin payoff and XP based on:
     * 1. Intensity Drop Delta (preIntensity - postIntensity)
     * 2. Outcome classification bonus
     * 3. Consistency bonus if user has maintained surfed momentum
     */
    suspend fun calculateRewards(
        preIntensity: Int,
        postIntensity: Int,
        outcome: SurfOutcome
    ): Pair<Int, Int> = withContext(Dispatchers.Default) {
        val delta = maxOf(0, preIntensity - postIntensity)
        val baseCoins = 5
        val deltaBonus = delta
        val outcomeBonus = outcome.coinBonus
        val totalCoins = baseCoins + deltaBonus + outcomeBonus

        // Check recent logs for consistency bonus
        var bonusXp = 0
        try {
            val recentLogs = urgeDao.getRecentUrges(5).first()
            val consecutiveSurfs = recentLogs.takeWhile { it.outcomeStatus in listOf("SURFED", "RESISTED") }.size
            if (consecutiveSurfs >= 2) {
                bonusXp = 10 // +10 XP Consistency Momentum Bonus
            }
        } catch (_: Exception) {
            // Fallback gracefully
        }

        val totalXp = outcome.xpValue + bonusXp
        Pair(totalCoins, totalXp)
    }

    /**
     * Completes and saves a clinical Urge Surfing session to local Room storage,
     * and bridges the coins & XP to the global app state.
     */
    suspend fun saveSession(
        session: UrgeSession,
        postOutcome: PostSurfOutcome
    ): UrgeLogEntity = withContext(Dispatchers.IO) {
        val now = System.currentTimeMillis()
        val today = DateUtils.todayStr()
        val timeNow = DateUtils.nowTimeStr()
        val delta = maxOf(0, session.preIntensity - postOutcome.postIntensity)

        val entity = UrgeLogEntity(
            id = "urg_${now}",
            timestamp = now,
            dateStr = today,
            timeStr = timeNow,
            trigger = session.trigger,
            want = session.want,
            choice = session.choice,
            preIntensity = session.preIntensity,
            postIntensity = postOutcome.postIntensity,
            intensityDelta = delta,
            somaticSensations = session.somaticSensations,
            contextTags = session.contextTags,
            pacingMode = session.pacingMode.name,
            outcomeStatus = postOutcome.outcomeClassification.name,
            durationSeconds = session.durationSeconds,
            coinsEarned = postOutcome.coinsEarned,
            xpEarned = postOutcome.xpEarned,
            notes = postOutcome.reflectionNote
        )

        // Save to Room for encrypted local device privacy
        urgeDao.insertUrge(entity)

        // Sync coins and XP to global repository
        globalRepository?.let { repo ->
            repo.logUrgeSurfingWave(
                trigger = session.trigger,
                preIntensity = session.preIntensity,
                postIntensity = postOutcome.postIntensity,
                want = session.want,
                choice = session.choice,
                note = postOutcome.reflectionNote,
                somaticSensations = session.somaticSensations,
                contextTags = session.contextTags,
                outcomeStatus = postOutcome.outcomeClassification.name,
                durationSeconds = session.durationSeconds
            )
        }

        entity
    }

    suspend fun deleteSession(id: String) = withContext(Dispatchers.IO) {
        urgeDao.deleteUrgeById(id)
    }
}
