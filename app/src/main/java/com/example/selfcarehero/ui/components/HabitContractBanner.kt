package com.example.selfcarehero.ui.components

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
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
import com.example.selfcarehero.model.DateUtils
import com.example.selfcarehero.model.HabitContract
import com.example.selfcarehero.ui.theme.*
import com.example.selfcarehero.ui.viewmodel.SelfCareViewModel
import kotlin.math.roundToInt

@Composable
fun HabitContractBanner(
    viewModel: SelfCareViewModel,
    modifier: Modifier = Modifier
) {
    val state by viewModel.state.collectAsState()
    val activeContract = state.habitContracts.firstOrNull { it.status == "active" }
    val wonContractsCount = state.habitContracts.count { it.status == "won" }
    val isBroken = activeContract?.hasStreakBreak() == true
    val missedDates = activeContract?.getMissedBreakDates() ?: emptyList()

    Card(
        modifier = modifier
            .fillMaxWidth()
            .padding(vertical = 6.dp)
            .testTag("habit_contract_banner"),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(
            containerColor = when {
                isBroken -> Color(0xFF241517) // Warning dark maroon background
                activeContract != null -> WarmSurface800
                else -> WarmSurface800.copy(alpha = 0.85f)
            }
        ),
        border = CardDefaults.outlinedCardBorder().copy(
            brush = androidx.compose.ui.graphics.SolidColor(
                when {
                    isBroken -> Color(0xFFEF5350)
                    activeContract != null -> WarmAmberGold
                    else -> WarmBorder
                }
            )
        )
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(14.dp)
        ) {
            // Header Row
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(if (isBroken) "⚠️" else "🪙", fontSize = 18.sp)
                    Spacer(modifier = Modifier.width(8.dp))
                    Column {
                        Text(
                            text = if (isBroken) "Streak Break Alert" else "Habit Staking Escrow",
                            fontWeight = FontWeight.Bold,
                            fontSize = 13.sp,
                            color = if (isBroken) Color(0xFFFF8A80) else TextPrimary
                        )
                        Text(
                            text = when {
                                isBroken -> "Shield redemption required to prevent forfeit"
                                activeContract != null -> "Active 1.5x Multiplier Contract"
                                else -> "Loss-aversion commitment"
                            },
                            fontSize = 11.sp,
                            color = if (isBroken) Color(0xFFFFAB91) else if (activeContract != null) WarmAmberLight else TextMuted
                        )
                    }
                }

                if (activeContract != null) {
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(8.dp))
                            .background(
                                if (isBroken) Color(0xFFEF5350).copy(alpha = 0.2f)
                                else WarmAmberGold.copy(alpha = 0.2f)
                            )
                            .border(
                                1.dp,
                                if (isBroken) Color(0xFFEF5350) else WarmAmberGold,
                                RoundedCornerShape(8.dp)
                            )
                            .padding(horizontal = 8.dp, vertical = 3.dp)
                    ) {
                        Text(
                            text = if (isBroken) "⚠️ AT RISK" else "${activeContract.stakedCoins} 🪙 Escrowed",
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold,
                            color = if (isBroken) Color(0xFFFF8A80) else WarmAmberLight
                        )
                    }
                } else {
                    Button(
                        onClick = { viewModel.openHabitContractDialog() },
                        colors = ButtonDefaults.buttonColors(
                            containerColor = MaterialTheme.colorScheme.primary,
                            contentColor = androidx.compose.ui.graphics.Color.White
                        ),
                        contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp),
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier
                            .height(30.dp)
                            .testTag("btn_open_contract_dialog")
                    ) {
                        Text(
                            text = "+ Stake Coins",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = androidx.compose.ui.graphics.Color.White
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            if (activeContract != null) {
                val targetDays = activeContract.targetDays
                val daysCompleted = activeContract.daysCompleted
                val progress = if (targetDays > 0) (daysCompleted.toFloat() / targetDays.toFloat()).coerceIn(0f, 1f) else 0f
                val potentialReturn = (activeContract.stakedCoins * activeContract.multiplierReward).roundToInt()

                if (isBroken) {
                    // STREAK BREAK RESCUE CARD
                    val missedDayLabel = missedDates.firstOrNull()?.let { DateUtils.getDayLabel(it) } ?: "Yesterday"
                    val hasShield = state.restDayTokens > 0
                    val canQuickBuy = !hasShield && state.coins >= 12

                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(12.dp))
                            .background(WarmCharcoal950)
                            .border(1.dp, Color(0xFFEF5350).copy(alpha = 0.5f), RoundedCornerShape(12.dp))
                            .padding(12.dp)
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "Missed: ${activeContract.targetHabitName}",
                                fontWeight = FontWeight.Bold,
                                fontSize = 13.sp,
                                color = TextPrimary
                            )
                            Text(
                                text = "Day: $missedDayLabel",
                                fontSize = 11.sp,
                                color = Color(0xFFFF8A80),
                                fontWeight = FontWeight.Bold
                            )
                        }

                        Spacer(modifier = Modifier.height(6.dp))

                        Text(
                            text = "Accidental streak break! Without a shield, your ${activeContract.stakedCoins} 🪙 stake will be forfeited to the Penalty Vault.",
                            fontSize = 11.sp,
                            color = TextSecondary,
                            lineHeight = 15.sp
                        )

                        Spacer(modifier = Modifier.height(10.dp))

                        // Quick Rescue Action
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            if (hasShield) {
                                Button(
                                    onClick = { viewModel.redeemShieldForContract(activeContract.id, missedDates.firstOrNull()) },
                                    colors = ButtonDefaults.buttonColors(
                                        containerColor = MaterialTheme.colorScheme.primary,
                                        contentColor = androidx.compose.ui.graphics.Color.White
                                    ),
                                    shape = RoundedCornerShape(12.dp),
                                    contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp),
                                    modifier = Modifier
                                        .weight(1f)
                                        .height(34.dp)
                                        .testTag("btn_rescue_with_shield")
                                ) {
                                    Text(
                                        text = "🛡️ Consume Shield (${state.restDayTokens})",
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.SemiBold,
                                        color = androidx.compose.ui.graphics.Color.White
                                    )
                                }
                            } else if (canQuickBuy) {
                                Button(
                                    onClick = { viewModel.buyShieldAndRescueContract(activeContract.id) },
                                    colors = ButtonDefaults.buttonColors(
                                        containerColor = MaterialTheme.colorScheme.primary,
                                        contentColor = androidx.compose.ui.graphics.Color.White
                                    ),
                                    shape = RoundedCornerShape(12.dp),
                                    contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp),
                                    modifier = Modifier
                                        .weight(1f)
                                        .height(34.dp)
                                        .testTag("btn_quick_buy_rescue")
                                ) {
                                    Text(
                                        text = "🛒 Buy & Rescue (12 🪙)",
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.SemiBold,
                                        color = androidx.compose.ui.graphics.Color.White
                                    )
                                }
                            } else {
                                OutlinedButton(
                                    onClick = { viewModel.showRewardShopDialog.value = true },
                                    shape = RoundedCornerShape(8.dp),
                                    contentPadding = PaddingValues(horizontal = 8.dp, vertical = 4.dp),
                                    modifier = Modifier
                                        .weight(1f)
                                        .height(34.dp)
                                ) {
                                    Text(
                                        text = "🛒 Shop for Shield",
                                        fontSize = 11.sp,
                                        color = WarmAmberLight
                                    )
                                }
                            }

                            OutlinedButton(
                                onClick = { viewModel.openRescueDialog(activeContract) },
                                shape = RoundedCornerShape(8.dp),
                                contentPadding = PaddingValues(horizontal = 8.dp, vertical = 4.dp),
                                modifier = Modifier.height(34.dp)
                            ) {
                                Text("Details", fontSize = 11.sp, color = TextPrimary)
                            }
                        }
                    }
                } else {
                    // Normal Active Contract Card
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(12.dp))
                            .background(WarmCharcoal950.copy(alpha = 0.6f))
                            .padding(12.dp)
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = activeContract.targetHabitName,
                                fontWeight = FontWeight.Bold,
                                fontSize = 14.sp,
                                color = TextPrimary
                            )

                            Text(
                                text = "Reward: $potentialReturn 🪙 (+50%)",
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold,
                                color = Emerald400
                            )
                        }

                        Spacer(modifier = Modifier.height(8.dp))

                        LinearProgressIndicator(
                            progress = { progress },
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(8.dp)
                                .clip(RoundedCornerShape(4.dp)),
                            color = WarmAmberGold,
                            trackColor = WarmBorder
                        )

                        Spacer(modifier = Modifier.height(6.dp))

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text(
                                text = "Day $daysCompleted of $targetDays completed",
                                fontSize = 11.sp,
                                color = TextSecondary
                            )

                            if (activeContract.protectedDates.isNotEmpty()) {
                                Text(
                                    text = "🛡️ ${activeContract.protectedDates.size} shield absorbed",
                                    fontSize = 11.sp,
                                    color = WarmAmberLight
                                )
                            } else {
                                Text(
                                    text = "${targetDays - daysCompleted} days to unlock",
                                    fontSize = 11.sp,
                                    color = TextMuted
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(10.dp))

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            OutlinedButton(
                                onClick = { viewModel.redeemShieldForContract(activeContract.id) },
                                enabled = state.restDayTokens > 0,
                                shape = RoundedCornerShape(8.dp),
                                contentPadding = PaddingValues(horizontal = 8.dp, vertical = 2.dp),
                                modifier = Modifier
                                    .height(30.dp)
                                    .testTag("btn_redeem_contract_shield")
                            ) {
                                Text(
                                    text = "🛡️ Use Shield (${state.restDayTokens})",
                                    fontSize = 10.sp,
                                    color = if (state.restDayTokens > 0) WarmAmberLight else TextMuted
                                )
                            }

                            TextButton(
                                onClick = { viewModel.forfeitContract(activeContract.id) },
                                contentPadding = PaddingValues(horizontal = 8.dp, vertical = 2.dp),
                                modifier = Modifier
                                    .height(30.dp)
                                    .testTag("btn_forfeit_contract")
                            ) {
                                Text(
                                    text = "⚠️ Forfeit Stake",
                                    fontSize = 10.sp,
                                    color = Color(0xFFEF5350)
                                )
                            }
                        }
                    }
                }
            } else {
                Text(
                    text = "Put skin in the game: stake Carrot-Coins on any habit for 7 days. Win to claim a 1.5x bonus return; slip without a Streak Shield and coins go to the Penalty Vault.",
                    fontSize = 12.sp,
                    color = TextSecondary,
                    lineHeight = 16.sp
                )
            }

            // Penalty Vault Footnote
            if (state.penaltyVaultCoins > 0 || wonContractsCount > 0) {
                Spacer(modifier = Modifier.height(8.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    if (wonContractsCount > 0) {
                        Text(
                            text = "🏆 $wonContractsCount Contracts Won",
                            fontSize = 10.sp,
                            color = ForestSage400,
                            fontWeight = FontWeight.Medium
                        )
                    }

                    if (state.penaltyVaultCoins > 0) {
                        Text(
                            text = "💀 Penalty Vault: ${state.penaltyVaultCoins} 🪙",
                            fontSize = 10.sp,
                            color = Color(0xFFE57373),
                            fontWeight = FontWeight.Medium
                        )
                    }
                }
            }
        }
    }
}
