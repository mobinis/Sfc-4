package com.example.selfcarehero.ui.dialogs

import androidx.compose.foundation.background
import androidx.compose.foundation.border
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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.example.selfcarehero.model.DateUtils
import com.example.selfcarehero.model.HabitContract
import com.example.selfcarehero.ui.theme.*
import com.example.selfcarehero.ui.viewmodel.SelfCareViewModel
import kotlin.math.roundToInt

@Composable
fun StreakBreakRescueDialog(
    contract: HabitContract,
    viewModel: SelfCareViewModel,
    onDismiss: () -> Unit
) {
    val state by viewModel.state.collectAsState()
    val missedDates = contract.getMissedBreakDates()
    val missedDate = missedDates.firstOrNull() ?: DateUtils.daysAgoStr(1)
    val missedLabel = DateUtils.getDayLabel(missedDate)
    val potentialReturn = (contract.stakedCoins * contract.multiplierReward).roundToInt()
    val hasShield = state.restDayTokens > 0
    val canQuickBuy = !hasShield && state.coins >= 12

    Dialog(onDismissRequest = onDismiss) {
        Card(
            shape = RoundedCornerShape(22.dp),
            colors = CardDefaults.cardColors(containerColor = WarmSurface800),
            border = CardDefaults.outlinedCardBorder().copy(
                brush = androidx.compose.ui.graphics.SolidColor(Color(0xFFE57373))
            ),
            modifier = Modifier
                .padding(12.dp)
                .fillMaxWidth()
                .testTag("dialog_streak_break_rescue")
        ) {
            Column(
                modifier = Modifier
                    .padding(20.dp)
                    .verticalScroll(rememberScrollState()),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                // Warning Badge Icon
                Box(
                    modifier = Modifier
                        .size(56.dp)
                        .clip(CircleShape)
                        .background(Color(0xFFEF5350).copy(alpha = 0.2f))
                        .border(2.dp, Color(0xFFEF5350), CircleShape),
                    contentAlignment = Alignment.Center
                ) {
                    Text(text = "🛡️⚠️", fontSize = 24.sp)
                }

                Spacer(modifier = Modifier.height(12.dp))

                Text(
                    text = "Accidental Streak Break!",
                    fontWeight = FontWeight.Bold,
                    fontSize = 18.sp,
                    color = Color(0xFFFF8A80),
                    textAlign = TextAlign.Center
                )

                Spacer(modifier = Modifier.height(4.dp))

                Text(
                    text = "A missed day was detected for '${contract.targetHabitName}'. Redeem a Streak Shield to prevent immediate forfeiture to the Penalty Vault.",
                    fontSize = 12.sp,
                    color = TextSecondary,
                    textAlign = TextAlign.Center,
                    lineHeight = 16.sp
                )

                Spacer(modifier = Modifier.height(16.dp))

                // Breakdown Card
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(12.dp))
                        .background(WarmCharcoal950)
                        .padding(14.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text("Missed Commitment Day:", fontSize = 12.sp, color = TextMuted)
                        Text(missedLabel, fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Color(0xFFFF8A80))
                    }

                    Spacer(modifier = Modifier.height(6.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text("Staked Coins in Escrow:", fontSize = 12.sp, color = TextMuted)
                        Text("${contract.stakedCoins} 🪙", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = WarmAmberLight)
                    }

                    Spacer(modifier = Modifier.height(6.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text("Expected 1.5x Payout:", fontSize = 12.sp, color = TextMuted)
                        Text("$potentialReturn 🪙 (+50%)", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Emerald400)
                    }

                    Spacer(modifier = Modifier.height(6.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text("Your Streak Shields:", fontSize = 12.sp, color = TextMuted)
                        Text(
                            text = if (hasShield) "🛡️ ${state.restDayTokens} Available" else "None (0 Shields)",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                            color = if (hasShield) WarmAmberGold else Color(0xFFEF5350)
                        )
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Action explanation note
                Text(
                    text = "Consuming 1 Streak Shield token immediately absorbs this break date ($missedLabel), preserves your ${contract.stakedCoins} 🪙 stake, and keeps your active contract progressing.",
                    fontSize = 11.sp,
                    color = TextMuted,
                    textAlign = TextAlign.Center,
                    lineHeight = 15.sp
                )

                Spacer(modifier = Modifier.height(20.dp))

                // Action Buttons
                if (hasShield) {
                    Button(
                        onClick = { viewModel.redeemShieldForContract(contract.id, missedDate) },
                        colors = ButtonDefaults.buttonColors(
                            containerColor = MaterialTheme.colorScheme.primary,
                            contentColor = androidx.compose.ui.graphics.Color.White
                        ),
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(44.dp)
                            .testTag("btn_dialog_redeem_shield")
                    ) {
                        Text(
                            text = "🛡️ Consume Streak Shield & Rescue",
                            fontWeight = FontWeight.SemiBold,
                            color = androidx.compose.ui.graphics.Color.White,
                            fontSize = 13.sp
                        )
                    }
                } else if (canQuickBuy) {
                    Button(
                        onClick = { viewModel.buyShieldAndRescueContract(contract.id) },
                        colors = ButtonDefaults.buttonColors(
                            containerColor = MaterialTheme.colorScheme.primary,
                            contentColor = androidx.compose.ui.graphics.Color.White
                        ),
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(44.dp)
                            .testTag("btn_dialog_quick_buy_rescue")
                    ) {
                        Text(
                            text = "🛒 Quick-Buy Shield & Rescue (12 🪙)",
                            fontWeight = FontWeight.SemiBold,
                            color = androidx.compose.ui.graphics.Color.White,
                            fontSize = 13.sp
                        )
                    }
                } else {
                    OutlinedButton(
                        onClick = {
                            viewModel.showRescueContractDialog.value = false
                            viewModel.showRewardShopDialog.value = true
                        },
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(44.dp)
                    ) {
                        Text(
                            text = "🛒 Open Reward Shop to Get Shield",
                            fontWeight = FontWeight.Bold,
                            color = WarmAmberLight,
                            fontSize = 13.sp
                        )
                    }
                }

                Spacer(modifier = Modifier.height(8.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    TextButton(
                        onClick = onDismiss,
                        contentPadding = PaddingValues(horizontal = 8.dp, vertical = 4.dp)
                    ) {
                        Text("Decide Later", color = TextMuted, fontSize = 12.sp)
                    }

                    TextButton(
                        onClick = { viewModel.forfeitContract(contract.id) },
                        contentPadding = PaddingValues(horizontal = 8.dp, vertical = 4.dp),
                        modifier = Modifier.testTag("btn_dialog_forfeit_break")
                    ) {
                        Text(
                            text = "💀 Forfeit Stake to Vault",
                            color = Color(0xFFEF5350),
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }
        }
    }
}
