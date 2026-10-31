package com.example.selfcarehero.ui.dialogs

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
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
import com.example.selfcarehero.model.RoadmapGoal
import com.example.selfcarehero.ui.theme.*
import com.example.selfcarehero.ui.viewmodel.SelfCareViewModel
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

@Composable
fun RoadmapGoalDialog(
    goal: RoadmapGoal?,
    viewModel: SelfCareViewModel,
    onDismiss: () -> Unit
) {
    val state by viewModel.state.collectAsState()
    var title by remember { mutableStateOf(goal?.title ?: "") }
    var description by remember { mutableStateOf(goal?.description ?: "") }
    var plannedStartDate by remember { mutableStateOf(goal?.plannedStartDate ?: DateUtils.todayStr()) }
    var targetCompletionDate by remember { mutableStateOf(goal?.targetCompletionDate ?: "") }
    var sessionTime by remember { mutableStateOf(goal?.sessionTime ?: "09:00") }
    var estimatedDurationMinutes by remember { mutableStateOf(goal?.estimatedDurationMinutes?.toString() ?: "30") }
    var priority by remember { mutableStateOf(goal?.priority ?: "medium") }
    var status by remember { mutableStateOf(goal?.status ?: "planned") }
    var selectedTagIds by remember { mutableStateOf(goal?.tagIds?.toSet() ?: emptySet()) }
    var notes by remember { mutableStateOf(goal?.notes ?: "") }
    var errorMessage by remember { mutableStateOf<String?>(null) }

    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Surface(
            modifier = Modifier
                .fillMaxWidth(0.92f)
                .fillMaxHeight(0.88f)
                .testTag("dialog_roadmap_goal"),
            shape = RoundedCornerShape(20.dp),
            color = MaterialTheme.colorScheme.surface,
            tonalElevation = 8.dp
        ) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(20.dp)
            ) {
                // Header
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(
                            text = if (goal != null) "Edit Learning Goal" else "New Future Learning Goal",
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                        Text(
                            text = "Schedule mastery goals and prerequisite milestones",
                            fontSize = 12.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                    IconButton(onClick = onDismiss) {
                        Text("✕", fontSize = 16.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))

                // Scrollable Form
                Column(
                    modifier = Modifier
                        .weight(1f)
                        .verticalScroll(rememberScrollState())
                ) {
                    // Title Input
                    OutlinedTextField(
                        value = title,
                        onValueChange = {
                            title = it
                            errorMessage = null
                        },
                        label = { Text("Goal Title *") },
                        placeholder = { Text("e.g. Master Neural Quantization & Edge AI") },
                        modifier = Modifier.fillMaxWidth().testTag("input_goal_title"),
                        singleLine = true,
                        isError = errorMessage != null
                    )

                    if (errorMessage != null) {
                        Text(
                            text = errorMessage ?: "",
                            color = MaterialTheme.colorScheme.error,
                            fontSize = 12.sp,
                            modifier = Modifier.padding(start = 4.dp, top = 4.dp)
                        )
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    // Description
                    OutlinedTextField(
                        value = description,
                        onValueChange = { description = it },
                        label = { Text("Description / Scope") },
                        placeholder = { Text("Core objective, outcomes, and motivation") },
                        modifier = Modifier.fillMaxWidth(),
                        maxLines = 3
                    )

                    Spacer(modifier = Modifier.height(12.dp))

                    // Priority Selector
                    Text("Priority", fontSize = 13.sp, fontWeight = FontWeight.SemiBold, color = MaterialTheme.colorScheme.onSurface)
                    Spacer(modifier = Modifier.height(6.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth().horizontalScroll(rememberScrollState()),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        listOf(
                            "low" to "🟢 Low",
                            "medium" to "🟡 Medium",
                            "high" to "🟠 High",
                            "urgent" to "🔴 Urgent"
                        ).forEach { (pKey, pLabel) ->
                            val isSelected = priority == pKey
                            FilterChip(
                                selected = isSelected,
                                onClick = { priority = pKey },
                                label = { Text(pLabel, fontSize = 12.sp) },
                                colors = FilterChipDefaults.filterChipColors(
                                    selectedContainerColor = MaterialTheme.colorScheme.primaryContainer,
                                    selectedLabelColor = MaterialTheme.colorScheme.onPrimaryContainer
                                )
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    // Status Selector
                    Text("Status", fontSize = 13.sp, fontWeight = FontWeight.SemiBold, color = MaterialTheme.colorScheme.onSurface)
                    Spacer(modifier = Modifier.height(6.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth().horizontalScroll(rememberScrollState()),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        listOf(
                            "planned" to "🗓️ Planned",
                            "in_progress" to "⚡ In Progress",
                            "paused" to "⏸️ Paused",
                            "completed" to "✅ Completed"
                        ).forEach { (sKey, sLabel) ->
                            val isSelected = status == sKey
                            FilterChip(
                                selected = isSelected,
                                onClick = { status = sKey },
                                label = { Text(sLabel, fontSize = 12.sp) }
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    // Schedule Dates & Times
                    Text("Schedule & Calendar", fontSize = 13.sp, fontWeight = FontWeight.SemiBold, color = MaterialTheme.colorScheme.onSurface)
                    Spacer(modifier = Modifier.height(6.dp))
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        OutlinedTextField(
                            value = plannedStartDate,
                            onValueChange = { plannedStartDate = it },
                            label = { Text("Start (YYYY-MM-DD)") },
                            modifier = Modifier.weight(1f),
                            singleLine = true
                        )
                        OutlinedTextField(
                            value = targetCompletionDate,
                            onValueChange = { targetCompletionDate = it },
                            label = { Text("Target Completion") },
                            placeholder = { Text("Optional") },
                            modifier = Modifier.weight(1f),
                            singleLine = true
                        )
                    }

                    Spacer(modifier = Modifier.height(8.dp))

                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        OutlinedTextField(
                            value = sessionTime,
                            onValueChange = { sessionTime = it },
                            label = { Text("Time (HH:mm)") },
                            modifier = Modifier.weight(1f),
                            singleLine = true
                        )
                        OutlinedTextField(
                            value = estimatedDurationMinutes,
                            onValueChange = { estimatedDurationMinutes = it.filter { char -> char.isDigit() } },
                            label = { Text("Duration (min)") },
                            modifier = Modifier.weight(1f),
                            singleLine = true
                        )
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    // Tags Selection
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text("Tags", fontSize = 13.sp, fontWeight = FontWeight.SemiBold, color = MaterialTheme.colorScheme.onSurface)
                        TextButton(onClick = { viewModel.showRoadmapTagDialog.value = true }) {
                            Text("+ Manage Tags", fontSize = 11.sp, color = SageGreenPrimary)
                        }
                    }
                    if (state.roadmapTags.isEmpty()) {
                        Text("No tags created yet. Tap '+ Manage Tags' to add tags.", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    } else {
                        Row(
                            modifier = Modifier.fillMaxWidth().horizontalScroll(rememberScrollState()),
                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            state.roadmapTags.forEach { tag ->
                                val isSelected = selectedTagIds.contains(tag.id)
                                FilterChip(
                                    selected = isSelected,
                                    onClick = {
                                        selectedTagIds = if (isSelected) selectedTagIds - tag.id else selectedTagIds + tag.id
                                    },
                                    label = { Text(tag.name, fontSize = 11.sp) }
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    // Personal Notes with Timestamp Action
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text("Personal Notes & Study Insights", fontSize = 13.sp, fontWeight = FontWeight.SemiBold, color = MaterialTheme.colorScheme.onSurface)
                        OutlinedButton(
                            onClick = {
                                val sdf = SimpleDateFormat("[yyyy-MM-dd HH:mm] ", Locale.US)
                                val stamp = sdf.format(Date())
                                notes = if (notes.isBlank()) stamp else "$notes\n$stamp"
                            },
                            contentPadding = PaddingValues(horizontal = 8.dp, vertical = 2.dp),
                            modifier = Modifier.height(28.dp)
                        ) {
                            Text("⏱️ + Insert Stamp", fontSize = 11.sp)
                        }
                    }
                    Spacer(modifier = Modifier.height(4.dp))
                    OutlinedTextField(
                        value = notes,
                        onValueChange = { notes = it },
                        placeholder = { Text("Log observations, breakthrough insights, or study logs...") },
                        modifier = Modifier.fillMaxWidth().heightIn(min = 100.dp),
                        maxLines = 8
                    )
                }

                Spacer(modifier = Modifier.height(12.dp))

                // Footer Actions
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.End,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    TextButton(onClick = onDismiss) {
                        Text("Cancel")
                    }
                    Spacer(modifier = Modifier.width(8.dp))
                    Button(
                        onClick = {
                            if (title.isBlank()) {
                                errorMessage = "Title cannot be empty"
                                return@Button
                            }
                            val goalToSave = RoadmapGoal(
                                id = goal?.id ?: "goal_${System.currentTimeMillis()}",
                                title = title.trim(),
                                description = description.trim(),
                                plannedStartDate = plannedStartDate.ifBlank { null },
                                targetCompletionDate = targetCompletionDate.ifBlank { null },
                                sessionTime = sessionTime.ifBlank { null },
                                estimatedDurationMinutes = estimatedDurationMinutes.toIntOrNull(),
                                priority = priority,
                                status = status,
                                tagIds = selectedTagIds.toList(),
                                notes = notes.trim(),
                                createdAt = goal?.createdAt ?: System.currentTimeMillis(),
                                updatedAt = System.currentTimeMillis()
                            )
                            viewModel.saveRoadmapGoal(goalToSave)
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = SageGreenPrimary),
                        modifier = Modifier.testTag("btn_save_goal")
                    ) {
                        Text(if (goal != null) "Update Goal" else "Save Goal", fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}
