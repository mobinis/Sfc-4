package com.example.selfcarehero.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.selfcarehero.model.AlertItem
import com.example.selfcarehero.ui.theme.*
import com.example.selfcarehero.ui.viewmodel.SelfCareViewModel

@Composable
fun AlertsScreen(
    viewModel: SelfCareViewModel,
    modifier: Modifier = Modifier
) {
    val state by viewModel.state.collectAsState()

    Scaffold(
        modifier = modifier.fillMaxSize(),
        containerColor = MaterialTheme.colorScheme.background,
        floatingActionButton = {
            FloatingActionButton(
                onClick = { viewModel.showAddAlertDialog.value = true },
                containerColor = WarmAmberGold,
                contentColor = androidx.compose.ui.graphics.Color(0xFF121413),
                shape = CircleShape,
                elevation = FloatingActionButtonDefaults.elevation(defaultElevation = 6.dp),
                modifier = Modifier
                    .padding(bottom = 76.dp)
                    .size(56.dp)
                    .testTag("fab_add_alert")
            ) {
                Text(text = "+", fontSize = 28.sp, fontWeight = FontWeight.Bold)
            }
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(horizontal = 16.dp),
            contentPadding = PaddingValues(top = 8.dp, bottom = 130.dp)
        ) {
            item {
                Text(
                    text = "Smart Alarms & Reminders",
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onBackground
                )
                Text(
                    text = "Custom multi-time schedules, chained follow-ups & linked skill XP",
                    fontSize = 12.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                Spacer(modifier = Modifier.height(16.dp))
            }

            if (state.rm.isEmpty()) {
                item {
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(top = 30.dp),
                        shape = RoundedCornerShape(20.dp),
                        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                        border = CardDefaults.outlinedCardBorder().copy(
                            brush = Brush.linearGradient(
                                listOf(MaterialTheme.colorScheme.outline, MaterialTheme.colorScheme.outline)
                            )
                        )
                    ) {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(24.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Text(text = "🔔", fontSize = 36.sp)
                            Spacer(modifier = Modifier.height(8.dp))
                            Text(
                                text = "No Smart Reminders Yet",
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.onSurface,
                                fontSize = 16.sp
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = "Set multi-time schedules like 1:00 AM then 3:00 AM water, or 10:00 PM reading with +3h chained follow-up.",
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                                fontSize = 12.sp,
                                lineHeight = 17.sp,
                                textAlign = androidx.compose.ui.text.style.TextAlign.Center
                            )
                            Spacer(modifier = Modifier.height(16.dp))
                            Button(
                                onClick = { viewModel.showAddAlertDialog.value = true },
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = MaterialTheme.colorScheme.primary,
                                    contentColor = MaterialTheme.colorScheme.onPrimary
                                ),
                                modifier = Modifier.height(48.dp)
                            ) {
                                Text("+ Create First Reminder", fontWeight = FontWeight.Bold)
                            }
                        }
                    }
                }
            } else {
                items(state.rm, key = { it.id }) { alert ->
                    AlertItemCard(
                        alert = alert,
                        viewModel = viewModel,
                        modifier = Modifier.padding(vertical = 6.dp)
                    )
                }
            }
        }
    }
}

