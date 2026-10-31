package com.example.selfcarehero.data.room

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import kotlinx.coroutines.flow.Flow

@Dao
interface VideoNoteDao {
    @Query("SELECT * FROM video_notes WHERE videoId = :videoId ORDER BY timestamp DESC")
    fun getNotesForVideo(videoId: String): Flow<List<VideoNote>>

    @Query("SELECT * FROM video_notes ORDER BY timestamp DESC")
    fun getAllVideoNotes(): Flow<List<VideoNote>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertVideoNote(note: VideoNote): Long

    @Query("DELETE FROM video_notes WHERE id = :id")
    suspend fun deleteVideoNote(id: String): Int

    @Query("DELETE FROM video_notes WHERE videoId = :videoId")
    suspend fun deleteNotesForVideo(videoId: String): Int

    @Query("SELECT COUNT(*) FROM video_notes")
    fun getTotalNotesCount(): Flow<Int>
}
