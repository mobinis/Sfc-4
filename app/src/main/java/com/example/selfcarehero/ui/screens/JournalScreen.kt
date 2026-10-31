package com.example.selfcarehero.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.selfcarehero.ui.theme.*
import com.example.selfcarehero.ui.viewmodel.SelfCareViewModel

@Composable
fun JournalScreen(
    viewModel: SelfCareViewModel,
    modifier: Modifier = Modifier
) {
    val state by viewModel.state.collectAsState()

    var selectedMood by remember { mutableStateOf(3) }
    var journalText by remember { mutableStateOf("") }
    var selectedTags by remember { mutableStateOf(setOf<String>()) }

    var goodDeedText by remember { mutableStateOf("") }
    var goodDeedTarget by remember { mutableStateOf("others") } // "self" or "others"

    val moodEmojis = remember { listOf("😞", "😕", "😐", "🙂", "😄") }
    val moodLabels = remember { listOf("Rough", "Low", "Neutral", "Good", "Great") }
    val availableTags = remember { listOf("Grateful", "Peaceful", "Focused", "Fatigued", "Creative", "Renewed") }
    val recentEntries by remember(state.jr) { derivedStateOf { state.jr.take(10) } }

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp),
        contentPadding = PaddingValues(top = 8.dp, bottom = 120.dp)
    ) {
        item {
            Text(
                text = "Daily Reflection & Mood",
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onSurface
            )
            Text(
                text = "Track your feelings, mental shifts, and small acts of kindness",
                fontSize = 12.sp,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            Spacer(modifier = Modifier.height(12.dp))
        }

        // Mood Rating Selector Card
        item {
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 6.dp)
                    .testTag("journal_mood_card"),
                shape = RoundedCornerShape(18.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                border = CardDefaults.outlinedCardBorder().copy(
                    brush = Brush.linearGradient(
                        listOf(MaterialTheme.colorScheme.outline, MaterialTheme.colorScheme.outline)
                    )
                )
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(14.dp)
                ) {
                    Text(
                        text = "Emotional Climate Selector",
                        fontWeight = FontWeight.Bold,
                        fontSize = 14.sp,
                        color = MaterialTheme.colorScheme.onSurface
                    )

                    Spacer(modifier = Modifier.height(10.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        moodEmojis.forEachIndexed { index, emoji ->
                            val isSelected = selectedMood == index
                            Surface(
                                onClick = { selectedMood = index },
                                shape = RoundedCornerShape(14.dp),
                                color = if (isSelected) MaterialTheme.colorScheme.primaryContainer else MaterialTheme.colorScheme.surfaceVariant,
                                border = CardDefaults.outlinedCardBorder().copy(
                                    brush = androidx.compose.ui.graphics.SolidColor(
                                        if (isSelected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.outline
                                    )
                                ),
                                modifier = Modifier
                                    .minimumInteractiveComponentSize()
                                    .sizeIn(minWidth = 52.dp, minHeight = 52.dp)
                                    .testTag("mood_emoji_$index")
                            ) {
                                Column(
                                    horizontalAlignment = Alignment.CenterHorizontally,
                                    verticalArrangement = Arrangement.Center,
                                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 6.dp)
                                ) {
                                    Text(text = emoji, fontSize = 24.sp)
                                    Spacer(modifier = Modifier.height(2.dp))
                                    Text(
                                        text = moodLabels[index],
                                        fontSize = 10.sp,
                                        color = if (isSelected) MaterialTheme.colorScheme.onSurface else MaterialTheme.colorScheme.onSurfaceVariant,
                                        fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium
                                    )
                                }
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(14.dp))

                    OutlinedTextField(
                        value = journalText,
                        onValueChange = { journalText = it },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(95.dp)
                            .testTag("journal_input"),
                        placeholder = {
                            Text(
                                "What made you smile or what felt heavy today?",
                                fontSize = 13.sp,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        },
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = PastelApricotAmber,
                            unfocusedBorderColor = MaterialTheme.colorScheme.outline,
                            focusedTextColor = MaterialTheme.colorScheme.onSurface,
                            unfocusedTextColor = MaterialTheme.colorScheme.onSurface,
                            cursorColor = PastelApricotAmber
                        ),
                        shape = RoundedCornerShape(12.dp)
                    )

                    Spacer(modifier = Modifier.height(8.dp))

                    // Tags
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        availableTags.forEach { tag ->
                            val isChecked = selectedTags.contains(tag)
                            FilterChip(
                                selected = isChecked,
                                onClick = {
                                    selectedTags = if (isChecked) selectedTags - tag else selectedTags + tag
                                },
                                label = { Text(text = "#$tag", fontSize = 10.sp) },
                                colors = FilterChipDefaults.filterChipColors(
                                    selectedContainerColor = PastelSoftBlush,
                                    selectedLabelColor = MaterialTheme.colorScheme.onSurface,
                                    containerColor = MaterialTheme.colorScheme.surfaceVariant,
                                    labelColor = MaterialTheme.colorScheme.onSurfaceVariant
                                ),
                                border = FilterChipDefaults.filterChipBorder(
                                    enabled = true,
                                    selected = isChecked,
                                    borderColor = if (isChecked) PastelBlossomPink else MaterialTheme.colorScheme.outline
                                )
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Button(
                            onClick = {
                                if (journalText.isNotBlank()) {
                                    viewModel.addJournalEntry(selectedMood, journalText, selectedTags.toList())
                                    journalText = ""
                                    selectedTags = emptySet()
                                }
                            },
                            enabled = journalText.isNotBlank(),
                            shape = RoundedCornerShape(12.dp),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = MaterialTheme.colorScheme.primary,
                                contentColor = androidx.compose.ui.graphics.Color.White
                            ),
                            modifier = Modifier
                                .weight(1f)
                                .height(44.dp)
                                .testTag("btn_save_journal")
                        ) {
                            Text(text = "Save (+15 XP)", color = androidx.compose.ui.graphics.Color.White, fontWeight = FontWeight.SemiBold, fontSize = 13.sp)
                        }

                        OutlinedButton(
                            onClick = {
                                viewModel.openLocalAi("Analyze reflection: $journalText")
                            },
                            enabled = journalText.isNotBlank(),
                            shape = RoundedCornerShape(12.dp),
                            colors = ButtonDefaults.outlinedButtonColors(
                                contentColor = MaterialTheme.colorScheme.onSurface
                            ),
                            border = ButtonDefaults.outlinedButtonBorder.copy(
                                brush = Brush.linearGradient(listOf(PastelApricotAmber, PastelBlossomPink))
                            ),
                            modifier = Modifier
                                .height(44.dp)
                                .testTag("btn_ai_reframe_journal")
                        ) {
                            Text(text = "🤖 Reframe", fontWeight = FontWeight.Bold, fontSize = 13.sp)
                        }
                    }
                }
            }
        }

        // Good Deeds Card
        item {
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 6.dp),
                shape = RoundedCornerShape(18.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                border = CardDefaults.outlinedCardBorder().copy(
                    brush = Brush.linearGradient(
                        listOf(MaterialTheme.colorScheme.outline, MaterialTheme.colorScheme.outline)
                    )
                )
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(14.dp)
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(text = "❤️", fontSize = 16.sp)
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = "Acts of Kindness & Good Deeds",
                            fontWeight = FontWeight.Bold,
                            fontSize = 14.sp,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                    }

                    Spacer(modifier = Modifier.height(8.dp))

                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        FilterChip(
                            selected = goodDeedTarget == "others",
                            onClick = { goodDeedTarget = "others" },
                            label = { Text("For Others 🤲", fontSize = 11.sp) },
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = PastelSoftBlush,
                                selectedLabelColor = MaterialTheme.colorScheme.onSurface,
                                containerColor = MaterialTheme.colorScheme.surfaceVariant,
                                labelColor = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        )
                        FilterChip(
                            selected = goodDeedTarget == "self",
                            onClick = { goodDeedTarget = "self" },
                            label = { Text("Self-Compassion 🧘", fontSize = 11.sp) },
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = PastelSoftBlush,
                                selectedLabelColor = MaterialTheme.colorScheme.onSurface,
                                containerColor = MaterialTheme.colorScheme.surfaceVariant,
                                labelColor = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        )
                    }

                    Spacer(modifier = Modifier.height(8.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        OutlinedTextField(
                            value = goodDeedText,
                            onValueChange = { goodDeedText = it },
                            modifier = Modifier
                                .weight(1f)
                                .height(50.dp)
                                .testTag("input_good_deed"),
                            placeholder = {
                                Text(
                                    "Helped colleague / Drank warm tea...",
                                    fontSize = 12.sp,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            },
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = PastelApricotAmber,
                                unfocusedBorderColor = MaterialTheme.colorScheme.outline,
                                focusedTextColor = MaterialTheme.colorScheme.onSurface,
                                unfocusedTextColor = MaterialTheme.colorScheme.onSurface
                            ),
                            shape = RoundedCornerShape(10.dp)
                        )

                        Spacer(modifier = Modifier.width(8.dp))

                        Button(
                            onClick = {
                                if (goodDeedText.isNotBlank()) {
                                    viewModel.addGoodDeed(goodDeedTarget, goodDeedText)
                                    goodDeedText = ""
                                }
                            },
                            enabled = goodDeedText.isNotBlank(),
                            shape = RoundedCornerShape(12.dp),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = MaterialTheme.colorScheme.primary,
                                contentColor = androidx.compose.ui.graphics.Color.White
                            ),
                            contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp),
                            modifier = Modifier.height(48.dp)
                        ) {
                            Text("Log ❤️", color = androidx.compose.ui.graphics.Color.White, fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                        }
                    }
                }
            }
        }

        // Recent Entries Title
        item {
            Spacer(modifier = Modifier.height(10.dp))
            Text(
                text = "Recent Journal Timeline",
                fontSize = 15.sp,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onSurface
            )
            Spacer(modifier = Modifier.height(6.dp))
        }

        if (state.jr.isEmpty()) {
            item {
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 8.dp),
                    shape = RoundedCornerShape(14.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(20.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text("📖", fontSize = 28.sp)
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(
                            text = "No reflections recorded yet. Your journey begins today!",
                            fontSize = 13.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            textAlign = androidx.compose.ui.text.style.TextAlign.Center
                        )
                    }
                }
            }
        } else {
            items(recentEntries, key = { it.id }) { entry ->
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 4.dp),
                    shape = RoundedCornerShape(14.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant),
                    border = CardDefaults.outlinedCardBorder().copy(
                        brush = Brush.linearGradient(
                            listOf(MaterialTheme.colorScheme.outline, MaterialTheme.colorScheme.outline)
                        )
                    )
                ) {
                    Column(modifier = Modifier.padding(12.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text(text = moodEmojis.getOrElse(entry.m) { "😐" }, fontSize = 16.sp)
                                Spacer(modifier = Modifier.width(6.dp))
                                Text(text = entry.d, fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                            }
                            if (entry.g.isNotEmpty()) {
                                Text(
                                    text = entry.g.joinToString(" ") { "#$it" },
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.SemiBold,
                                    color = PastelApricotAmber
                                )
                            }
                        }
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(
                            text = entry.t,
                            fontSize = 13.sp,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                    }
                }
            }
        }
    }
}
