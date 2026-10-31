package com.example.selfcarehero.data.room

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import kotlinx.coroutines.flow.Flow

@Dao
interface BookNoteDao {
    @Query("SELECT * FROM book_notes WHERE bookId = :bookId ORDER BY timestamp DESC")
    fun getNotesForBook(bookId: String): Flow<List<BookNote>>

    @Query("SELECT * FROM book_notes ORDER BY timestamp DESC")
    fun getAllBookNotes(): Flow<List<BookNote>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertBookNote(note: BookNote): Long

    @Query("DELETE FROM book_notes WHERE id = :id")
    suspend fun deleteBookNote(id: String): Int

    @Query("DELETE FROM book_notes WHERE bookId = :bookId")
    suspend fun deleteNotesForBook(bookId: String): Int

    @Query("SELECT COUNT(*) FROM book_notes")
    fun getTotalNotesCount(): Flow<Int>
}
