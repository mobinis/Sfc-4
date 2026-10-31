package com.example.selfcarehero.data.room

import androidx.compose.runtime.Immutable
import androidx.room.Entity
import androidx.room.PrimaryKey
import androidx.room.TypeConverter
import androidx.room.TypeConverters
import kotlinx.serialization.Serializable
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json

@Serializable
enum class SomaticPacerMode(val displayName: String, val cadenceLabel: String, val description: String) {
    BOX_BREATHING("Box Breathing", "4-4-4-4", "Equalized 4s inhale, 4s hold, 4s exhale, 4s hold for autonomic grounding"),
    BREATH_478("4-7-8 Relaxing", "4-7-8", "4s inhale, 7s hold, 8s prolonged exhale activating vagal tone"),
    PHYSIOLOGICAL_SIGH("Physiological Sigh", "2-1-5", "Double inhale followed by a long, slow sigh exhale for instant neural reset")
}

@Serializable
enum class SurfOutcome(val displayName: String, val emoji: String, val xpValue: Int, val coinBonus: Int, val tagLine: String) {
    SURFED("Surfed Wave", "🌊", 35, 5, "Rode the wave until the urge naturally subsided"),
    RESISTED("Resisted", "🛡️", 30, 3, "Consciously stood firm and stepped out with choice"),
    PARTIAL_LAPSE("Partial Lapse", "🌱", 20, 1, "Valuable data: caught early and mitigated damage"),
    FULL_LAPSE("Full Lapse", "💡", 15, 0, "No judgment: learning trigger dynamics for next time")
}

@Immutable
@Serializable
data class UrgeSession(
    val id: String = "session_${System.currentTimeMillis()}",
    val trigger: String = "Boredom / Aimless",
    val want: String = "",
    val choice: String = "Somatic Pacing & Ice Water",
    val preIntensity: Int = 7,
    val postIntensity: Int = 3,
    val somaticSensations: List<String> = listOf("Chest Tightness", "Restless Limbs"),
    val contextTags: List<String> = listOf("Late Evening"),
    val pacingMode: SomaticPacerMode = SomaticPacerMode.BOX_BREATHING,
    val durationSeconds: Int = 600,
    val notes: String = ""
)

@Immutable
@Serializable
data class PostSurfOutcome(
    val postIntensity: Int,
    val outcomeClassification: SurfOutcome,
    val reflectionNote: String = "",
    val intensityDelta: Int = 0,
    val coinsEarned: Int = 0,
    val xpEarned: Int = 0
)

class StringListConverters {
    private val json = Json { ignoreUnknownKeys = true }

    @TypeConverter
    fun fromStringList(value: List<String>): String {
        return json.encodeToString(value)
    }

    @TypeConverter
    fun toStringList(value: String): List<String> {
        return try {
            json.decodeFromString(value)
        } catch (e: Exception) {
            if (value.isBlank()) emptyList() else value.split(",").map { it.trim() }
        }
    }
}

@Immutable
@Entity(tableName = "urge_logs")
@TypeConverters(StringListConverters::class)
data class UrgeLogEntity(
    @PrimaryKey
    val id: String,
    val timestamp: Long,
    val dateStr: String,
    val timeStr: String,
    val trigger: String,
    val want: String,
    val choice: String,
    val preIntensity: Int,
    val postIntensity: Int,
    val intensityDelta: Int,
    val somaticSensations: List<String>,
    val contextTags: List<String>,
    val pacingMode: String,
    val outcomeStatus: String, // 'RESISTED' | 'SURFED' | 'PARTIAL_LAPSE' | 'FULL_LAPSE'
    val durationSeconds: Int,
    val coinsEarned: Int,
    val xpEarned: Int,
    val notes: String
)
