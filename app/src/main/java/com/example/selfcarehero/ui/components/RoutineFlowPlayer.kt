package com.example.selfcarehero.ui.components

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.selfcarehero.model.NodeItem
import com.example.selfcarehero.model.RoutineFlow
import com.example.selfcarehero.model.RoutineStep
import com.example.selfcarehero.ui.theme.*
import com.example.selfcarehero.ui.viewmodel.SelfCareViewModel
import kotlinx.coroutines.delay
import java.util.UUID

/**
 * Sequential step-by-step RoutineFlowPlayer composable.
 * Supports morning, focus, and evening rituals, with full step customizability.
 */
@Composable
fun RoutineFlowPlayer(
    initialRoutine: RoutineFlow,
    viewModel: SelfCareViewModel,
    onClose: () -> Unit,
    modifier: Modifier = Modifier
) {
    val state by viewModel.state.collectAsState()
    var currentRoutine by remember(initialRoutine.id) {
        mutableStateOf(state.routines.firstOrNull { it.id == initialRoutine.id } ?: initialRoutine)
    }

    var isCustomizing by remember { mutableStateOf(false) }
    var currentStepIndex by remember(currentRoutine.id) { mutableIntStateOf(0) }

    val currentStep = currentRoutine.steps.getOrElse(currentStepIndex) {
        currentRoutine.steps.firstOrNull() ?: RoutineStep("empty", "No Steps", 60)
    }

    var secondsLeft by remember(currentRoutine.id, currentStepIndex) {
        mutableIntStateOf(currentStep.durationSeconds)
    }
    var isRunning by remember { mutableStateOf(true) }

    // Countdown Timer Loop
    LaunchedEffect(currentStepIndex, isRunning, secondsLeft, isCustomizing) {
        if (!isCustomizing && isRunning && secondsLeft > 0) {
            delay(1000L)
            secondsLeft -= 1
        }
    }

    val progress = if (currentStep.durationSeconds > 0) {
        (secondsLeft.toFloat() / currentStep.durationSeconds.toFloat()).coerceIn(0f, 1f)
    } else 0f
    val animatedProgress by animateFloatAsState(targetValue = progress, label = "routine_step_progress")

    // Step dialog state for customizer
    var editingStep by remember { mutableStateOf<RoutineStep?>(null) }
    var isCreatingNewStep by remember { mutableStateOf(false) }

    fun completeCurrentStep() {
        // Auto-increment linked habit if present
        currentStep.linkedHabitId?.let { habitId ->
            viewModel.incrementHabit(habitId)
        }
        viewModel.awardDirectXp(10, "Step: ${currentStep.name}")

        if (currentStepIndex < currentRoutine.steps.size - 1) {
            currentStepIndex += 1
            secondsLeft = currentRoutine.steps[currentStepIndex].durationSeconds
            isRunning = true
        } else {
            // Completed all steps in the routine!
            viewModel.awardDirectXp(30, "Completed Routine: ${currentRoutine.name}")
            viewModel.triggerCelebration(
                title = "Routine Complete! 🎯",
                subtitle = "Completed ${currentRoutine.name}. +40 Total XP awarded!"
            )
            onClose()
        }
    }

    Card(
        shape = RoundedCornerShape(24.dp),
        colors = CardDefaults.cardColors(containerColor = WarmCharcoal950),
        modifier = modifier
            .fillMaxWidth()
            .border(1.dp, WarmBorder, RoundedCornerShape(24.dp))
            .testTag("routine_flow_player_card")
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(20.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Header: Routine switcher chips & customizer toggle
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(currentRoutine.icon, fontSize = 24.sp)
                    Spacer(modifier = Modifier.width(8.dp))
                    Column {
                        Text(
                            text = currentRoutine.name,
                            fontWeight = FontWeight.Bold,
                            fontSize = 16.sp,
                            color = TextPrimary
                        )
                        Text(
                            text = if (isCustomizing) "Customization Mode" else "Step ${currentStepIndex + 1} of ${currentRoutine.steps.size}",
                            fontSize = 12.sp,
                            color = if (isCustomizing) WarmAmberGold else TextMuted
                        )
                    }
                }

                Row(verticalAlignment = Alignment.CenterVertically) {
                    // Customize Toggle Button
                    IconButton(
                        onClick = { isCustomizing = !isCustomizing },
                        modifier = Modifier.testTag("routine_toggle_customize_button")
                    ) {
                        Icon(
                            imageVector = if (isCustomizing) Icons.Default.Check else Icons.Default.Edit,
                            contentDescription = if (isCustomizing) "Done Customizing" else "Customize Routine",
                            tint = if (isCustomizing) WarmAmberGold else TextMuted
                        )
                    }

                    IconButton(
                        onClick = onClose,
                        modifier = Modifier.testTag("routine_close_button")
                    ) {
                        Icon(Icons.Default.Close, contentDescription = "Close", tint = TextMuted)
                    }
                }
            }

            // Routine Switcher Tabs (Morning, Focus, Evening, etc.)
            Spacer(modifier = Modifier.height(12.dp))
            LazyRow(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(state.routines) { routine ->
                    val isSelected = routine.id == currentRoutine.id
                    FilterChip(
                        selected = isSelected,
                        onClick = {
                            currentRoutine = routine
                            currentStepIndex = 0
                            secondsLeft = routine.steps.firstOrNull()?.durationSeconds ?: 60
                            isRunning = true
                        },
                        label = { Text("${routine.icon} ${routine.name}", fontSize = 12.sp) },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = ForestSage700,
                            selectedLabelColor = TextPrimary,
                            containerColor = WarmSurface800,
                            labelColor = TextMuted
                        ),
                        border = FilterChipDefaults.filterChipBorder(
                            enabled = true,
                            selected = isSelected,
                            borderColor = if (isSelected) WarmAmberGold else WarmBorder
                        )
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            if (!isCustomizing) {
                // NORMAL SEQUENTIAL RUNNER VIEW

                // Sequential Step Sequence Bar
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 4.dp),
                    horizontalArrangement = Arrangement.spacedBy(6.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    currentRoutine.steps.forEachIndexed { idx, step ->
                        val isDone = idx < currentStepIndex
                        val isCurrent = idx == currentStepIndex
                        Box(
                            modifier = Modifier
                                .weight(1f)
                                .height(6.dp)
                                .clip(RoundedCornerShape(3.dp))
                                .background(
                                    when {
                                        isDone -> ForestSage400
                                        isCurrent -> WarmAmberGold
                                        else -> WarmSurface700
                                    }
                                )
                        )
                    }
                }

                Spacer(modifier = Modifier.height(20.dp))

                // Central Countdown Ring
                Box(
                    modifier = Modifier
                        .size(190.dp)
                        .clip(CircleShape)
                        .background(WarmSurface800)
                        .border(4.dp, ForestSage700, CircleShape),
                    contentAlignment = Alignment.Center
                ) {
                    CircularProgressIndicator(
                        progress = { animatedProgress },
                        modifier = Modifier.fillMaxSize(),
                        strokeWidth = 6.dp,
                        color = WarmAmberGold,
                        trackColor = Color.Transparent
                    )

                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(
                            text = currentStep.icon,
                            fontSize = 32.sp
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        val mins = secondsLeft / 60
                        val secs = secondsLeft % 60
                        Text(
                            text = String.format("%02d:%02d", mins, secs),
                            fontSize = 34.sp,
                            fontWeight = FontWeight.ExtraBold,
                            color = if (secondsLeft == 0) WarmAmberLight else TextPrimary
                        )
                        Text(
                            text = if (isRunning) "ACTIVE" else "PAUSED",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = ForestSage400
                        )
                    }
                }

                Spacer(modifier = Modifier.height(20.dp))

                // Step Name & Guidance
                Text(
                    text = currentStep.name,
                    fontWeight = FontWeight.Bold,
                    fontSize = 18.sp,
                    color = TextPrimary,
                    textAlign = TextAlign.Center
                )

                if (currentStep.linkedHabitId != null) {
                    val habit = state.nodes.firstOrNull { it.id == currentStep.linkedHabitId }
                    if (habit != null) {
                        Spacer(modifier = Modifier.height(4.dp))
                        Surface(
                            shape = RoundedCornerShape(8.dp),
                            color = ForestSage900,
                            border = androidx.compose.foundation.BorderStroke(1.dp, ForestSage600)
                        ) {
                            Text(
                                text = "Linked: ${habit.e} ${habit.n}",
                                fontSize = 11.sp,
                                color = WarmAmberLight,
                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 2.dp)
                            )
                        }
                    }
                }

                if (currentStep.guidanceNote.isNotBlank()) {
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        text = currentStep.guidanceNote,
                        fontSize = 13.sp,
                        color = TextSecondary,
                        textAlign = TextAlign.Center,
                        modifier = Modifier.padding(horizontal = 12.dp)
                    )
                }

                // Next upcoming preview card
                if (currentStepIndex < currentRoutine.steps.size - 1) {
                    val nextStep = currentRoutine.steps[currentStepIndex + 1]
                    Spacer(modifier = Modifier.height(14.dp))
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(12.dp))
                            .background(WarmSurface700)
                            .padding(horizontal = 12.dp, vertical = 8.dp)
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text("Next: ", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = TextMuted)
                            Text("${nextStep.icon} ${nextStep.name}", fontSize = 12.sp, color = TextSecondary)
                        }
                    }
                }

                Spacer(modifier = Modifier.height(24.dp))

                // Control Buttons: Previous, +1m, Play/Pause, Skip, Complete
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceEvenly,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    // Previous Step Button
                    IconButton(
                        onClick = {
                            if (currentStepIndex > 0) {
                                currentStepIndex -= 1
                                secondsLeft = currentRoutine.steps[currentStepIndex].durationSeconds
                            }
                        },
                        enabled = currentStepIndex > 0
                    ) {
                        Icon(Icons.Default.SkipPrevious, contentDescription = "Previous Step", tint = if (currentStepIndex > 0) TextPrimary else TextMuted)
                    }

                    // +1 Min Button
                    OutlinedButton(
                        onClick = { secondsLeft += 60 },
                        shape = RoundedCornerShape(12.dp),
                        colors = ButtonDefaults.outlinedButtonColors(contentColor = TextSecondary),
                        border = ButtonDefaults.outlinedButtonBorder.copy(brush = androidx.compose.ui.graphics.SolidColor(WarmBorder)),
                        modifier = Modifier.height(48.dp)
                    ) {
                        Text("+1m", fontWeight = FontWeight.Bold, fontSize = 13.sp)
                    }

                    // Play/Pause Button
                    FilledIconButton(
                        onClick = { isRunning = !isRunning },
                        shape = CircleShape,
                        colors = IconButtonDefaults.filledIconButtonColors(containerColor = WarmSurface700),
                        modifier = Modifier.size(54.dp)
                    ) {
                        Icon(
                            imageVector = if (isRunning) Icons.Default.Pause else Icons.Default.PlayArrow,
                            contentDescription = if (isRunning) "Pause" else "Play",
                            tint = TextPrimary
                        )
                    }

                    // Skip Step Button
                    IconButton(
                        onClick = {
                            if (currentStepIndex < currentRoutine.steps.size - 1) {
                                currentStepIndex += 1
                                secondsLeft = currentRoutine.steps[currentStepIndex].durationSeconds
                            }
                        },
                        enabled = currentStepIndex < currentRoutine.steps.size - 1
                    ) {
                        Icon(Icons.Default.SkipNext, contentDescription = "Skip Step", tint = if (currentStepIndex < currentRoutine.steps.size - 1) TextPrimary else TextMuted)
                    }

                    // Done / Complete Button
                    Button(
                        onClick = { completeCurrentStep() },
                        shape = RoundedCornerShape(12.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = MaterialTheme.colorScheme.primary,
                            contentColor = androidx.compose.ui.graphics.Color.White
                        ),
                        modifier = Modifier
                            .height(48.dp)
                            .testTag("routine_complete_step_button")
                    ) {
                        Icon(Icons.Default.Check, contentDescription = null, tint = androidx.compose.ui.graphics.Color.White, modifier = Modifier.size(18.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = if (currentStepIndex == currentRoutine.steps.size - 1) "Finish" else "Done",
                            fontWeight = FontWeight.SemiBold,
                            fontSize = 13.sp,
                            color = androidx.compose.ui.graphics.Color.White
                        )
                    }
                }

            } else {
                // CUSTOMIZE MODE VIEW
                Text(
                    text = "Customize Steps for '${currentRoutine.name}'",
                    fontWeight = FontWeight.Bold,
                    fontSize = 15.sp,
                    color = WarmAmberGold
                )
                Spacer(modifier = Modifier.height(10.dp))

                LazyColumn(
                    modifier = Modifier
                        .fillMaxWidth()
                        .heightIn(max = 320.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    itemsIndexed(currentRoutine.steps) { index, step ->
                        Card(
                            shape = RoundedCornerShape(12.dp),
                            colors = CardDefaults.cardColors(containerColor = WarmSurface800),
                            border = CardDefaults.outlinedCardBorder().copy(
                                brush = androidx.compose.ui.graphics.SolidColor(WarmBorder)
                            )
                        ) {
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(horizontal = 10.dp, vertical = 8.dp),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Row(
                                    modifier = Modifier.weight(1f),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text(step.icon, fontSize = 20.sp)
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Column {
                                        Text(step.name, fontWeight = FontWeight.Bold, fontSize = 13.sp, color = TextPrimary)
                                        Text("${step.durationSeconds / 60}m ${step.durationSeconds % 60}s", fontSize = 11.sp, color = TextMuted)
                                    }
                                }

                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    // Move Up
                                    IconButton(
                                        onClick = {
                                            if (index > 0) {
                                                val mutableSteps = currentRoutine.steps.toMutableList()
                                                val item = mutableSteps.removeAt(index)
                                                mutableSteps.add(index - 1, item)
                                                val updated = currentRoutine.copy(steps = mutableSteps)
                                                currentRoutine = updated
                                                viewModel.saveRoutine(updated)
                                            }
                                        },
                                        enabled = index > 0,
                                        modifier = Modifier.size(32.dp)
                                    ) {
                                        Icon(Icons.Default.ArrowUpward, contentDescription = "Move Up", modifier = Modifier.size(16.dp), tint = TextMuted)
                                    }

                                    // Move Down
                                    IconButton(
                                        onClick = {
                                            if (index < currentRoutine.steps.size - 1) {
                                                val mutableSteps = currentRoutine.steps.toMutableList()
                                                val item = mutableSteps.removeAt(index)
                                                mutableSteps.add(index + 1, item)
                                                val updated = currentRoutine.copy(steps = mutableSteps)
                                                currentRoutine = updated
                                                viewModel.saveRoutine(updated)
                                            }
                                        },
                                        enabled = index < currentRoutine.steps.size - 1,
                                        modifier = Modifier.size(32.dp)
                                    ) {
                                        Icon(Icons.Default.ArrowDownward, contentDescription = "Move Down", modifier = Modifier.size(16.dp), tint = TextMuted)
                                    }

                                    // Edit Step
                                    IconButton(
                                        onClick = { editingStep = step },
                                        modifier = Modifier.size(32.dp)
                                    ) {
                                        Icon(Icons.Default.Edit, contentDescription = "Edit Step", modifier = Modifier.size(16.dp), tint = WarmAmberGold)
                                    }

                                    // Delete Step
                                    IconButton(
                                        onClick = {
                                            val mutableSteps = currentRoutine.steps.toMutableList()
                                            mutableSteps.removeAt(index)
                                            val updated = currentRoutine.copy(steps = mutableSteps)
                                            currentRoutine = updated
                                            viewModel.saveRoutine(updated)
                                        },
                                        modifier = Modifier.size(32.dp)
                                    ) {
                                        Icon(Icons.Default.Delete, contentDescription = "Delete Step", modifier = Modifier.size(16.dp), tint = Color.Red.copy(alpha = 0.8f))
                                    }
                                }
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                // Customizer Action Buttons
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    OutlinedButton(
                        onClick = { isCreatingNewStep = true },
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier.weight(1f)
                    ) {
                        Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Add Step", fontSize = 12.sp)
                    }

                    Button(
                        onClick = { isCustomizing = false },
                        shape = RoundedCornerShape(12.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = MaterialTheme.colorScheme.primary,
                            contentColor = androidx.compose.ui.graphics.Color.White
                        ),
                        modifier = Modifier.weight(1f)
                    ) {
                        Text("Save & Play", color = androidx.compose.ui.graphics.Color.White, fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                    }
                }
            }
        }
    }

    // Step Edit Dialog
    if (editingStep != null || isCreatingNewStep) {
        val targetStep = editingStep ?: RoutineStep(
            id = "step_${UUID.randomUUID().toString().take(6)}",
            name = "",
            durationSeconds = 180,
            icon = "⏱️",
            guidanceNote = ""
        )

        var stepName by remember { mutableStateOf(targetStep.name) }
        var stepDurationMins by remember { mutableIntStateOf(targetStep.durationSeconds / 60) }
        var stepIcon by remember { mutableStateOf(targetStep.icon) }
        var stepNote by remember { mutableStateOf(targetStep.guidanceNote) }
        var linkedHabitId by remember { mutableStateOf(targetStep.linkedHabitId) }

        AlertDialog(
            onDismissRequest = {
                editingStep = null
                isCreatingNewStep = false
            },
            title = {
                Text(
                    text = if (isCreatingNewStep) "Add Routine Step" else "Edit Step",
                    fontWeight = FontWeight.Bold,
                    color = TextPrimary
                )
            },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    OutlinedTextField(
                        value = stepName,
                        onValueChange = { stepName = it },
                        label = { Text("Step Name") },
                        modifier = Modifier.fillMaxWidth()
                    )

                    OutlinedTextField(
                        value = stepIcon,
                        onValueChange = { stepIcon = it },
                        label = { Text("Icon Emoji") },
                        modifier = Modifier.fillMaxWidth()
                    )

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text("Duration: ${stepDurationMins}m", color = TextPrimary, fontSize = 14.sp)
                        Row {
                            IconButton(onClick = { if (stepDurationMins > 1) stepDurationMins -= 1 }) {
                                Icon(Icons.Default.Remove, contentDescription = "Minus 1 min")
                            }
                            IconButton(onClick = { stepDurationMins += 1 }) {
                                Icon(Icons.Default.Add, contentDescription = "Add 1 min")
                            }
                        }
                    }

                    OutlinedTextField(
                        value = stepNote,
                        onValueChange = { stepNote = it },
                        label = { Text("Guidance / Tip") },
                        modifier = Modifier.fillMaxWidth()
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        val saved = targetStep.copy(
                            name = stepName.ifBlank { "Step" },
                            icon = stepIcon.ifBlank { "⏱️" },
                            durationSeconds = stepDurationMins * 60,
                            guidanceNote = stepNote,
                            linkedHabitId = linkedHabitId
                        )
                        val updatedSteps = if (isCreatingNewStep) {
                            currentRoutine.steps + saved
                        } else {
                            currentRoutine.steps.map { if (it.id == saved.id) saved else it }
                        }
                        val updatedRoutine = currentRoutine.copy(steps = updatedSteps)
                        currentRoutine = updatedRoutine
                        viewModel.saveRoutine(updatedRoutine)
                        editingStep = null
                        isCreatingNewStep = false
                    },
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = MaterialTheme.colorScheme.primary,
                        contentColor = androidx.compose.ui.graphics.Color.White
                    )
                ) {
                    Text("Save", color = androidx.compose.ui.graphics.Color.White, fontWeight = FontWeight.SemiBold)
                }
            },
            dismissButton = {
                TextButton(onClick = {
                    editingStep = null
                    isCreatingNewStep = false
                }) {
                    Text("Cancel")
                }
            }
        )
    }
}
