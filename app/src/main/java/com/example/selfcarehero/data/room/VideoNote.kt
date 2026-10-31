package com.example.selfcarehero.data.room

import androidx.compose.runtime.Immutable
import androidx.room.Entity
import androidx.room.PrimaryKey
import kotlinx.serialization.Serializable

/**
 * Room database entity for notes taken specifically for individual videos,
 * including in-video timestamps, date tracking, and text insights.
 */
@Immutable
@Serializable
@Entity(tableName = "video_notes")
data class VideoNote(
    @PrimaryKey
    val id: String = "vnote_${System.currentTimeMillis()}_${(100..999).random()}",
    val videoId: String,
    val noteText: String,
    val videoTimestampMs: Long = 0L,
    val formattedTime: String = "00:00",
    val timestamp: Long = System.currentTimeMillis(),
    val dateStr: String = ""
)
