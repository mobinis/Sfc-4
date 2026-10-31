package com.example.selfcarehero.ui.dialogs

import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.example.selfcarehero.model.BreathTechnique
import com.example.selfcarehero.ui.theme.*
import com.example.selfcarehero.ui.viewmodel.SelfCareViewModel
import com.example.selfcarehero.utils.SoundscapeEngine
import com.example.selfcarehero.utils.SoundscapeType
import kotlinx.coroutines.delay

enum class BreathPhase(val instruction: String, val color: Color) {
    INHALE("Inhale Gently", ForestSage400),
    HOLD_IN("Hold Breath", WarmAmberLight),
    EXHALE("Exhale Slowly", WarmTerracotta),
    HOLD_OUT("Rest Empty", ForestSage600)
}

@Composable
fun BreathPacerDialog(
    viewModel: SelfCareViewModel,
    onDismiss: () -> Unit
) {
    var selectedTechnique by remember { mutableStateOf(BreathTechnique.BOX_BREATHING) }
    var currentPhase by remember { mutableStateOf(BreathPhase.INHALE) }
    var phaseSecondsRemaining by remember { mutableIntStateOf(selectedTechnique.inhaleSeconds) }
    var completedCycles by remember { mutableIntStateOf(0) }
    var currentSound by remember { mutableStateOf(SoundscapeEngine.currentSoundscape) }

    // Breathing loop
    LaunchedEffect(selectedTechnique, currentPhase, phaseSecondsRemaining) {
        if (phaseSecondsRemaining > 1) {
            delay(1000L)
            phaseSecondsRemaining -= 1
        } else {
            delay(1000L)
            // Advance phase
            when (currentPhase) {
                BreathPhase.INHALE -> {
                    if (selectedTechnique.hold1Seconds > 0) {
                        currentPhase = BreathPhase.HOLD_IN
                        phaseSecondsRemaining = selectedTechnique.hold1Seconds
                    } else {
                        currentPhase = BreathPhase.EXHALE
                        phaseSecondsRemaining = selectedTechnique.exhaleSeconds
                    }
                }
                BreathPhase.HOLD_IN -> {
                    currentPhase = BreathPhase.EXHALE
                    phaseSecondsRemaining = selectedTechnique.exhaleSeconds
                }
                BreathPhase.EXHALE -> {
                    if (selectedTechnique.hold2Seconds > 0) {
                        currentPhase = BreathPhase.HOLD_OUT
                        phaseSecondsRemaining = selectedTechnique.hold2Seconds
                    } else {
                        completedCycles += 1
                        currentPhase = BreathPhase.INHALE
                        phaseSecondsRemaining = selectedTechnique.inhaleSeconds
                    }
                }
                BreathPhase.HOLD_OUT -> {
                    completedCycles += 1
                    currentPhase = BreathPhase.INHALE
                    phaseSecondsRemaining = selectedTechnique.inhaleSeconds
                }
            }
        }
    }

    // Animation scale
    val targetScale = when (currentPhase) {
        BreathPhase.INHALE -> 1.35f
        BreathPhase.HOLD_IN -> 1.35f
        BreathPhase.EXHALE -> 0.85f
        BreathPhase.HOLD_OUT -> 0.85f
    }

    val animatedScale by animateFloatAsState(
        targetValue = targetScale,
        animationSpec = tween(
            durationMillis = when (currentPhase) {
                BreathPhase.INHALE -> selectedTechnique.inhaleSeconds * 1000
                BreathPhase.EXHALE -> selectedTechnique.exhaleSeconds * 1000
                else -> 400
            },
            easing = FastOutSlowInEasing
        ),
        label = "breath_scale"
    )

    DisposableEffect(Unit) {
        onDispose {
            SoundscapeEngine.stop()
        }
    }

    Dialog(
        onDismissRequest = {
            SoundscapeEngine.stop()
            onDismiss()
        },
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Card(
            shape = RoundedCornerShape(24.dp),
            colors = CardDefaults.cardColors(containerColor = WarmCharcoal950),
            modifier = Modifier
                .fillMaxWidth(0.94f)
                .padding(vertical = 24.dp)
                .border(1.dp, WarmBorder, RoundedCornerShape(24.dp))
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(24.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                // Header
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(
                            text = "Somatic Breath Pacer",
                            fontWeight = FontWeight.Bold,
                            fontSize = 17.sp,
                            color = TextPrimary
                        )
                        Text(
                            text = "${completedCycles} Cycles Completed",
                            fontSize = 12.sp,
                            color = ForestSage400
                        )
                    }

                    IconButton(
                        onClick = {
                            SoundscapeEngine.stop()
                            onDismiss()
                        },
                        modifier = Modifier.testTag("breath_close_button")
                    ) {
                        Icon(Icons.Default.Close, contentDescription = "Close", tint = TextMuted)
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Technique Selector Tabs
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(12.dp))
                        .background(WarmSurface800)
                        .padding(4.dp),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    BreathTechnique.entries.forEach { tech ->
                        val isSelected = tech == selectedTechnique
                        Box(
                            modifier = Modifier
                                .weight(1f)
                                .clip(RoundedCornerShape(8.dp))
                                .background(if (isSelected) ForestSage700 else Color.Transparent)
                                .clickable {
                                    selectedTechnique = tech
                                    currentPhase = BreathPhase.INHALE
                                    phaseSecondsRemaining = tech.inhaleSeconds
                                }
                                .padding(vertical = 8.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = tech.name.split("_").first(),
                                fontSize = 11.sp,
                                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                                color = if (isSelected) WarmAmberLight else TextMuted
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(28.dp))

                // Pulsing Breathing Circle
                Box(
                    modifier = Modifier
                        .size(200.dp),
                    contentAlignment = Alignment.Center
                ) {
                    // Outer aura ring
                    Box(
                        modifier = Modifier
                            .size(175.dp)
                            .scale(animatedScale)
                            .clip(CircleShape)
                            .background(
                                Brush.radialGradient(
                                    colors = listOf(
                                        currentPhase.color.copy(alpha = 0.35f),
                                        currentPhase.color.copy(alpha = 0.08f),
                                        Color.Transparent
                                    )
                                )
                            )
                    )

                    // Solid inner core
                    Box(
                        modifier = Modifier
                            .size(115.dp)
                            .scale(animatedScale)
                            .clip(CircleShape)
                            .background(
                                Brush.verticalGradient(
                                    colors = listOf(
                                        currentPhase.color.copy(alpha = 0.9f),
                                        ForestSage800
                                    )
                                )
                            )
                            .border(2.dp, currentPhase.color, CircleShape),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "$phaseSecondsRemaining",
                            fontSize = 38.sp,
                            fontWeight = FontWeight.ExtraBold,
                            color = TextPrimary
                        )
                    }
                }

                Spacer(modifier = Modifier.height(20.dp))

                Text(
                    text = currentPhase.instruction,
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    color = currentPhase.color
                )
                Text(
                    text = selectedTechnique.description,
                    fontSize = 12.sp,
                    color = TextMuted,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.padding(horizontal = 16.dp, vertical = 4.dp)
                )

                Spacer(modifier = Modifier.height(20.dp))

                // Ambient Soundscape Selector
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(12.dp))
                        .background(WarmSurface700)
                        .padding(horizontal = 12.dp, vertical = 8.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(currentSound.icon, fontSize = 18.sp)
                        Spacer(modifier = Modifier.width(8.dp))
                        Column {
                            Text("Ambient Sound", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = TextPrimary)
                            Text(currentSound.label, fontSize = 11.sp, color = TextMuted)
                        }
                    }

                    Row {
                        SoundscapeType.entries.filter { it != SoundscapeType.OFF }.forEach { st ->
                            IconButton(
                                onClick = {
                                    if (currentSound == st) {
                                        SoundscapeEngine.stop()
                                        currentSound = SoundscapeType.OFF
                                    } else {
                                        SoundscapeEngine.play(st)
                                        currentSound = st
                                    }
                                },
                                modifier = Modifier.size(36.dp)
                            ) {
                                Text(
                                    text = st.icon,
                                    fontSize = if (currentSound == st) 18.sp else 14.sp
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}
