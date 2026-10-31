package com.example.selfcarehero.ui.dialogs

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
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
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.LockOpen
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Checkbox
import androidx.compose.material3.CheckboxDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Surface
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.example.selfcarehero.ui.theme.DangerRed
import com.example.selfcarehero.ui.theme.SageButtonShape
import com.example.selfcarehero.ui.theme.TabularNumberStyle
import com.example.selfcarehero.ui.theme.WarmAmberGold
import com.example.selfcarehero.ui.viewmodel.SelfCareViewModel

@Composable
fun PinSettingsDialog(
    viewModel: SelfCareViewModel,
    onDismiss: () -> Unit
) {
    val state by viewModel.state.collectAsState()
    var isEnabled by remember(state.pinLockEnabled) { mutableStateOf(state.pinLockEnabled) }
    var lockJournal by remember(state.lockJournal) { mutableStateOf(state.lockJournal) }
    var lockUrges by remember(state.lockUrges) { mutableStateOf(state.lockUrges) }
    var lockAppLaunch by remember(state.lockAppLaunch) { mutableStateOf(state.lockAppLaunch) }

    var showPinChangeFields by remember { mutableStateOf(!state.pinLockEnabled) }
    var newPin by remember { mutableStateOf("") }
    var confirmPin by remember { mutableStateOf("") }
    var errorMessage by remember { mutableStateOf("") }

    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Card(
            shape = RoundedCornerShape(22.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
            border = CardDefaults.outlinedCardBorder().copy(
                brush = androidx.compose.ui.graphics.SolidColor(MaterialTheme.colorScheme.outline)
            ),
            modifier = Modifier
                .fillMaxWidth(0.92f)
                .padding(vertical = 20.dp)
                .testTag("pin_settings_dialog")
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(20.dp)
                    .verticalScroll(rememberScrollState())
            ) {
                // Header Row
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .size(40.dp)
                                .clip(CircleShape)
                                .background(MaterialTheme.colorScheme.primaryContainer),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = if (isEnabled) Icons.Default.Lock else Icons.Default.LockOpen,
                                contentDescription = null,
                                tint = MaterialTheme.colorScheme.primary,
                                modifier = Modifier.size(20.dp)
                            )
                        }
                        Spacer(modifier = Modifier.width(10.dp))
                        Column {
                            Text(
                                text = "Privacy & PIN Lock",
                                fontSize = 17.sp,
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.onSurface
                            )
                            Text(
                                text = if (state.pinLockEnabled) "Protection active" else "Unsecured",
                                fontSize = 11.sp,
                                color = if (state.pinLockEnabled) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }

                    IconButton(onClick = onDismiss) {
                        Icon(imageVector = Icons.Default.Close, contentDescription = "Close")
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Master Toggle Card
                Surface(
                    shape = RoundedCornerShape(14.dp),
                    color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(14.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = "Enable PIN Protection",
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.onSurface
                            )
                            Text(
                                text = "Lock confidential sections with a 4-digit code",
                                fontSize = 11.sp,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }

                        Switch(
                            checked = isEnabled,
                            onCheckedChange = { checked ->
                                isEnabled = checked
                                if (!checked) {
                                    viewModel.disablePin()
                                } else {
                                    showPinChangeFields = true
                                }
                            },
                            colors = SwitchDefaults.colors(
                                checkedThumbColor = MaterialTheme.colorScheme.primary,
                                checkedTrackColor = MaterialTheme.colorScheme.primaryContainer
                            )
                        )
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                // PIN Setup or Change Section
                if (showPinChangeFields || !state.pinLockEnabled) {
                    Card(
                        shape = RoundedCornerShape(14.dp),
                        colors = CardDefaults.cardColors(
                            containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.35f)
                        ),
                        border = CardDefaults.outlinedCardBorder().copy(
                            brush = androidx.compose.ui.graphics.SolidColor(MaterialTheme.colorScheme.outline.copy(alpha = 0.5f))
                        ),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column(modifier = Modifier.padding(14.dp)) {
                            Text(
                                text = if (state.pinLockEnabled) "Set New 4-Digit PIN" else "Create 4-Digit PIN",
                                fontSize = 13.sp,
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.onSurface
                            )

                            Spacer(modifier = Modifier.height(8.dp))

                            OutlinedTextField(
                                value = newPin,
                                onValueChange = { if (it.length <= 4 && it.all { c -> c.isDigit() }) newPin = it },
                                label = { Text("New PIN (4 digits)") },
                                placeholder = { Text("••••") },
                                singleLine = true,
                                visualTransformation = PasswordVisualTransformation(),
                                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.NumberPassword),
                                textStyle = TabularNumberStyle,
                                colors = OutlinedTextFieldDefaults.colors(
                                    focusedBorderColor = MaterialTheme.colorScheme.primary
                                ),
                                modifier = Modifier.fillMaxWidth()
                            )

                            Spacer(modifier = Modifier.height(8.dp))

                            OutlinedTextField(
                                value = confirmPin,
                                onValueChange = { if (it.length <= 4 && it.all { c -> c.isDigit() }) confirmPin = it },
                                label = { Text("Confirm PIN") },
                                placeholder = { Text("••••") },
                                singleLine = true,
                                visualTransformation = PasswordVisualTransformation(),
                                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.NumberPassword),
                                textStyle = TabularNumberStyle,
                                colors = OutlinedTextFieldDefaults.colors(
                                    focusedBorderColor = MaterialTheme.colorScheme.primary
                                ),
                                modifier = Modifier.fillMaxWidth()
                            )

                            AnimatedVisibility(visible = errorMessage.isNotBlank()) {
                                Text(
                                    text = errorMessage,
                                    fontSize = 11.sp,
                                    color = DangerRed,
                                    fontWeight = FontWeight.Bold,
                                    modifier = Modifier.padding(top = 6.dp)
                                )
                            }

                            Spacer(modifier = Modifier.height(10.dp))

                            Button(
                                onClick = {
                                    if (newPin.length != 4) {
                                        errorMessage = "PIN must be exactly 4 digits."
                                    } else if (newPin != confirmPin) {
                                        errorMessage = "PINs do not match. Please re-enter."
                                    } else {
                                        errorMessage = ""
                                        viewModel.setPin(newPin)
                                        viewModel.updatePinSettings(true, lockJournal, lockUrges, lockAppLaunch)
                                        showPinChangeFields = false
                                        newPin = ""
                                        confirmPin = ""
                                    }
                                },
                                shape = SageButtonShape,
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = MaterialTheme.colorScheme.primary,
                                    contentColor = androidx.compose.ui.graphics.Color.White
                                ),
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(44.dp)
                            ) {
                                Text("Save & Activate PIN 🔐", fontWeight = FontWeight.Bold)
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(14.dp))
                } else {
                    // Quick Action to Change Existing PIN
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        TextButton(onClick = { showPinChangeFields = true }) {
                            Text("Change PIN Code", color = MaterialTheme.colorScheme.primary, fontWeight = FontWeight.Bold)
                        }

                        TextButton(onClick = { viewModel.lockSession() }) {
                            Text("Lock Now 🔒", color = WarmAmberGold, fontWeight = FontWeight.Bold)
                        }
                    }

                    Spacer(modifier = Modifier.height(10.dp))
                }

                // Protected Sections Checklist
                Text(
                    text = "Sections Protected by PIN",
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurface
                )

                Spacer(modifier = Modifier.height(6.dp))

                SectionCheckRow(
                    label = "✍️ Confidential Journal & Reflections",
                    sub = "Locks daily mood and private notes",
                    checked = lockJournal,
                    onCheckedChange = {
                        lockJournal = it
                        if (state.pinLockEnabled) viewModel.updatePinSettings(isEnabled, it, lockUrges, lockAppLaunch)
                    }
                )

                SectionCheckRow(
                    label = "🌊 Urge Surfing & Impulse Records",
                    sub = "Protects craving delay timer and history logs",
                    checked = lockUrges,
                    onCheckedChange = {
                        lockUrges = it
                        if (state.pinLockEnabled) viewModel.updatePinSettings(isEnabled, lockJournal, it, lockAppLaunch)
                    }
                )

                SectionCheckRow(
                    label = "📱 Full App Lock on Launch",
                    sub = "Requires PIN whenever app is opened",
                    checked = lockAppLaunch,
                    onCheckedChange = {
                        lockAppLaunch = it
                        if (state.pinLockEnabled) viewModel.updatePinSettings(isEnabled, lockJournal, lockUrges, it)
                    }
                )

                Spacer(modifier = Modifier.height(16.dp))

                // Offline Notice Disclaimer
                Surface(
                    shape = RoundedCornerShape(10.dp),
                    color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.4f),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier.padding(10.dp),
                        verticalAlignment = Alignment.Top
                    ) {
                        Text("ℹ️", fontSize = 14.sp)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "BloomQuest operates 100% offline. PINs are salted and hashed with SHA-256 locally. There is no remote cloud recovery for forgotten PINs.",
                            fontSize = 10.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            lineHeight = 13.sp
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun SectionCheckRow(
    label: String,
    sub: String,
    checked: Boolean,
    onCheckedChange: (Boolean) -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Column(modifier = Modifier.weight(1f)) {
            Text(text = label, fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = MaterialTheme.colorScheme.onSurface)
            Text(text = sub, fontSize = 10.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
        }

        Checkbox(
            checked = checked,
            onCheckedChange = onCheckedChange,
            colors = CheckboxDefaults.colors(checkedColor = MaterialTheme.colorScheme.primary)
        )
    }
}
