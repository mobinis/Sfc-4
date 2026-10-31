package com.example.selfcarehero.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
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
import com.example.selfcarehero.model.BackupSnapshot
import com.example.selfcarehero.model.DateUtils
import com.example.selfcarehero.ui.theme.*
import com.example.selfcarehero.ui.viewmodel.SelfCareViewModel
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

@Composable
fun StatsScreen(
    viewModel: SelfCareViewModel,
    modifier: Modifier = Modifier
) {
    val state by viewModel.state.collectAsState()
    val statsViewMode by viewModel.statsViewMode.collectAsState()
    val level by remember(state.ev) { derivedStateOf { viewModel.getPlayerLevel() } }
    val title by remember(state.ev) { derivedStateOf { viewModel.getLevelTitle() } }
    val totalXp by remember(state.ev) { derivedStateOf { viewModel.getTotalXp() } }

    val weeklyInsights by remember(state.ev, state.jr, state.goodDeeds) {
        derivedStateOf { viewModel.getWeeklyInsights() }
    }

    val analytics by remember(state.ev, state.jr, state.urges, state.nodes) {
        derivedStateOf { viewModel.getAdvancedAnalytics() }
    }

    val awards by remember(state.ev, state.dailyThreeStreak, state.jr, state.learnStack) {
        derivedStateOf {
            listOf(
                AwardItem("First Step", "Complete your first habit", state.ev.isNotEmpty(), "🌱"),
                AwardItem("Hydration Anchor", "Drink 8 glasses of water in a day", state.ev.any { it.n == "w" && it.c >= 8 }, "💧"),
                AwardItem("Triple Threat", "Achieve your first Daily Three", state.dailyThreeStreak.best >= 1, "⚡"),
                AwardItem("Mindful Soul", "Log 3 journal reflections", state.jr.size >= 3, "✍️"),
                AwardItem("Steadfast Streak", "Maintain a 7-day streak", state.dailyThreeStreak.best >= 7, "🔥"),
                AwardItem("Wisdom Seeker", "Study and review 5 wisdom items", state.learnStack.sumOf { it.reviewCount } >= 5, "🧠")
            )
        }
    }

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp),
        contentPadding = PaddingValues(top = 8.dp, bottom = 120.dp)
    ) {
        item {
            Text(
                text = "Hero Evolution & Analytics",
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onBackground
            )
            Text(
                text = "Reflect on weekly momentum and lifetime progression",
                fontSize = 12.sp,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            Spacer(modifier = Modifier.height(10.dp))
        }

        // Hero Profile Card
        item {
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("stats_hero_card"),
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                border = CardDefaults.outlinedCardBorder().copy(
                    brush = androidx.compose.ui.graphics.SolidColor(MaterialTheme.colorScheme.secondary.copy(alpha = 0.6f))
                )
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(14.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = Modifier
                            .size(54.dp)
                            .clip(CircleShape)
                            .background(MaterialTheme.colorScheme.secondary),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(text = "🛡️", fontSize = 26.sp)
                    }

                    Spacer(modifier = Modifier.width(14.dp))

                    Column {
                        Text(
                            text = "Level $level",
                            fontSize = 19.sp,
                            fontWeight = FontWeight.Black,
                            color = MaterialTheme.colorScheme.secondary
                        )
                        Text(
                            text = title,
                            fontSize = 12.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            fontWeight = FontWeight.SemiBold
                        )
                        Spacer(modifier = Modifier.height(3.dp))
                        Text(
                            text = "Total Lifetime XP: $totalXp",
                            fontSize = 12.sp,
                            color = MaterialTheme.colorScheme.primary,
                            style = TabularNumberStyle
                        )
                    }
                }
            }
        }

        // Executive 30-Day Recap Banner
        item {
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 4.dp)
                    .clickable { viewModel.openMonthlyRecap() }
                    .testTag("btn_open_monthly_recap"),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.5f)),
                border = CardDefaults.outlinedCardBorder().copy(
                    brush = androidx.compose.ui.graphics.SolidColor(MaterialTheme.colorScheme.primary.copy(alpha = 0.4f))
                )
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(14.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text("📊", fontSize = 22.sp)
                        Spacer(modifier = Modifier.width(10.dp))
                        Column {
                            Text(
                                text = "Executive 30-Day Recap",
                                fontWeight = FontWeight.Bold,
                                fontSize = 14.sp,
                                color = MaterialTheme.colorScheme.onPrimaryContainer
                            )
                            Text(
                                text = "Pillar balance, 30d heatmap & correlations",
                                fontSize = 11.sp,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }
                    Text("View →", fontWeight = FontWeight.Bold, fontSize = 12.sp, color = MaterialTheme.colorScheme.primary)
                }
            }
        }

        // Segmented Control: Weekly Insights vs Annual Heatmap
        item {
            Spacer(modifier = Modifier.height(12.dp))
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(12.dp))
                    .background(MaterialTheme.colorScheme.surfaceVariant)
                    .padding(4.dp)
            ) {
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .clip(RoundedCornerShape(10.dp))
                        .background(if (statsViewMode == "insights") MaterialTheme.colorScheme.primary else Color.Transparent)
                        .clickable { viewModel.setStatsViewMode("insights") }
                        .padding(vertical = 8.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "📊 Weekly Insights",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        color = if (statsViewMode == "insights") MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }

                Box(
                    modifier = Modifier
                        .weight(1f)
                        .clip(RoundedCornerShape(10.dp))
                        .background(if (statsViewMode == "heatmap") MaterialTheme.colorScheme.primary else Color.Transparent)
                        .clickable { viewModel.setStatsViewMode("heatmap") }
                        .padding(vertical = 8.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "🗓️ Activity & Backups",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        color = if (statsViewMode == "heatmap") MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
            Spacer(modifier = Modifier.height(10.dp))
        }

        if (statsViewMode == "insights") {
            // VIEW A: WEEKLY INSIGHTS
            item {
                // 4-KPI Strip (Linear/Notion Metric Precision)
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    MetricBox(
                        label = "Weekly XP",
                        value = "+${weeklyInsights.totalXp}",
                        emoji = "⚡",
                        modifier = Modifier.weight(1f)
                    )
                    MetricBox(
                        label = "Reps",
                        value = "${weeklyInsights.totalCompletions}",
                        emoji = "✓",
                        modifier = Modifier.weight(1f)
                    )
                    MetricBox(
                        label = "Daily 3",
                        value = "${weeklyInsights.dailyThreeDays}/7d",
                        emoji = "🔥",
                        modifier = Modifier.weight(1f)
                    )
                    MetricBox(
                        label = "Kind Deeds",
                        value = "${weeklyInsights.gratitudeEntries.size}",
                        emoji = "🤲",
                        modifier = Modifier.weight(1f)
                    )
                }
            }

            // Weekly Review CTA Button
            item {
                Spacer(modifier = Modifier.height(10.dp))
                Button(
                    onClick = { viewModel.showWeeklyReviewDialog.value = true },
                    shape = RoundedCornerShape(14.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = AmberGold),
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(44.dp)
                        .testTag("btn_start_weekly_review")
                ) {
                    Text("✍️ Start Weekly Review (+50 Bonus XP)", color = Emerald900, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                }
            }

            // Hybrid Top Skills Section
            item {
                Spacer(modifier = Modifier.height(16.dp))
                Text(
                    text = "Top Momentum Skills (Last 7 Days)",
                    fontSize = 15.sp,
                    fontWeight = FontWeight.Bold,
                    color = TextPrimary
                )
                Text(
                    text = "Scored via reps, active days & earned XP",
                    fontSize = 11.sp,
                    color = TextMuted
                )
                Spacer(modifier = Modifier.height(6.dp))
            }

            if (weeklyInsights.topSkills.isEmpty()) {
                item {
                    Text(
                        text = "No completions recorded in the past 7 days yet. Check off habits to build momentum!",
                        color = TextMuted,
                        fontSize = 12.sp,
                        modifier = Modifier.padding(vertical = 8.dp)
                    )
                }
            } else {
                items(weeklyInsights.topSkills) { skill ->
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 4.dp),
                        shape = RoundedCornerShape(14.dp),
                        colors = CardDefaults.cardColors(containerColor = SurfaceCardVariant)
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(12.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                modifier = Modifier.weight(1f)
                            ) {
                                Text(text = skill.emoji, fontSize = 20.sp)
                                Spacer(modifier = Modifier.width(10.dp))
                                Column {
                                    Text(
                                        text = skill.name,
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 13.sp,
                                        color = TextPrimary
                                    )
                                    Text(
                                        text = "${skill.completionCount} reps • ${skill.activeDays} active days • +${skill.xpEarned} XP",
                                        fontSize = 11.sp,
                                        color = TextSecondary
                                    )
                                }
                            }

                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(8.dp))
                                    .background(Emerald800)
                                    .padding(horizontal = 6.dp, vertical = 3.dp)
                            ) {
                                Text(
                                    text = skill.momentumTag,
                                    fontSize = 10.sp,
                                    color = AmberLight,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        }
                    }
                }
            }

            // 7-Day Mood Analytics
            item {
                Spacer(modifier = Modifier.height(16.dp))
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(18.dp),
                    colors = CardDefaults.cardColors(containerColor = SurfaceCard)
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "7-Day Emotional Stability",
                                fontWeight = FontWeight.Bold,
                                fontSize = 14.sp,
                                color = TextPrimary
                            )
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text(text = weeklyInsights.dominantMoodEmoji, fontSize = 18.sp)
                                Spacer(modifier = Modifier.width(4.dp))
                                Text(
                                    text = weeklyInsights.dominantMoodLabel,
                                    fontSize = 12.sp,
                                    color = AmberGold,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(10.dp))

                        // 5-bar Mood Frequency Proportions
                        val moodEmojis = listOf("😢", "😕", "😐", "🙂", "😄")
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            weeklyInsights.moodCounts.forEachIndexed { idx, count ->
                                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                    Text(text = moodEmojis[idx], fontSize = 14.sp)
                                    Spacer(modifier = Modifier.height(2.dp))
                                    Text(
                                        text = "${count}d",
                                        fontSize = 11.sp,
                                        color = if (count > 0) TextPrimary else TextMuted,
                                        fontWeight = if (count > 0) FontWeight.Bold else FontWeight.Normal
                                    )
                                }
                            }
                        }
                    }
                }
            }

            // Gratitude Notes of the Week
            item {
                Spacer(modifier = Modifier.height(16.dp))
                Text(
                    text = "Weekly Gratitude & Kind Deeds",
                    fontSize = 15.sp,
                    fontWeight = FontWeight.Bold,
                    color = TextPrimary
                )
                Spacer(modifier = Modifier.height(6.dp))
            }

            if (weeklyInsights.gratitudeEntries.isEmpty()) {
                item {
                    Text(
                        text = "No deeds or reflections logged this week yet. Log small acts of kindness in Journal!",
                        color = TextMuted,
                        fontSize = 12.sp
                    )
                }
            } else {
                items(weeklyInsights.gratitudeEntries.take(5)) { deed ->
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 3.dp),
                        shape = RoundedCornerShape(12.dp),
                        colors = CardDefaults.cardColors(containerColor = SurfaceCardVariant)
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(10.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(text = if (deed.target == "others") "🤲" else "🧘", fontSize = 16.sp)
                            Spacer(modifier = Modifier.width(8.dp))
                            Column {
                                Text(text = deed.text, fontSize = 12.sp, color = TextPrimary)
                                Text(text = deed.d, fontSize = 10.sp, color = TextMuted)
                            }
                        }
                    }
                }
            }

            // Advanced Analytics: Habit-to-Mood Correlations
            item {
                Spacer(modifier = Modifier.height(18.dp))
                Text(
                    text = "Habit-to-Mood Correlations",
                    fontSize = 15.sp,
                    fontWeight = FontWeight.Bold,
                    color = TextPrimary
                )
                Text(
                    text = "Empirical mood boost on days each habit is completed",
                    fontSize = 11.sp,
                    color = TextMuted
                )
                Spacer(modifier = Modifier.height(8.dp))
            }

            items(analytics.correlations) { corr ->
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 4.dp),
                    shape = RoundedCornerShape(14.dp),
                    colors = CardDefaults.cardColors(containerColor = SurfaceCardVariant)
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(12.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier.weight(1f)
                        ) {
                            Text(text = corr.habitEmoji, fontSize = 20.sp)
                            Spacer(modifier = Modifier.width(10.dp))
                            Column {
                                Text(
                                    text = corr.habitName,
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = TextPrimary
                                )
                                Text(
                                    text = "${String.format(Locale.US, "%.1f", corr.avgMoodDone)}★ when active vs ${String.format(Locale.US, "%.1f", corr.avgMoodNotDone)}★ skipped (${corr.totalDoneDays}d)",
                                    fontSize = 10.sp,
                                    color = TextMuted
                                )
                            }
                        }

                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(8.dp))
                                .background(Emerald700.copy(alpha = 0.8f))
                                .padding(horizontal = 8.dp, vertical = 4.dp)
                        ) {
                            Text(
                                text = "+${corr.deltaPercent}% Mood",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = Emerald400
                            )
                        }
                    }
                }
            }

            // Life Pillars Balance
            item {
                Spacer(modifier = Modifier.height(18.dp))
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = SurfaceCard)
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "Life Pillars Balance",
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Bold,
                                color = TextPrimary
                            )
                            Text(
                                text = "Lead: ${analytics.pillarBalance.dominantPillar}",
                                fontSize = 11.sp,
                                color = AmberGold,
                                fontWeight = FontWeight.SemiBold
                            )
                        }

                        Spacer(modifier = Modifier.height(10.dp))

                        // Proportional Stacked Meter
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(12.dp)
                                .clip(RoundedCornerShape(6.dp))
                        ) {
                            val pb = analytics.pillarBalance
                            if (pb.learnPercent > 0) {
                                Box(
                                    modifier = Modifier
                                        .weight(pb.learnPercent.toFloat())
                                        .fillMaxHeight()
                                        .background(TealAccent)
                                )
                            }
                            if (pb.buildPercent > 0) {
                                Box(
                                    modifier = Modifier
                                        .weight(pb.buildPercent.toFloat())
                                        .fillMaxHeight()
                                        .background(AmberGold)
                                )
                            }
                            if (pb.bodyPercent > 0) {
                                Box(
                                    modifier = Modifier
                                        .weight(pb.bodyPercent.toFloat())
                                        .fillMaxHeight()
                                        .background(Emerald500)
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(10.dp))

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Box(modifier = Modifier.size(8.dp).clip(CircleShape).background(TealAccent))
                                Spacer(modifier = Modifier.width(4.dp))
                                Text("Mind: ${analytics.pillarBalance.learnPercent}%", fontSize = 11.sp, color = TextSecondary)
                            }
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Box(modifier = Modifier.size(8.dp).clip(CircleShape).background(AmberGold))
                                Spacer(modifier = Modifier.width(4.dp))
                                Text("Craft: ${analytics.pillarBalance.buildPercent}%", fontSize = 11.sp, color = TextSecondary)
                            }
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Box(modifier = Modifier.size(8.dp).clip(CircleShape).background(Emerald500))
                                Spacer(modifier = Modifier.width(4.dp))
                                Text("Vitality: ${analytics.pillarBalance.bodyPercent}%", fontSize = 11.sp, color = TextSecondary)
                            }
                        }
                    }
                }
            }

            // Urge Surfing Resilience
            item {
                Spacer(modifier = Modifier.height(18.dp))
                Card(
                    modifier = Modifier.fillMaxWidth().testTag("stats_urge_card"),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = SurfaceCard)
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "🌊 Urge Surfing Resilience",
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Bold,
                                color = TextPrimary
                            )
                            Text(
                                text = "${analytics.urgeAnalytics.successRate}% Success",
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold,
                                color = TealAccent
                            )
                        }

                        Spacer(modifier = Modifier.height(10.dp))

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Column {
                                Text("Surfed Waves", fontSize = 11.sp, color = TextMuted)
                                Text("${analytics.urgeAnalytics.surfedCount} / ${analytics.urgeAnalytics.totalUrges}", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = TextPrimary)
                            }
                            Column {
                                Text("Avg Wave Drop", fontSize = 11.sp, color = TextMuted)
                                val dropText = if (analytics.urgeAnalytics.avgIntensityDrop > 0.0) {
                                    "-${String.format(Locale.US, "%.1f", analytics.urgeAnalytics.avgIntensityDrop)} pts"
                                } else {
                                    "${String.format(Locale.US, "%.1f", analytics.urgeAnalytics.avgIntensity)}/10"
                                }
                                Text(dropText, fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Emerald500)
                            }
                            Column {
                                Text("Top Trigger", fontSize = 11.sp, color = TextMuted)
                                val topTrig = analytics.urgeAnalytics.topTriggers.firstOrNull()?.first ?: "None"
                                Text(topTrig, fontSize = 13.sp, fontWeight = FontWeight.Bold, color = TextPrimary)
                            }
                        }

                        if (analytics.urgeAnalytics.topSomaticSensations.isNotEmpty()) {
                            Spacer(modifier = Modifier.height(8.dp))
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text("Body Interoception: ", fontSize = 11.sp, color = TextMuted)
                                Text(
                                    text = analytics.urgeAnalytics.topSomaticSensations.take(2).joinToString(", ") { "${it.first} (${it.second})" },
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.SemiBold,
                                    color = AmberGold
                                )
                            }
                        }
                    }
                }
            }

        } else {
            // VIEW B: 30-DAY HEATMAP, ACHIEVEMENTS & 10-SLOT BACKUPS
            item {
                Text(
                    text = "30-Day Activity Heatmap",
                    fontSize = 15.sp,
                    fontWeight = FontWeight.Bold,
                    color = TextPrimary
                )
                Spacer(modifier = Modifier.height(8.dp))

                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = SurfaceCardVariant)
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        Text(
                            text = "Consistency compounds into destiny",
                            fontSize = 11.sp,
                            color = TextMuted
                        )
                        Spacer(modifier = Modifier.height(10.dp))

                        Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                            repeat(4) { week ->
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    repeat(7) { day ->
                                        val isFilled = (week * 7 + day) % 3 != 1
                                        Box(
                                            modifier = Modifier
                                                .size(24.dp)
                                                .clip(RoundedCornerShape(4.dp))
                                                .background(
                                                    if (isFilled) Emerald500.copy(alpha = 0.7f + (day % 3) * 0.1f)
                                                    else Emerald900
                                                )
                                        )
                                    }
                                }
                            }
                        }
                    }
                }
            }

            // Achievements / Awards
            item {
                Spacer(modifier = Modifier.height(16.dp))
                Text(
                    text = "Milestones & Achievements",
                    fontSize = 15.sp,
                    fontWeight = FontWeight.Bold,
                    color = TextPrimary
                )
                Spacer(modifier = Modifier.height(8.dp))
            }

            items(awards.size) { index ->
                val award = awards[index]
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 4.dp),
                    shape = RoundedCornerShape(14.dp),
                    colors = CardDefaults.cardColors(
                        containerColor = if (award.unlocked) SurfaceCard else Emerald900.copy(alpha = 0.5f)
                    ),
                    border = CardDefaults.outlinedCardBorder().copy(
                        brush = androidx.compose.ui.graphics.SolidColor(if (award.unlocked) AmberGold.copy(alpha = 0.5f) else LineBorder)
                    )
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(12.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Box(
                            modifier = Modifier
                                .size(38.dp)
                                .clip(CircleShape)
                                .background(if (award.unlocked) AmberGold.copy(alpha = 0.2f) else SurfaceCardVariant),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(text = if (award.unlocked) award.emoji else "🔒", fontSize = 18.sp)
                        }

                        Spacer(modifier = Modifier.width(12.dp))

                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = award.title,
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Bold,
                                color = if (award.unlocked) TextPrimary else TextMuted
                            )
                            Text(
                                text = award.desc,
                                fontSize = 11.sp,
                                color = if (award.unlocked) TextSecondary else TextMuted
                            )
                        }

                        if (award.unlocked) {
                            Text(text = "UNLOCKED", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = AmberGold)
                        }
                    }
                }
            }

            // Privacy & PIN Lock Protection Card (Phase 3, Feature 12)
            item {
                Spacer(modifier = Modifier.height(16.dp))
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("privacy_pin_card"),
                    shape = RoundedCornerShape(18.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                    border = CardDefaults.outlinedCardBorder().copy(
                        brush = androidx.compose.ui.graphics.SolidColor(
                            if (state.pinLockEnabled) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.outline
                        )
                    )
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Box(
                                    modifier = Modifier
                                        .size(36.dp)
                                        .clip(CircleShape)
                                        .background(MaterialTheme.colorScheme.primaryContainer),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Text(text = if (state.pinLockEnabled) "🔐" else "🔓", fontSize = 18.sp)
                                }
                                Spacer(modifier = Modifier.width(10.dp))
                                Column {
                                    Text(
                                        text = "Privacy & PIN Protection",
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 15.sp,
                                        color = MaterialTheme.colorScheme.onSurface
                                    )
                                    Text(
                                        text = if (state.pinLockEnabled) "4-Digit PIN active • Sensitive data locked" else "No PIN configured • Unlocked",
                                        fontSize = 11.sp,
                                        color = if (state.pinLockEnabled) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurfaceVariant
                                    )
                                }
                            }

                            Button(
                                onClick = { viewModel.showPinSettingsDialog.value = true },
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = if (state.pinLockEnabled) MaterialTheme.colorScheme.primary else WarmAmberGold,
                                    contentColor = androidx.compose.ui.graphics.Color.White
                                ),
                                shape = RoundedCornerShape(10.dp),
                                contentPadding = PaddingValues(horizontal = 12.dp, vertical = 4.dp),
                                modifier = Modifier.height(34.dp)
                            ) {
                                Text(
                                    text = if (state.pinLockEnabled) "Configure" else "Setup PIN",
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 11.sp
                                )
                            }
                        }

                        if (state.pinLockEnabled) {
                            Spacer(modifier = Modifier.height(10.dp))
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                if (state.lockJournal) {
                                    Surface(
                                        shape = RoundedCornerShape(8.dp),
                                        color = MaterialTheme.colorScheme.surfaceVariant
                                    ) {
                                        Text(
                                            text = "✍️ Journal Locked",
                                            fontSize = 10.sp,
                                            fontWeight = FontWeight.SemiBold,
                                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                                        )
                                    }
                                }
                                if (state.lockUrges) {
                                    Surface(
                                        shape = RoundedCornerShape(8.dp),
                                        color = MaterialTheme.colorScheme.surfaceVariant
                                    ) {
                                        Text(
                                            text = "🌊 Urges Locked",
                                            fontSize = 10.sp,
                                            fontWeight = FontWeight.SemiBold,
                                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                                        )
                                    }
                                }
                                if (state.lockAppLaunch) {
                                    Surface(
                                        shape = RoundedCornerShape(8.dp),
                                        color = MaterialTheme.colorScheme.surfaceVariant
                                    ) {
                                        Text(
                                            text = "📱 App Launch Locked",
                                            fontSize = 10.sp,
                                            fontWeight = FontWeight.SemiBold,
                                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                                        )
                                    }
                                }
                            }
                        }
                    }
                }
            }

            // 10-Slot Rolling Backup Manager with 'CONFIRM' Guard
            item {
                Spacer(modifier = Modifier.height(20.dp))
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(18.dp),
                    colors = CardDefaults.cardColors(containerColor = SurfaceCard),
                    border = CardDefaults.outlinedCardBorder().copy(brush = androidx.compose.ui.graphics.SolidColor(LineBorder))
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column {
                                Text(
                                    text = "💾 10-Slot Rolling Backups",
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 15.sp,
                                    color = TextPrimary
                                )
                                Text(
                                    text = "${state.snapshots.size} of 10 slots filled",
                                    fontSize = 11.sp,
                                    color = TextMuted
                                )
                            }

                            Button(
                                onClick = { viewModel.createBackupSnapshot("Snapshot #${state.snapshots.size + 1}") },
                                colors = ButtonDefaults.buttonColors(containerColor = Emerald600),
                                shape = RoundedCornerShape(10.dp),
                                contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp),
                                modifier = Modifier
                                    .height(32.dp)
                                    .testTag("btn_create_snapshot")
                            ) {
                                Text("+ Save Slot", color = TextPrimary, fontWeight = FontWeight.Bold, fontSize = 11.sp)
                            }
                        }

                        Spacer(modifier = Modifier.height(10.dp))

                        // Visual 10-slot strip
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(4.dp)
                        ) {
                            repeat(10) { slotIdx ->
                                val isOccupied = slotIdx < state.snapshots.size
                                Box(
                                    modifier = Modifier
                                        .weight(1f)
                                        .height(6.dp)
                                        .clip(RoundedCornerShape(3.dp))
                                        .background(if (isOccupied) TealAccent else SurfaceCardVariant)
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(12.dp))

                        if (state.snapshots.isEmpty()) {
                            Text(
                                text = "No local snapshots saved yet. Tap '+ Save Slot' to capture current state.",
                                color = TextMuted,
                                fontSize = 12.sp,
                                modifier = Modifier.padding(vertical = 4.dp)
                            )
                        } else {
                            state.snapshots.forEach { snap ->
                                SnapshotRow(
                                    snapshot = snap,
                                    onRestore = { viewModel.promptRestoreSnapshot(snap) },
                                    onDelete = { viewModel.deleteSnapshot(snap.id) }
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(14.dp))

                        // Danger Zone: Anti-Wipe Reset
                        Button(
                            onClick = { viewModel.showResetHeroDialog.value = true },
                            colors = ButtonDefaults.buttonColors(containerColor = DangerRed.copy(alpha = 0.15f)),
                            border = androidx.compose.foundation.BorderStroke(1.dp, DangerRed.copy(alpha = 0.5f)),
                            shape = RoundedCornerShape(10.dp),
                            modifier = Modifier
                                .fillMaxWidth()
                                .testTag("btn_reset_hero_danger")
                        ) {
                            Text("🚨 Erase All Data & Reset (Requires 'RESET HERO')", color = DangerRed, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun SnapshotRow(
    snapshot: BackupSnapshot,
    onRestore: () -> Unit,
    onDelete: () -> Unit
) {
    val dateFormatted = remember(snapshot.timestamp) {
        val sdf = SimpleDateFormat("MMM d, HH:mm", Locale.US)
        sdf.format(Date(snapshot.timestamp))
    }

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp)
            .clip(RoundedCornerShape(10.dp))
            .background(SurfaceCardVariant)
            .padding(horizontal = 10.dp, vertical = 8.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Column(modifier = Modifier.weight(1f)) {
            Text(text = snapshot.label, fontSize = 12.sp, fontWeight = FontWeight.Bold, color = TextPrimary)
            Text(
                text = "$dateFormatted • Lv.${snapshot.level} • ${snapshot.xp} XP • ${snapshot.skillsCount} skills",
                fontSize = 10.sp,
                color = TextSecondary
            )
        }

        Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
            Button(
                onClick = onRestore,
                shape = RoundedCornerShape(8.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Emerald600),
                contentPadding = PaddingValues(horizontal = 8.dp, vertical = 2.dp),
                modifier = Modifier.height(28.dp)
            ) {
                Text("Restore", fontSize = 10.sp, color = TextPrimary, fontWeight = FontWeight.Bold)
            }

            IconButton(
                onClick = onDelete,
                modifier = Modifier.size(28.dp)
            ) {
                Text("✕", fontSize = 12.sp, color = DangerRed)
            }
        }
    }
}

@Immutable
data class AwardItem(
    val title: String,
    val desc: String,
    val unlocked: Boolean,
    val emoji: String
)

@Composable
fun MetricBox(label: String, value: String, emoji: String, modifier: Modifier = Modifier) {
    Card(
        modifier = modifier,
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        border = CardDefaults.outlinedCardBorder().copy(
            brush = androidx.compose.ui.graphics.SolidColor(MaterialTheme.colorScheme.outline)
        )
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 10.dp, horizontal = 6.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(text = emoji, fontSize = 16.sp)
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = value,
                fontSize = 13.sp,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onSurface,
                style = TabularNumberStyle
            )
            Text(
                text = label,
                fontSize = 10.sp,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                fontWeight = FontWeight.Medium
            )
        }
    }
}
