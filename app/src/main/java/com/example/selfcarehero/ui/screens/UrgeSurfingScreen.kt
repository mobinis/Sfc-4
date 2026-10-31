package com.example.selfcarehero.ui.screens

import androidx.activity.compose.BackHandler
import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.*
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
import com.example.selfcarehero.data.room.SomaticPacerMode
import com.example.selfcarehero.data.room.SurfOutcome
import com.example.selfcarehero.data.room.UrgeLogEntity
import com.example.selfcarehero.ui.theme.*
import com.example.selfcarehero.ui.viewmodel.PacerPhase
import com.example.selfcarehero.ui.viewmodel.UrgeScreenStep
import com.example.selfcarehero.ui.viewmodel.UrgeSurfViewModel
import java.util.Locale
import kotlin.math.PI
import kotlin.math.sin

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun UrgeSurfingScreen(
    viewModel: UrgeSurfViewModel,
    onBack: () -> Unit
) {
    val currentStep by viewModel.currentStep.collectAsState()
    val session by viewModel.session.collectAsState()
    val secondsRemaining by viewModel.secondsRemaining.collectAsState()
    val isTimerRunning by viewModel.isTimerRunning.collectAsState()
    val pacerPhase by viewModel.pacerPhase.collectAsState()
    val pacerProgress by viewModel.pacerProgress.collectAsState()
    val postOutcome by viewModel.postOutcome.collectAsState()
    val surfedCount by viewModel.surfedCount.collectAsState()
    val avgIntensityDrop by viewModel.avgIntensityDrop.collectAsState()
    val recentLogs by viewModel.recentLogs.collectAsState()

    var showHistorySheet by remember { mutableStateOf(false) }

    // Intercept back navigation
    BackHandler {
        if (currentStep == UrgeScreenStep.WAVE_PACER) {
            viewModel.onStepOut(SurfOutcome.RESISTED)
        } else if (currentStep == UrgeScreenStep.RESOLUTION) {
            viewModel.cancelAndExit(onBack)
        } else {
            onBack()
        }
    }

    Scaffold(
        containerColor = MaterialTheme.colorScheme.background,
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(
                            text = "🌊 Urge Surfing Protocol",
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                        Text(
                            text = when (currentStep) {
                                UrgeScreenStep.ONSET -> "Step 1: Interoceptive Trigger Capture"
                                UrgeScreenStep.WAVE_PACER -> "Step 2: 10-Minute Somatic Decay Wave"
                                UrgeScreenStep.RESOLUTION -> "Step 3: Non-Punitive Resolution & Reward"
                            },
                            fontSize = 12.sp,
                            color = ForestSage400
                        )
                    }
                },
                navigationIcon = {
                    IconButton(
                        onClick = {
                            if (currentStep == UrgeScreenStep.WAVE_PACER) {
                                viewModel.onStepOut(SurfOutcome.RESISTED)
                            } else {
                                onBack()
                            }
                        },
                        modifier = Modifier
                            .minimumInteractiveComponentSize()
                            .testTag("btn_urge_back")
                    ) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                            contentDescription = "Back",
                            tint = MaterialTheme.colorScheme.onSurface
                        )
                    }
                },
                actions = {
                    // Room History Quick Button
                    TextButton(
                        onClick = { showHistorySheet = true },
                        modifier = Modifier
                            .minimumInteractiveComponentSize()
                            .testTag("btn_urge_history")
                    ) {
                        Text(
                            text = "📜 Logs ($surfedCount)",
                            color = PastelApricotAmber,
                            fontSize = 13.sp,
                            fontWeight = FontWeight.SemiBold
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surface,
                    titleContentColor = MaterialTheme.colorScheme.onSurface,
                    navigationIconContentColor = MaterialTheme.colorScheme.onSurface,
                    actionIconContentColor = MaterialTheme.colorScheme.onSurface
                )
            )
        }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            // Step Progress Track
            StepProgressHeader(currentStep = currentStep)

            // Step Content
            AnimatedContent(
                targetState = currentStep,
                transitionSpec = {
                    fadeIn(animationSpec = tween(250)) togetherWith fadeOut(animationSpec = tween(200))
                },
                label = "UrgeStepTransition"
            ) { step ->
                when (step) {
                    UrgeScreenStep.ONSET -> {
                        UrgeOnsetSection(
                            session = session,
                            surfedCount = surfedCount,
                            avgIntensityDrop = avgIntensityDrop,
                            onTriggerChange = { viewModel.updateTrigger(it) },
                            onIntensityChange = { viewModel.updatePreIntensity(it) },
                            onToggleSomaticTag = { viewModel.toggleSomaticTag(it) },
                            onToggleContextTag = { viewModel.toggleContextTag(it) },
                            onPacerModeSelect = { viewModel.setPacingMode(it) },
                            onStartWave = { viewModel.startWave() }
                        )
                    }

                    UrgeScreenStep.WAVE_PACER -> {
                        UrgeWavePacerSection(
                            secondsRemaining = secondsRemaining,
                            totalSeconds = viewModel.totalSeconds,
                            isTimerRunning = isTimerRunning,
                            pacerPhase = pacerPhase,
                            pacerProgress = pacerProgress,
                            pacingMode = session.pacingMode,
                            preIntensity = session.preIntensity,
                            onToggleTimer = { viewModel.toggleTimer() },
                            onPacerModeChange = { viewModel.setPacingMode(it) },
                            onEarlySubside = { viewModel.onEarlySubside() },
                            onStepOut = { viewModel.onStepOut(SurfOutcome.RESISTED) }
                        )
                    }

                    UrgeScreenStep.RESOLUTION -> {
                        postOutcome?.let { outcome ->
                            UrgeResolutionSection(
                                session = session,
                                outcome = outcome,
                                onPostIntensityChange = { viewModel.updatePostIntensity(it) },
                                onOutcomeSelect = { viewModel.updateOutcomeClassification(it) },
                                onNoteChange = { viewModel.updateReflectionNote(it) },
                                onSaveAndFinish = { viewModel.saveAndFinish(onBack) },
                                onCancel = { viewModel.cancelAndExit(onBack) }
                            )
                        }
                    }
                }
            }
        }
    }

    if (showHistorySheet) {
        UrgeHistoryBottomSheet(
            logs = recentLogs,
            onDismiss = { showHistorySheet = false }
        )
    }
}

