package com.example.selfcarehero.ui.components

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.runtime.derivedStateOf
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.selfcarehero.ui.theme.*
import com.example.selfcarehero.ui.viewmodel.SelfCareViewModel

@Composable
fun HeaderBar(
    viewModel: SelfCareViewModel,
    modifier: Modifier = Modifier
) {
    val state by viewModel.state.collectAsState()
    val level by remember(state.ev) { derivedStateOf { viewModel.getPlayerLevel() } }
    val title by remember(state.ev) { derivedStateOf { viewModel.getLevelTitle() } }
    val xpProgress by remember(state.ev) {
        derivedStateOf { viewModel.getXpProgress() }
    }
    val xpInto = xpProgress.first
    val needed = xpProgress.second
    val progressRatio = (xpInto.toFloat() / needed.toFloat()).coerceIn(0f, 1f)
    val animatedProgress by animateFloatAsState(targetValue = progressRatio, label = "xp_progress")

    val soundEnabled by viewModel.soundEnabled.collectAsState()
    val hapticsEnabled by viewModel.hapticsEnabled.collectAsState()
    val currentUser by viewModel.currentUser.collectAsState()

    Card(
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 6.dp)
            .testTag("hero_header_card"),
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        border = CardDefaults.outlinedCardBorder().copy(
            brush = androidx.compose.ui.graphics.SolidColor(MaterialTheme.colorScheme.outline)
        )
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
        ) {
            // Row 1: Profile Level, Title & 1-Tap Quick Toggles
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    // Level Badge
                    Box(
                        modifier = Modifier
                            .size(44.dp)
                            .clip(CircleShape)
                            .background(MaterialTheme.colorScheme.secondary),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "L$level",
                            color = androidx.compose.ui.graphics.Color.White,
                            fontWeight = FontWeight.Black,
                            fontSize = 15.sp,
                            style = TabularNumberStyle
                        )
                    }

                    Spacer(modifier = Modifier.width(12.dp))

                    Column {
                        Text(
                            text = "BloomQuest",
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onSurface,
                            fontSize = 15.sp
                        )
                        Text(
                            text = title,
                            fontSize = 12.sp,
                            color = MaterialTheme.colorScheme.secondary,
                            fontWeight = FontWeight.SemiBold
                        )
                    }
                }

                // 1-Tap Quick Toggles (Enforcing Fitts's Law 44-48dp targets)
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    // Theme Mode Toggle (☀️ / 🌙)
                    IconButton(
                        onClick = { viewModel.toggleTheme() },
                        modifier = Modifier
                            .minimumInteractiveComponentSize()
                            .size(44.dp)
                            .clip(RoundedCornerShape(12.dp))
                            .background(MaterialTheme.colorScheme.surfaceVariant)
                            .testTag("btn_toggle_theme")
                    ) {
                        Text(text = if (state.isDarkMode) "☀️" else "🌙", fontSize = 16.sp)
                    }

                    // Sound Toggle (🔊 / 🔇)
                    IconButton(
                        onClick = { viewModel.toggleSound() },
                        modifier = Modifier
                            .minimumInteractiveComponentSize()
                            .size(44.dp)
                            .clip(RoundedCornerShape(12.dp))
                            .background(
                                if (soundEnabled) MaterialTheme.colorScheme.primaryContainer
                                else MaterialTheme.colorScheme.surfaceVariant
                            )
                            .testTag("btn_toggle_sound")
                    ) {
                        Text(text = if (soundEnabled) "🔊" else "🔇", fontSize = 16.sp)
                    }

                    // Cloud Sync Dialog
                    IconButton(
                        onClick = { viewModel.showCloudSyncDialog.value = true },
                        modifier = Modifier
                            .minimumInteractiveComponentSize()
                            .size(44.dp)
                            .clip(RoundedCornerShape(12.dp))
                            .background(
                                if (currentUser != null) MaterialTheme.colorScheme.primaryContainer
                                else MaterialTheme.colorScheme.surfaceVariant
                            )
                            .testTag("btn_cloud_sync_header")
                    ) {
                        Text(text = "☁️", fontSize = 16.sp)
                    }
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Row 2: Status Pills: Streak Flame, Rest Shield, Coins
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Streak Flame
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier
                        .weight(1f)
                        .clip(RoundedCornerShape(10.dp))
                        .background(MaterialTheme.colorScheme.surfaceVariant)
                        .padding(horizontal = 8.dp, vertical = 6.dp)
                ) {
                    Text(text = "🔥", fontSize = 13.sp)
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = "${state.dailyThreeStreak.cur}d streak",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.secondary,
                        style = TabularNumberStyle
                    )
                }

                // Coins Balance
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier
                        .weight(1f)
                        .clip(RoundedCornerShape(10.dp))
                        .background(MaterialTheme.colorScheme.surfaceVariant)
                        .clickable { viewModel.showRewardShopDialog.value = true }
                        .padding(horizontal = 8.dp, vertical = 6.dp)
                        .testTag("action_reward_shop")
                ) {
                    Text(text = "🥕", fontSize = 13.sp)
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = "${state.coins} coins",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onSurface,
                        style = TabularNumberStyle
                    )
                }

                // Shield Tokens
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier
                        .weight(1f)
                        .clip(RoundedCornerShape(10.dp))
                        .background(MaterialTheme.colorScheme.surfaceVariant)
                        .clickable { viewModel.useRestDayToken() }
                        .padding(horizontal = 8.dp, vertical = 6.dp)
                        .testTag("streak_shield_token")
                ) {
                    Text(text = "🛡️", fontSize = 13.sp)
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = "${state.restDayTokens} shield",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = if (state.restDayTokens > 0) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurfaceVariant,
                        style = TabularNumberStyle
                    )
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            // Row 3: XP Progress with Tabular Numerics
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    text = "XP $xpInto / $needed",
                    fontSize = 11.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    fontWeight = FontWeight.Medium,
                    style = TabularNumberStyle
                )
                Text(
                    text = "${(animatedProgress * 100).toInt()}% to Lv ${level + 1}",
                    fontSize = 11.sp,
                    color = MaterialTheme.colorScheme.primary,
                    fontWeight = FontWeight.SemiBold,
                    style = TabularNumberStyle
                )
            }

            Spacer(modifier = Modifier.height(6.dp))

            LinearProgressIndicator(
                progress = { animatedProgress },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(6.dp)
                    .clip(RoundedCornerShape(3.dp)),
                color = MaterialTheme.colorScheme.primary,
                trackColor = MaterialTheme.colorScheme.surfaceVariant
            )
        }
    }
}
