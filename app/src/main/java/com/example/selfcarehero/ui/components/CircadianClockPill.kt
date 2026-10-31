package com.example.selfcarehero.ui.components

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.selfcarehero.model.CircadianConfig
import com.example.selfcarehero.ui.theme.AmberGold
import com.example.selfcarehero.ui.theme.AmberLight
import com.example.selfcarehero.ui.theme.Emerald700
import com.example.selfcarehero.ui.theme.Emerald800
import com.example.selfcarehero.ui.theme.ForestSage400
import com.example.selfcarehero.ui.theme.LineBorder
import com.example.selfcarehero.ui.theme.SurfaceCard
import com.example.selfcarehero.ui.theme.SurfaceCardVariant
import com.example.selfcarehero.ui.theme.TextMuted
import com.example.selfcarehero.ui.theme.TextPrimary
import com.example.selfcarehero.ui.theme.TextSecondary
import com.example.selfcarehero.ui.viewmodel.SelfCareViewModel
import java.util.Calendar

data class CircadianStatus(
    val phaseTitle: String,
    val phaseIcon: String,
    val guidance: String,
    val countdownLabel: String,
    val countdownText: String,
    val accentColor: Color,
    val dayProgress: Float,
    val isCaffeineCutoffPast: Boolean,
    val isScreenCurfewActive: Boolean
)

fun calculateCircadianStatus(config: CircadianConfig): CircadianStatus {
    val cal = Calendar.getInstance()
    val currentMinutes = cal.get(Calendar.HOUR_OF_DAY) * 60 + cal.get(Calendar.MINUTE)

    fun parseMinutes(timeStr: String, default: Int): Int {
        val parts = timeStr.split(":")
        if (parts.size != 2) return default
        val h = parts[0].toIntOrNull() ?: return default
        val m = parts[1].toIntOrNull() ?: 0
        return (h * 60 + m) % (24 * 60)
    }

    val wakeMins = parseMinutes(config.wakeTimeStr, 7 * 60) // 07:00 default = 420
    var bedMins = parseMinutes(config.bedTimeStr, 23 * 60)  // 23:00 default = 1380

    // Adjust if bedtime wraps across midnight (e.g. 01:00)
    val effectiveBedMins = if (bedMins <= wakeMins) bedMins + 24 * 60 else bedMins
    val effectiveCurrentMins = if (currentMinutes < wakeMins && effectiveBedMins > 24 * 60) {
        currentMinutes + 24 * 60
    } else {
        currentMinutes
    }

    val caffeineCutoffMins = effectiveBedMins - (config.caffeineCutoffHoursBeforeSleep * 60)
    val screenCurfewMins = effectiveBedMins - (config.screenCurfewHoursBeforeSleep * 60)
    val morningLightEndMins = wakeMins + 90 // first 90 minutes

    val wakingDuration = (effectiveBedMins - wakeMins).coerceAtLeast(1)
    val minutesAwake = (effectiveCurrentMins - wakeMins).coerceIn(0, wakingDuration)
    val dayProgress = (minutesAwake.toFloat() / wakingDuration.toFloat()).coerceIn(0f, 1f)

    fun formatMinutesDelta(mins: Int): String {
        val m = mins.coerceAtLeast(0)
        val hours = m / 60
        val remainingMins = m % 60
        return if (hours > 0) "${hours}h ${remainingMins}m" else "${remainingMins}m"
    }

    return when {
        // Asleep / Pre-Wake Window
        effectiveCurrentMins < wakeMins -> {
            val minsToWake = wakeMins - effectiveCurrentMins
            CircadianStatus(
                phaseTitle = "Cellular Regeneration & Sleep",
                phaseIcon = "🌌",
                guidance = "Glymphatic brain clearance and restorative deep sleep.",
                countdownLabel = "☀️ Sunrise in",
                countdownText = formatMinutesDelta(minsToWake),
                accentColor = Color(0xFF818CF8),
                dayProgress = 0f,
                isCaffeineCutoffPast = true,
                isScreenCurfewActive = true
            )
        }
        // Morning Light Window
        effectiveCurrentMins in wakeMins until morningLightEndMins -> {
            val minsRemaining = morningLightEndMins - effectiveCurrentMins
            CircadianStatus(
                phaseTitle = "Morning Cortisol Surge & Light",
                phaseIcon = "☀️",
                guidance = "View natural outdoor light to lock in circadian adenosine timing.",
                countdownLabel = "⚡ Peak Focus in",
                countdownText = formatMinutesDelta(minsRemaining),
                accentColor = AmberGold,
                dayProgress = dayProgress,
                isCaffeineCutoffPast = false,
                isScreenCurfewActive = false
            )
        }
        // Peak Focus & Caffeine Window
        effectiveCurrentMins in morningLightEndMins until caffeineCutoffMins -> {
            val minsToCaffeine = caffeineCutoffMins - effectiveCurrentMins
            CircadianStatus(
                phaseTitle = "Peak Executive Focus & Dopamine",
                phaseIcon = "⚡",
                guidance = "Prime window for creative execution and high-priority sprints.",
                countdownLabel = "☕ Caffeine Cut-off in",
                countdownText = formatMinutesDelta(minsToCaffeine),
                accentColor = ForestSage400,
                dayProgress = dayProgress,
                isCaffeineCutoffPast = false,
                isScreenCurfewActive = false
            )
        }
        // Afternoon Taper / Caffeine Cut-Off Active
        effectiveCurrentMins in caffeineCutoffMins until screenCurfewMins -> {
            val minsToCurfew = screenCurfewMins - effectiveCurrentMins
            CircadianStatus(
                phaseTitle = "Afternoon Taper & Steady Flow",
                phaseIcon = "☕",
                guidance = "Caffeine threshold passed. Hydrate with water to protect tonight's deep NREM.",
                countdownLabel = "📵 Screen Curfew in",
                countdownText = formatMinutesDelta(minsToCurfew),
                accentColor = AmberLight,
                dayProgress = dayProgress,
                isCaffeineCutoffPast = true,
                isScreenCurfewActive = false
            )
        }
        // Digital Sunset / Screen Curfew
        effectiveCurrentMins in screenCurfewMins until effectiveBedMins -> {
            val minsToBed = effectiveBedMins - effectiveCurrentMins
            CircadianStatus(
                phaseTitle = "Digital Sunset & Melatonin Surge",
                phaseIcon = "📵",
                guidance = "Screens down or dim warm filters. Melatonin is actively rising.",
                countdownLabel = "🌙 Sleep Window in",
                countdownText = formatMinutesDelta(minsToBed),
                accentColor = Color(0xFFF472B6),
                dayProgress = dayProgress,
                isCaffeineCutoffPast = true,
                isScreenCurfewActive = true
            )
        }
        // Past Bedtime
        else -> {
            CircadianStatus(
                phaseTitle = "Sleep Architecture Window",
                phaseIcon = "🌙",
                guidance = "Target bedtime reached. Rest deeply to rebuild dopamine receptors.",
                countdownLabel = "🛌 In Bed Now",
                countdownText = "Rest mode",
                accentColor = Color(0xFFA78BFA),
                dayProgress = 1f,
                isCaffeineCutoffPast = true,
                isScreenCurfewActive = true
            )
        }
    }
}

