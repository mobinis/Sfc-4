package com.example.selfcarehero.utils

import android.app.NotificationManager
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import com.example.selfcarehero.data.SelfCareRepository

class ReminderReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        val action = intent.action ?: return
        val repository = SelfCareRepository(context.applicationContext)

        when (action) {
            Intent.ACTION_BOOT_COMPLETED -> {
                val alerts = repository.state.value.rm
                ReminderScheduler.scheduleAllReminders(context, alerts)
            }

            ReminderScheduler.ACTION_TRIGGER_ALERT -> {
                val alertId = intent.getStringExtra(ReminderScheduler.EXTRA_ALERT_ID) ?: ""
                val alertName = intent.getStringExtra(ReminderScheduler.EXTRA_ALERT_NAME) ?: "Reminder"
                val alertType = intent.getStringExtra(ReminderScheduler.EXTRA_ALERT_TYPE) ?: "custom"
                val pillsCount = intent.getIntExtra(ReminderScheduler.EXTRA_PILLS_COUNT, -1)
                val pillsLowThreshold = intent.getIntExtra(ReminderScheduler.EXTRA_PILLS_LOW_THRESHOLD, -1)
                val linkedSkillId = intent.getStringExtra(ReminderScheduler.EXTRA_LINKED_SKILL_ID)
                val linkedSkillName = intent.getStringExtra(ReminderScheduler.EXTRA_LINKED_SKILL_NAME)

                if (alertId.isNotBlank()) {
                    ReminderScheduler.showNotification(
                        context = context,
                        alertId = alertId,
                        alertName = alertName,
                        alertType = alertType,
                        pillsCount = pillsCount,
                        pillsLowThreshold = pillsLowThreshold,
                        linkedSkillId = linkedSkillId,
                        linkedSkillName = linkedSkillName
                    )

                    // Re-schedule recurring alarm matching active multi-time & day rules
                    val currentAlert = repository.state.value.rm.firstOrNull { it.id == alertId }
                    if (currentAlert != null && currentAlert.active) {
                        ReminderScheduler.scheduleAlert(context, currentAlert)
                    }
                }
            }

            ReminderScheduler.ACTION_MARK_DONE -> {
                val alertId = intent.getStringExtra(ReminderScheduler.EXTRA_ALERT_ID) ?: ""
                if (alertId.isNotBlank()) {
                    val notificationManager =
                        context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
                    notificationManager.cancel(alertId.hashCode())

                    repository.handleAlertMarkDone(alertId)
                }
            }

            ReminderScheduler.ACTION_SNOOZE -> {
                val alertId = intent.getStringExtra(ReminderScheduler.EXTRA_ALERT_ID) ?: ""
                val alertName = intent.getStringExtra(ReminderScheduler.EXTRA_ALERT_NAME) ?: "Reminder"
                val alertType = intent.getStringExtra(ReminderScheduler.EXTRA_ALERT_TYPE) ?: "custom"
                val pillsCount = intent.getIntExtra(ReminderScheduler.EXTRA_PILLS_COUNT, -1)
                val pillsLowThreshold = intent.getIntExtra(ReminderScheduler.EXTRA_PILLS_LOW_THRESHOLD, -1)
                val linkedSkillId = intent.getStringExtra(ReminderScheduler.EXTRA_LINKED_SKILL_ID)
                val linkedSkillName = intent.getStringExtra(ReminderScheduler.EXTRA_LINKED_SKILL_NAME)

                if (alertId.isNotBlank()) {
                    val notificationManager =
                        context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
                    notificationManager.cancel(alertId.hashCode())

                    ReminderScheduler.snoozeAlert(
                        context = context,
                        alertId = alertId,
                        alertName = alertName,
                        alertType = alertType,
                        pillsCount = pillsCount,
                        pillsLowThreshold = pillsLowThreshold,
                        linkedSkillId = linkedSkillId,
                        linkedSkillName = linkedSkillName,
                        snoozeMinutes = 10
                    )
                }
            }
        }
    }
}
