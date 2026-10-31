package com.example.selfcarehero.ui.dialogs

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.example.selfcarehero.model.DateUtils
import com.example.selfcarehero.ui.theme.*
import com.example.selfcarehero.ui.viewmodel.SelfCareViewModel

@Composable
fun MonthlyRecapDialog(
    viewModel: SelfCareViewModel,
    onDismiss: () -> Unit
) {
    val state by viewModel.state.collectAsState()
    val scrollState = rememberScrollState()

    // Calculate 30-day statistics
    val thirtyDaysEvents = remember(state.ev) {
        val thirtyDaysAgo = System.currentTimeMillis() - (30L * 86400000L)
        state.ev.filter { it.t >= thirtyDaysAgo }
    }

    val totalCompletions = thirtyDaysEvents.size
    val totalXpEarned = thirtyDaysEvents.sumOf { it.x }

    // Pillar breakdown
    val learnCount = thirtyDaysEvents.count { ev ->
        val node = state.nodes.firstOrNull { it.id == ev.n }
        node?.p == "learn" || node?.id == "learn" || node?.id == "r"
    }
    val buildCount = thirtyDaysEvents.count { ev ->
        val node = state.nodes.firstOrNull { it.id == ev.n }
        node?.p == "build" || node?.id == "build" || node?.id == "d"
    }
    val bodyCount = thirtyDaysEvents.count { ev ->
        val node = state.nodes.firstOrNull { it.id == ev.n }
        node?.p == "body" || node?.id == "body" || node?.id == "w" || node?.id == "m1"
    }
    val totalPillar = (learnCount + buildCount + bodyCount).coerceAtLeast(1)

    val learnPct = (learnCount * 100) / totalPillar
    val buildPct = (buildCount * 100) / totalPillar
    val bodyPct = (bodyCount * 100) / totalPillar

    // 30-day heatmap data (last 30 calendar days)
    val dayGridData = remember(thirtyDaysEvents) {
        (29 downTo 0).map { daysAgo ->
            val dateStr = DateUtils.daysAgoStr(daysAgo)
            val count = thirtyDaysEvents.count { it.d == dateStr }
            val color = when {
                count >= 5 -> ForestSage400
                count >= 3 -> ForestSage600
                count >= 1 -> ForestSage800
                else -> WarmSurface800
            }
            Pair(dateStr, color)
        }
    }

    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Card(
            shape = RoundedCornerShape(24.dp),
            colors = CardDefaults.cardColors(containerColor = WarmCharcoal950),
            modifier = Modifier
                .fillMaxWidth(0.94f)
                .fillMaxHeight(0.85f)
                .padding(vertical = 16.dp)
                .border(1.dp, WarmBorder, RoundedCornerShape(24.dp))
        ) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(20.dp)
                    .verticalScroll(scrollState)
            ) {
                // Header
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(
                            text = "Executive 30-Day Recap",
                            fontWeight = FontWeight.Bold,
                            fontSize = 18.sp,
                            color = TextPrimary
                        )
                        Text(
                            text = "Performance & Health Audit",
                            fontSize = 12.sp,
                            color = ForestSage400
                        )
                    }

                    IconButton(
                        onClick = onDismiss,
                        modifier = Modifier.testTag("monthly_recap_close_button")
                    ) {
                        Icon(Icons.Default.Close, contentDescription = "Close", tint = TextMuted)
                    }
                }

                Spacer(modifier = Modifier.height(20.dp))

                // KPI Overview Cards
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Card(
                        colors = CardDefaults.cardColors(containerColor = WarmSurface800),
                        shape = RoundedCornerShape(14.dp),
                        modifier = Modifier.weight(1f)
                    ) {
                        Column(modifier = Modifier.padding(12.dp)) {
                            Text("Total Reps", fontSize = 11.sp, color = TextMuted)
                            Text("$totalCompletions", fontSize = 22.sp, fontWeight = FontWeight.ExtraBold, color = WarmAmberLight)
                            Text("30 Days", fontSize = 10.sp, color = ForestSage400)
                        }
                    }

                    Card(
                        colors = CardDefaults.cardColors(containerColor = WarmSurface800),
                        shape = RoundedCornerShape(14.dp),
                        modifier = Modifier.weight(1f)
                    ) {
                        Column(modifier = Modifier.padding(12.dp)) {
                            Text("XP Earned", fontSize = 11.sp, color = TextMuted)
                            Text("+$totalXpEarned", fontSize = 22.sp, fontWeight = FontWeight.ExtraBold, color = ForestSage400)
                            Text("Experience", fontSize = 10.sp, color = TextMuted)
                        }
                    }

                    Card(
                        colors = CardDefaults.cardColors(containerColor = WarmSurface800),
                        shape = RoundedCornerShape(14.dp),
                        modifier = Modifier.weight(1f)
                    ) {
                        Column(modifier = Modifier.padding(12.dp)) {
                            Text("Current Streak", fontSize = 11.sp, color = TextMuted)
                            Text("${state.dailyThreeStreak.cur}d", fontSize = 22.sp, fontWeight = FontWeight.ExtraBold, color = WarmAmberGold)
                            Text("Best: ${state.dailyThreeStreak.best}d", fontSize = 10.sp, color = TextMuted)
                        }
                    }
                }

                Spacer(modifier = Modifier.height(24.dp))

                // 30-Day Consistency Heatmap Grid
                Text(
                    text = "30-Day Activity Heatmap",
                    fontWeight = FontWeight.Bold,
                    fontSize = 14.sp,
                    color = TextPrimary
                )
                Spacer(modifier = Modifier.height(10.dp))
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(14.dp))
                        .background(WarmSurface800)
                        .padding(12.dp)
                ) {
                    val rows = dayGridData.chunked(6)
                    rows.forEach { row ->
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 3.dp),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            row.forEach { (_, color) ->
                                Box(
                                    modifier = Modifier
                                        .size(36.dp)
                                        .clip(RoundedCornerShape(6.dp))
                                        .background(color)
                                        .border(1.dp, WarmBorder.copy(alpha = 0.5f), RoundedCornerShape(6.dp))
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(8.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.End,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text("Less", fontSize = 10.sp, color = TextMuted)
                        Spacer(modifier = Modifier.width(4.dp))
                        Box(modifier = Modifier.size(10.dp).clip(CircleShape).background(WarmSurface800))
                        Spacer(modifier = Modifier.width(3.dp))
                        Box(modifier = Modifier.size(10.dp).clip(CircleShape).background(ForestSage800))
                        Spacer(modifier = Modifier.width(3.dp))
                        Box(modifier = Modifier.size(10.dp).clip(CircleShape).background(ForestSage600))
                        Spacer(modifier = Modifier.width(3.dp))
                        Box(modifier = Modifier.size(10.dp).clip(CircleShape).background(ForestSage400))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("More", fontSize = 10.sp, color = TextMuted)
                    }
                }

                Spacer(modifier = Modifier.height(24.dp))

                // Pillar Balance Breakdown
                Text(
                    text = "Pillar Distribution",
                    fontWeight = FontWeight.Bold,
                    fontSize = 14.sp,
                    color = TextPrimary
                )
                Spacer(modifier = Modifier.height(10.dp))
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(14.dp))
                        .background(WarmSurface800)
                        .padding(14.dp)
                ) {
                    // Learn Bar
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text("🧠 Learn", fontSize = 12.sp, color = TextPrimary)
                        Text("$learnPct% ($learnCount)", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = ForestSage400)
                    }
                    LinearProgressIndicator(
                        progress = { learnPct / 100f },
                        modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp).height(6.dp).clip(CircleShape),
                        color = ForestSage400,
                        trackColor = WarmSurface700
                    )

                    Spacer(modifier = Modifier.height(8.dp))

                    // Build Bar
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text("🛠️ Build", fontSize = 12.sp, color = TextPrimary)
                        Text("$buildPct% ($buildCount)", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = WarmAmberGold)
                    }
                    LinearProgressIndicator(
                        progress = { buildPct / 100f },
                        modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp).height(6.dp).clip(CircleShape),
                        color = WarmAmberGold,
                        trackColor = WarmSurface700
                    )

                    Spacer(modifier = Modifier.height(8.dp))

                    // Body Bar
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text("💪 Body", fontSize = 12.sp, color = TextPrimary)
                        Text("$bodyPct% ($bodyCount)", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = WarmAmberLight)
                    }
                    LinearProgressIndicator(
                        progress = { bodyPct / 100f },
                        modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp).height(6.dp).clip(CircleShape),
                        color = WarmAmberLight,
                        trackColor = WarmSurface700
                    )
                }

                Spacer(modifier = Modifier.height(24.dp))

                // High-Impact Habit Insight
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(14.dp))
                        .background(ForestSage900)
                        .border(1.dp, ForestSage700, RoundedCornerShape(14.dp))
                        .padding(14.dp)
                ) {
                    Column {
                        Text("💡 Executive Takeaway", fontWeight = FontWeight.Bold, fontSize = 13.sp, color = WarmAmberGold)
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = if (bodyPct < 25) {
                                "Your physical pillar (Body) is lower than optimal. Consider starting tomorrow with the Sunrise Kickstart routine to ensure early hydration and mobility."
                            } else {
                                "Strong physiological anchoring maintained over the past 30 days. Maintain this foundation to support deep cognitive work."
                            },
                            fontSize = 12.sp,
                            color = TextSecondary,
                            lineHeight = 16.sp
                        )
                    }
                }
            }
        }
    }
}
