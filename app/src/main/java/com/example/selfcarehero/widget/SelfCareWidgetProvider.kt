package com.example.selfcarehero.widget

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.widget.RemoteViews
import com.example.selfcarehero.MainActivity
import com.example.selfcarehero.R
import com.example.selfcarehero.data.SelfCareRepository

class SelfCareWidgetProvider : AppWidgetProvider() {

    override fun onUpdate(context: Context, appWidgetManager: AppWidgetManager, appWidgetIds: IntArray) {
        for (appWidgetId in appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId)
        }
    }

    override fun onReceive(context: Context, intent: Intent) {
        super.onReceive(context, intent)
        if (intent.action == ACTION_TOGGLE_HABIT) {
            val habitId = intent.getStringExtra(EXTRA_HABIT_ID)
            if (!habitId.isNullOrBlank()) {
                val repository = SelfCareRepository(context)
                repository.toggleHabit(habitId)

                // Refresh all instances of the widget
                val appWidgetManager = AppWidgetManager.getInstance(context)
                val thisWidget = ComponentName(context, SelfCareWidgetProvider::class.java)
                val allWidgetIds = appWidgetManager.getAppWidgetIds(thisWidget)
                onUpdate(context, appWidgetManager, allWidgetIds)
            }
        }
    }

    companion object {
        const val ACTION_TOGGLE_HABIT = "com.example.selfcarehero.widget.ACTION_TOGGLE_HABIT"
        const val EXTRA_HABIT_ID = "extra_habit_id"

        fun updateAppWidget(context: Context, appWidgetManager: AppWidgetManager, appWidgetId: Int) {
            val repository = SelfCareRepository(context)
            val state = repository.state.value

            val views = RemoteViews(context.packageName, R.layout.widget_selfcare_layout)

            // Open app on header click
            val openAppIntent = Intent(context, MainActivity::class.java)
            val openAppPendingIntent = PendingIntent.getActivity(
                context,
                0,
                openAppIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            views.setOnClickPendingIntent(R.id.widget_title, openAppPendingIntent)

            // Streak indicator
            views.setTextViewText(R.id.widget_streak, "🔥 ${state.dailyThreeStreak.cur}d Streak")

            // Top 3 habits
            val topHabits = state.nodes.filter { it.p != "0" }.take(3)

            val titleViews = listOf(R.id.widget_habit_title_1, R.id.widget_habit_title_2, R.id.widget_habit_title_3)
            val buttonViews = listOf(R.id.widget_habit_check_1, R.id.widget_habit_check_2, R.id.widget_habit_check_3)

            for (i in 0 until 3) {
                if (i < topHabits.size) {
                    val habit = topHabits[i]
                    val isDone = repository.isHabitDoneToday(habit.id)
                    views.setTextViewText(titleViews[i], "${habit.e} ${habit.n}")

                    // Check button icon
                    val iconRes = if (isDone) android.R.drawable.checkbox_on_background else android.R.drawable.checkbox_off_background
                    views.setImageViewResource(buttonViews[i], iconRes)

                    // PendingIntent to toggle habit
                    val toggleIntent = Intent(context, SelfCareWidgetProvider::class.java).apply {
                        action = ACTION_TOGGLE_HABIT
                        putExtra(EXTRA_HABIT_ID, habit.id)
                    }
                    val togglePendingIntent = PendingIntent.getBroadcast(
                        context,
                        i + 100,
                        toggleIntent,
                        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
                    )
                    views.setOnClickPendingIntent(buttonViews[i], togglePendingIntent)
                }
            }

            appWidgetManager.updateAppWidget(appWidgetId, views)
        }
    }
}
