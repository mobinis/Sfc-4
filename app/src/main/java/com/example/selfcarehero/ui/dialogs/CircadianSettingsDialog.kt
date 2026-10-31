package com.example.selfcarehero.ui.dialogs

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.example.selfcarehero.model.CircadianConfig
import com.example.selfcarehero.ui.theme.AmberGold
import com.example.selfcarehero.ui.theme.AmberLight
import com.example.selfcarehero.ui.theme.ForestSage400
import com.example.selfcarehero.ui.theme.LineBorder
import com.example.selfcarehero.ui.theme.SurfaceCard
import com.example.selfcarehero.ui.theme.SurfaceCardVariant
import com.example.selfcarehero.ui.theme.TextMuted
import com.example.selfcarehero.ui.theme.TextPrimary
import com.example.selfcarehero.ui.theme.TextSecondary
import com.example.selfcarehero.ui.theme.WarmCharcoal950
import com.example.selfcarehero.ui.viewmodel.SelfCareViewModel

@Composable
fun CircadianSettingsDialog(
    config: CircadianConfig,
    viewModel: SelfCareViewModel,
    onDismiss: () -> Unit
) {
    var wakeTime by remember { mutableStateOf(config.wakeTimeStr) }
    var bedTime by remember { mutableStateOf(config.bedTimeStr) }
    var caffeineHours by remember { mutableIntStateOf(config.caffeineCutoffHoursBeforeSleep) }
    var screenHours by remember { mutableIntStateOf(config.screenCurfewHoursBeforeSleep) }
    var enabled by remember { mutableStateOf(config.enabled) }

    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Card(
            modifier = Modifier
                .fillMaxWidth(0.92f)
                .clip(RoundedCornerShape(22.dp))
                .border(1.dp, LineBorder, RoundedCornerShape(22.dp))
                .testTag("circadian_settings_dialog"),
            colors = CardDefaults.cardColors(containerColor = WarmCharcoal950)
        ) {
            Column(
                modifier = Modifier
                    .padding(20.dp)
                    .verticalScroll(rememberScrollState())
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Column {
                        Text(
                            text = "⏰ Circadian Sleep Engine",
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold,
                            color = TextPrimary
                        )
                        Text(
                            text = "Optimize adenosine, melatonin & dopamine rhythms",
                            fontSize = 12.sp,
                            color = TextSecondary
                        )
                    }

                    Switch(
                        checked = enabled,
                        onCheckedChange = { enabled = it },
                        colors = SwitchDefaults.colors(
                            checkedThumbColor = AmberGold,
                            checkedTrackColor = ForestSage400.copy(alpha = 0.5f),
                            uncheckedThumbColor = TextMuted,
                            uncheckedTrackColor = SurfaceCardVariant
                        ),
                        modifier = Modifier.testTag("circadian_enable_switch")
                    )
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Wake & Bed Presets
                Text(
                    text = "TARGET SLEEP SCHEDULE (24-HOUR)",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    color = AmberLight
                )

                Spacer(modifier = Modifier.height(8.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    OutlinedTextField(
                        value = wakeTime,
                        onValueChange = { wakeTime = it },
                        label = { Text("Wake Time", fontSize = 12.sp) },
                        placeholder = { Text("07:00") },
                        singleLine = true,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = AmberGold,
                            unfocusedBorderColor = LineBorder,
                            focusedTextColor = TextPrimary,
                            unfocusedTextColor = TextPrimary,
                            focusedLabelColor = AmberLight,
                            unfocusedLabelColor = TextMuted
                        ),
                        modifier = Modifier
                            .weight(1f)
                            .testTag("wake_time_input")
                    )

                    OutlinedTextField(
                        value = bedTime,
                        onValueChange = { bedTime = it },
                        label = { Text("Bed Time", fontSize = 12.sp) },
                        placeholder = { Text("23:00") },
                        singleLine = true,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = AmberGold,
                            unfocusedBorderColor = LineBorder,
                            focusedTextColor = TextPrimary,
                            unfocusedTextColor = TextPrimary,
                            focusedLabelColor = AmberLight,
                            unfocusedLabelColor = TextMuted
                        ),
                        modifier = Modifier
                            .weight(1f)
                            .testTag("bed_time_input")
                    )
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Caffeine Cut-off Selector
                Text(
                    text = "CAFFEINE CUT-OFF (HOURS BEFORE BED)",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    color = AmberLight
                )
                Text(
                    text = "Caffeine half-life is 5-7h. Quarter-life is 10-12h.",
                    fontSize = 11.sp,
                    color = TextMuted
                )

                Spacer(modifier = Modifier.height(8.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    listOf(8, 10, 12).forEach { hours ->
                        val isSelected = caffeineHours == hours
                        Box(
                            modifier = Modifier
                                .weight(1f)
                                .clip(RoundedCornerShape(10.dp))
                                .background(if (isSelected) ForestSage400.copy(alpha = 0.25f) else SurfaceCard)
                                .border(
                                    1.dp,
                                    if (isSelected) ForestSage400 else LineBorder,
                                    RoundedCornerShape(10.dp)
                                )
                                .clickable { caffeineHours = hours }
                                .padding(vertical = 10.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = "${hours}h Before",
                                fontSize = 12.sp,
                                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                                color = if (isSelected) ForestSage400 else TextSecondary
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Screen Curfew Selector
                Text(
                    text = "SCREEN CURFEW (HOURS BEFORE BED)",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    color = AmberLight
                )
                Text(
                    text = "Blue light suppresses pineal gland melatonin secretion.",
                    fontSize = 11.sp,
                    color = TextMuted
                )

                Spacer(modifier = Modifier.height(8.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    listOf(1, 2, 3).forEach { hours ->
                        val isSelected = screenHours == hours
                        Box(
                            modifier = Modifier
                                .weight(1f)
                                .clip(RoundedCornerShape(10.dp))
                                .background(if (isSelected) AmberGold.copy(alpha = 0.25f) else SurfaceCard)
                                .border(
                                    1.dp,
                                    if (isSelected) AmberGold else LineBorder,
                                    RoundedCornerShape(10.dp)
                                )
                                .clickable { screenHours = hours }
                                .padding(vertical = 10.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = "${hours}h Curfew",
                                fontSize = 12.sp,
                                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                                color = if (isSelected) AmberGold else TextSecondary
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(22.dp))

                // Actions
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.End,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    TextButton(
                        onClick = onDismiss,
                        modifier = Modifier.testTag("cancel_circadian_button")
                    ) {
                        Text("Cancel", color = TextMuted)
                    }

                    Spacer(modifier = Modifier.width(10.dp))

                    Button(
                        onClick = {
                            val updated = config.copy(
                                wakeTimeStr = wakeTime.trim().ifBlank { "07:00" },
                                bedTimeStr = bedTime.trim().ifBlank { "23:00" },
                                caffeineCutoffHoursBeforeSleep = caffeineHours,
                                screenCurfewHoursBeforeSleep = screenHours,
                                enabled = enabled
                            )
                            viewModel.saveCircadianConfig(updated)
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = AmberGold),
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier.testTag("save_circadian_button")
                    ) {
                        Text(
                            text = "Save Protocol",
                            color = WarmCharcoal950,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }
        }
    }
}