@Composable
private fun StepProgressHeader(currentStep: UrgeScreenStep) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .background(MaterialTheme.colorScheme.surfaceVariant)
            .padding(horizontal = 16.dp, vertical = 8.dp),
        horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        val steps = listOf(
            Triple(UrgeScreenStep.ONSET, "1. Intercept", "🎯"),
            Triple(UrgeScreenStep.WAVE_PACER, "2. Wave (10m)", "🌊"),
            Triple(UrgeScreenStep.RESOLUTION, "3. Reward", "🪙")
        )

        steps.forEach { (step, label, icon) ->
            val isActive = currentStep == step
            val isDone = currentStep.ordinal > step.ordinal

            Box(
                modifier = Modifier
                    .weight(1f)
                    .clip(RoundedCornerShape(8.dp))
                    .background(
                        when {
                            isActive -> PastelBlossomPink.copy(alpha = 0.35f)
                            isDone -> PastelApricotAmber.copy(alpha = 0.25f)
                            else -> Color.Transparent
                        }
                    )
                    .border(
                        width = 1.dp,
                        color = when {
                            isActive -> PastelBlossomPink
                            isDone -> PastelApricotAmber
                            else -> MaterialTheme.colorScheme.outline
                        },
                        shape = RoundedCornerShape(8.dp)
                    )
                    .padding(vertical = 6.dp),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = "$icon $label",
                    fontSize = 11.sp,
                    fontWeight = if (isActive) FontWeight.Bold else FontWeight.Normal,
                    color = when {
                        isActive -> MaterialTheme.colorScheme.onSurface
                        isDone -> MaterialTheme.colorScheme.onSurface
                        else -> MaterialTheme.colorScheme.onSurfaceVariant
                    }
                )
            }
        }
    }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
