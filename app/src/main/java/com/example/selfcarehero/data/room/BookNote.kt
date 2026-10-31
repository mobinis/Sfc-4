package com.example.selfcarehero.data.room

import androidx.compose.runtime.Immutable
import androidx.room.Entity
import androidx.room.PrimaryKey
import kotlinx.serialization.Serializable

/**
 * Room database entity for notes taken specifically for individual books and ebooks,
 * including page number, chapter reference, date tracking, and text reflections.
 */
@Immutable
@Serializable
@Entity(tableName = "book_notes")
data class BookNote(
    @PrimaryKey
    val id: String = "bnote_${System.currentTimeMillis()}_${(100..999).random()}",
    val bookId: String,
    val noteText: String,
    val pageNumber: Int = 0,
    val chapterTitle: String = "",
    val timestamp: Long = System.currentTimeMillis(),
    val dateStr: String = ""
)
