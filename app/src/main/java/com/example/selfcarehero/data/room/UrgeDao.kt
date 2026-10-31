package com.example.selfcarehero.data.room

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import kotlinx.coroutines.flow.Flow

@Dao
interface UrgeDao {
    @Query("SELECT * FROM urge_logs ORDER BY timestamp DESC")
    fun getAllUrges(): Flow<List<UrgeLogEntity>>

    @Query("SELECT * FROM urge_logs ORDER BY timestamp DESC LIMIT :limit")
    fun getRecentUrges(limit: Int = 20): Flow<List<UrgeLogEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertUrge(urge: UrgeLogEntity): Long

    @Query("DELETE FROM urge_logs WHERE id = :id")
    suspend fun deleteUrgeById(id: String): Int

    @Query("SELECT COUNT(*) FROM urge_logs WHERE outcomeStatus IN ('SURFED', 'RESISTED')")
    fun getSurfedCount(): Flow<Int>

    @Query("SELECT AVG(intensityDelta) FROM urge_logs")
    fun getAvgIntensityDrop(): Flow<Double?>

    @Query("SELECT COUNT(*) FROM urge_logs")
    fun getTotalLogsCount(): Flow<Int>
}
