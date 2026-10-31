package com.example.selfcarehero.ui.dialogs

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
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
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
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
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.example.selfcarehero.ui.theme.DangerRed
import com.example.selfcarehero.ui.theme.WarmAmberGold
import com.example.selfcarehero.ui.viewmodel.SelfCareViewModel

@Composable
fun PinVerificationDialog(
    viewModel: SelfCareViewModel,
    title: String = "Enter Privacy PIN",
    subtitle: String = "Unlock confidential reflections and records",
    onDismiss: () -> Unit
) {
    var enteredPin by remember { mutableStateOf("") }
    var isError by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf("") }

    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(usePlatformDefaultWidth = false)
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
                .fillMaxWidth(0.92f)
                .padding(vertical = 16.dp)
                .testTag("pin_verification_dialog")
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(20.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                // Header Icon
                Box(
                    modifier = Modifier
                        .size(52.dp)
                        .clip(CircleShape)
                        .background(
                            if (isError) DangerRed.copy(alpha = 0.15f)
                            else MaterialTheme.colorScheme.primaryContainer
                        ),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = if (isError) "⚠️" else "🔐",
                        fontSize = 24.sp
                    )
                }

                Spacer(modifier = Modifier.height(10.dp))

                Text(
                    text = title,
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurface,
                    textAlign = TextAlign.Center
                )

                Text(
                    text = subtitle,
                    fontSize = 12.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                )

                Spacer(modifier = Modifier.height(18.dp))

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
                            label = "pin_dot_scale"
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
                        text = errorMessage.ifBlank { "Incorrect PIN. Please try again." },
                        color = DangerRed,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(top = 10.dp)
                    )
                }

                Spacer(modifier = Modifier.height(20.dp))

                // Numeric Keypad 3x4
                Column(
                    verticalArrangement = Arrangement.spacedBy(10.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    // Row 1: 1, 2, 3
                    Row(horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                        PinKeypadButton("1") { onDigitPress("1", enteredPin) { enteredPin = it; isError = false; checkAndSubmit(it, viewModel, onDismiss, { isError = true; errorMessage = it }) } }
                        PinKeypadButton("2") { onDigitPress("2", enteredPin) { enteredPin = it; isError = false; checkAndSubmit(it, viewModel, onDismiss, { isError = true; errorMessage = it }) } }
                        PinKeypadButton("3") { onDigitPress("3", enteredPin) { enteredPin = it; isError = false; checkAndSubmit(it, viewModel, onDismiss, { isError = true; errorMessage = it }) } }
                    }

                    // Row 2: 4, 5, 6
                    Row(horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                        PinKeypadButton("4") { onDigitPress("4", enteredPin) { enteredPin = it; isError = false; checkAndSubmit(it, viewModel, onDismiss, { isError = true; errorMessage = it }) } }
                        PinKeypadButton("5") { onDigitPress("5", enteredPin) { enteredPin = it; isError = false; checkAndSubmit(it, viewModel, onDismiss, { isError = true; errorMessage = it }) } }
                        PinKeypadButton("6") { onDigitPress("6", enteredPin) { enteredPin = it; isError = false; checkAndSubmit(it, viewModel, onDismiss, { isError = true; errorMessage = it }) } }
                    }

                    // Row 3: 7, 8, 9
                    Row(horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                        PinKeypadButton("7") { onDigitPress("7", enteredPin) { enteredPin = it; isError = false; checkAndSubmit(it, viewModel, onDismiss, { isError = true; errorMessage = it }) } }
                        PinKeypadButton("8") { onDigitPress("8", enteredPin) { enteredPin = it; isError = false; checkAndSubmit(it, viewModel, onDismiss, { isError = true; errorMessage = it }) } }
                        PinKeypadButton("9") { onDigitPress("9", enteredPin) { enteredPin = it; isError = false; checkAndSubmit(it, viewModel, onDismiss, { isError = true; errorMessage = it }) } }
                    }

                    // Row 4: Cancel, 0, Backspace
                    Row(horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                        PinKeypadButton("✕", isAction = true) { onDismiss() }
                        PinKeypadButton("0") { onDigitPress("0", enteredPin) { enteredPin = it; isError = false; checkAndSubmit(it, viewModel, onDismiss, { isError = true; errorMessage = it }) } }
                        PinKeypadButton("⌫", isAction = true) {
                            if (enteredPin.isNotEmpty()) {
                                enteredPin = enteredPin.dropLast(1)
                                isError = false
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                Text(
                    text = "🔒 100% Offline Privacy: BloomQuest does not transmit or store your PIN remotely.",
                    fontSize = 10.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.7f),
                    textAlign = TextAlign.Center,
                    lineHeight = 13.sp,
                    modifier = Modifier.padding(horizontal = 8.dp)
                )
            }
        }
    }
}

private fun onDigitPress(digit: String, current: String, update: (String) -> Unit) {
    if (current.length < 4) {
        update(current + digit)
    }
}

private fun checkAndSubmit(
    pin: String,
    viewModel: SelfCareViewModel,
    onSuccess: () -> Unit,
    onError: (String) -> Unit
) {
    if (pin.length == 4) {
        val success = viewModel.unlockSessionWithPin(pin)
        if (success) {
            onSuccess()
        } else {
            onError("Incorrect PIN. Please re-enter.")
        }
    }
}

@Composable
fun PinKeypadButton(
    label: String,
    isAction: Boolean = false,
    onClick: () -> Unit
) {
    Surface(
        onClick = onClick,
        shape = CircleShape,
        color = if (isAction) MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.6f)
                else MaterialTheme.colorScheme.surfaceVariant,
        border = CardDefaults.outlinedCardBorder().copy(
            brush = androidx.compose.ui.graphics.SolidColor(MaterialTheme.colorScheme.outline.copy(alpha = 0.5f))
        ),
        modifier = Modifier.size(62.dp)
    ) {
        Box(contentAlignment = Alignment.Center) {
            Text(
                text = label,
                fontSize = if (isAction) 16.sp else 22.sp,
                fontWeight = if (isAction) FontWeight.SemiBold else FontWeight.Bold,
                color = if (label == "✕") DangerRed else MaterialTheme.colorScheme.onSurface
            )
        }
    }
}