private fun UrgeOnsetSection(
    session: com.example.selfcarehero.data.room.UrgeSession,
    surfedCount: Int,
    avgIntensityDrop: Double?,
    onTriggerChange: (String) -> Unit,
    onIntensityChange: (Int) -> Unit,
    onToggleSomaticTag: (String) -> Unit,
    onToggleContextTag: (String) -> Unit,
    onPacerModeSelect: (SomaticPacerMode) -> Unit,
    onStartWave: () -> Unit
) {
    val triggers = listOf(
        "Boredom / Aimless", "Late Evening", "Solitude / Alone",
        "Stress / Anxiety", "Screen Trigger", "Fatigue",
        "Social Friction", "Work Burnout"
    )

    val somaticSensations = listOf(
        "Chest Tightness", "Rapid Heartbeat", "Clenched Jaw",
        "Shallow Breathing", "Restless Limbs", "Stomach Knot",
        "Facial Heat", "Throat Constriction", "Fidgety Hands"
    )

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
        contentPadding = PaddingValues(top = 16.dp, bottom = 40.dp)
    ) {
        // Clinical Overview Card
        item {
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = WarmSurface800),
                border = CardDefaults.outlinedCardBorder().copy(brush = Brush.linearGradient(listOf(ForestSage400, WarmAmberGold)))
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "🧠 The 10-Minute Wave Principle",
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Bold,
                            color = WarmAmberLight
                        )
                        if (surfedCount > 0) {
                            Text(
                                text = "🏆 $surfedCount Surfed",
                                fontSize = 12.sp,
                                color = ForestSage400,
                                fontWeight = FontWeight.SemiBold
                            )
                        }
                    }
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        text = "Craving impulses peak sharply like ocean waves within 5–10 minutes, then naturally subside. You do not need to fight or suppress the urge—simply ride its somatic sensations with breath until the wave calms.",
                        fontSize = 12.sp,
                        color = TextMuted,
                        lineHeight = 17.sp
                    )
                }
            }
        }

        // Intensity Slider Card
        item {
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = WarmSurface800)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "Current Urge Intensity",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = TextPrimary
                        )
                        Text(
                            text = "${session.preIntensity} / 10",
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold,
                            color = when {
                                session.preIntensity >= 8 -> Color(0xFFE57373)
                                session.preIntensity >= 5 -> WarmAmberGold
                                else -> ForestSage400
                            }
                        )
                    }

                    Spacer(modifier = Modifier.height(8.dp))

                    Slider(
                        value = session.preIntensity.toFloat(),
                        onValueChange = { onIntensityChange(it.toInt()) },
                        valueRange = 1f..10f,
                        steps = 8,
                        colors = SliderDefaults.colors(
                            thumbColor = WarmAmberGold,
                            activeTrackColor = ForestSage400,
                            inactiveTrackColor = WarmCharcoal900
                        ),
                        modifier = Modifier
                            .fillMaxWidth()
                            .testTag("slider_pre_intensity")
                    )

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text("1 (Mild Whisper)", fontSize = 10.sp, color = TextMuted)
                        Text("5 (Moderate)", fontSize = 10.sp, color = TextMuted)
                        Text("10 (Acute Peak)", fontSize = 10.sp, color = TextMuted)
                    }
                }
            }
        }

        // Trigger Selector
        item {
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = WarmSurface800)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = "Trigger & Environmental Context",
                        fontSize = 14.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = TextPrimary
                    )
                    Spacer(modifier = Modifier.height(10.dp))
                    FlowRow(
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        triggers.forEach { trig ->
                            val isSelected = session.trigger == trig
                            FilterChip(
                                selected = isSelected,
                                onClick = { onTriggerChange(trig) },
                                label = { Text(trig, fontSize = 12.sp) },
                                colors = FilterChipDefaults.filterChipColors(
                                    selectedContainerColor = ForestSage400.copy(alpha = 0.3f),
                                    selectedLabelColor = WarmAmberLight,
                                    containerColor = WarmCharcoal900,
                                    labelColor = TextMuted
                                ),
                                border = FilterChipDefaults.filterChipBorder(
                                    enabled = true,
                                    selected = isSelected,
                                    borderColor = if (isSelected) ForestSage400 else WarmBorder
                                ),
                                modifier = Modifier.minimumInteractiveComponentSize()
                            )
                        }
                    }
                }
            }
        }

        // Somatic Sensation Chips
        item {
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = WarmSurface800)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = "Where do you feel this in your body?",
                        fontSize = 14.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = TextPrimary
                    )
                    Text(
                        text = "Decouple physical sensations from cognitive catastrophizing.",
                        fontSize = 11.sp,
                        color = TextMuted
                    )
                    Spacer(modifier = Modifier.height(10.dp))
                    FlowRow(
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        somaticSensations.forEach { sensation ->
                            val isSelected = session.somaticSensations.contains(sensation)
                            FilterChip(
                                selected = isSelected,
                                onClick = { onToggleSomaticTag(sensation) },
                                label = { Text(sensation, fontSize = 12.sp) },
                                colors = FilterChipDefaults.filterChipColors(
                                    selectedContainerColor = WarmAmberGold.copy(alpha = 0.25f),
                                    selectedLabelColor = WarmAmberLight,
                                    containerColor = WarmCharcoal900,
                                    labelColor = TextMuted
                                ),
                                border = FilterChipDefaults.filterChipBorder(
                                    enabled = true,
                                    selected = isSelected,
                                    borderColor = if (isSelected) WarmAmberGold else WarmBorder
                                ),
                                modifier = Modifier.minimumInteractiveComponentSize()
                            )
                        }
                    }
                }
            }
        }

        // Pacing Mode Selection
        item {
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = WarmSurface800)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = "Somatic Breath Pacer Mode",
                        fontSize = 14.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = TextPrimary
                    )
                    Spacer(modifier = Modifier.height(10.dp))

                    SomaticPacerMode.entries.forEach { mode ->
                        val isSelected = session.pacingMode == mode
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(12.dp))
                                .background(if (isSelected) ForestSage400.copy(alpha = 0.2f) else WarmCharcoal900)
                                .border(
                                    width = 1.dp,
                                    color = if (isSelected) ForestSage400 else WarmBorder,
                                    shape = RoundedCornerShape(12.dp)
                                )
                                .clickable { onPacerModeSelect(mode) }
                                .padding(12.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    text = mode.displayName,
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = if (isSelected) WarmAmberLight else TextPrimary
                                )
                                Text(
                                    text = mode.description,
                                    fontSize = 11.sp,
                                    color = TextMuted,
                                    lineHeight = 15.sp
                                )
                            }
                            Text(
                                text = mode.cadenceLabel,
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold,
                                color = WarmAmberGold,
                                modifier = Modifier.padding(start = 8.dp)
                            )
                        }
                        Spacer(modifier = Modifier.height(8.dp))
                    }
                }
            }
        }

        // Start Wave Button
        item {
            Button(
                onClick = onStartWave,
                shape = RoundedCornerShape(16.dp),
                colors = ButtonDefaults.buttonColors(containerColor = ForestSage400),
                modifier = Modifier
                    .fillMaxWidth()
                    .height(56.dp)
                    .testTag("btn_start_urge_wave")
            ) {
                Text(
                    text = "Ride the 10-Minute Wave 🌊",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )
            }
        }
    }
}