@Composable
fun CircadianClockPill(
    viewModel: SelfCareViewModel,
    modifier: Modifier = Modifier
) {
    val state by viewModel.state.collectAsState()
    val config = state.circadianConfig
    if (!config.enabled) return

    val status = remember(config) { calculateCircadianStatus(config) }
    var expandedInfo by remember { mutableStateOf(false) }

    Card(
        modifier = modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp)
            .testTag("circadian_clock_pill"),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = SurfaceCard),
        border = CardDefaults.outlinedCardBorder().copy(
            brush = androidx.compose.ui.graphics.SolidColor(LineBorder)
        )
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 14.dp, vertical = 10.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.weight(1f)
                ) {
                    Box(
                        modifier = Modifier
                            .size(34.dp)
                            .clip(CircleShape)
                            .background(SurfaceCardVariant)
                            .border(1.dp, status.accentColor.copy(alpha = 0.5f), CircleShape),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(text = status.phaseIcon, fontSize = 16.sp)
                    }

                    Spacer(modifier = Modifier.width(10.dp))

                    Column {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(
                                text = "Circadian Rhythm Clock",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = TextMuted
                            )
                        }
                        Text(
                            text = status.phaseTitle,
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Bold,
                            color = TextPrimary,
                            maxLines = 1
                        )
                    }
                }

                // Countdown Badge
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(12.dp))
                        .background(status.accentColor.copy(alpha = 0.15f))
                        .border(1.dp, status.accentColor.copy(alpha = 0.35f), RoundedCornerShape(12.dp))
                        .padding(horizontal = 10.dp, vertical = 5.dp)
                ) {
                    Column(horizontalAlignment = Alignment.End) {
                        Text(
                            text = status.countdownLabel,
                            fontSize = 10.sp,
                            color = status.accentColor,
                            fontWeight = FontWeight.Medium
                        )
                        Text(
                            text = status.countdownText,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                            color = TextPrimary
                        )
                    }
                }

                // Settings icon button
                IconButton(
                    onClick = { viewModel.openCircadianSettings() },
                    modifier = Modifier
                        .size(32.dp)
                        .padding(start = 4.dp)
                        .testTag("circadian_settings_button")
                ) {
                    Icon(
                        imageVector = Icons.Default.Settings,
                        contentDescription = "Circadian Settings",
                        tint = TextSecondary,
                        modifier = Modifier.size(16.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Linear biological day progression
            LinearProgressIndicator(
                progress = { status.dayProgress },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(4.dp)
                    .clip(RoundedCornerShape(2.dp)),
                color = status.accentColor,
                trackColor = SurfaceCardVariant
            )

            Spacer(modifier = Modifier.height(6.dp))

            // Guidance hint with expand toggle
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { expandedInfo = !expandedInfo },
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    text = status.guidance,
                    fontSize = 11.sp,
                    color = TextSecondary,
                    modifier = Modifier.weight(1f)
                )

                Icon(
                    imageVector = Icons.Default.Info,
                    contentDescription = "Protocol Details",
                    tint = TextMuted,
                    modifier = Modifier
                        .size(14.dp)
                        .padding(start = 4.dp)
                )
            }

            AnimatedVisibility(visible = expandedInfo) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = 8.dp)
                        .clip(RoundedCornerShape(10.dp))
                        .background(SurfaceCardVariant)
                        .padding(10.dp)
                ) {
                    Text(
                        text = "🔬 Chronobiological Protocol",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = AmberLight
                    )
                    Spacer(modifier = Modifier.height(3.dp))
                    Text(
                        text = "• Wake: ${config.wakeTimeStr} | Bed: ${config.bedTimeStr}\n" +
                               "• Caffeine cutoff: ${config.caffeineCutoffHoursBeforeSleep}h before sleep (prevents adenosine block)\n" +
                               "• Screen curfew: ${config.screenCurfewHoursBeforeSleep}h before sleep (prevents melatonin suppression)",
                        fontSize = 10.sp,
                        color = TextPrimary,
                        lineHeight = 14.sp
                    )
                }
            }
        }
    }
}