@Composable
fun AlertItemCard(
    alert: AlertItem,
    viewModel: SelfCareViewModel,
    modifier: Modifier = Modifier
) {
    val effectiveTimes = alert.allEffectiveTimes()
    val repeatSummary = when (alert.repeatRule) {
        "daily" -> "Every Day 🌟"
        "weekdays" -> "Weekdays (Mon-Fri) 💼"
        "weekends" -> "Weekends (Sat-Sun) 🏖️"
        else -> {
            val dNames = listOf("Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat")
            alert.days.mapNotNull { dNames.getOrNull(it) }.joinToString(", ")
        }
    }

    Card(
        modifier = modifier
            .fillMaxWidth()
            .testTag("alert_card_${alert.id}"),
        shape = RoundedCornerShape(18.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        border = CardDefaults.outlinedCardBorder().copy(
            brush = Brush.linearGradient(
                listOf(MaterialTheme.colorScheme.outline, MaterialTheme.colorScheme.outline)
            )
        )
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(14.dp)
        ) {
            // Top Row: Icon, Title, and Toggle/Delete
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
                            .size(44.dp)
                            .clip(CircleShape)
                            .background(
                                if (alert.active) MaterialTheme.colorScheme.primaryContainer
                                else MaterialTheme.colorScheme.surfaceVariant
                            ),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(text = alert.icon, fontSize = 20.sp)
                    }

                    Spacer(modifier = Modifier.width(12.dp))

                    Column {
                        Text(
                            text = alert.n,
                            fontWeight = FontWeight.Bold,
                            fontSize = 15.sp,
                            color = if (alert.active) MaterialTheme.colorScheme.onSurface else MaterialTheme.colorScheme.onSurfaceVariant
                        )
                        Text(
                            text = repeatSummary,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Medium,
                            color = MaterialTheme.colorScheme.secondary
                        )
                    }
                }

                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    Switch(
                        checked = alert.active,
                        onCheckedChange = { viewModel.toggleAlert(alert.id) },
                        colors = SwitchDefaults.colors(
                            checkedThumbColor = MaterialTheme.colorScheme.onPrimary,
                            checkedTrackColor = MaterialTheme.colorScheme.primary
                        ),
                        modifier = Modifier.testTag("toggle_alert_${alert.id}")
                    )

                    IconButton(
                        onClick = { viewModel.deleteAlert(alert.id) },
                        modifier = Modifier
                            .minimumInteractiveComponentSize()
                            .size(48.dp)
                    ) {
                        Text(text = "✕", color = MaterialTheme.colorScheme.error, fontSize = 16.sp, fontWeight = FontWeight.Bold)
                    }
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            // Multi-Time Badges Row (with horizontal scroll for narrow viewports)
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .horizontalScroll(rememberScrollState()),
                horizontalArrangement = Arrangement.spacedBy(6.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                effectiveTimes.forEach { timeStr ->
                    Surface(
                        shape = RoundedCornerShape(8.dp),
                        color = if (alert.active) MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.6f) else MaterialTheme.colorScheme.surfaceVariant,
                        border = androidx.compose.foundation.BorderStroke(
                            1.dp,
                            if (alert.active) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.outline
                        )
                    ) {
                        Text(
                            text = "⏰ $timeStr",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                            color = if (alert.active) MaterialTheme.colorScheme.onSurface else MaterialTheme.colorScheme.onSurfaceVariant,
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                            style = TabularNumberStyle
                        )
                    }
                }

                if (alert.chainedOffsetMinutes != null) {
                    val hours = alert.chainedOffsetMinutes / 60
                    val mins = alert.chainedOffsetMinutes % 60
                    val offsetLabel = if (mins == 0) "+${hours}h chain" else "+${hours}h ${mins}m chain"
                    Surface(
                        shape = RoundedCornerShape(8.dp),
                        color = MaterialTheme.colorScheme.secondaryContainer.copy(alpha = 0.5f),
                        border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.secondary)
                    ) {
                        Text(
                            text = "⚡ $offsetLabel",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = MaterialTheme.colorScheme.onSecondaryContainer,
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                        )
                    }
                }
            }

            // Linked Skill or Medicine Sub-Bar with 1-Tap Action
            Spacer(modifier = Modifier.height(10.dp))
            HorizontalDivider(color = MaterialTheme.colorScheme.outline.copy(alpha = 0.5f))
            Spacer(modifier = Modifier.height(8.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.weight(1f)
                ) {
                    if (!alert.skillName.isNullOrBlank()) {
                        Text(
                            text = "🔗 ${alert.skillName} (+15 XP)",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = MaterialTheme.colorScheme.primary
                        )
                    } else if (alert.type == "medicine" && alert.pillsCount != null) {
                        val isLow = alert.pillsCount <= (alert.pillsLowThreshold ?: 5)
                        Text(
                            text = "💊 Supply: ${alert.pillsCount} pills left" + if (isLow) " (Refill soon!)" else "",
                            fontSize = 12.sp,
                            color = if (isLow) MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.onSurfaceVariant,
                            fontWeight = if (isLow) FontWeight.Bold else FontWeight.Normal
                        )
                    } else {
                        Text(
                            text = "Stand-alone gentle notification",
                            fontSize = 11.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }

                Button(
                    onClick = { viewModel.markAlertDone(alert.id) },
                    colors = ButtonDefaults.buttonColors(
                        containerColor = if (alert.active) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surfaceVariant,
                        contentColor = if (alert.active) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurfaceVariant
                    ),
                    contentPadding = PaddingValues(horizontal = 14.dp, vertical = 6.dp),
                    modifier = Modifier
                        .height(44.dp)
                        .testTag("btn_mark_done_${alert.id}")
                ) {
                    Text(
                        text = if (!alert.skillName.isNullOrBlank()) "✓ Complete & Log" else "✓ Log Done",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }
    }
}
