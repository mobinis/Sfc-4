package com.example.selfcarehero.utils

import android.app.AlarmManager
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat
import com.example.selfcarehero.MainActivity
import com.example.selfcarehero.model.AlertItem
import java.util.Calendar

object ReminderScheduler {
    const val CHANNEL_HABITS = "channel_habits"
    const val CHANNEL_MEDS = "channel_meds"
    const val CHANNEL_PRAYER = "channel_prayer"

    const val ACTION_TRIGGER_ALERT = "com.example.selfcarehero.ACTION_TRIGGER_ALERT"
    const val ACTION_MARK_DONE = "com.example.selfcarehero.ACTION_MARK_DONE"
    const val ACTION_SNOOZE = "com.example.selfcarehero.ACTION_SNOOZE"

    const val EXTRA_ALERT_ID = "extra_alert_id"
    const val EXTRA_ALERT_NAME = "extra_alert_name"
    const val EXTRA_ALERT_TYPE = "extra_alert_type"
    const val EXTRA_PILLS_COUNT = "extra_pills_count"
    const val EXTRA_PILLS_LOW_THRESHOLD = "extra_pills_low_threshold"
    const val EXTRA_LINKED_SKILL_ID = "extra_linked_skill_id"
    const val EXTRA_LINKED_SKILL_NAME = "extra_linked_skill_name"
    const val EXTRA_TIME_SLOT = "extra_time_slot"

    fun setupNotificationChannels(context: Context) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val notificationManager =
                context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

            val habitsChannel = NotificationChannel(
                CHANNEL_HABITS,
                "Habit & Routine Reminders",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Daily notifications for self-care, focus routines, and habit check-ins"
                enableVibration(true)
            }

            val medsChannel = NotificationChannel(
                CHANNEL_MEDS,
                "Medication & Health Critical Alerts",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Timely medication reminders and low pill supply notifications"
                enableVibration(true)
            }

            val prayerChannel = NotificationChannel(
                CHANNEL_PRAYER,
                "Prayer & Reflection Times",
                NotificationManager.IMPORTANCE_DEFAULT
            ).apply {
                description = "Timely alerts for spiritual pauses and reflections"
            }

