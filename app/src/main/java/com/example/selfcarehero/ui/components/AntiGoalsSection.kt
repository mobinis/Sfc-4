package com.example.selfcarehero.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.selfcarehero.model.AntiGoalItem
import com.example.selfcarehero.model.DateUtils
import com.example.selfcarehero.ui.theme.*
import com.example.selfcarehero.ui.viewmodel.SelfCareViewModel

@Composable
fun AntiGoalsSection(
    viewModel: SelfCareViewModel,
    modifier: Modifier = Modifier
) {
    val state by viewModel.state.collectAsState()
    val today = DateUtils.todayStr()

    Card(
        shape = RoundedCornerShape(18.dp),
        colors = CardDefaults.cardColors(containerColor = WarmCharcoal950),
        border = CardDefaults.outlinedCardBorder().copy(
            brush = androidx.compose.ui.graphics.SolidColor(WarmBorder)
        ),
        modifier = modifier
            .fillMaxWidth()
            .padding(vertical = 6.dp)
            .testTag("anti_goals_section_card")
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(14.dp)
        ) {
            // Header
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text("🛡️", fontSize = 18.sp)
                    Spacer(modifier = Modifier.width(8.dp))
                    Column {
                        Text(
                            text = "Anti-Goals & Dopamine Shield",
                            fontWeight = FontWeight.Bold,
                            fontSize = 14.sp,
                            color = TextPrimary
                        )
                        Text(
                            text = "Not-to-do list: What you avoid builds your future",
                            fontSize = 11.sp,
                            color = TextMuted
                        )
                    }
                }

                TextButton(
                    onClick = { viewModel.openEditAntiGoal(null) },
                    contentPadding = PaddingValues(horizontal = 8.dp, vertical = 2.dp),
                    modifier = Modifier.height(30.dp).testTag("btn_add_anti_goal")
                ) {
                    Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(16.dp), tint = WarmAmberLight)
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Add", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = WarmAmberLight)
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            if (state.antiGoals.isEmpty()) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(10.dp))
                        .background(WarmSurface800)
                        .padding(12.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "No anti-goals set. Tap '+ Add' to establish an avoidance boundary.",
                        fontSize = 12.sp,
                        color = TextMuted
                    )
                }
            } else {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    state.antiGoals.forEach { antiGoal ->
                        AntiGoalCardItem(
                            item = antiGoal,
                            isCleanToday = antiGoal.lastCleanDate == today && antiGoal.slipsCountToday == 0,
                            onMarkClean = { viewModel.markAntiGoalClean(antiGoal.id) },
                            onLogSlip = { viewModel.logAntiGoalSlip(antiGoal.id) },
                            onEdit = { viewModel.openEditAntiGoal(antiGoal) }
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun AntiGoalCardItem(
    item: AntiGoalItem,
    isCleanToday: Boolean,
    onMarkClean: () -> Unit,
    onLogSlip: () -> Unit,
    onEdit: () -> Unit
) {
    Card(
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = WarmSurface800),
        border = CardDefaults.outlinedCardBorder().copy(
            brush = androidx.compose.ui.graphics.SolidColor(
                if (isCleanToday) ForestSage600 else WarmBorder
            )
        ),
        modifier = Modifier.fillMaxWidth().testTag("anti_goal_item_${item.id}")
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(10.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(
                    modifier = Modifier.weight(1f),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(item.icon, fontSize = 20.sp)
                    Spacer(modifier = Modifier.width(8.dp))
                    Column {
                        Text(
                            text = item.name,
                            fontWeight = FontWeight.Bold,
                            fontSize = 13.sp,
                            color = TextPrimary
                        )
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(
                                text = "🔥 ${item.cleanStreakDays}d clean",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = WarmAmberGold
                            )
                            if (item.slipsCountToday > 0) {
                                Spacer(modifier = Modifier.width(6.dp))
                                Text(
                                    text = "• Slipped today",
                                    fontSize = 11.sp,
                                    color = Color(0xFFE57373)
                                )
                            }
                        }
                    }
                }

                IconButton(
                    onClick = onEdit,
                    modifier = Modifier.size(32.dp).testTag("btn_edit_anti_goal_${item.id}")
                ) {
                    Icon(
                        Icons.Default.Edit,
                        contentDescription = "Edit boundary",
                        modifier = Modifier.size(15.dp),
                        tint = TextMuted
                    )
                }
            }

            if (item.triggerCue.isNotBlank() || item.replacementAction.isNotBlank()) {
                Spacer(modifier = Modifier.height(6.dp))
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(8.dp))
                        .background(WarmSurface700)
                        .padding(horizontal = 8.dp, vertical = 5.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    if (item.triggerCue.isNotBlank()) {
                        Text(
                            text = "⚡ Cue: ${item.triggerCue}",
                            fontSize = 10.sp,
                            color = TextSecondary,
                            maxLines = 1,
                            modifier = Modifier.weight(1f)
                        )
                    }
                    if (item.replacementAction.isNotBlank()) {
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = "🌱 Replace: ${item.replacementAction}",
                            fontSize = 10.sp,
                            color = ForestSage400,
                            maxLines = 1,
                            modifier = Modifier.weight(1f)
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Action row: Clean vs Slipped
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                if (isCleanToday) {
                    Surface(
                        shape = RoundedCornerShape(8.dp),
                        color = ForestSage900,
                        border = androidx.compose.foundation.BorderStroke(1.dp, ForestSage600),
                        modifier = Modifier.weight(1f).height(36.dp)
                    ) {
                        Row(
                            modifier = Modifier.fillMaxSize(),
                            horizontalArrangement = Arrangement.Center,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(Icons.Default.Check, contentDescription = null, modifier = Modifier.size(16.dp), tint = ForestSage400)
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("Clean Today (+5 coins)", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = ForestSage400)
                        }
                    }
                } else {
                    Button(
                        onClick = onMarkClean,
                        shape = RoundedCornerShape(12.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = MaterialTheme.colorScheme.primary,
                            contentColor = androidx.compose.ui.graphics.Color.White
                        ),
                        contentPadding = PaddingValues(horizontal = 8.dp, vertical = 0.dp),
                        modifier = Modifier.weight(1.3f).height(36.dp).testTag("btn_mark_clean_${item.id}")
                    ) {
                        Icon(Icons.Default.Check, contentDescription = null, tint = androidx.compose.ui.graphics.Color.White, modifier = Modifier.size(15.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Log Clean Today", color = androidx.compose.ui.graphics.Color.White, fontSize = 11.sp, fontWeight = FontWeight.SemiBold)
                    }

                    OutlinedButton(
                        onClick = onLogSlip,
                        shape = RoundedCornerShape(8.dp),
                        colors = ButtonDefaults.outlinedButtonColors(contentColor = Color(0xFFEF9A9A)),
                        border = ButtonDefaults.outlinedButtonBorder.copy(
                            brush = androidx.compose.ui.graphics.SolidColor(Color(0xFF8C3838))
                        ),
                        contentPadding = PaddingValues(horizontal = 8.dp, vertical = 0.dp),
                        modifier = Modifier.weight(0.9f).height(36.dp).testTag("btn_log_slip_${item.id}")
                    ) {
                        Text("Slipped", fontSize = 11.sp, fontWeight = FontWeight.SemiBold)
                    }
                }
            }
        }
    }
}
