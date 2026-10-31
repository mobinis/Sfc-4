package com.example.selfcarehero.ui.components

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.selfcarehero.ui.dialogs.PinKeypadButton
import com.example.selfcarehero.ui.theme.DangerRed
import com.example.selfcarehero.ui.viewmodel.SelfCareViewModel

@Composable
fun PinProtectedScreen(
    sectionName: String,
    sectionIcon: String = "🔐",
    viewModel: SelfCareViewModel,
    modifier: Modifier = Modifier,
    onDismiss: (() -> Unit)? = null
) {
    var enteredPin by remember { mutableStateOf("") }
    var isError by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf("") }

    Box(
        modifier = modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .padding(16.dp),
        contentAlignment = Alignment.Center
    ) {
        Card(
            shape = RoundedCornerShape(24.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
            border = CardDefaults.outlinedCardBorder().copy(
                brush = androidx.compose.ui.graphics.SolidColor(
                    if (isError) DangerRed else MaterialTheme.colorScheme.outline
                )
            ),
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 8.dp)
                .testTag("pin_protected_screen_card")
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(20.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                // Section Icon Badge
                Box(
                    modifier = Modifier
                        .size(56.dp)
                        .clip(CircleShape)
                        .background(MaterialTheme.colorScheme.primaryContainer),
                    contentAlignment = Alignment.Center
                ) {
                    Text(text = sectionIcon, fontSize = 28.sp)
                }

                Spacer(modifier = Modifier.height(12.dp))

                Text(
                    text = sectionName,
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurface,
                    textAlign = TextAlign.Center
                )

                Text(
                    text = "This section is protected by your privacy PIN",
                    fontSize = 12.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.padding(top = 4.dp)
                )

                Spacer(modifier = Modifier.height(20.dp))

                // 4 PIN Dots Indicator
                Row(
                    horizontalArrangement = Arrangement.spacedBy(16.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    repeat(4) { idx ->
                        val isFilled = idx < enteredPin.length
                        val dotScale by animateFloatAsState(
                            targetValue = if (isFilled) 1.25f else 1.0f,
                            animationSpec = tween(durationMillis = 150),
                            label = "screen_pin_dot_scale"
                        )

                        Box(
                            modifier = Modifier
                                .size(18.dp)
                                .scale(dotScale)
                                .clip(CircleShape)
                                .background(
                                    when {
                                        isError -> DangerRed
                                        isFilled -> MaterialTheme.colorScheme.primary
                                        else -> Color.Transparent
                                    }
                                )
                                .border(
                                    width = 2.dp,
                                    color = if (isError) DangerRed else MaterialTheme.colorScheme.outline,
                                    shape = CircleShape
                                )
                        )
                    }
                }

                AnimatedVisibility(visible = isError) {
                    Text(
                        text = errorMessage.ifBlank { "Incorrect PIN. Try again." },
                        color = DangerRed,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(top = 10.dp)
                    )
                }

                Spacer(modifier = Modifier.height(22.dp))

                // Numeric Keypad
                Column(
                    verticalArrangement = Arrangement.spacedBy(10.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Row(horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                        PinKeypadButton("1") { handleDigit("1", enteredPin) { enteredPin = it; isError = false; submitIfComplete(it, viewModel) { isError = true; errorMessage = it } } }
                        PinKeypadButton("2") { handleDigit("2", enteredPin) { enteredPin = it; isError = false; submitIfComplete(it, viewModel) { isError = true; errorMessage = it } } }
                        PinKeypadButton("3") { handleDigit("3", enteredPin) { enteredPin = it; isError = false; submitIfComplete(it, viewModel) { isError = true; errorMessage = it } } }
                    }

                    Row(horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                        PinKeypadButton("4") { handleDigit("4", enteredPin) { enteredPin = it; isError = false; submitIfComplete(it, viewModel) { isError = true; errorMessage = it } } }
                        PinKeypadButton("5") { handleDigit("5", enteredPin) { enteredPin = it; isError = false; submitIfComplete(it, viewModel) { isError = true; errorMessage = it } } }
                        PinKeypadButton("6") { handleDigit("6", enteredPin) { enteredPin = it; isError = false; submitIfComplete(it, viewModel) { isError = true; errorMessage = it } } }
                    }

                    Row(horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                        PinKeypadButton("7") { handleDigit("7", enteredPin) { enteredPin = it; isError = false; submitIfComplete(it, viewModel) { isError = true; errorMessage = it } } }
                        PinKeypadButton("8") { handleDigit("8", enteredPin) { enteredPin = it; isError = false; submitIfComplete(it, viewModel) { isError = true; errorMessage = it } } }
                        PinKeypadButton("9") { handleDigit("9", enteredPin) { enteredPin = it; isError = false; submitIfComplete(it, viewModel) { isError = true; errorMessage = it } } }
                    }

                    Row(horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                        PinKeypadButton(if (onDismiss != null) "✕" else "", isAction = true) {
                            onDismiss?.invoke()
                        }
                        PinKeypadButton("0") { handleDigit("0", enteredPin) { enteredPin = it; isError = false; submitIfComplete(it, viewModel) { isError = true; errorMessage = it } } }
                        PinKeypadButton("⌫", isAction = true) {
                            if (enteredPin.isNotEmpty()) {
                                enteredPin = enteredPin.dropLast(1)
                                isError = false
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                TextButton(onClick = { viewModel.showPinSettingsDialog.value = true }) {
                    Text(
                        text = "⚙️ Privacy Settings",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = MaterialTheme.colorScheme.primary
                    )
                }
            }
        }
    }
}

private fun handleDigit(digit: String, current: String, onUpdate: (String) -> Unit) {
    if (current.length < 4) {
        onUpdate(current + digit)
    }
}

private fun submitIfComplete(
    pin: String,
    viewModel: SelfCareViewModel,
    onError: (String) -> Unit
) {
    if (pin.length == 4) {
        val valid = viewModel.unlockSessionWithPin(pin)
        if (!valid) {
            onError("Incorrect PIN. Please re-enter.")
        }
    }
}
