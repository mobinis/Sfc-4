package com.example.selfcarehero.ui.dialogs

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
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
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.example.selfcarehero.model.DateUtils
import com.example.selfcarehero.model.LearnItem
import com.example.selfcarehero.ui.theme.*
import com.example.selfcarehero.ui.viewmodel.SelfCareViewModel

@Composable
fun TeachBackDialog(
    item: LearnItem,
    viewModel: SelfCareViewModel,
    onDismiss: () -> Unit
) {
    var explanation by remember { mutableStateOf(item.getEffectiveExplanation()) }
    var selectedMastery by remember { mutableStateOf(item.masteryRating ?: 2) } // default 2 (Solid)
    var selectedIntervalDays by remember {
        mutableStateOf(
            when (item.masteryRating) {
                1 -> 1
                3 -> 14
                else -> 4
            }
        )
    }
    var showPeekReference by remember { mutableStateOf(false) }

    val isFirstTime = item.teachBackCount == 0
    val potentialXp = if (isFirstTime) 25 else 15
    val potentialCoins = if (isFirstTime) 3 else 2

    Dialog(onDismissRequest = onDismiss) {
        Card(
            shape = RoundedCornerShape(22.dp),
            colors = CardDefaults.cardColors(containerColor = SurfaceCard),
            border = CardDefaults.outlinedCardBorder().copy(
                brush = androidx.compose.ui.graphics.SolidColor(AmberGold.copy(alpha = 0.5f))
            ),
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 12.dp)
                .testTag("teach_back_dialog")
        ) {
            Column(
                modifier = Modifier
                    .padding(18.dp)
                    .verticalScroll(rememberScrollState())
            ) {
                // Header Row
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.weight(1f)
                    ) {
                        Text(text = "🧠", fontSize = 22.sp)
                        Spacer(modifier = Modifier.width(8.dp))
                        Column {
                            Text(
                                text = "Teach-Back & Active Recall",
                                fontWeight = FontWeight.Bold,
                                fontSize = 15.sp,
                                color = TextPrimary
                            )
                            Text(
                                text = "Feynman Elaboration & Retrieval Practice",
                                fontSize = 11.sp,
                                color = AmberLight
                            )
                        }
                    }

                    IconButton(
                        onClick = onDismiss,
                        modifier = Modifier
                            .size(36.dp)
                            .testTag("teach_back_close_button")
                    ) {
                        Text("✕", fontSize = 16.sp, color = TextMuted)
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))

                // Concept Pill Card
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(12.dp))
                        .background(Emerald900.copy(alpha = 0.6f))
                        .border(1.dp, Emerald600.copy(alpha = 0.4f), RoundedCornerShape(12.dp))
                        .padding(12.dp)
                ) {
                    Column {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween,
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text(
                                text = item.title,
                                fontWeight = FontWeight.Bold,
                                fontSize = 16.sp,
                                color = TextPrimary
                            )
                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(6.dp))
                                    .background(Emerald800)
                                    .padding(horizontal = 6.dp, vertical = 2.dp)
                            ) {
                                Text(
                                    text = item.category.uppercase(),
                                    fontSize = 9.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = AmberGold
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(6.dp))

                        // Active Recall Peek / Hide Toggle
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text(
                                text = if (!showPeekReference) "💡 Recall from pure memory first" else "📖 Reference definition:",
                                fontSize = 11.sp,
                                color = if (!showPeekReference) AmberLight else TextMuted
                            )
                            TextButton(
                                onClick = { showPeekReference = !showPeekReference },
                                contentPadding = PaddingValues(horizontal = 8.dp, vertical = 2.dp),
                                modifier = Modifier
                                    .height(32.dp)
                                    .testTag("toggle_peek_reference")
                            ) {
                                Text(
                                    text = if (showPeekReference) "🙈 Hide Reference" else "👁️ Peek at Hint",
                                    fontSize = 11.sp,
                                    color = TealAccent,
                                    fontWeight = FontWeight.SemiBold
                                )
                            }
                        }

                        AnimatedVisibility(visible = showPeekReference) {
                            Column(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(top = 6.dp)
                                    .clip(RoundedCornerShape(8.dp))
                                    .background(SurfaceCardVariant)
                                    .padding(8.dp)
                            ) {
                                Text(
                                    text = item.summary,
                                    fontSize = 12.sp,
                                    color = TextSecondary,
                                    lineHeight = 16.sp
                                )
                                if (item.whyNote.isNotBlank()) {
                                    Spacer(modifier = Modifier.height(4.dp))
                                    Text(
                                        text = "Why it matters: ${item.whyNote}",
                                        fontSize = 11.sp,
                                        color = AmberLight
                                    )
                                }
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))

                // Guided Prompt Starters (Scaffolding)
                Text(
                    text = "Prompt Starters (tap to insert):",
                    fontSize = 11.sp,
                    color = TextMuted,
                    fontWeight = FontWeight.SemiBold
                )
                Spacer(modifier = Modifier.height(4.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    val prompts = listOf(
                        "ELI10 (Simple)" to "In plain words: ",
                        "Real Example" to "For instance, when I: ",
                        "Action Plan" to "When this happens, I will: "
                    )
                    prompts.forEach { (label, prefix) ->
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(8.dp))
                                .background(SurfaceCardVariant)
                                .border(1.dp, LineBorder, RoundedCornerShape(8.dp))
                                .clickable {
                                    explanation = if (explanation.isBlank()) {
                                        prefix
                                    } else {
                                        explanation.trimEnd() + "\n" + prefix
                                    }
                                }
                                .padding(horizontal = 8.dp, vertical = 6.dp)
                        ) {
                            Text(text = "+ $label", fontSize = 10.sp, color = AmberLight)
                        }
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))

                // User Explanation Field
                Text(
                    text = "Your Own Explanation (Feynman Technique):",
                    fontSize = 12.sp,
                    color = TextPrimary,
                    fontWeight = FontWeight.Bold
                )
                Spacer(modifier = Modifier.height(4.dp))
                OutlinedTextField(
                    value = explanation,
                    onValueChange = { explanation = it },
                    placeholder = {
                        Text(
                            text = "Explain this principle in your own words. How would you teach it to someone else? How does it show up in your real life?",
                            fontSize = 12.sp,
                            color = TextMuted
                        )
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .heightIn(min = 100.dp, max = 160.dp)
                        .testTag("input_teach_back_explanation"),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = Emerald500,
                        unfocusedBorderColor = LineBorder,
                        focusedTextColor = TextPrimary,
                        unfocusedTextColor = TextPrimary
                    )
                )

                Spacer(modifier = Modifier.height(14.dp))

                // Self-Assessment Rubrics & Spaced Repetition Scheduling
                Text(
                    text = "Self-Assessment & Spaced Recall Interval:",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    color = TextPrimary
                )
                Text(
                    text = "Be honest. Honest ratings schedule optimal recall spacing.",
                    fontSize = 11.sp,
                    color = TextMuted
                )

                Spacer(modifier = Modifier.height(8.dp))

                val rubrics = listOf(
                    Triple(1, "🔴 Struggled", 1),
                    Triple(2, "🟡 Solid", 4),
                    Triple(3, "🟢 Mastered", 14)
                )

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    rubrics.forEach { (rating, label, interval) ->
                        val selected = selectedMastery == rating
                        Box(
                            modifier = Modifier
                                .weight(1f)
                                .clip(RoundedCornerShape(10.dp))
                                .background(if (selected) Emerald800 else SurfaceCardVariant)
                                .border(
                                    width = if (selected) 2.dp else 1.dp,
                                    color = if (selected) AmberGold else LineBorder,
                                    shape = RoundedCornerShape(10.dp)
                                )
                                .clickable {
                                    selectedMastery = rating
                                    selectedIntervalDays = interval
                                }
                                .padding(vertical = 10.dp, horizontal = 4.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                Text(
                                    text = label,
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = if (selected) AmberLight else TextPrimary
                                )
                                Spacer(modifier = Modifier.height(2.dp))
                                Text(
                                    text = "Recall in ${interval}d",
                                    fontSize = 10.sp,
                                    color = if (selected) TextPrimary else TextMuted
                                )
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                // Dynamic Gamification Callout
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(10.dp))
                        .background(Emerald900)
                        .border(1.dp, AmberGold.copy(alpha = 0.4f), RoundedCornerShape(10.dp))
                        .padding(horizontal = 12.dp, vertical = 8.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(text = "🪙", fontSize = 16.sp)
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = if (isFirstTime) "First Teach-Back Bonus" else "Spaced Recall Compounding",
                                fontSize = 11.sp,
                                color = AmberLight,
                                fontWeight = FontWeight.Bold
                            )
                        }
                        Text(
                            text = "+$potentialCoins 🪙 • +$potentialXp XP",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                            color = AmberGold
                        )
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Action Buttons
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.End,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    TextButton(
                        onClick = onDismiss,
                        modifier = Modifier.height(48.dp)
                    ) {
                        Text("Cancel", color = TextMuted, fontSize = 13.sp)
                    }

                    Spacer(modifier = Modifier.width(8.dp))

                    Button(
                        onClick = {
                            if (explanation.isNotBlank()) {
                                viewModel.submitTeachBack(
                                    learnId = item.id,
                                    explanation = explanation.trim(),
                                    masteryRating = selectedMastery,
                                    intervalDays = selectedIntervalDays
                                )
                            }
                        },
                        enabled = explanation.isNotBlank(),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = MaterialTheme.colorScheme.primary,
                            contentColor = androidx.compose.ui.graphics.Color.White
                        ),
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier
                            .height(48.dp)
                            .testTag("save_teach_back_button")
                    ) {
                        Text(
                            text = "Save & Schedule Recall ✓",
                            fontWeight = FontWeight.SemiBold,
                            color = androidx.compose.ui.graphics.Color.White,
                            fontSize = 13.sp
                        )
                    }
                }
            }
        }
    }
}
