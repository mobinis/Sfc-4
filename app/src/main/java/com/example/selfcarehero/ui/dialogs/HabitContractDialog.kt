package com.example.selfcarehero.ui.dialogs

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
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
import com.example.selfcarehero.model.NodeItem
import com.example.selfcarehero.ui.theme.*
import com.example.selfcarehero.ui.viewmodel.SelfCareViewModel
import kotlin.math.roundToInt

@Composable
fun HabitContractDialog(
    viewModel: SelfCareViewModel,
    onDismiss: () -> Unit
) {
    val state by viewModel.state.collectAsState()
    val availableHabits = state.nodes.filter { it.p != "0" }

    var selectedHabit by remember { mutableStateOf<NodeItem?>(availableHabits.firstOrNull()) }
    var selectedCoins by remember { mutableStateOf(10.coerceAtMost(state.coins.coerceAtLeast(5))) }
    var selectedTargetDays by remember { mutableStateOf(7) }

    val coinOptions = listOf(5, 10, 15, 20, 30).filter { it <= state.coins.coerceAtLeast(5) }
    val durationOptions = listOf(7, 14, 21)

    val multiplier = when (selectedTargetDays) {
        7 -> 1.5
        14 -> 1.75
        21 -> 2.0
        else -> 1.5
    }
    val potentialPayout = (selectedCoins * multiplier).roundToInt()
    val canStake = state.coins >= selectedCoins && selectedCoins > 0 && selectedHabit != null

    Dialog(onDismissRequest = onDismiss) {
        Card(
            shape = RoundedCornerShape(22.dp),
            colors = CardDefaults.cardColors(containerColor = WarmSurface800),
            border = CardDefaults.outlinedCardBorder().copy(
                brush = androidx.compose.ui.graphics.SolidColor(WarmAmberGold)
            ),
            modifier = Modifier
                .padding(12.dp)
                .fillMaxWidth()
                .testTag("dialog_habit_contract")
        ) {
            Column(
                modifier = Modifier
                    .padding(20.dp)
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
                            text = "🪙 Habit Staking Contract",
                            fontWeight = FontWeight.Bold,
                            fontSize = 17.sp,
                            color = WarmAmberLight
                        )
                        Text(
                            text = "Commit coins into escrow for 1.5x return",
                            fontSize = 11.sp,
                            color = TextMuted
                        )
                    }

                    Text(
                        text = "Balance: ${state.coins} 🪙",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        color = WarmAmberGold
                    )
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Select Target Habit
                Text(
                    text = "1. CHOOSE COMMITMENT HABIT",
                    fontWeight = FontWeight.Bold,
                    fontSize = 11.sp,
                    color = ForestSage400
                )
                Spacer(modifier = Modifier.height(8.dp))

                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(12.dp))
                        .background(WarmCharcoal950)
                        .padding(8.dp),
                    verticalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    availableHabits.take(6).forEach { habit ->
                        val isSelected = selectedHabit?.id == habit.id
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(8.dp))
                                .background(if (isSelected) WarmSurface800 else Color.Transparent)
                                .border(
                                    1.dp,
                                    if (isSelected) WarmAmberGold else Color.Transparent,
                                    RoundedCornerShape(8.dp)
                                )
                                .clickable { selectedHabit = habit }
                                .padding(horizontal = 10.dp, vertical = 8.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text(habit.e, fontSize = 16.sp)
                                Spacer(modifier = Modifier.width(8.dp))
                                Text(
                                    text = habit.n,
                                    fontSize = 12.sp,
                                    fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                                    color = if (isSelected) TextPrimary else TextSecondary
                                )
                            }
                            if (isSelected) {
                                Text("✓", color = WarmAmberGold, fontWeight = FontWeight.Bold)
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Select Staked Coins
                Text(
                    text = "2. STAKE CARROT-COINS (ESCROW)",
                    fontWeight = FontWeight.Bold,
                    fontSize = 11.sp,
                    color = ForestSage400
                )
                Spacer(modifier = Modifier.height(8.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    val chips = if (coinOptions.isNotEmpty()) coinOptions else listOf(5, 10)
                    chips.forEach { coins ->
                        val isSelected = selectedCoins == coins
                        Box(
                            modifier = Modifier
                                .weight(1f)
                                .clip(RoundedCornerShape(10.dp))
                                .background(if (isSelected) WarmAmberGold else WarmSurface800)
                                .border(
                                    1.dp,
                                    if (isSelected) WarmAmberLight else WarmBorder,
                                    RoundedCornerShape(10.dp)
                                )
                                .clickable { selectedCoins = coins }
                                .padding(vertical = 8.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = "$coins 🪙",
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold,
                                color = if (isSelected) WarmCharcoal950 else TextPrimary
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Select Target Commitment Days
                Text(
                    text = "3. COMMITMENT DURATION",
                    fontWeight = FontWeight.Bold,
                    fontSize = 11.sp,
                    color = ForestSage400
                )
                Spacer(modifier = Modifier.height(8.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    durationOptions.forEach { days ->
                        val isSelected = selectedTargetDays == days
                        val optMultiplier = when (days) {
                            7 -> "1.5x"
                            14 -> "1.75x"
                            21 -> "2.0x"
                            else -> "1.5x"
                        }
                        Box(
                            modifier = Modifier
                                .weight(1f)
                                .clip(RoundedCornerShape(10.dp))
                                .background(if (isSelected) ForestSage700 else WarmSurface800)
                                .border(
                                    1.dp,
                                    if (isSelected) ForestSage400 else WarmBorder,
                                    RoundedCornerShape(10.dp)
                                )
                                .clickable { selectedTargetDays = days }
                                .padding(vertical = 8.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                Text(
                                    text = "$days Days",
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = if (isSelected) WarmAmberLight else TextPrimary
                                )
                                Text(
                                    text = optMultiplier,
                                    fontSize = 10.sp,
                                    color = if (isSelected) TextPrimary else TextMuted
                                )
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Escrow Contract Summary Card
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(12.dp))
                        .background(WarmCharcoal950)
                        .padding(12.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text("Staked in Escrow:", fontSize = 12.sp, color = TextMuted)
                        Text("$selectedCoins Carrot-Coins", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = TextPrimary)
                    }
                    Spacer(modifier = Modifier.height(4.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text("Success Return:", fontSize = 12.sp, color = TextMuted)
                        Text("$potentialPayout Coins (+50% bonus)", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Emerald400)
                    }
                    Spacer(modifier = Modifier.height(4.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text("Emergency Protection:", fontSize = 12.sp, color = TextMuted)
                        Text("Streak Shield Tokens (${state.restDayTokens})", fontSize = 12.sp, color = WarmAmberLight)
                    }
                }

                Spacer(modifier = Modifier.height(20.dp))

                // Bottom Buttons
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.End
                ) {
                    TextButton(onClick = onDismiss) {
                        Text("Cancel", color = TextMuted)
                    }
                    Spacer(modifier = Modifier.width(8.dp))
                    Button(
                        onClick = {
                            selectedHabit?.let { habit ->
                                viewModel.createHabitContract(
                                    habitId = habit.id,
                                    habitName = habit.n,
                                    stakedCoins = selectedCoins,
                                    targetDays = selectedTargetDays
                                )
                            }
                        },
                        enabled = canStake,
                        colors = ButtonDefaults.buttonColors(
                            containerColor = MaterialTheme.colorScheme.primary,
                            contentColor = androidx.compose.ui.graphics.Color.White
                        ),
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier.testTag("btn_seal_contract")
                    ) {
                        Text(
                            text = if (state.coins < selectedCoins) "Need ${selectedCoins - state.coins} More Coins" else "Seal Contract ($selectedCoins 🪙)",
                            fontWeight = FontWeight.SemiBold,
                            color = androidx.compose.ui.graphics.Color.White
                        )
                    }
                }
            }
        }
    }
}