            notificationManager.createNotificationChannels(
                listOf(habitsChannel, medsChannel, prayerChannel)
            )
        }
    }

    fun scheduleAllReminders(context: Context, alerts: List<AlertItem>) {
        setupNotificationChannels(context)
        alerts.forEach { alert ->
            if (alert.active) {
                scheduleAlert(context, alert)
            } else {
                cancelAlert(context, alert.id)
            }
        }
    }

    /**
     * Schedules alarms for all effective times (discrete times + chained offset follow-ups)
     * and filters by configured repeating days of week.
     */
    fun scheduleAlert(context: Context, alert: AlertItem) {
        val effectiveTimes = alert.allEffectiveTimes()
        if (effectiveTimes.isEmpty()) return

        val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager

        effectiveTimes.forEachIndexed { index, timeStr ->
            val parts = timeStr.split(":")
            if (parts.size != 2) return@forEachIndexed
            val hour = parts[0].toIntOrNull() ?: return@forEachIndexed
            val minute = parts[1].toIntOrNull() ?: return@forEachIndexed

            val nextTriggerTime = computeNextTriggerTime(hour, minute, alert.days)

            val intent = Intent(context, ReminderReceiver::class.java).apply {
                action = ACTION_TRIGGER_ALERT
                putExtra(EXTRA_ALERT_ID, alert.id)
                putExtra(EXTRA_ALERT_NAME, alert.n)
                putExtra(EXTRA_ALERT_TYPE, alert.type)
                putExtra(EXTRA_PILLS_COUNT, alert.pillsCount ?: -1)
                putExtra(EXTRA_PILLS_LOW_THRESHOLD, alert.pillsLowThreshold ?: -1)
                putExtra(EXTRA_LINKED_SKILL_ID, alert.skillId)
                putExtra(EXTRA_LINKED_SKILL_NAME, alert.skillName)
                putExtra(EXTRA_TIME_SLOT, timeStr)
            }

            val requestCode = getRequestCode(alert.id, index)
            val pendingIntent = PendingIntent.getBroadcast(
                context,
                requestCode,
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )

            val canExact = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                alarmManager.canScheduleExactAlarms()
            } else {
                true
            }
            try {
                if (canExact && Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    alarmManager.setExactAndAllowWhileIdle(
                        AlarmManager.RTC_WAKEUP,
                        nextTriggerTime,
                        pendingIntent
                    )
                } else if (canExact) {
                    alarmManager.setExact(
                        AlarmManager.RTC_WAKEUP,
                        nextTriggerTime,
                        pendingIntent
                    )
                } else {
                    alarmManager.set(
                        AlarmManager.RTC_WAKEUP,
                        nextTriggerTime,
                        pendingIntent
                    )
                }
            } catch (_: SecurityException) {
                alarmManager.set(
                    AlarmManager.RTC_WAKEUP,
                    nextTriggerTime,
                    pendingIntent
                )
            }
        }
    }

    /**
     * Computes the next epoch millisecond for an hour and minute matching allowed days of week.
     * Days in `allowedDays` are 0=Sunday, 1=Monday, ..., 6=Saturday.
     */
    fun computeNextTriggerTime(hour: Int, minute: Int, allowedDays: List<Int>): Long {
        val daysSet = if (allowedDays.isEmpty()) (0..6).toSet() else allowedDays.toSet()
        val calendar = Calendar.getInstance().apply {
            set(Calendar.HOUR_OF_DAY, hour)
            set(Calendar.MINUTE, minute)
            set(Calendar.SECOND, 0)
            set(Calendar.MILLISECOND, 0)
        }

        val now = System.currentTimeMillis()
        val currentDayOfWeek = calendar.get(Calendar.DAY_OF_WEEK) - 1 // Calendar.SUNDAY is 1 -> 0

        // If today's time is already past, start searching from tomorrow
        if (calendar.timeInMillis <= now) {
            calendar.add(Calendar.DAY_OF_YEAR, 1)
        }

        // Loop up to 7 days ahead until finding an allowed day
        for (i in 0 until 7) {
            val dayOfWeek = calendar.get(Calendar.DAY_OF_WEEK) - 1
            if (daysSet.contains(dayOfWeek)) {
                return calendar.timeInMillis
            }
            calendar.add(Calendar.DAY_OF_YEAR, 1)
        }

        return calendar.timeInMillis
    }

    fun snoozeAlert(
        context: Context,
        alertId: String,
        alertName: String,
        alertType: String,
        pillsCount: Int = -1,
        pillsLowThreshold: Int = -1,
        linkedSkillId: String? = null,
        linkedSkillName: String? = null,
        snoozeMinutes: Int = 10
    ) {
        val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
        val intent = Intent(context, ReminderReceiver::class.java).apply {
            action = ACTION_TRIGGER_ALERT
            putExtra(EXTRA_ALERT_ID, alertId)
            putExtra(EXTRA_ALERT_NAME, alertName)
            putExtra(EXTRA_ALERT_TYPE, alertType)
            putExtra(EXTRA_PILLS_COUNT, pillsCount)
            putExtra(EXTRA_PILLS_LOW_THRESHOLD, pillsLowThreshold)
            putExtra(EXTRA_LINKED_SKILL_ID, linkedSkillId)
            putExtra(EXTRA_LINKED_SKILL_NAME, linkedSkillName)
        }

        val pendingIntent = PendingIntent.getBroadcast(
            context,
            (alertId + "_snooze").hashCode(),
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val triggerTime = System.currentTimeMillis() + (snoozeMinutes * 60 * 1000L)
        val canExact = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            alarmManager.canScheduleExactAlarms()
        } else {
            true
        }
        try {
            if (canExact && Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                alarmManager.setExactAndAllowWhileIdle(
                    AlarmManager.RTC_WAKEUP,
                    triggerTime,
                    pendingIntent
                )
            } else {
                alarmManager.set(
                    AlarmManager.RTC_WAKEUP,
                    triggerTime,
                    pendingIntent
                )
            }
        } catch (_: SecurityException) {
            alarmManager.set(
                AlarmManager.RTC_WAKEUP,
                triggerTime,
                pendingIntent
            )
        }
    }

    fun cancelAlert(context: Context, alertId: String) {
        val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
        // Cancel base and up to 10 multi-time slots for this alert
        for (i in 0..9) {
            val intent = Intent(context, ReminderReceiver::class.java).apply {
                action = ACTION_TRIGGER_ALERT
            }
            val requestCode = getRequestCode(alertId, i)
            val pendingIntent = PendingIntent.getBroadcast(
                context,
                requestCode,
                intent,
                PendingIntent.FLAG_NO_CREATE or PendingIntent.FLAG_IMMUTABLE
            )
            if (pendingIntent != null) {
                alarmManager.cancel(pendingIntent)
                pendingIntent.cancel()
            }
        }
    }

    fun showNotification(
        context: Context,
        alertId: String,
        alertName: String,
        alertType: String,
        pillsCount: Int,
        pillsLowThreshold: Int,
        linkedSkillId: String? = null,
        linkedSkillName: String? = null
    ) {
        setupNotificationChannels(context)

        val channelId = when (alertType) {
            "medicine" -> CHANNEL_MEDS
            "prayer" -> CHANNEL_PRAYER
            else -> CHANNEL_HABITS
        }

        val tapIntent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
        }
        val tapPendingIntent = PendingIntent.getActivity(
            context,
            alertId.hashCode(),
            tapIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        // Action: Mark Done
        val doneIntent = Intent(context, ReminderReceiver::class.java).apply {
            action = ACTION_MARK_DONE
            putExtra(EXTRA_ALERT_ID, alertId)
            putExtra(EXTRA_ALERT_NAME, alertName)
            putExtra(EXTRA_ALERT_TYPE, alertType)
            putExtra(EXTRA_PILLS_COUNT, pillsCount)
            putExtra(EXTRA_LINKED_SKILL_ID, linkedSkillId)
            putExtra(EXTRA_LINKED_SKILL_NAME, linkedSkillName)
        }
        val donePendingIntent = PendingIntent.getBroadcast(
            context,
            (alertId + "_done").hashCode(),
            doneIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        // Action: Snooze 10m
        val snoozeIntent = Intent(context, ReminderReceiver::class.java).apply {
            action = ACTION_SNOOZE
            putExtra(EXTRA_ALERT_ID, alertId)
            putExtra(EXTRA_ALERT_NAME, alertName)
            putExtra(EXTRA_ALERT_TYPE, alertType)
            putExtra(EXTRA_PILLS_COUNT, pillsCount)
            putExtra(EXTRA_PILLS_LOW_THRESHOLD, pillsLowThreshold)
            putExtra(EXTRA_LINKED_SKILL_ID, linkedSkillId)
            putExtra(EXTRA_LINKED_SKILL_NAME, linkedSkillName)
        }
        val snoozePendingIntent = PendingIntent.getBroadcast(
            context,
            (alertId + "_snooze").hashCode(),
            snoozeIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val isLowPill = alertType == "medicine" && pillsCount in 0..pillsLowThreshold
        val skillSuffix = if (!linkedSkillName.isNullOrBlank()) " • 🔗 Linked: $linkedSkillName (+XP)" else ""
        val contentBody = when {
            isLowPill -> "⚠️ Low supply: Only $pillsCount pills remaining! Time for $alertName."
            alertType == "medicine" && pillsCount > 0 -> "Time to take $alertName ($pillsCount pills remaining)."
            alertType == "prayer" -> "Time for reflection and spiritual pause ($alertName)."
            else -> "Hero reminder: Time for $alertName!$skillSuffix"
        }

        val actionTitle = if (!linkedSkillName.isNullOrBlank()) "✓ Complete & Log" else "✓ Mark Done"

        val builder = NotificationCompat.Builder(context, channelId)
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setContentTitle(if (isLowPill) "⚠️ Refill Alert: $alertName" else alertName)
            .setContentText(contentBody)
            .setStyle(NotificationCompat.BigTextStyle().bigText(contentBody))
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setContentIntent(tapPendingIntent)
            .setAutoCancel(true)
            .addAction(android.R.drawable.checkbox_on_background, actionTitle, donePendingIntent)
            .addAction(android.R.drawable.ic_popup_sync, "⏰ Snooze 10m", snoozePendingIntent)

        val notificationManager =
            context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        notificationManager.notify(alertId.hashCode(), builder.build())
    }

    private fun getRequestCode(alertId: String, slotIndex: Int): Int {
        return (alertId.hashCode() * 31 + slotIndex) and 0x7FFFFFFF
    }
}
