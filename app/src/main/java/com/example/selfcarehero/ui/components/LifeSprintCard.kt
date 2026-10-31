package com.example.selfcarehero.ui.components

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.Flag
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
import com.example.selfcarehero.model.DateUtils
import com.example.selfcarehero.ui.theme.*
import com.example.selfcarehero.ui.viewmodel.SelfCareViewModel
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import kotlin.math.max

@Composable
fun LifeSprintCard(
    viewModel: SelfCareViewModel,
    modifier: Modifier = Modifier
) {
    val state by viewModel.state.collectAsState()
    val sprint = state.activeSprint ?: return

    // Calculate days elapsed
    val daysElapsed = remember(sprint.startDateStr) {
        try {
            val sdf = SimpleDateFormat("yyyy-MM-dd", Locale.US)
            val start = sdf.parse(sprint.startDateStr) ?: Date()
            val now = Date()
            val diffMs = now.time - start.time
            max(1, (diffMs / (1000 * 60 * 60 * 24)).toInt() + 1)
        } catch (_: Exception) {
            1
        }
    }

    val progressFraction = (daysElapsed.toFloat() / sprint.totalDays.toFloat()).coerceIn(0f, 1f)
    val animatedProgress by animateFloatAsState(targetValue = progressFraction, label = "sprint_progress")

    Card(
        shape = RoundedCornerShape(18.dp),
        colors = CardDefaults.cardColors(containerColor = WarmSurface800),
        border = CardDefaults.outlinedCardBorder().copy(
            brush = androidx.compose.ui.graphics.SolidColor(ForestSage700)
        ),
        modifier = modifier
            .fillMaxWidth()
            .padding(vertical = 6.dp)
            .testTag("life_sprint_card")
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(14.dp)
        ) {
            // Header Row: Title & Sprint Day Badge & Edit
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text("🚀", fontSize = 18.sp)
                    Spacer(modifier = Modifier.width(8.dp))
                    Column {
                        Text(
                            text = "90-Day Life Sprint",
                            fontWeight = FontWeight.Bold,
                            fontSize = 14.sp,
                            color = TextPrimary
                        )
                        Text(
                            text = sprint.title,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = WarmAmberLight
                        )
                    }
                }

                Row(verticalAlignment = Alignment.CenterVertically) {
                    Surface(
                        shape = RoundedCornerShape(8.dp),
                        color = WarmSurface700,
                        border = androidx.compose.foundation.BorderStroke(1.dp, WarmBorder)
                    ) {
                        Text(
                            text = "Day $daysElapsed / ${sprint.totalDays}",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = ForestSage400,
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
                        )
                    }

                    Spacer(modifier = Modifier.width(4.dp))

                    IconButton(
                        onClick = { viewModel.openEditSprintGoal() },
                        modifier = Modifier.size(32.dp).testTag("btn_edit_sprint_goal")
                    ) {
                        Icon(
                            Icons.Default.Edit,
                            contentDescription = "Edit Sprint",
                            modifier = Modifier.size(15.dp),
                            tint = TextMuted
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            // Progress Bar
            Column(modifier = Modifier.fillMaxWidth()) {
                LinearProgressIndicator(
                    progress = { animatedProgress },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(8.dp)
                        .clip(RoundedCornerShape(4.dp)),
                    color = WarmAmberGold,
                    trackColor = WarmCharcoal950
                )
                Spacer(modifier = Modifier.height(4.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(
                        text = "Quarter Progress: ${(progressFraction * 100).toInt()}%",
                        fontSize = 10.sp,
                        color = TextMuted
                    )
                    Text(
                        text = "${max(0, sprint.totalDays - daysElapsed)} days remaining",
                        fontSize = 10.sp,
                        color = TextMuted
                    )
                }
            }

            // Identity Compass Affirmation Box
            if (sprint.identityStatement.isNotBlank()) {
                Spacer(modifier = Modifier.height(10.dp))
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(10.dp))
                        .background(ForestSage900.copy(alpha = 0.5f))
                        .border(1.dp, ForestSage700, RoundedCornerShape(10.dp))
                        .padding(horizontal = 12.dp, vertical = 8.dp)
                ) {
                    Column {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text("🌱", fontSize = 11.sp)
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(
                                text = "CORE IDENTITY COMPASS",
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Bold,
                                color = ForestSage400
                            )
                        }
                        Spacer(modifier = Modifier.height(2.dp))
                        Text(
                            text = "“${sprint.identityStatement}”",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Medium,
                            color = TextPrimary
                        )
                    }
                }
            }

            // Key Milestones Preview
            if (sprint.keyMilestones.isNotEmpty()) {
                Spacer(modifier = Modifier.height(10.dp))
                val currentMilestone = sprint.keyMilestones.getOrNull(sprint.currentMilestoneIdx)
                val allDone = sprint.currentMilestoneIdx >= sprint.keyMilestones.size

                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(10.dp))
                        .background(WarmCharcoal950)
                        .padding(horizontal = 10.dp, vertical = 8.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(
                        modifier = Modifier.weight(1f),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = if (allDone) "🏆" else "🎯",
                            fontSize = 14.sp
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Column {
                            Text(
                                text = if (allDone) "All Milestones Reached!" else "Milestone ${sprint.currentMilestoneIdx + 1} of ${sprint.keyMilestones.size}",
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Bold,
                                color = ForestSage400
                            )
                            Text(
                                text = currentMilestone ?: "Sprint targets accomplished",
                                fontSize = 12.sp,
                                color = TextPrimary,
                                maxLines = 1
                            )
                        }
                    }

                    if (!allDone) {
                        Button(
                            onClick = { viewModel.advanceSprintMilestone() },
                            colors = ButtonDefaults.buttonColors(
                                containerColor = MaterialTheme.colorScheme.primary,
                                contentColor = androidx.compose.ui.graphics.Color.White
                            ),
                            shape = RoundedCornerShape(12.dp),
                            contentPadding = PaddingValues(horizontal = 10.dp, vertical = 2.dp),
                            modifier = Modifier.height(30.dp).testTag("btn_complete_milestone")
                        ) {
                            Icon(Icons.Default.Check, contentDescription = null, modifier = Modifier.size(14.dp), tint = androidx.compose.ui.graphics.Color.White)
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(
                                text = "Done (+15 🥕)",
                                fontSize = 10.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = androidx.compose.ui.graphics.Color.White
                            )
                        }
                    }
                }
            }
        }
    }
}
