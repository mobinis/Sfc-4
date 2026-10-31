package com.example.selfcarehero.ui.dialogs

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.*
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.example.selfcarehero.ui.theme.*
import com.example.selfcarehero.ui.viewmodel.SelfCareViewModel
import kotlinx.coroutines.delay
import java.util.Locale
import kotlin.math.PI
import kotlin.math.sin

enum class UrgeWaveStep {
    ONSET_INTERCEPT,
    WAVE_PACER,
    RESOLUTION
}

@Composable
fun UrgeSurfingDialog(
    viewModel: SelfCareViewModel,
    onDismiss: () -> Unit
) {
    var currentStep by remember { mutableStateOf(UrgeWaveStep.ONSET_INTERCEPT) }

    // Onset State
    var trigger by remember { mutableStateOf("Boredom / Aimless") }
    var want by remember { mutableStateOf("") }
    var choice by remember { mutableStateOf("Somatic Breathing & Cold Water") }
    var preIntensity by remember { mutableStateOf(7) }
    var selectedSensations by remember { mutableStateOf(setOf("Chest Tightness", "Restless Limbs")) }
    var selectedContexts by remember { mutableStateOf(setOf("Late Evening")) }

    // Wave Pacer State
    val totalSeconds = 600 // 10 minutes
    var secondsRemaining by remember { mutableStateOf(totalSeconds) }
    var isTimerRunning by remember { mutableStateOf(false) }

    // Resolution State
    var postIntensity by remember { mutableStateOf(3) }
    var outcomeStatus by remember { mutableStateOf("SURFED") }
    var reflectionNote by remember { mutableStateOf("") }

    // Timer effect
    LaunchedEffect(isTimerRunning, secondsRemaining) {
        if (isTimerRunning && secondsRemaining > 0) {
            delay(1000L)
            secondsRemaining -= 1
            if (secondsRemaining == 0) {
                isTimerRunning = false
                currentStep = UrgeWaveStep.RESOLUTION
            }
        }
    }

    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Card(
            shape = RoundedCornerShape(24.dp),
            colors = CardDefaults.cardColors(containerColor = WarmSurface800),
            border = CardDefaults.outlinedCardBorder().copy(
                brush = Brush.linearGradient(
                    colors = listOf(ForestSage400, WarmAmberGold, ForestSage400)
                )
            ),
            modifier = Modifier
                .padding(16.dp)
                .fillMaxWidth()
                .testTag("dialog_urge_surfing")
        ) {
            when (currentStep) {
                UrgeWaveStep.ONSET_INTERCEPT -> {
                    OnsetInterceptView(
                        trigger = trigger,
                        onTriggerChange = { trigger = it },
                        want = want,
                        onWantChange = { want = it },
                        choice = choice,
                        onChoiceChange = { choice = it },
                        preIntensity = preIntensity,
                        onPreIntensityChange = { preIntensity = it },
                        selectedSensations = selectedSensations,
                        onSensationsChange = { selectedSensations = it },
                        selectedContexts = selectedContexts,
                        onContextsChange = { selectedContexts = it },
                        onStartWave = {
                            isTimerRunning = true
                            currentStep = UrgeWaveStep.WAVE_PACER
                        },
                        onDismiss = onDismiss
                    )
                }

                UrgeWaveStep.WAVE_PACER -> {
                    WavePacerView(
                        secondsRemaining = secondsRemaining,
                        totalSeconds = totalSeconds,
                        isTimerRunning = isTimerRunning,
                        onToggleTimer = { isTimerRunning = !isTimerRunning },
                        preIntensity = preIntensity,
                        onEarlySubside = {
                            isTimerRunning = false
                            outcomeStatus = "SURFED"
                            postIntensity = (preIntensity / 2).coerceAtLeast(1)
                            currentStep = UrgeWaveStep.RESOLUTION
                        },
                        onStepOut = {
                            isTimerRunning = false
                            outcomeStatus = "RESISTED"
                            postIntensity = preIntensity
                            currentStep = UrgeWaveStep.RESOLUTION
                        }
                    )
                }

                UrgeWaveStep.RESOLUTION -> {
                    ResolutionView(
                        preIntensity = preIntensity,
                        postIntensity = postIntensity,
                        onPostIntensityChange = { postIntensity = it },
                        outcomeStatus = outcomeStatus,
                        onOutcomeStatusChange = { outcomeStatus = it },
                        reflectionNote = reflectionNote,
                        onReflectionNoteChange = { reflectionNote = it },
                        onComplete = {
                            viewModel.logUrgeSurfingWave(
                                trigger = trigger.ifBlank { "Impulse Wave" },
                                preIntensity = preIntensity,
                                postIntensity = postIntensity,
                                want = want,
                                choice = choice,
                                note = reflectionNote,
                                somaticSensations = selectedSensations.toList(),
                                contextTags = selectedContexts.toList(),
                                outcomeStatus = outcomeStatus,
                                durationSeconds = totalSeconds - secondsRemaining
                            )
                        },
                        onDismiss = onDismiss
                    )
                }
            }
        }
    }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
