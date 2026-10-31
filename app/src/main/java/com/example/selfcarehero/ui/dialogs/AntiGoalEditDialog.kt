package com.example.selfcarehero.ui.dialogs

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.selfcarehero.model.AntiGoalItem
import com.example.selfcarehero.ui.theme.*
import com.example.selfcarehero.ui.viewmodel.SelfCareViewModel
import java.util.UUID

@Composable
fun AntiGoalEditDialog(
    item: AntiGoalItem?,
    viewModel: SelfCareViewModel,
    onDismiss: () -> Unit
) {
    val isEditing = item != null
    var name by remember { mutableStateOf(item?.name ?: "") }
    var icon by remember { mutableStateOf(item?.icon ?: "🚫") }
    var category by remember { mutableStateOf(item?.category ?: "digital") }
    var triggerCue by remember { mutableStateOf(item?.triggerCue ?: "") }
    var replacementAction by remember { mutableStateOf(item?.replacementAction ?: "") }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Text(
                text = if (isEditing) "Edit Anti-Goal" else "Add Anti-Goal Boundary",
                fontWeight = FontWeight.Bold,
                color = TextPrimary
            )
        },
        text = {
            Column(
                modifier = Modifier.fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                OutlinedTextField(
                    value = name,
                    onValueChange = { name = it },
                    label = { Text("Behavior to Avoid") },
                    placeholder = { Text("e.g. No phone in bed before sleep") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth().testTag("input_anti_goal_name")
                )

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    OutlinedTextField(
                        value = icon,
                        onValueChange = { icon = it },
                        label = { Text("Emoji") },
                        singleLine = true,
                        modifier = Modifier.width(70.dp).testTag("input_anti_goal_icon")
                    )

                    // Category chips
                    Row(
                        modifier = Modifier.weight(1f),
                        horizontalArrangement = Arrangement.spacedBy(4.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        listOf("digital" to "Digital", "health" to "Health", "mindset" to "Mindset").forEach { (key, label) ->
                            FilterChip(
                                selected = category == key,
                                onClick = { category = key },
                                label = { Text(label, fontSize = 11.sp) },
                                modifier = Modifier.height(36.dp)
                            )
                        }
                    }
                }

                OutlinedTextField(
                    value = triggerCue,
                    onValueChange = { triggerCue = it },
                    label = { Text("Trigger / Vulnerable Cue") },
                    placeholder = { Text("e.g. Late-night boredom, 3 PM energy crash") },
                    modifier = Modifier.fillMaxWidth().testTag("input_anti_goal_trigger")
                )

                OutlinedTextField(
                    value = replacementAction,
                    onValueChange = { replacementAction = it },
                    label = { Text("Healthy Replacement Habit") },
                    placeholder = { Text("e.g. Read 5 pages, drink sparkling water") },
                    modifier = Modifier.fillMaxWidth().testTag("input_anti_goal_replace")
                )
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    if (name.isNotBlank()) {
                        val saved = item?.copy(
                            name = name.trim(),
                            icon = icon.ifBlank { "🚫" },
                            category = category,
                            triggerCue = triggerCue.trim(),
                            replacementAction = replacementAction.trim()
                        ) ?: AntiGoalItem(
                            id = "ag_${UUID.randomUUID().toString().take(6)}",
                            name = name.trim(),
                            icon = icon.ifBlank { "🚫" },
                            category = category,
                            triggerCue = triggerCue.trim(),
                            replacementAction = replacementAction.trim()
                        )
                        viewModel.saveAntiGoal(saved)
                    }
                },
                colors = ButtonDefaults.buttonColors(
                    containerColor = MaterialTheme.colorScheme.primary,
                    contentColor = androidx.compose.ui.graphics.Color.White
                ),
                shape = androidx.compose.foundation.shape.RoundedCornerShape(12.dp),
                modifier = Modifier.testTag("btn_save_anti_goal")
            ) {
                Text("Save", color = androidx.compose.ui.graphics.Color.White, fontWeight = FontWeight.SemiBold)
            }
        },
        dismissButton = {
            Row(verticalAlignment = Alignment.CenterVertically) {
                if (isEditing && item != null) {
                    IconButton(
                        onClick = { viewModel.deleteAntiGoal(item.id) },
                        modifier = Modifier.testTag("btn_delete_anti_goal")
                    ) {
                        Icon(Icons.Default.Delete, contentDescription = "Delete", tint = Color.Red.copy(alpha = 0.8f))
                    }
                }
                TextButton(onClick = onDismiss) {
                    Text("Cancel")
                }
            }
        }
    )
}
