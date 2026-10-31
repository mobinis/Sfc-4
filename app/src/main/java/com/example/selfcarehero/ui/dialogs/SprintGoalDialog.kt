package com.example.selfcarehero.ui.dialogs

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.selfcarehero.model.DateUtils
import com.example.selfcarehero.model.LifeSprintGoal
import com.example.selfcarehero.ui.theme.*
import com.example.selfcarehero.ui.viewmodel.SelfCareViewModel

@Composable
fun SprintGoalDialog(
    goal: LifeSprintGoal?,
    viewModel: SelfCareViewModel,
    onDismiss: () -> Unit
) {
    val current = goal ?: LifeSprintGoal(startDateStr = DateUtils.todayStr())
    var title by remember { mutableStateOf(current.title) }
    var identityStatement by remember { mutableStateOf(current.identityStatement) }
    var totalDays by remember { mutableIntStateOf(current.totalDays) }
    var milestones by remember { mutableStateOf(current.keyMilestones) }
    var newMilestoneText by remember { mutableStateOf("") }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Text(
                text = "Edit 90-Day Sprint & Identity",
                fontWeight = FontWeight.Bold,
                color = TextPrimary
            )
        },
        text = {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .heightIn(max = 420.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                OutlinedTextField(
                    value = title,
                    onValueChange = { title = it },
                    label = { Text("Sprint Focus Title") },
                    placeholder = { Text("e.g. Build Core Fitness & Launch Project") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth().testTag("input_sprint_title")
                )

                OutlinedTextField(
                    value = identityStatement,
                    onValueChange = { identityStatement = it },
                    label = { Text("Core Identity Statement") },
                    placeholder = { Text("e.g. I am the kind of person who shows up every day.") },
                    modifier = Modifier.fillMaxWidth().testTag("input_sprint_identity")
                )

                Text(
                    text = "Key Milestones (${milestones.size})",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    color = ForestSage400
                )

                LazyColumn(
                    modifier = Modifier
                        .fillMaxWidth()
                        .weight(1f, fill = false),
                    verticalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    itemsIndexed(milestones) { index, item ->
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text(
                                text = "${index + 1}. $item",
                                fontSize = 12.sp,
                                color = TextPrimary,
                                modifier = Modifier.weight(1f)
                            )
                            IconButton(
                                onClick = {
                                    milestones = milestones.filterIndexed { i, _ -> i != index }
                                },
                                modifier = Modifier.size(28.dp)
                            ) {
                                Icon(Icons.Default.Delete, contentDescription = "Delete milestone", modifier = Modifier.size(15.dp), tint = TextMuted)
                            }
                        }
                    }
                }

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    OutlinedTextField(
                        value = newMilestoneText,
                        onValueChange = { newMilestoneText = it },
                        placeholder = { Text("New milestone...", fontSize = 12.sp) },
                        singleLine = true,
                        modifier = Modifier.weight(1f).testTag("input_new_milestone")
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    IconButton(
                        onClick = {
                            if (newMilestoneText.isNotBlank()) {
                                milestones = milestones + newMilestoneText.trim()
                                newMilestoneText = ""
                            }
                        },
                        modifier = Modifier.size(40.dp)
                    ) {
                        Icon(Icons.Default.Add, contentDescription = "Add milestone", tint = WarmAmberGold)
                    }
                }
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    val updated = current.copy(
                        title = title.ifBlank { "90-Day Sprint" },
                        identityStatement = identityStatement.trim(),
                        totalDays = totalDays,
                        keyMilestones = if (milestones.isEmpty()) listOf("Show up consistently") else milestones
                    )
                    viewModel.saveSprintGoal(updated)
                },
                colors = ButtonDefaults.buttonColors(
                    containerColor = MaterialTheme.colorScheme.primary,
                    contentColor = androidx.compose.ui.graphics.Color.White
                ),
                shape = SageButtonShape,
                modifier = Modifier.testTag("btn_save_sprint_goal")
            ) {
                Text("Save", color = androidx.compose.ui.graphics.Color.White, fontWeight = FontWeight.SemiBold)
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel")
            }
        }
    )
}
