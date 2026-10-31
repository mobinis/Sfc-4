package com.example.selfcarehero.data.room

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.room.TypeConverters

@Database(
    entities = [UrgeLogEntity::class, VideoNote::class, BookNote::class],
    version = 2,
    exportSchema = false
)
@TypeConverters(StringListConverters::class)
abstract class UrgeDatabase : RoomDatabase() {
    abstract fun urgeDao(): UrgeDao
    abstract fun videoNoteDao(): VideoNoteDao
    abstract fun bookNoteDao(): BookNoteDao

    companion object {
        @Volatile
        private var INSTANCE: UrgeDatabase? = null

        fun getDatabase(context: Context): UrgeDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    UrgeDatabase::class.java,
                    "urge_surfing_database"
                )
                    .fallbackToDestructiveMigration()
                    .build()
                INSTANCE = instance
                instance
            }
        }
    }
}
