package com.example.selfcarehero.ui.components

import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
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
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.selfcarehero.model.RoadmapGoal
import com.example.selfcarehero.model.RoadmapStep
import com.example.selfcarehero.model.RoadmapTag
import com.example.selfcarehero.ui.theme.*
import com.example.selfcarehero.ui.viewmodel.SelfCareViewModel

@Composable
fun FutureLearningRoadmapSection(
    viewModel: SelfCareViewModel,
    modifier: Modifier = Modifier
) {
    val state by viewModel.state.collectAsState()
    var searchQuery by remember { mutableStateOf("") }
    var selectedTagId by remember { mutableStateOf("all") }
    var expandedGoalIds by remember { mutableStateOf(state.roadmapGoals.map { it.id }.toSet()) }

    // Synchronize newly added goals to be expanded
    LaunchedEffect(state.roadmapGoals.size) {
        expandedGoalIds = expandedGoalIds + state.roadmapGoals.map { it.id }.toSet()
    }

    val filteredGoals = remember(state.roadmapGoals, searchQuery, selectedTagId) {
        state.roadmapGoals.filter { goal ->
            val matchesQuery = searchQuery.isBlank() ||
                goal.title.contains(searchQuery, ignoreCase = true) ||
                goal.description.contains(searchQuery, ignoreCase = true) ||
                goal.notes.contains(searchQuery, ignoreCase = true)
            val matchesTag = selectedTagId == "all" || goal.tagIds.contains(selectedTagId)
            matchesQuery && matchesTag
        }
    }

    val totalGoalsCount = state.roadmapGoals.size
    val totalStepsCount = state.roadmapSteps.size
    val completedStepsCount = state.roadmapSteps.count { it.isCompleted }
    val overallProgress = if (totalStepsCount > 0) completedStepsCount.toFloat() / totalStepsCount else 0f

    Column(modifier = modifier.fillMaxWidth()) {
        // Summary KPI Banner
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f))
        ) {
            Column(modifier = Modifier.fillMaxWidth().padding(14.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(
                            text = "🎯 Future Learning Roadmap",
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                        Text(
                            text = "$totalGoalsCount Goals • $completedStepsCount/$totalStepsCount Milestones Completed",
                            fontSize = 12.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                    Button(
                        onClick = { viewModel.openCreateRoadmapGoal() },
                        colors = ButtonDefaults.buttonColors(containerColor = WarmAmberGold, contentColor = Color(0xFF121413)),
                        contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp),
                        modifier = Modifier.height(34.dp).testTag("btn_add_roadmap_goal")
                    ) {
                        Text("+ New Goal", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))
                LinearProgressIndicator(
                    progress = { overallProgress },
                    modifier = Modifier.fillMaxWidth().height(6.dp).clip(CircleShape),
                    color = SageGreenPrimary,
                    trackColor = MaterialTheme.colorScheme.surfaceVariant
                )
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // Search bar
        OutlinedTextField(
            value = searchQuery,
            onValueChange = { searchQuery = it },
            placeholder = { Text("Search learning goals or milestones...") },
            modifier = Modifier.fillMaxWidth().height(52.dp),
            singleLine = true,
            shape = RoundedCornerShape(12.dp)
        )

        Spacer(modifier = Modifier.height(8.dp))

        // Tag Filter Chips
        Row(
            modifier = Modifier.fillMaxWidth().horizontalScroll(rememberScrollState()),
            horizontalArrangement = Arrangement.spacedBy(6.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            FilterChip(
                selected = selectedTagId == "all",
                onClick = { selectedTagId = "all" },
                label = { Text("All Goals", fontSize = 11.sp) }
            )
            state.roadmapTags.forEach { tag ->
                val isSelected = selectedTagId == tag.id
                FilterChip(
                    selected = isSelected,
                    onClick = { selectedTagId = if (isSelected) "all" else tag.id },
                    label = { Text(tag.name, fontSize = 11.sp) }
                )
            }
            TextButton(
                onClick = { viewModel.showRoadmapTagDialog.value = true },
                contentPadding = PaddingValues(horizontal = 6.dp, vertical = 2.dp)
            ) {
                Text("⚙️ Tags", fontSize = 11.sp, color = SageGreenPrimary)
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // Goals List
        if (filteredGoals.isEmpty()) {
            Card(
                modifier = Modifier.fillMaxWidth().padding(vertical = 16.dp),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
            ) {
                Column(
                    modifier = Modifier.fillMaxWidth().padding(24.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text("🌱", fontSize = 36.sp)
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = if (searchQuery.isNotBlank() || selectedTagId != "all") "No goals match your search filter." else "No future learning goals saved yet.",
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Medium,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "Structure your deep learning with prerequisites, target dates, and rich notes.",
                        fontSize = 12.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        textAlign = androidx.compose.ui.text.style.TextAlign.Center
                    )
                    Spacer(modifier = Modifier.height(14.dp))
                    Button(
                        onClick = { viewModel.openCreateRoadmapGoal() },
                        colors = ButtonDefaults.buttonColors(containerColor = SageGreenPrimary)
                    ) {
                        Text("+ Add First Learning Goal", fontWeight = FontWeight.Bold)
                    }
                }
            }
        } else {
            filteredGoals.forEach { goal ->
                RoadmapGoalCard(
                    goal = goal,
                    allSteps = state.roadmapSteps.filter { it.goalId == goal.id },
                    allTags = state.roadmapTags,
                    isExpanded = expandedGoalIds.contains(goal.id),
                    onToggleExpand = {
                        expandedGoalIds = if (expandedGoalIds.contains(goal.id)) {
                            expandedGoalIds - goal.id
                        } else {
                            expandedGoalIds + goal.id
                        }
                    },
                    viewModel = viewModel
                )
                Spacer(modifier = Modifier.height(12.dp))
            }
        }
    }
}

@Composable
fun RoadmapGoalCard(
    goal: RoadmapGoal,
    allSteps: List<RoadmapStep>,
    allTags: List<RoadmapTag>,
    isExpanded: Boolean,
    onToggleExpand: () -> Unit,
    viewModel: SelfCareViewModel
) {
    val completedCount = allSteps.count { it.isCompleted }
    val progress = if (allSteps.isNotEmpty()) completedCount.toFloat() / allSteps.size else 0f
    val percentText = (progress * 100).toInt()

    val priorityColor = when (goal.priority) {
        "urgent" -> Color(0xFFEF4444)
        "high" -> Color(0xFFF97316)
        "medium" -> WarmAmberGold
        else -> SageGreenPrimary
    }

    Card(
        modifier = Modifier.fillMaxWidth().testTag("goal_card_${goal.id}"),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(modifier = Modifier.fillMaxWidth().padding(14.dp)) {
            // Header Row
            Row(
                modifier = Modifier.fillMaxWidth().clickable { onToggleExpand() },
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.Top
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(4.dp))
                                .background(priorityColor.copy(alpha = 0.2f))
                                .padding(horizontal = 6.dp, vertical = 2.dp)
                        ) {
                            Text(
                                text = goal.priority.uppercase(),
                                fontSize = 9.sp,
                                fontWeight = FontWeight.Bold,
                                color = priorityColor
                            )
                        }
                        Spacer(modifier = Modifier.width(6.dp))
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(4.dp))
                                .background(MaterialTheme.colorScheme.surfaceVariant)
                                .padding(horizontal = 6.dp, vertical = 2.dp)
                        ) {
                            Text(
                                text = goal.status.replace("_", " ").uppercase(),
                                fontSize = 9.sp,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(6.dp))

                    Text(
                        text = goal.title,
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onSurface
                    )

                    if (goal.description.isNotBlank()) {
                        Spacer(modifier = Modifier.height(2.dp))
                        Text(
                            text = goal.description,
                            fontSize = 12.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            maxLines = if (isExpanded) 10 else 2,
                            overflow = TextOverflow.Ellipsis
                        )
                    }
                }

                Text(
                    text = if (isExpanded) "▲" else "▼",
                    fontSize = 12.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    modifier = Modifier.padding(start = 8.dp, top = 4.dp)
                )
            }

            Spacer(modifier = Modifier.height(10.dp))

            // Progress bar
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                LinearProgressIndicator(
                    progress = { progress },
                    modifier = Modifier.weight(1f).height(6.dp).clip(CircleShape),
                    color = SageGreenPrimary,
                    trackColor = MaterialTheme.colorScheme.surfaceVariant
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = "$completedCount/${allSteps.size} ($percentText%)",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = MaterialTheme.colorScheme.onSurface
                )
            }

            // Schedule & Tags Row
            Spacer(modifier = Modifier.height(8.dp))
            Row(
                modifier = Modifier.fillMaxWidth().horizontalScroll(rememberScrollState()),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                if (!goal.plannedStartDate.isNullOrBlank()) {
                    Text(
                        text = "🗓️ Start: ${goal.plannedStartDate}",
                        fontSize = 11.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
                if (!goal.targetCompletionDate.isNullOrBlank()) {
                    Text(
                        text = "🎯 Target: ${goal.targetCompletionDate}",
                        fontSize = 11.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
                if (!goal.sessionTime.isNullOrBlank()) {
                    Text(
                        text = "⏰ ${goal.sessionTime} (${goal.estimatedDurationMinutes ?: 30}m)",
                        fontSize = 11.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
                goal.tagIds.forEach { tagId ->
                    val tag = allTags.firstOrNull { it.id == tagId }
                    if (tag != null) {
                        val tColor = try {
                            Color(android.graphics.Color.parseColor(tag.color))
                        } catch (_: Exception) {
                            SageGreenPrimary
                        }
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(4.dp))
                                .background(tColor.copy(alpha = 0.15f))
                                .padding(horizontal = 6.dp, vertical = 2.dp)
                        ) {
                            Text(tag.name, fontSize = 10.sp, color = tColor, fontWeight = FontWeight.Medium)
                        }
                    }
                }
            }

            // Expanded Milestones & Controls
            AnimatedVisibility(visible = isExpanded) {
                Column(modifier = Modifier.fillMaxWidth().padding(top = 12.dp)) {
                    HorizontalDivider(modifier = Modifier.padding(bottom = 10.dp))

                    // Goal Notes (if any)
                    if (goal.notes.isNotBlank()) {
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(8.dp))
                                .background(MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.4f))
                                .padding(10.dp)
                        ) {
                            Column {
                                Text("📝 Notes & Insights:", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = SageGreenPrimary)
                                Spacer(modifier = Modifier.height(2.dp))
                                Text(goal.notes, fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurface)
                            }
                        }
                        Spacer(modifier = Modifier.height(10.dp))
                    }

                    // Milestones Subtree
                    Text(
                        text = "Prerequisite Milestones (${allSteps.size})",
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                    Spacer(modifier = Modifier.height(6.dp))

                    if (allSteps.isEmpty()) {
                        Text(
                            text = "No prerequisite milestones added. Break this goal down into steps!",
                            fontSize = 12.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    } else {
                        allSteps.sortedBy { it.order }.forEach { step ->
                            RoadmapStepItem(
                                step = step,
                                onToggle = { viewModel.toggleRoadmapStep(step.id) },
                                onEdit = { viewModel.openEditRoadmapStep(step) },
                                onDelete = { viewModel.deleteRoadmapStep(step.id) }
                            )
                            Spacer(modifier = Modifier.height(6.dp))
                        }
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    // Actions Row
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        OutlinedButton(
                            onClick = { viewModel.openCreateRoadmapStep(goal.id) },
                            contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp),
                            modifier = Modifier.height(32.dp)
                        ) {
                            Text("+ Add Milestone", fontSize = 11.sp)
                        }

                        Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                            TextButton(
                                onClick = { viewModel.openEditRoadmapGoal(goal) },
                                contentPadding = PaddingValues(horizontal = 8.dp, vertical = 4.dp),
                                modifier = Modifier.height(32.dp)
                            ) {
                                Text("✏️ Edit", fontSize = 11.sp)
                            }
                            TextButton(
                                onClick = { viewModel.deleteRoadmapGoal(goal.id) },
                                contentPadding = PaddingValues(horizontal = 8.dp, vertical = 4.dp),
                                modifier = Modifier.height(32.dp)
                            ) {
                                Text("🗑️ Delete", fontSize = 11.sp, color = MaterialTheme.colorScheme.error)
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun RoadmapStepItem(
    step: RoadmapStep,
    onToggle: () -> Unit,
    onEdit: () -> Unit,
    onDelete: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(8.dp))
            .background(if (step.isCompleted) SageGreenPrimary.copy(alpha = 0.08f) else MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.35f))
            .clickable { onToggle() }
            .padding(horizontal = 10.dp, vertical = 8.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Checkbox(
            checked = step.isCompleted,
            onCheckedChange = { onToggle() },
            colors = CheckboxDefaults.colors(checkedColor = SageGreenPrimary),
            modifier = Modifier.size(24.dp)
        )
        Spacer(modifier = Modifier.width(10.dp))
        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = step.title,
                fontSize = 13.sp,
                fontWeight = if (step.isCompleted) FontWeight.Normal else FontWeight.Medium,
                textDecoration = if (step.isCompleted) TextDecoration.LineThrough else TextDecoration.None,
                color = if (step.isCompleted) MaterialTheme.colorScheme.onSurfaceVariant else MaterialTheme.colorScheme.onSurface
            )
            if (step.description.isNotBlank()) {
                Text(
                    text = step.description,
                    fontSize = 11.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
            if (!step.plannedDate.isNullOrBlank() || !step.sessionTime.isNullOrBlank()) {
                Text(
                    text = "🗓️ ${step.plannedDate ?: ""} ${step.sessionTime ?: ""} (${step.durationMinutes ?: 25}m)",
                    fontSize = 10.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
        IconButton(onClick = onEdit, modifier = Modifier.size(26.dp)) {
            Text("✏️", fontSize = 11.sp)
        }
        IconButton(onClick = onDelete, modifier = Modifier.size(26.dp)) {
            Text("✕", fontSize = 12.sp, color = MaterialTheme.colorScheme.error)
        }
    }
}