private fun OnsetInterceptView(
    trigger: String,
    onTriggerChange: (String) -> Unit,
    want: String,
    onWantChange: (String) -> Unit,
    choice: String,
    onChoiceChange: (String) -> Unit,
    preIntensity: Int,
    onPreIntensityChange: (Int) -> Unit,
    selectedSensations: Set<String>,
    onSensationsChange: (Set<String>) -> Unit,
    selectedContexts: Set<String>,
    onContextsChange: (Set<String>) -> Unit,
    onStartWave: () -> Unit,
    onDismiss: () -> Unit
) {
    val somaticOptions = listOf(
        "🫁 Chest Tightness",
        "💓 Rapid Heart",
        "🌬️ Shallow Breath",
        "😬 Clenched Jaw",
        "⚡ Restless Limbs",
        "🔥 Facial Heat",
        "🌪️ Stomach Knot",
        "Dry Throat"
    )

    val contextOptions = listOf(
        "Late Evening",
        "Boredom / Aimless",
        "Solitude / Alone",
        "Stress / Anxiety",
        "Screen Trigger",
        "Fatigue / Exhaustion",
        "Social Friction"
    )

    Column(
        modifier = Modifier
            .padding(20.dp)
            .fillMaxWidth()
            .verticalScroll(rememberScrollState())
    ) {
        // Header
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(text = "🌊", fontSize = 22.sp)
                Spacer(modifier = Modifier.width(8.dp))
                Column {
                    Text(
                        text = "Urge Surfing Protocol",
                        fontWeight = FontWeight.Bold,
                        fontSize = 17.sp,
                        color = TextPrimary
                    )
                    Text(
                        text = "Marlatt Wave & DBT Interoception",
                        fontSize = 11.sp,
                        color = ForestSage400
                    )
                }
            }

            Box(
                modifier = Modifier
                    .clip(RoundedCornerShape(8.dp))
                    .background(ForestSage900)
                    .border(1.dp, ForestSage400, RoundedCornerShape(8.dp))
                    .padding(horizontal = 8.dp, vertical = 4.dp)
            ) {
                Text(
                    text = "10-Min Wave",
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Bold,
                    color = WarmAmberLight
                )
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        // 1. Initial Intensity Slider
        Text(
            text = "1. URGE INTENSITY (ONSET): $preIntensity / 10",
            fontSize = 11.sp,
            fontWeight = FontWeight.Bold,
            color = when {
                preIntensity >= 8 -> DangerRed
                preIntensity >= 5 -> WarmAmberGold
                else -> ForestSage400
            }
        )
        Slider(
            value = preIntensity.toFloat(),
            onValueChange = { onPreIntensityChange(it.toInt()) },
            valueRange = 1f..10f,
            steps = 8,
            colors = SliderDefaults.colors(
                thumbColor = WarmAmberGold,
                activeTrackColor = if (preIntensity >= 7) DangerRed else ForestSage400,
                inactiveTrackColor = WarmBorder
            )
        )

        Spacer(modifier = Modifier.height(10.dp))

        // 2. Somatic Interoception Chips
        Text(
            text = "2. SOMATIC SENSATIONS (ACT DEFUSION)",
            fontSize = 11.sp,
            fontWeight = FontWeight.Bold,
            color = ForestSage400
        )
        Text(
            text = "Notice the physical sensation without the story. Where do you feel it?",
            fontSize = 11.sp,
            color = TextMuted
        )
        Spacer(modifier = Modifier.height(6.dp))

        FlowRow(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(6.dp),
            verticalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            somaticOptions.forEach { sensation ->
                val isSelected = selectedSensations.contains(sensation)
                FilterChip(
                    selected = isSelected,
                    onClick = {
                        val cleanName = sensation.replace(Regex("^[\\p{So}\\p{Sk}\\s]+"), "")
                        val updated = if (isSelected) selectedSensations - cleanName else selectedSensations + cleanName
                        onSensationsChange(updated)
                    },
                    label = { Text(sensation, fontSize = 11.sp) },
                    colors = FilterChipDefaults.filterChipColors(
                        selectedContainerColor = ForestSage700,
                        selectedLabelColor = WarmAmberLight
                    )
                )
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // 3. Trigger Context Chips
        Text(
            text = "3. CONTEXT & ENVIRONMENT (DBT CHAIN)",
            fontSize = 11.sp,
            fontWeight = FontWeight.Bold,
            color = ForestSage400
        )
        Spacer(modifier = Modifier.height(6.dp))

        FlowRow(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(6.dp),
            verticalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            contextOptions.forEach { ctx ->
                val isSelected = selectedContexts.contains(ctx)
                FilterChip(
                    selected = isSelected,
                    onClick = {
                        val updated = if (isSelected) selectedContexts - ctx else selectedContexts + ctx
                        onContextsChange(updated)
                    },
                    label = { Text(ctx, fontSize = 11.sp) },
                    colors = FilterChipDefaults.filterChipColors(
                        selectedContainerColor = WarmSurface700,
                        selectedLabelColor = TextPrimary
                    )
                )
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // 4. Craving Impulse
        OutlinedTextField(
            value = want,
            onValueChange = onWantChange,
            label = { Text("What is the impulse urging you to do?") },
            placeholder = { Text("e.g. Doomscroll, sugary snack, impulse shopping", fontSize = 12.sp, color = TextMuted) },
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(12.dp)
        )

        Spacer(modifier = Modifier.height(8.dp))

        // 5. Constructive Alternative
        OutlinedTextField(
            value = choice,
            onValueChange = onChoiceChange,
            label = { Text("Healthy substitute action") },
            placeholder = { Text("e.g. 10 deep breaths, drink tall water glass", fontSize = 12.sp, color = TextMuted) },
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(12.dp)
        )

        Spacer(modifier = Modifier.height(18.dp))

        // Bottom Action Buttons
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            TextButton(onClick = onDismiss) {
                Text("Cancel", color = TextMuted)
            }

            Button(
                onClick = onStartWave,
                colors = ButtonDefaults.buttonColors(
                    containerColor = MaterialTheme.colorScheme.primary,
                    contentColor = androidx.compose.ui.graphics.Color.White
                ),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier.testTag("btn_start_urge_wave")
            ) {
                Text(
                    text = "🌊 Ride Craving Wave (10m)",
                    fontWeight = FontWeight.SemiBold,
                    color = androidx.compose.ui.graphics.Color.White
                )
            }
        }
    }
}

@Composable
private fun WavePacerView(
    secondsRemaining: Int,
    totalSeconds: Int,
    isTimerRunning: Boolean,
    onToggleTimer: () -> Unit,
    preIntensity: Int,
    onEarlySubside: () -> Unit,
    onStepOut: () -> Unit
) {
    val minutes = secondsRemaining / 60
    val seconds = secondsRemaining % 60
    val progress = (totalSeconds - secondsRemaining).toFloat() / totalSeconds.toFloat()

    // Breathing Animation (Navy SEAL Box Breathing: 4-4-4-4 cycle = 16 seconds total)
    val infiniteTransition = rememberInfiniteTransition(label = "breath")
    val breathScale by infiniteTransition.animateFloat(
        initialValue = 0.8f,
        targetValue = 1.25f,
        animationSpec = infiniteRepeatable(
            animation = tween(4000, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "breath_scale"
    )

    // Wave phase calculation & clinical defusion prompt
    val clinicalGuidance = when {
        progress < 0.25f -> "Acknowledge the impulse without fighting. An urge is a wave in your nervous system—it rises, but it cannot force you to act."
        progress < 0.55f -> "You are entering the crest of the craving. Notice the physical sensations loosening. Breathe directly into the tightness."
        progress < 0.85f -> "The wave is naturally breaking and decaying. Parasympathetic calm is taking over as dopamine stabilizes."
        else -> "Final stretch. You have ridden through the peak. Notice how temporary and fragile urges truly are."
    }

    val breathPhase = when ((secondsRemaining % 16)) {
        in 12..15 -> "Inhale Slowly (4s)"
        in 8..11 -> "Hold Gently (4s)"
        in 4..7 -> "Exhale Fully (4s)"
        else -> "Rest & Empty (4s)"
    }

    Column(
        modifier = Modifier
            .padding(20.dp)
            .fillMaxWidth(),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        // Top Header
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "🌊 Surfing the Craving Wave",
                fontWeight = FontWeight.Bold,
                fontSize = 15.sp,
                color = TextPrimary
            )

            Box(
                modifier = Modifier
                    .clip(RoundedCornerShape(8.dp))
                    .background(ForestSage900)
                    .padding(horizontal = 8.dp, vertical = 3.dp)
            ) {
                Text(
                    text = "Peak Intensity: $preIntensity/10",
                    fontSize = 11.sp,
                    color = WarmAmberLight,
                    fontWeight = FontWeight.Bold
                )
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Animated Harmonic Sine-Wave Visualizer
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(110.dp)
                .clip(RoundedCornerShape(16.dp))
                .background(WarmCharcoal950)
                .border(1.dp, WarmBorder, RoundedCornerShape(16.dp)),
            contentAlignment = Alignment.Center
        ) {
            val wavePhase by infiniteTransition.animateFloat(
                initialValue = 0f,
                targetValue = 2f * PI.toFloat(),
                animationSpec = infiniteRepeatable(
                    animation = tween(3000, easing = LinearEasing),
                    repeatMode = RepeatMode.Restart
                ),
                label = "wave_phase"
            )

            Canvas(modifier = Modifier.fillMaxSize()) {
                val width = size.width
                val height = size.height
                val midY = height / 2f
                val amplitude = (height / 3f) * (1f - (progress * 0.45f)) // Wave decays in amplitude over time!

                val path = Path()
                for (x in 0..width.toInt() step 4) {
                    val angle = (x / width) * 4f * PI.toFloat() + wavePhase
                    val y = midY + sin(angle) * amplitude
                    if (x == 0) path.moveTo(x.toFloat(), y) else path.lineTo(x.toFloat(), y)
                }

                drawPath(
                    path = path,
                    color = ForestSage400,
                    style = Stroke(width = 3.dp.toPx())
                )

                // Current position indicator dot
                val currentX = width * progress
                val currentAngle = (currentX / width) * 4f * PI.toFloat() + wavePhase
                val currentY = midY + sin(currentAngle) * amplitude
                drawCircle(
                    color = WarmAmberGold,
                    radius = 6.dp.toPx(),
                    center = Offset(currentX, currentY)
                )
            }

            // Breath Aura Circle
            Box(
                modifier = Modifier
                    .size(54.dp * breathScale)
                    .clip(CircleShape)
                    .background(ForestSage500.copy(alpha = 0.25f))
                    .border(1.dp, WarmAmberGold.copy(alpha = 0.4f), CircleShape)
            )
        }

        Spacer(modifier = Modifier.height(14.dp))

        // Timer Display
        Text(
            text = String.format(Locale.US, "%02d:%02d", minutes, seconds),
            fontSize = 42.sp,
            fontWeight = FontWeight.Black,
            color = WarmAmberLight,
            letterSpacing = 2.sp
        )

        Text(
            text = breathPhase,
            fontSize = 13.sp,
            fontWeight = FontWeight.Bold,
            color = ForestSage400
        )

        Spacer(modifier = Modifier.height(12.dp))

        // Clinical Defusion Guidance Card
        Card(
            shape = RoundedCornerShape(12.dp),
            colors = CardDefaults.cardColors(containerColor = WarmCharcoal950),
            modifier = Modifier.fillMaxWidth()
        ) {
            Text(
                text = clinicalGuidance,
                fontSize = 12.sp,
                color = TextSecondary,
                textAlign = TextAlign.Center,
                lineHeight = 17.sp,
                modifier = Modifier.padding(12.dp)
            )
        }

        Spacer(modifier = Modifier.height(18.dp))

        // Wave Controls
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            Button(
                onClick = onEarlySubside,
                colors = ButtonDefaults.buttonColors(
                    containerColor = MaterialTheme.colorScheme.primary,
                    contentColor = androidx.compose.ui.graphics.Color.White
                ),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier
                    .weight(1f)
                    .height(42.dp)
                    .testTag("btn_urge_subsided_early")
            ) {
                Text(
                    text = "🌊 Urge Subsided",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = androidx.compose.ui.graphics.Color.White
                )
            }

            OutlinedButton(
                onClick = onStepOut,
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier
                    .weight(1f)
                    .height(42.dp)
                    .testTag("btn_step_out_to_log")
            ) {
                Text(
                    text = "Log Resolution",
                    fontSize = 12.sp,
                    color = TextPrimary
                )
            }
        }
    }
}

@Composable
private fun ResolutionView(
    preIntensity: Int,
    postIntensity: Int,
    onPostIntensityChange: (Int) -> Unit,
    outcomeStatus: String,
    onOutcomeStatusChange: (String) -> Unit,
    reflectionNote: String,
    onReflectionNoteChange: (String) -> Unit,
    onComplete: () -> Unit,
    onDismiss: () -> Unit
) {
    val delta = maxOf(0, preIntensity - postIntensity)
    val baseCoins = 5
    val surfBonus = if (outcomeStatus == "SURFED") 5 else if (outcomeStatus == "RESISTED") 3 else 0
    val totalCoins = baseCoins + delta + surfBonus
    val totalXp = when (outcomeStatus) {
        "SURFED" -> 35
        "RESISTED" -> 30
        "PARTIAL_LAPSE" -> 20
        else -> 15
    }

    Column(
        modifier = Modifier
            .padding(20.dp)
            .fillMaxWidth()
            .verticalScroll(rememberScrollState())
    ) {
        // Header
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = "✨ Wave Resolution",
                    fontWeight = FontWeight.Bold,
                    fontSize = 17.sp,
                    color = TextPrimary
                )
                Text(
                    text = "Evaluate craving decay & claim resilience coins",
                    fontSize = 11.sp,
                    color = TextMuted
                )
            }

            Box(
                modifier = Modifier
                    .clip(RoundedCornerShape(8.dp))
                    .background(ForestSage900)
                    .padding(horizontal = 8.dp, vertical = 4.dp)
            ) {
                Text(
                    text = "+$totalCoins 🪙  +$totalXp XP",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    color = WarmAmberLight
                )
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        // Post Intensity Slider
        Text(
            text = "POST-SURF INTENSITY: $postIntensity / 10",
            fontSize = 11.sp,
            fontWeight = FontWeight.Bold,
            color = ForestSage400
        )
        Slider(
            value = postIntensity.toFloat(),
            onValueChange = { onPostIntensityChange(it.toInt()) },
            valueRange = 1f..10f,
            steps = 8,
            colors = SliderDefaults.colors(
                thumbColor = WarmAmberGold,
                activeTrackColor = ForestSage400,
                inactiveTrackColor = WarmBorder
            )
        )

        // Delta Card
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(12.dp))
                .background(WarmCharcoal950)
                .padding(12.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text("Pre-Surf: $preIntensity", fontSize = 11.sp, color = TextMuted)
                Text("Post-Surf: $postIntensity", fontSize = 11.sp, color = TextMuted)
            }

            Column(horizontalAlignment = Alignment.End) {
                Text(
                    text = if (delta > 0) "Decay: -$delta pts" else "Intensity Stable",
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Bold,
                    color = if (delta > 0) Emerald400 else TextSecondary
                )
                Text(
                    text = "+$delta 🪙 Intensity Drop Bonus",
                    fontSize = 10.sp,
                    color = WarmAmberLight
                )
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        // Outcome Classification (AVE non-punitive options)
        Text(
            text = "OUTCOME CLASSIFICATION (AVE NEUTRALITY)",
            fontSize = 11.sp,
            fontWeight = FontWeight.Bold,
            color = ForestSage400
        )
        Spacer(modifier = Modifier.height(6.dp))

        val outcomes = listOf(
            "SURFED" to "🌊 Surfed Wave",
            "RESISTED" to "🛡️ Substituted Action",
            "PARTIAL_LAPSE" to "🌱 Delayed Harm",
            "FULL_LAPSE" to "Mindful Log (0 Penalty)"
        )

        Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
            outcomes.forEach { (key, label) ->
                val isSelected = outcomeStatus == key
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(8.dp))
                        .background(if (isSelected) ForestSage700 else WarmCharcoal950)
                        .border(1.dp, if (isSelected) WarmAmberGold else WarmBorder, RoundedCornerShape(8.dp))
                        .clickable { onOutcomeStatusChange(key) }
                        .padding(horizontal = 12.dp, vertical = 8.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = label,
                        fontSize = 12.sp,
                        fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                        color = if (isSelected) TextPrimary else TextSecondary
                    )
                    if (isSelected) {
                        Text("✓", color = WarmAmberGold, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // Cognitive Reframing Reflection
        OutlinedTextField(
            value = reflectionNote,
            onValueChange = onReflectionNoteChange,
            label = { Text("What did you learn about this impulse?") },
            placeholder = { Text("e.g. Sensations peaked quickly once I labeled them.", fontSize = 12.sp, color = TextMuted) },
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(12.dp)
        )

        Spacer(modifier = Modifier.height(18.dp))

        // Action Buttons
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            TextButton(onClick = onDismiss) {
                Text("Discard", color = TextMuted)
            }

            Button(
                onClick = onComplete,
                colors = ButtonDefaults.buttonColors(
                    containerColor = MaterialTheme.colorScheme.primary,
                    contentColor = androidx.compose.ui.graphics.Color.White
                ),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier.testTag("btn_complete_urge_session")
            ) {
                Text(
                    text = "Claim $totalCoins 🪙 & Save Session",
                    fontWeight = FontWeight.SemiBold,
                    color = androidx.compose.ui.graphics.Color.White
                )
            }
        }
    }
}
