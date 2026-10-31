package com.example.selfcarehero.ui.dialogs

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.example.selfcarehero.model.DateUtils
import com.example.selfcarehero.model.RoadmapStep
import com.example.selfcarehero.ui.theme.SageGreenPrimary
import com.example.selfcarehero.ui.viewmodel.SelfCareViewModel
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

@Composable
fun RoadmapStepDialog(
    step: RoadmapStep?,
    goalId: String,
    parentId: String?,
    viewModel: SelfCareViewModel,
    onDismiss: () -> Unit
) {
    var title by remember { mutableStateOf(step?.title ?: "") }
    var description by remember { mutableStateOf(step?.description ?: "") }
    var plannedDate by remember { mutableStateOf(step?.plannedDate ?: DateUtils.todayStr()) }
    var sessionTime by remember { mutableStateOf(step?.sessionTime ?: "09:00") }
    var durationMinutes by remember { mutableStateOf(step?.durationMinutes?.toString() ?: "25") }
    var notes by remember { mutableStateOf(step?.notes ?: "") }
    var errorMessage by remember { mutableStateOf<String?>(null) }

    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Surface(
            modifier = Modifier
                .fillMaxWidth(0.92f)
                .fillMaxHeight(0.80f)
                .testTag("dialog_roadmap_step"),
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
                            text = if (step != null) "Edit Milestone / Prerequisite" else "Add Milestone / Prerequisite",
                            fontSize = 17.sp,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                        Text(
                            text = "A concrete prerequisite step required for mastery",
                            fontSize = 12.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                    IconButton(onClick = onDismiss) {
                        Text("✕", fontSize = 16.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))

                Column(
                    modifier = Modifier
                        .weight(1f)
                        .verticalScroll(rememberScrollState())
                ) {
                    OutlinedTextField(
                        value = title,
                        onValueChange = {
                            title = it
                            errorMessage = null
                        },
                        label = { Text("Milestone Title *") },
                        placeholder = { Text("e.g. Understand Byte-Pair Encoding merges") },
                        modifier = Modifier.fillMaxWidth().testTag("input_step_title"),
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

                    OutlinedTextField(
                        value = description,
                        onValueChange = { description = it },
                        label = { Text("Prerequisite Details / Exercise") },
                        placeholder = { Text("Specific reading, lab exercise, or proof of work") },
                        modifier = Modifier.fillMaxWidth(),
                        maxLines = 3
                    )

                    Spacer(modifier = Modifier.height(10.dp))

                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        OutlinedTextField(
                            value = plannedDate,
                            onValueChange = { plannedDate = it },
                            label = { Text("Date (YYYY-MM-DD)") },
                            modifier = Modifier.weight(1f),
                            singleLine = true
                        )
                        OutlinedTextField(
                            value = sessionTime,
                            onValueChange = { sessionTime = it },
                            label = { Text("Time (HH:mm)") },
                            modifier = Modifier.weight(1f),
                            singleLine = true
                        )
                    }

                    Spacer(modifier = Modifier.height(8.dp))

                    OutlinedTextField(
                        value = durationMinutes,
                        onValueChange = { durationMinutes = it.filter { c -> c.isDigit() } },
                        label = { Text("Session Duration (minutes)") },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true
                    )

                    Spacer(modifier = Modifier.height(12.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text("Milestone Notes & Key Takeaways", fontSize = 13.sp, fontWeight = FontWeight.SemiBold, color = MaterialTheme.colorScheme.onSurface)
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
                        placeholder = { Text("Write notes, formula reminders, or synthesis...") },
                        modifier = Modifier.fillMaxWidth().heightIn(min = 90.dp),
                        maxLines = 6
                    )
                }

                Spacer(modifier = Modifier.height(12.dp))

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
                            val stepToSave = RoadmapStep(
                                id = step?.id ?: "step_${System.currentTimeMillis()}",
                                parentId = parentId ?: step?.parentId,
                                goalId = goalId,
                                title = title.trim(),
                                description = description.trim(),
                                plannedDate = plannedDate.ifBlank { null },
                                sessionTime = sessionTime.ifBlank { null },
                                durationMinutes = durationMinutes.toIntOrNull(),
                                tagIds = step?.tagIds ?: emptyList(),
                                notes = notes.trim(),
                                isCompleted = step?.isCompleted ?: false,
                                order = step?.order ?: 0,
                                createdAt = step?.createdAt ?: System.currentTimeMillis(),
                                updatedAt = System.currentTimeMillis()
                            )
                            viewModel.saveRoadmapStep(stepToSave)
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = SageGreenPrimary),
                        modifier = Modifier.testTag("btn_save_step")
                    ) {
                        Text(if (step != null) "Update Milestone" else "Save Milestone", fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}