@Composable
private fun UrgeWavePacerSection(
    secondsRemaining: Int,
    totalSeconds: Int,
    isTimerRunning: Boolean,
    pacerPhase: PacerPhase,
    pacerProgress: Float,
    pacingMode: SomaticPacerMode,
    preIntensity: Int,
    onToggleTimer: () -> Unit,
    onPacerModeChange: (SomaticPacerMode) -> Unit,
    onEarlySubside: () -> Unit,
    onStepOut: () -> Unit
) {
    // Dynamic sine wave animation
    val infiniteTransition = rememberInfiniteTransition(label = "WavePhaseTransition")
    val waveOffset by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 2f * PI.toFloat(),
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 3500, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "WavePhase"
    )

    // Compute progress ratio (1.0 down to 0.0)
    val timeRatio = (secondsRemaining.toFloat() / totalSeconds.toFloat()).coerceIn(0f, 1f)

    // Mantras list cycling every 15s
    val mantras = listOf(
        "You are the sky. The urge is just weather passing through.",
        "An urge peaks in 5-10 minutes. Your breath is the anchor.",
        "Notice physical sensations without judgment or fear.",
        "You don't need to fight this feeling. Just make room for it.",
        "This urge does not control your hands. You hold the choice."
    )
    val mantraIndex = (totalSeconds - secondsRemaining) / 15 % mantras.size
    val currentMantra = mantras[mantraIndex]

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.SpaceBetween
    ) {
        // Mode Selector Chips
        LazyRow(
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            items(SomaticPacerMode.entries) { mode ->
                val isSelected = pacingMode == mode
                SuggestionChip(
                    onClick = { onPacerModeChange(mode) },
                    label = { Text("${mode.displayName} (${mode.cadenceLabel})", fontSize = 11.sp) },
                    colors = SuggestionChipDefaults.suggestionChipColors(
                        containerColor = if (isSelected) ForestSage400.copy(alpha = 0.3f) else WarmSurface800,
                        labelColor = if (isSelected) WarmAmberLight else TextMuted
                    ),
                    border = SuggestionChipDefaults.suggestionChipBorder(
                        enabled = true,
                        borderColor = if (isSelected) ForestSage400 else WarmBorder
                    ),
                    modifier = Modifier.minimumInteractiveComponentSize()
                )
            }
        }

        // Center Somatic Guide Area
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            modifier = Modifier.weight(1f),
            verticalArrangement = Arrangement.Center
        ) {
            // Respiratory Guided Circle
            Box(
                contentAlignment = Alignment.Center,
                modifier = Modifier.size(220.dp)
            ) {
                // Outer Breathing Ripple Aura
                val auraScale = when (pacerPhase) {
                    PacerPhase.INHALE -> 1.0f + (pacerProgress * 0.35f)
                    PacerPhase.TOP_UP_INHALE -> 1.35f + (pacerProgress * 0.15f)
                    PacerPhase.HOLD_FULL -> 1.45f
                    PacerPhase.EXHALE -> 1.45f - (pacerProgress * 0.45f)
                    PacerPhase.HOLD_EMPTY -> 1.0f
                }

                Canvas(modifier = Modifier.fillMaxSize()) {
                    val radius = (size.minDimension / 2f) * 0.7f * auraScale
                    drawCircle(
                        brush = Brush.radialGradient(
                            colors = listOf(
                                ForestSage400.copy(alpha = 0.35f),
                                WarmAmberGold.copy(alpha = 0.15f),
                                Color.Transparent
                            ),
                            center = center,
                            radius = radius
                        ),
                        radius = radius
                    )
                }

                // Inner Main Circle
                Box(
                    modifier = Modifier
                        .size(150.dp)
                        .clip(CircleShape)
                        .background(WarmSurface800)
                        .border(2.dp, ForestSage400, CircleShape),
                    contentAlignment = Alignment.Center
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(
                            text = pacerPhase.label,
                            fontSize = 20.sp,
                            fontWeight = FontWeight.Bold,
                            color = WarmAmberLight
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        val minutes = secondsRemaining / 60
                        val secs = secondsRemaining % 60
                        Text(
                            text = String.format(Locale.US, "%02d:%02d", minutes, secs),
                            fontSize = 24.sp,
                            fontWeight = FontWeight.ExtraBold,
                            color = TextPrimary
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            Text(
                text = pacerPhase.instruction,
                fontSize = 13.sp,
                color = ForestSage400,
                fontWeight = FontWeight.Medium,
                textAlign = TextAlign.Center,
                modifier = Modifier.padding(horizontal = 24.dp)
            )

            Spacer(modifier = Modifier.height(16.dp))

            // Decaying Sine Wave Canvas
            Canvas(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(60.dp)
                    .clip(RoundedCornerShape(12.dp))
                    .background(WarmCharcoal900)
            ) {
                val width = size.width
                val height = size.height
                val midY = height / 2f
                val maxAmplitude = (height * 0.4f) * timeRatio // amplitude calms as time decays

                val path = Path()
                path.moveTo(0f, midY)
                val points = 60
                for (i in 0..points) {
                    val x = (i.toFloat() / points) * width
                    val angle = (x / width) * 4f * PI.toFloat() + waveOffset
                    val y = midY + sin(angle) * maxAmplitude
                    path.lineTo(x, y)
                }

                drawPath(
                    path = path,
                    color = ForestSage400,
                    style = Stroke(width = 3.dp.toPx())
                )
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Cognitive Defusion Mantra
            Text(
                text = "“$currentMantra”",
                fontSize = 12.sp,
                color = TextMuted,
                textAlign = TextAlign.Center,
                modifier = Modifier.padding(horizontal = 16.dp)
            )
        }

        // Action Controls
        Column(
            modifier = Modifier.fillMaxWidth(),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                // Pause / Resume
                OutlinedButton(
                    onClick = onToggleTimer,
                    shape = RoundedCornerShape(14.dp),
                    colors = ButtonDefaults.outlinedButtonColors(contentColor = TextPrimary),
                    border = ButtonDefaults.outlinedButtonBorder.copy(brush = Brush.linearGradient(listOf(WarmBorder, ForestSage400))),
                    modifier = Modifier
                        .weight(1f)
                        .height(50.dp)
                        .testTag("btn_toggle_timer")
                ) {
                    Text(if (isTimerRunning) "⏸️ Pause" else "▶️ Resume", fontWeight = FontWeight.SemiBold)
                }

                // Wave Subsided Early
                Button(
                    onClick = onEarlySubside,
                    shape = RoundedCornerShape(14.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = ForestSage400),
                    modifier = Modifier
                        .weight(1.4f)
                        .height(50.dp)
                        .testTag("btn_urge_subsided")
                ) {
                    Text("🌊 Urge Subsided", fontWeight = FontWeight.Bold, color = Color.White)
                }
            }

            // Step Out With Choice
            TextButton(
                onClick = onStepOut,
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("btn_step_out")
            ) {
                Text(
                    text = "🛡️ Step Out Firmly With Choice",
                    color = WarmAmberLight,
                    fontSize = 13.sp
                )
            }
        }
    }
}

@Composable
private fun UrgeResolutionSection(
    session: com.example.selfcarehero.data.room.UrgeSession,
    outcome: com.example.selfcarehero.data.room.PostSurfOutcome,
    onPostIntensityChange: (Int) -> Unit,
    onOutcomeSelect: (SurfOutcome) -> Unit,
    onNoteChange: (String) -> Unit,
    onSaveAndFinish: () -> Unit,
    onCancel: () -> Unit
) {
    val delta = maxOf(0, session.preIntensity - outcome.postIntensity)

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
        contentPadding = PaddingValues(top = 16.dp, bottom = 40.dp)
    ) {
        // Delta Intensity Banner
        item {
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = WarmSurface800),
                border = CardDefaults.outlinedCardBorder().copy(brush = Brush.linearGradient(listOf(WarmAmberGold, ForestSage400)))
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = "🎉 Wave Intercept Complete",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        color = WarmAmberLight
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceEvenly,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text("Pre-Surf", fontSize = 11.sp, color = TextMuted)
                            Text("${session.preIntensity}/10", fontSize = 20.sp, fontWeight = FontWeight.Bold, color = Color(0xFFE57373))
                        }
                        Text("➔", fontSize = 20.sp, color = ForestSage400)
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text("Post-Surf", fontSize = 11.sp, color = TextMuted)
                            Text("${outcome.postIntensity}/10", fontSize = 20.sp, fontWeight = FontWeight.Bold, color = ForestSage400)
                        }
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text("Drop Δ", fontSize = 11.sp, color = TextMuted)
                            Text(
                                text = if (delta > 0) "-$delta pts" else "0 pts",
                                fontSize = 20.sp,
                                fontWeight = FontWeight.ExtraBold,
                                color = WarmAmberGold
                            )
                        }
                    }
                }
            }
        }

        // Post-Intensity Slider
        item {
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = WarmSurface800)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = "Rate Urge Intensity Now",
                        fontSize = 14.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = TextPrimary
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Slider(
                        value = outcome.postIntensity.toFloat(),
                        onValueChange = { onPostIntensityChange(it.toInt()) },
                        valueRange = 1f..10f,
                        steps = 8,
                        colors = SliderDefaults.colors(
                            thumbColor = ForestSage400,
                            activeTrackColor = ForestSage400,
                            inactiveTrackColor = WarmCharcoal900
                        ),
                        modifier = Modifier
                            .fillMaxWidth()
                            .testTag("slider_post_intensity")
                    )
                }
            }
        }

        // Outcome Classification Cards
        item {
            Text(
                text = "Classify Outcome (Non-Punitive)",
                fontSize = 14.sp,
                fontWeight = FontWeight.SemiBold,
                color = TextPrimary
            )
            Spacer(modifier = Modifier.height(8.dp))

            SurfOutcome.entries.forEach { out ->
                val isSelected = outcome.outcomeClassification == out
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(14.dp))
                        .background(if (isSelected) ForestSage400.copy(alpha = 0.25f) else WarmSurface800)
                        .border(
                            width = 1.dp,
                            color = if (isSelected) WarmAmberGold else WarmBorder,
                            shape = RoundedCornerShape(14.dp)
                        )
                        .clickable { onOutcomeSelect(out) }
                        .padding(14.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(out.emoji, fontSize = 24.sp)
                    Spacer(modifier = Modifier.width(12.dp))
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = out.displayName,
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold,
                            color = if (isSelected) WarmAmberLight else TextPrimary
                        )
                        Text(
                            text = out.tagLine,
                            fontSize = 11.sp,
                            color = TextMuted
                        )
                    }
                    Text(
                        text = "+${out.xpValue} XP",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        color = ForestSage400
                    )
                }
                Spacer(modifier = Modifier.height(8.dp))
            }
        }

        // Reward Summary Card
        item {
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = WarmCharcoal900),
                border = CardDefaults.outlinedCardBorder().copy(brush = Brush.linearGradient(listOf(ForestSage400, WarmAmberGold)))
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text("Dynamic Reward Earned", fontSize = 12.sp, color = TextMuted)
                        Text(
                            text = "+${outcome.coinsEarned} Carrot-Coins 🪙",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold,
                            color = WarmAmberGold
                        )
                    }
                    Text(
                        text = "+${outcome.xpEarned} Hero XP ⭐",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        color = ForestSage400
                    )
                }
            }
        }

        // Reflection Note
        item {
            OutlinedTextField(
                value = outcome.reflectionNote,
                onValueChange = onNoteChange,
                label = { Text("What somatic or cognitive cue helped most?", fontSize = 12.sp) },
                placeholder = { Text("e.g., The 4-7-8 exhale relaxed my jaw tension.", fontSize = 12.sp) },
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("input_reflection_note"),
                shape = RoundedCornerShape(14.dp),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = ForestSage400,
                    unfocusedBorderColor = WarmBorder,
                    focusedTextColor = TextPrimary,
                    unfocusedTextColor = TextPrimary
                )
            )
        }

        // Save & Finish Button
        item {
            Button(
                onClick = onSaveAndFinish,
                shape = RoundedCornerShape(16.dp),
                colors = ButtonDefaults.buttonColors(containerColor = ForestSage400),
                modifier = Modifier
                    .fillMaxWidth()
                    .height(54.dp)
                    .testTag("btn_save_urge_session")
            ) {
                Text(
                    text = "Save Session to Room & Hero Profile ✓",
                    fontSize = 15.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun UrgeHistoryBottomSheet(
    logs: List<UrgeLogEntity>,
    onDismiss: () -> Unit
) {
    ModalBottomSheet(
        onDismissRequest = onDismiss,
        containerColor = MaterialTheme.colorScheme.surface
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 8.dp)
        ) {
            Text(
                text = "📜 Privacy Room Storage: Urge History",
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onSurface
            )
            Text(
                text = "Stored locally on-device. Zero unencrypted telemetry.",
                fontSize = 11.sp,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            Spacer(modifier = Modifier.height(12.dp))

            if (logs.isEmpty()) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(32.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "No saved urge logs yet. Your completed waves will appear here.",
                        fontSize = 13.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        textAlign = TextAlign.Center
                    )
                }
            } else {
                LazyColumn(
                    verticalArrangement = Arrangement.spacedBy(8.dp),
                    modifier = Modifier
                        .fillMaxWidth()
                        .heightIn(max = 400.dp)
                ) {
                    items(logs) { log ->
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(12.dp))
                                .background(MaterialTheme.colorScheme.surfaceVariant)
                                .padding(12.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column(modifier = Modifier.weight(1f)) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Text(
                                        text = log.trigger,
                                        fontSize = 13.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = MaterialTheme.colorScheme.onSurface
                                    )
                                    Spacer(modifier = Modifier.width(6.dp))
                                    Text(
                                        text = "• ${log.outcomeStatus}",
                                        fontSize = 11.sp,
                                        color = ForestSage400,
                                        fontWeight = FontWeight.SemiBold
                                    )
                                }
                                Text(
                                    text = "${log.dateStr} at ${log.timeStr} • Intensity: ${log.preIntensity} ➔ ${log.postIntensity} (Δ -${log.intensityDelta})",
                                    fontSize = 11.sp,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                                if (log.somaticSensations.isNotEmpty()) {
                                    Text(
                                        text = "Body: ${log.somaticSensations.joinToString(", ")}",
                                        fontSize = 10.sp,
                                        color = PastelApricotAmber
                                    )
                                }
                            }
                            Column(horizontalAlignment = Alignment.End) {
                                Text(
                                    text = "+${log.coinsEarned} 🪙",
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = PastelApricotAmber
                                )
                                Text(
                                    text = "+${log.xpEarned} XP",
                                    fontSize = 11.sp,
                                    color = ForestSage400
                                )
                            }
                        }
                    }
                }
            }
            Spacer(modifier = Modifier.height(24.dp))
        }
    }
}
