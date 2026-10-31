package com.example.selfcarehero.ui.dialogs

import android.app.Activity
import androidx.compose.animation.core.*
import androidx.compose.foundation.background
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
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.example.selfcarehero.model.*
import com.example.selfcarehero.ui.theme.*
import com.example.selfcarehero.ui.viewmodel.SelfCareViewModel
import kotlinx.coroutines.delay

@Composable
fun CelebrationDialog(
    title: String,
    subtitle: String,
    onDismiss: () -> Unit
) {
    val infiniteTransition = rememberInfiniteTransition(label = "shimmer")
    val shimmerOffset by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 1000f,
        animationSpec = infiniteRepeatable(
            animation = tween(2400, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "shimmer_offset"
    )

    val scale by animateFloatAsState(
        targetValue = 1f,
        animationSpec = spring(dampingRatio = Spring.DampingRatioMediumBouncy, stiffness = Spring.StiffnessLow),
        label = "scale_bounce"
    )

    Dialog(onDismissRequest = onDismiss) {
        Card(
            shape = RoundedCornerShape(24.dp),
            colors = CardDefaults.cardColors(containerColor = SurfaceCard),
            border = CardDefaults.outlinedCardBorder().copy(
                brush = Brush.linearGradient(
                    colors = listOf(AmberGold, AmberLight, AmberGold),
                    start = androidx.compose.ui.geometry.Offset(shimmerOffset, 0f),
                    end = androidx.compose.ui.geometry.Offset(shimmerOffset + 300f, 300f)
                )
            ),
            modifier = Modifier
                .padding(16.dp)
                .scale(scale)
                .testTag("celebration_dialog")
        ) {
            Column(
                modifier = Modifier
                    .padding(24.dp)
                    .fillMaxWidth(),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(text = "✨ 🌟 ✨", fontSize = 28.sp)
                Spacer(modifier = Modifier.height(10.dp))
                Text(
                    text = title,
                    fontWeight = FontWeight.Black,
                    fontSize = 20.sp,
                    color = AmberLight,
                    textAlign = androidx.compose.ui.text.style.TextAlign.Center
                )
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = subtitle,
                    fontSize = 13.sp,
                    color = TextPrimary,
                    textAlign = androidx.compose.ui.text.style.TextAlign.Center,
                    lineHeight = 18.sp
                )

                Spacer(modifier = Modifier.height(18.dp))

                Button(
                    onClick = onDismiss,
                    colors = ButtonDefaults.buttonColors(containerColor = AmberGold),
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(46.dp)
                ) {
                    Text("Continue Hero Journey 🛡️", color = Emerald900, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                }
            }
        }
    }
}

@Composable
fun WeeklyReviewDialog(
    viewModel: SelfCareViewModel,
    onDismiss: () -> Unit
) {
    val state by viewModel.state.collectAsState()
    var winsText by remember { mutableStateOf("") }
    var selectedFrictions by remember { mutableStateOf(setOf<String>()) }
    var frictionNotes by remember { mutableStateOf("") }
    var selectedFocusSkill by remember { mutableStateOf(state.nodes.firstOrNull { it.p != "0" }) }

    val frictionChoices = listOf("Fatigue", "Procrastination", "Busy Schedule", "Low Focus", "Travel")

    Dialog(onDismissRequest = onDismiss) {
        Card(
            shape = RoundedCornerShape(20.dp),
            colors = CardDefaults.cardColors(containerColor = SurfaceCard),
            modifier = Modifier
                .padding(12.dp)
                .fillMaxWidth()
        ) {
            Column(
                modifier = Modifier
                    .padding(16.dp)
                    .verticalScroll(rememberScrollState())
            ) {
                Text(text = "✍️ Weekly Wins & Review", fontWeight = FontWeight.Bold, fontSize = 16.sp, color = TextPrimary)
                Text(text = "Reflect on accomplishments and clear obstacles (+50 XP)", fontSize = 11.sp, color = AmberLight)

                Spacer(modifier = Modifier.height(12.dp))

                Text(text = "1. What went well this week?", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = TextSecondary)
                OutlinedTextField(
                    value = winsText,
                    onValueChange = { winsText = it },
                    placeholder = { Text("Consistency in morning water, read 30 pages...", fontSize = 12.sp, color = TextMuted) },
                    modifier = Modifier.fillMaxWidth()
                )

                Spacer(modifier = Modifier.height(10.dp))

                Text(text = "2. What caused friction?", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = TextSecondary)
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    frictionChoices.take(3).forEach { fr ->
                        val isChecked = selectedFrictions.contains(fr)
                        FilterChip(
                            selected = isChecked,
                            onClick = {
                                selectedFrictions = if (isChecked) selectedFrictions - fr else selectedFrictions + fr
                            },
                            label = { Text(fr, fontSize = 10.sp) }
                        )
                    }
                }

                Spacer(modifier = Modifier.height(8.dp))

                OutlinedTextField(
                    value = frictionNotes,
                    onValueChange = { frictionNotes = it },
                    placeholder = { Text("How to adjust next week?", fontSize = 12.sp, color = TextMuted) },
                    modifier = Modifier.fillMaxWidth()
                )

                Spacer(modifier = Modifier.height(14.dp))

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
                            if (winsText.isNotBlank()) {
                                viewModel.completeWeeklyReview(
                                    winsText = winsText,
                                    frictionTags = selectedFrictions.toList(),
                                    frictionNotes = frictionNotes,
                                    focusSkillId = selectedFocusSkill?.id,
                                    focusSkillName = selectedFocusSkill?.n
                                )
                            }
                        },
                        enabled = winsText.isNotBlank(),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = MaterialTheme.colorScheme.primary,
                            contentColor = Color.White
                        ),
                        shape = SageButtonShape
                    ) {
                        Text("Complete Review (+50 XP)", color = Color.White, fontWeight = FontWeight.SemiBold)
                    }
                }
            }
        }
    }
}

@Composable
fun ConfirmRestoreDialog(
    snapshot: BackupSnapshot?,
    onConfirm: () -> Unit,
    onDismiss: () -> Unit
) {
    if (snapshot == null) return
    var confirmText by remember { mutableStateOf("") }
    val isConfirmed = confirmText.trim().uppercase() == "CONFIRM"

    Dialog(onDismissRequest = onDismiss) {
        Card(
            shape = RoundedCornerShape(20.dp),
            colors = CardDefaults.cardColors(containerColor = SurfaceCard),
            border = CardDefaults.outlinedCardBorder().copy(brush = androidx.compose.ui.graphics.SolidColor(AmberGold)),
            modifier = Modifier.padding(16.dp)
        ) {
            Column(
                modifier = Modifier.padding(20.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(text = "⚠️", fontSize = 34.sp)
                Spacer(modifier = Modifier.height(6.dp))
                Text(
                    text = "Confirm State Restore",
                    fontWeight = FontWeight.Bold,
                    fontSize = 17.sp,
                    color = AmberLight
                )
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "Restoring '${snapshot.label}' (Level ${snapshot.level}, ${snapshot.xp} XP) will replace current data.",
                    fontSize = 12.sp,
                    color = TextPrimary,
                    textAlign = androidx.compose.ui.text.style.TextAlign.Center
                )

                Spacer(modifier = Modifier.height(10.dp))

                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(8.dp))
                        .background(Emerald800)
                        .padding(8.dp)
                ) {
                    Text(
                        text = "🛡️ Safety Guarantee: An automatic Pre-Restore Rollback Snapshot is created immediately before restoring.",
                        fontSize = 11.sp,
                        color = TealAccent
                    )
                }

                Spacer(modifier = Modifier.height(14.dp))

                Text(text = "Type 'CONFIRM' to restore:", fontSize = 12.sp, color = TextMuted)
                OutlinedTextField(
                    value = confirmText,
                    onValueChange = { confirmText = it },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )

                Spacer(modifier = Modifier.height(14.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    TextButton(onClick = onDismiss) {
                        Text("Cancel", color = TextMuted)
                    }

                    Button(
                        onClick = onConfirm,
                        enabled = isConfirmed,
                        colors = ButtonDefaults.buttonColors(
                            containerColor = MaterialTheme.colorScheme.primary,
                            contentColor = Color.White
                        ),
                        shape = SageButtonShape
                    ) {
                        Text("Restore State", color = Color.White, fontWeight = FontWeight.SemiBold)
                    }
                }
            }
        }
    }
}

@Composable
fun ResetHeroDialog(
    onConfirm: () -> Unit,
    onDismiss: () -> Unit
) {
    var confirmText by remember { mutableStateOf("") }
    val isConfirmed = confirmText.trim() == "RESET HERO"

    Dialog(onDismissRequest = onDismiss) {
        Card(
            shape = RoundedCornerShape(20.dp),
            colors = CardDefaults.cardColors(containerColor = SurfaceCard),
            border = CardDefaults.outlinedCardBorder().copy(brush = androidx.compose.ui.graphics.SolidColor(DangerRed)),
            modifier = Modifier.padding(16.dp)
        ) {
            Column(
                modifier = Modifier.padding(20.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(text = "🚨", fontSize = 34.sp)
                Spacer(modifier = Modifier.height(6.dp))
                Text(
                    text = "High-Security Hero Reset",
                    fontWeight = FontWeight.Bold,
                    fontSize = 17.sp,
                    color = DangerRed
                )
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "This erases all current habits, logs, and events, restoring initial starter templates.",
                    fontSize = 12.sp,
                    color = TextPrimary,
                    textAlign = androidx.compose.ui.text.style.TextAlign.Center
                )

                Spacer(modifier = Modifier.height(10.dp))

                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(8.dp))
                        .background(Emerald800)
                        .padding(8.dp)
                ) {
                    Text(
                        text = "🛡️ An Emergency Pre-Wipe Snapshot will be preserved in slot 1 so this is fully undoable.",
                        fontSize = 11.sp,
                        color = TealAccent
                    )
                }

                Spacer(modifier = Modifier.height(14.dp))

                Text(text = "Type 'RESET HERO' to wipe:", fontSize = 12.sp, color = TextMuted)
                OutlinedTextField(
                    value = confirmText,
                    onValueChange = { confirmText = it },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )

                Spacer(modifier = Modifier.height(14.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    TextButton(onClick = onDismiss) {
                        Text("Cancel", color = TextMuted)
                    }

                    Button(
                        onClick = onConfirm,
                        enabled = isConfirmed,
                        colors = ButtonDefaults.buttonColors(containerColor = DangerRed)
                    ) {
                        Text("Erase & Reset", color = TextPrimary, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}

@Composable
fun CloudSyncDialog(
    viewModel: SelfCareViewModel,
    onDismiss: () -> Unit
) {
    val context = LocalContext.current
    val activity = context as? Activity
    val currentUser by viewModel.currentUser.collectAsState()
    val syncStatus by viewModel.syncStatus.collectAsState()
    val isSyncing by viewModel.isSyncing.collectAsState()

    Dialog(onDismissRequest = onDismiss) {
        Card(
            shape = RoundedCornerShape(20.dp),
            colors = CardDefaults.cardColors(containerColor = SurfaceCard),
            border = CardDefaults.outlinedCardBorder().copy(brush = androidx.compose.ui.graphics.SolidColor(TealAccent.copy(alpha = 0.6f))),
            modifier = Modifier.padding(16.dp)
        ) {
            Column(
                modifier = Modifier
                    .padding(20.dp)
                    .fillMaxWidth(),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(text = "☁️", fontSize = 36.sp)
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "Cloud Sync & Multi-Device",
                    fontWeight = FontWeight.Bold,
                    fontSize = 17.sp,
                    color = TextPrimary
                )
                Text(
                    text = "Secure your habits, streaks, and reflections with Google & Firebase Firestore",
                    fontSize = 11.sp,
                    color = TextMuted,
                    textAlign = androidx.compose.ui.text.style.TextAlign.Center
                )

                Spacer(modifier = Modifier.height(14.dp))

                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(12.dp))
                        .background(Emerald800)
                        .padding(12.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(
                            text = "STATUS",
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold,
                            color = TealAccent
                        )
                        Spacer(modifier = Modifier.height(2.dp))
                        Text(
                            text = syncStatus,
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Medium,
                            color = TextPrimary
                        )
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                if (currentUser == null) {
                    Button(
                        onClick = {
                            if (activity != null) {
                                viewModel.signInWithGoogle(activity)
                            }
                        },
                        colors = ButtonDefaults.buttonColors(
                            containerColor = MaterialTheme.colorScheme.primary,
                            contentColor = Color.White
                        ),
                        shape = SageButtonShape,
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(48.dp)
                            .testTag("btn_google_signin")
                    ) {
                        Text(
                            text = "Sign in with Google",
                            color = Color.White,
                            fontWeight = FontWeight.SemiBold,
                            fontSize = 14.sp
                        )
                    }
                } else {
                    Button(
                        onClick = { viewModel.syncWithCloud() },
                        enabled = !isSyncing,
                        colors = ButtonDefaults.buttonColors(
                            containerColor = MaterialTheme.colorScheme.primary,
                            contentColor = Color.White
                        ),
                        shape = SageButtonShape,
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(46.dp)
                            .testTag("btn_cloud_sync_now")
                    ) {
                        if (isSyncing) {
                            CircularProgressIndicator(
                                modifier = Modifier.size(20.dp),
                                color = Emerald900,
                                strokeWidth = 2.dp
                            )
                        } else {
                            Text("☁️ Backup & Sync to Cloud", color = Emerald900, fontWeight = FontWeight.Bold)
                        }
                    }

                    Spacer(modifier = Modifier.height(8.dp))

                    TextButton(
                        onClick = { viewModel.signOutFromCloud() },
                        colors = ButtonDefaults.textButtonColors(contentColor = DangerRed)
                    ) {
                        Text("Sign Out of Google", fontSize = 12.sp)
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))

                TextButton(onClick = onDismiss) {
                    Text("Close", color = TextMuted)
                }
            }
        }
    }
}

@Composable
fun SkillEditDialog(
    node: NodeItem?,
    viewModel: SelfCareViewModel,
    onDismiss: () -> Unit
) {
    var name by remember { mutableStateOf(node?.n ?: "") }
    var emoji by remember { mutableStateOf(node?.e ?: "⭐") }
    var kind by remember { mutableStateOf(node?.k ?: "check") }
    var goalStr by remember { mutableStateOf((node?.g ?: 1).toString()) }
    var unit by remember { mutableStateOf(node?.u ?: "") }
    var routineTime by remember { mutableStateOf(node?.routineTime ?: "morning") }
    var nature by remember { mutableStateOf(node?.nature ?: "skill") }
    var importance by remember { mutableStateOf(node?.importance ?: "medium") }
    var rememorizeEnabled by remember { mutableStateOf(node?.rememorize?.enabled ?: false) }
    var rememorizeInterval by remember { mutableStateOf(node?.rememorize?.intervalDays ?: 3) }
    var ifThenAnchor by remember { mutableStateOf(node?.ifThenAnchor ?: "") }
    var note by remember { mutableStateOf(node?.note ?: "") }

    val state by viewModel.state.collectAsState()
    val targetParent by viewModel.targetParentId.collectAsState()
    var selectedParentId by remember { mutableStateOf(node?.p ?: targetParent ?: "0") }
    var parentDropdownExpanded by remember { mutableStateOf(false) }

    val emojis = listOf("⭐", "💧", "🧘", "📖", "🎯", "🎨", "✍️", "🤲", "🦷", "🧼", "🧠", "💪", "🍎")

    Dialog(onDismissRequest = onDismiss) {
        Card(
            shape = RoundedCornerShape(20.dp),
            colors = CardDefaults.cardColors(containerColor = SurfaceCard),
            border = CardDefaults.outlinedCardBorder().copy(brush = androidx.compose.ui.graphics.SolidColor(LineBorder)),
            modifier = Modifier
                .fillMaxWidth()
                .padding(8.dp)
        ) {
            Column(
                modifier = Modifier
                    .padding(16.dp)
                    .verticalScroll(rememberScrollState())
            ) {
                Text(
                    text = if (node != null) "Edit Habit / Skill" else "Add New Habit / Skill",
                    fontWeight = FontWeight.Bold,
                    fontSize = 16.sp,
                    color = TextPrimary
                )

                Spacer(modifier = Modifier.height(10.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    emojis.take(7).forEach { em ->
                        Box(
                            modifier = Modifier
                                .size(34.dp)
                                .clip(CircleShape)
                                .background(if (emoji == em) Emerald500 else SurfaceCardVariant)
                                .clickable { emoji = em },
                            contentAlignment = Alignment.Center
                        ) {
                            Text(text = em, fontSize = 16.sp)
                        }
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))

                OutlinedTextField(
                    value = name,
                    onValueChange = { name = it },
                    label = { Text("Skill / Habit Name") },
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("input_skill_name"),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = Emerald500,
                        unfocusedBorderColor = LineBorder
                    )
                )

                Spacer(modifier = Modifier.height(8.dp))

                // Nature Selector
                Text(text = "Item Nature:", fontSize = 11.sp, color = TextMuted)
                Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                    listOf("skill", "technique", "concept", "habit").forEach { nat ->
                        FilterChip(
                            selected = nature == nat,
                            onClick = { nature = nat },
                            label = { Text(nat.replaceFirstChar { it.uppercase() }, fontSize = 10.sp) }
                        )
                    }
                }

                Spacer(modifier = Modifier.height(8.dp))

                // Parent Skill Selector
                val parentNode = state.nodes.firstOrNull { it.id == selectedParentId }
                val parentLabel = if (selectedParentId == "0") "🌟 Top-Level Root (New Pillar)" else "${parentNode?.e ?: "⭐"} ${parentNode?.n ?: "Sub-skill"}"

                Text(text = "Parent Skill / Hierarchy:", fontSize = 11.sp, color = TextMuted)
                Spacer(modifier = Modifier.height(4.dp))
                Box {
                    Surface(
                        shape = RoundedCornerShape(10.dp),
                        color = SurfaceCardVariant,
                        border = CardDefaults.outlinedCardBorder().copy(brush = androidx.compose.ui.graphics.SolidColor(LineBorder)),
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { parentDropdownExpanded = true }
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween,
                            modifier = Modifier.padding(horizontal = 12.dp, vertical = 10.dp)
                        ) {
                            Text(
                                text = parentLabel,
                                fontSize = 12.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = TextPrimary
                            )
                            Text(text = "▼", fontSize = 10.sp, color = TextMuted)
                        }
                    }

                    DropdownMenu(
                        expanded = parentDropdownExpanded,
                        onDismissRequest = { parentDropdownExpanded = false }
                    ) {
                        DropdownMenuItem(
                            text = { Text("🌟 Top-Level Root (New Pillar)") },
                            onClick = {
                                selectedParentId = "0"
                                parentDropdownExpanded = false
                            }
                        )
                        state.nodes.filter { it.id != node?.id }.forEach { opt ->
                            DropdownMenuItem(
                                text = { Text("${opt.e} ${opt.n}") },
                                onClick = {
                                    selectedParentId = opt.id
                                    parentDropdownExpanded = false
                                }
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(6.dp))

                // Kind: Check or Count
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    FilterChip(
                        selected = kind == "check",
                        onClick = { kind = "check" },
                        label = { Text("Checkmark ✓") }
                    )
                    FilterChip(
                        selected = kind == "count",
                        onClick = { kind = "count" },
                        label = { Text("Counter (+/-)") }
                    )
                }

                if (kind == "count") {
                    Spacer(modifier = Modifier.height(8.dp))
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        OutlinedTextField(
                            value = goalStr,
                            onValueChange = { goalStr = it },
                            label = { Text("Goal") },
                            modifier = Modifier.weight(1f)
                        )
                        OutlinedTextField(
                            value = unit,
                            onValueChange = { unit = it },
                            label = { Text("Unit (e.g. glasses)") },
                            modifier = Modifier.weight(1f)
                        )
                    }
                }

                Spacer(modifier = Modifier.height(8.dp))

                // Spaced Rememorization Toggle
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(8.dp))
                        .background(SurfaceCardVariant)
                        .padding(horizontal = 8.dp, vertical = 4.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Column {
                        Text("🧠 Spaced Rememorization", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = AmberLight)
                        Text("Queues in Study tab every $rememorizeInterval days", fontSize = 10.sp, color = TextMuted)
                    }
                    Switch(
                        checked = rememorizeEnabled,
                        onCheckedChange = { rememorizeEnabled = it }
                    )
                }

                if (rememorizeEnabled) {
                    Spacer(modifier = Modifier.height(6.dp))
                    Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                        listOf(1 to "1d", 3 to "3d", 7 to "7d", 14 to "14d", 30 to "30d").forEach { (days, lbl) ->
                            FilterChip(
                                selected = rememorizeInterval == days,
                                onClick = { rememorizeInterval = days },
                                label = { Text(lbl, fontSize = 10.sp) }
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(8.dp))

                OutlinedTextField(
                    value = ifThenAnchor,
                    onValueChange = { ifThenAnchor = it },
                    label = { Text("If-Then Anchor (e.g. After morning coffee)") },
                    modifier = Modifier.fillMaxWidth()
                )

                Spacer(modifier = Modifier.height(14.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.End
                ) {
                    if (node != null) {
                        TextButton(
                            onClick = { viewModel.deleteNode(node.id) },
                            colors = ButtonDefaults.textButtonColors(contentColor = DangerRed)
                        ) {
                            Text("Delete")
                        }
                    }
                    Spacer(modifier = Modifier.width(8.dp))
                    TextButton(onClick = onDismiss) {
                        Text("Cancel", color = TextMuted)
                    }
                    Spacer(modifier = Modifier.width(8.dp))
                    Button(
                        onClick = {
                            if (name.isNotBlank()) {
                                val item = NodeItem(
                                    id = node?.id ?: "node_${System.currentTimeMillis()}",
                                    p = selectedParentId,
                                    e = emoji,
                                    n = name,
                                    k = kind,
                                    g = goalStr.toIntOrNull() ?: 1,
                                    u = unit,
                                    nature = nature,
                                    importance = importance,
                                    rememorize = if (rememorizeEnabled) RememorizeConfig(
                                        enabled = true,
                                        intervalDays = rememorizeInterval,
                                        lastReviewed = System.currentTimeMillis(),
                                        nextDue = System.currentTimeMillis() + (rememorizeInterval * 86400000L),
                                        reviewCount = node?.rememorize?.reviewCount ?: 0
                                    ) else null,
                                    routineTime = routineTime,
                                    ifThenAnchor = ifThenAnchor.ifBlank { null },
                                    note = note
                                )
                                viewModel.saveNode(item)
                            }
                        },
                        colors = ButtonDefaults.buttonColors(
                            containerColor = MaterialTheme.colorScheme.primary,
                            contentColor = Color.White
                        ),
                        shape = SageButtonShape,
                        modifier = Modifier.testTag("btn_save_skill")
                    ) {
                        Text("Save", color = Color.White, fontWeight = FontWeight.SemiBold)
                    }
                }
            }
        }
    }
}

@Composable
fun FocusTimerDialog(
    viewModel: SelfCareViewModel,
    onDismiss: () -> Unit
) {
    var secondsLeft by remember { mutableStateOf(20 * 60) }
    var isRunning by remember { mutableStateOf(false) }
    var strictMode by remember { mutableStateOf(false) }
    var sessionCompleted by remember { mutableStateOf(false) }
    var reflectionText by remember { mutableStateOf("") }
    var reflectionClaimed by remember { mutableStateOf(false) }

    LaunchedEffect(isRunning) {
        while (isRunning && secondsLeft > 0) {
            delay(1000L)
            secondsLeft -= 1
        }
        if (secondsLeft == 0 && isRunning) {
            isRunning = false
            sessionCompleted = true
            viewModel.playFocusBell()
            viewModel.triggerCelebration("🎯 Deep Work Completed!", "Distraction-free focus completed! Complete your reflection for +10 bonus XP.")
        }
    }

    Dialog(onDismissRequest = { if (!strictMode || !isRunning) onDismiss() }) {
        Card(
            shape = RoundedCornerShape(24.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
            border = CardDefaults.outlinedCardBorder().copy(
                brush = androidx.compose.ui.graphics.SolidColor(MaterialTheme.colorScheme.outline)
            ),
            modifier = Modifier
                .padding(16.dp)
                .testTag("focus_timer_dialog")
        ) {
            Column(
                modifier = Modifier
                    .padding(24.dp)
                    .verticalScroll(rememberScrollState()),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(
                    text = if (sessionCompleted) "🎉 Focus Block Mastered!" else "⏱️ Deep Focus Session",
                    fontWeight = FontWeight.Bold,
                    fontSize = 18.sp,
                    color = MaterialTheme.colorScheme.onSurface
                )
                Text(
                    text = if (sessionCompleted) "Calibrate and crystallize your progress" else "Distraction-free flow state calibration",
                    fontSize = 12.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )

                Spacer(modifier = Modifier.height(16.dp))

                if (sessionCompleted) {
                    // Post-Session Reflection Prompt
                    Surface(
                        shape = RoundedCornerShape(16.dp),
                        color = MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.4f),
                        border = CardDefaults.outlinedCardBorder().copy(
                            brush = androidx.compose.ui.graphics.SolidColor(MaterialTheme.colorScheme.primary)
                        ),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column(modifier = Modifier.padding(14.dp)) {
                            Text(
                                text = "📝 Post-Session Reflection (+10 XP)",
                                fontSize = 13.sp,
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.onSurface
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = "What did you accomplish or overcome during this session?",
                                fontSize = 11.sp,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )

                            Spacer(modifier = Modifier.height(8.dp))

                            OutlinedTextField(
                                value = reflectionText,
                                onValueChange = { reflectionText = it },
                                placeholder = {
                                    Text(
                                        text = "e.g. Wrote 3 modules, read chapter 4, refactored database...",
                                        fontSize = 12.sp,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.6f)
                                    )
                                },
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .heightIn(min = 80.dp),
                                enabled = !reflectionClaimed,
                                colors = OutlinedTextFieldDefaults.colors(
                                    focusedBorderColor = MaterialTheme.colorScheme.primary,
                                    unfocusedBorderColor = MaterialTheme.colorScheme.outline
                                )
                            )

                            Spacer(modifier = Modifier.height(10.dp))

                            Button(
                                onClick = {
                                    if (reflectionText.isNotBlank() && !reflectionClaimed) {
                                        viewModel.awardDirectXp(10, "Focus session reflection")
                                        reflectionClaimed = true
                                    }
                                },
                                enabled = reflectionText.isNotBlank() && !reflectionClaimed,
                                shape = RoundedCornerShape(12.dp),
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = MaterialTheme.colorScheme.primary
                                ),
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .minimumInteractiveComponentSize()
                                    .height(44.dp)
                            ) {
                                Text(
                                    text = if (reflectionClaimed) "✓ Reflection Saved (+10 XP Claimed)" else "Claim +10 Bonus XP 🌟",
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 13.sp
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        OutlinedButton(
                            onClick = {
                                sessionCompleted = false
                                reflectionText = ""
                                reflectionClaimed = false
                                secondsLeft = 25 * 60
                            },
                            shape = RoundedCornerShape(12.dp),
                            modifier = Modifier
                                .weight(1f)
                                .minimumInteractiveComponentSize()
                                .height(46.dp)
                        ) {
                            Text("New Session", color = MaterialTheme.colorScheme.onSurface, fontSize = 13.sp)
                        }

                        Button(
                            onClick = onDismiss,
                            shape = RoundedCornerShape(12.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary),
                            modifier = Modifier
                                .weight(1f)
                                .minimumInteractiveComponentSize()
                                .height(46.dp)
                        ) {
                            Text("Finish 🛡️", fontWeight = FontWeight.Bold, fontSize = 13.sp)
                        }
                    }
                } else {
                    // Centered 5-digit tabular deep work timer (00:00)
                    val mins = secondsLeft / 60
                    val secs = secondsLeft % 60
                    Surface(
                        shape = RoundedCornerShape(16.dp),
                        color = MaterialTheme.colorScheme.surfaceVariant,
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 8.dp)
                    ) {
                        Box(
                            modifier = Modifier.padding(vertical = 18.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = String.format("%02d:%02d", mins, secs),
                                fontSize = 48.sp,
                                fontWeight = FontWeight.Black,
                                color = MaterialTheme.colorScheme.secondary,
                                style = TabularNumberStyle
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    // Duration Presets (15m, 25m, 45m)
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        listOf(15 to "15m", 25 to "25m (Pomo)", 45 to "45m (Deep)").forEach { (minutes, label) ->
                            Surface(
                                onClick = {
                                    if (!isRunning) {
                                        secondsLeft = minutes * 60
                                    }
                                },
                                shape = RoundedCornerShape(8.dp),
                                color = if (secondsLeft == minutes * 60) MaterialTheme.colorScheme.primaryContainer else MaterialTheme.colorScheme.surfaceVariant,
                                modifier = Modifier
                                    .minimumInteractiveComponentSize()
                                    .height(36.dp)
                            ) {
                                Text(
                                    text = label,
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.SemiBold,
                                    color = MaterialTheme.colorScheme.onSurface,
                                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 6.dp)
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    // Strict Flow Mode Switch
                    Surface(
                        shape = RoundedCornerShape(12.dp),
                        color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.6f),
                        border = CardDefaults.outlinedCardBorder().copy(
                            brush = androidx.compose.ui.graphics.SolidColor(MaterialTheme.colorScheme.outline)
                        ),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(horizontal = 12.dp, vertical = 8.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    text = "Strict Mode 🔒",
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = MaterialTheme.colorScheme.onSurface
                                )
                                Text(
                                    text = if (strictMode) "Controls locked during active flow state" else "Lock pause/cancel during active flow",
                                    fontSize = 10.sp,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                            Switch(
                                checked = strictMode,
                                onCheckedChange = { if (!isRunning) strictMode = it },
                                enabled = !isRunning
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    // Controls Row
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Button(
                            onClick = {
                                val nextRunning = !isRunning
                                isRunning = nextRunning
                                if (nextRunning) {
                                    viewModel.playFocusBell()
                                }
                            },
                            enabled = !strictMode || !isRunning,
                            colors = ButtonDefaults.buttonColors(
                                containerColor = if (isRunning) MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.primary
                            ),
                            shape = RoundedCornerShape(14.dp),
                            modifier = Modifier
                                .weight(1f)
                                .minimumInteractiveComponentSize()
                                .height(48.dp)
                        ) {
                            Text(
                                text = if (strictMode && isRunning) "Locked in Flow 🔒" else if (isRunning) "Pause" else "Start Focus",
                                color = Color.White,
                                fontWeight = FontWeight.Bold,
                                fontSize = 15.sp
                            )
                        }

                        OutlinedButton(
                            onClick = {
                                isRunning = false
                                secondsLeft = 20 * 60
                            },
                            enabled = !strictMode || !isRunning,
                            shape = RoundedCornerShape(14.dp),
                            modifier = Modifier
                                .minimumInteractiveComponentSize()
                                .height(48.dp)
                        ) {
                            Text("Reset", color = MaterialTheme.colorScheme.onSurface)
                        }
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    if (!strictMode || !isRunning) {
                        TextButton(
                            onClick = onDismiss,
                            modifier = Modifier.minimumInteractiveComponentSize()
                        ) {
                            Text("Close", color = MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun UrgeDelayDialog(
    viewModel: SelfCareViewModel,
    onDismiss: () -> Unit
) {
    var trigger by remember { mutableStateOf("") }
    var level by remember { mutableStateOf(3) }
    var choice by remember { mutableStateOf("") }

    Dialog(onDismissRequest = onDismiss) {
        Card(
            shape = RoundedCornerShape(20.dp),
            colors = CardDefaults.cardColors(containerColor = SurfaceCard),
            modifier = Modifier.padding(16.dp)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text(
                    text = "🌊 Urge Surfing & Delay",
                    fontWeight = FontWeight.Bold,
                    fontSize = 16.sp,
                    color = TextPrimary
                )
                Text(
                    text = "Notice the impulse without acting immediately. Urges peak and subside.",
                    fontSize = 11.sp,
                    color = TextMuted
                )

                Spacer(modifier = Modifier.height(12.dp))

                OutlinedTextField(
                    value = trigger,
                    onValueChange = { trigger = it },
                    label = { Text("What triggered this urge? (e.g. Boredom, Stress)") },
                    modifier = Modifier.fillMaxWidth()
                )

                Spacer(modifier = Modifier.height(10.dp))

                Text(text = "Intensity Level (1 to 5): $level", fontSize = 12.sp, color = AmberGold)
                Slider(
                    value = level.toFloat(),
                    onValueChange = { level = it.toInt() },
                    valueRange = 1f..5f,
                    steps = 3,
                    colors = SliderDefaults.colors(thumbColor = AmberGold, activeTrackColor = Emerald500)
                )

                Spacer(modifier = Modifier.height(10.dp))

                OutlinedTextField(
                    value = choice,
                    onValueChange = { choice = it },
                    label = { Text("Healthy substitute (e.g. Glass of water, 10 deep breaths)") },
                    modifier = Modifier.fillMaxWidth()
                )

                Spacer(modifier = Modifier.height(14.dp))

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
                            if (trigger.isNotBlank()) {
                                viewModel.logUrge(trigger, level, "Delay 10m", choice, "")
                            }
                        },
                        enabled = trigger.isNotBlank(),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = MaterialTheme.colorScheme.primary,
                            contentColor = Color.White
                        ),
                        shape = SageButtonShape
                    ) {
                        Text("Surfed Successfully ✓", color = Color.White, fontWeight = FontWeight.SemiBold)
                    }
                }
            }
        }
    }
}

@Composable
fun RewardShopDialog(
    viewModel: SelfCareViewModel,
    onDismiss: () -> Unit
) {
    val state by viewModel.state.collectAsState()

    Dialog(onDismissRequest = onDismiss) {
        Card(
            shape = RoundedCornerShape(20.dp),
            colors = CardDefaults.cardColors(containerColor = SurfaceCard),
            modifier = Modifier.padding(16.dp)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "🎁 Reward Vault",
                        fontWeight = FontWeight.Bold,
                        fontSize = 16.sp,
                        color = TextPrimary
                    )
                    Text(
                        text = "🪙 ${state.coins} Coins",
                        fontWeight = FontWeight.Bold,
                        fontSize = 14.sp,
                        color = AmberLight
                    )
                }

                Spacer(modifier = Modifier.height(12.dp))

                state.rewardShop.forEach { rew ->
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 4.dp)
                            .clip(RoundedCornerShape(12.dp))
                            .background(SurfaceCardVariant)
                            .padding(10.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text(text = rew.title, fontSize = 12.sp, color = TextPrimary)
                            Text(text = "Cost: ${rew.cost} coins", fontSize = 11.sp, color = AmberGold)
                        }

                        Button(
                            onClick = { viewModel.redeemReward(rew) },
                            enabled = state.coins >= rew.cost,
                            shape = SageButtonShape,
                            contentPadding = PaddingValues(horizontal = 10.dp, vertical = 2.dp),
                            modifier = Modifier.height(32.dp),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = MaterialTheme.colorScheme.primary,
                                contentColor = Color.White
                            )
                        ) {
                            Text("Redeem", fontSize = 11.sp, color = Color.White, fontWeight = FontWeight.SemiBold)
                        }
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))

                TextButton(
                    onClick = onDismiss,
                    modifier = Modifier.align(Alignment.End)
                ) {
                    Text("Close", color = TextMuted)
                }
            }
        }
    }
}

@Composable
fun ComebackBonusDialog(
    bonus: ComebackBonusInfo,
    onDismiss: () -> Unit
) {
    Dialog(onDismissRequest = onDismiss) {
        Card(
            shape = RoundedCornerShape(20.dp),
            colors = CardDefaults.cardColors(containerColor = SurfaceCard),
            border = CardDefaults.outlinedCardBorder().copy(brush = androidx.compose.ui.graphics.SolidColor(AmberGold)),
            modifier = Modifier.padding(16.dp)
        ) {
            Column(
                modifier = Modifier.padding(20.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(text = "🌱", fontSize = 36.sp)
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "Welcome Back, Hero!",
                    fontWeight = FontWeight.Black,
                    fontSize = 18.sp,
                    color = AmberLight
                )
                Spacer(modifier = Modifier.height(6.dp))
                Text(
                    text = bonus.welcomeMessage,
                    fontSize = 13.sp,
                    color = TextPrimary
                )

                Spacer(modifier = Modifier.height(14.dp))

                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(12.dp))
                        .background(Emerald800)
                        .padding(12.dp),
                    horizontalArrangement = Arrangement.SpaceAround
                ) {
                    Text(text = "+${bonus.bonusXp} XP", color = TealAccent, fontWeight = FontWeight.Bold)
                    Text(text = "+${bonus.bonusCoins} Coins 🪙", color = AmberLight, fontWeight = FontWeight.Bold)
                    Text(text = "+1 Shield 🛡️", color = Emerald400, fontWeight = FontWeight.Bold)
                }

                Spacer(modifier = Modifier.height(16.dp))

                Button(
                    onClick = onDismiss,
                    colors = ButtonDefaults.buttonColors(
                        containerColor = MaterialTheme.colorScheme.primary,
                        contentColor = Color.White
                    ),
                    shape = SageButtonShape,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text("Receive & Begin", color = Color.White, fontWeight = FontWeight.SemiBold)
                }
            }
        }
    }
}

@Composable
fun AddLearnDialog(
    viewModel: SelfCareViewModel,
    onDismiss: () -> Unit
) {
    var title by remember { mutableStateOf("") }
    var category by remember { mutableStateOf("selfhelp") }
    var summary by remember { mutableStateOf("") }
    var whyNote by remember { mutableStateOf("") }

    Dialog(onDismissRequest = onDismiss) {
        Card(
            shape = RoundedCornerShape(20.dp),
            colors = CardDefaults.cardColors(containerColor = SurfaceCard),
            modifier = Modifier.padding(16.dp)
        ) {
            Column(
                modifier = Modifier
                    .padding(16.dp)
                    .verticalScroll(rememberScrollState())
            ) {
                Text(text = "💡 Add New Wisdom Card", fontWeight = FontWeight.Bold, fontSize = 16.sp, color = TextPrimary)
                Spacer(modifier = Modifier.height(10.dp))

                OutlinedTextField(
                    value = title,
                    onValueChange = { title = it },
                    label = { Text("Concept Title") },
                    modifier = Modifier.fillMaxWidth()
                )

                Spacer(modifier = Modifier.height(8.dp))

                OutlinedTextField(
                    value = summary,
                    onValueChange = { summary = it },
                    label = { Text("Key Principle / Summary") },
                    modifier = Modifier.fillMaxWidth()
                )

                Spacer(modifier = Modifier.height(8.dp))

                OutlinedTextField(
                    value = whyNote,
                    onValueChange = { whyNote = it },
                    label = { Text("Why it matters in daily life") },
                    modifier = Modifier.fillMaxWidth()
                )

                Spacer(modifier = Modifier.height(14.dp))

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
                            if (title.isNotBlank() && summary.isNotBlank()) {
                                viewModel.addLearnItem(
                                    LearnItem(
                                        id = "learn_${System.currentTimeMillis()}",
                                        title = title,
                                        category = category,
                                        summary = summary,
                                        whyNote = whyNote,
                                        learnedDate = DateUtils.todayStr()
                                    )
                                )
                            }
                        },
                        enabled = title.isNotBlank() && summary.isNotBlank(),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = MaterialTheme.colorScheme.primary,
                            contentColor = Color.White
                        ),
                        shape = SageButtonShape
                    ) {
                        Text("Save", color = Color.White, fontWeight = FontWeight.SemiBold)
                    }
                }
            }
        }
    }
}

@Composable
fun AddTopicDialog(
    viewModel: SelfCareViewModel,
    onDismiss: () -> Unit
) {
    var name by remember { mutableStateOf("") }

    Dialog(onDismissRequest = onDismiss) {
        Card(
            shape = RoundedCornerShape(20.dp),
            colors = CardDefaults.cardColors(containerColor = SurfaceCard),
            modifier = Modifier.padding(16.dp)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text(text = "📖 Add Study Topic", fontWeight = FontWeight.Bold, fontSize = 16.sp, color = TextPrimary)
                Spacer(modifier = Modifier.height(10.dp))

                OutlinedTextField(
                    value = name,
                    onValueChange = { name = it },
                    label = { Text("Topic or Skill Name") },
                    modifier = Modifier.fillMaxWidth()
                )

                Spacer(modifier = Modifier.height(14.dp))

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
                            if (name.isNotBlank()) {
                                viewModel.addStudyTopic(name)
                            }
                        },
                        enabled = name.isNotBlank(),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = MaterialTheme.colorScheme.primary,
                            contentColor = Color.White
                        ),
                        shape = SageButtonShape
                    ) {
                        Text("Add Topic", color = Color.White, fontWeight = FontWeight.SemiBold)
                    }
                }
            }
        }
    }
}

@Composable
fun AddAlertDialog(
    viewModel: SelfCareViewModel,
    onDismiss: () -> Unit
) {
    val state by viewModel.state.collectAsState()
    var name by remember { mutableStateOf("") }
    var type by remember { mutableStateOf("custom") } // 'custom' | 'skill' | 'medicine' | 'prayer'
    val timesList = remember { mutableStateListOf("09:00") }
    var newTimeInput by remember { mutableStateOf("") }
    var hasChainedOffset by remember { mutableStateOf(false) }
    var chainedMinutes by remember { mutableStateOf(180) } // 3 hours default follow-up
    var repeatRule by remember { mutableStateOf("daily") } // 'daily' | 'weekdays' | 'weekends' | 'custom'
    val customDays = remember { mutableStateListOf(0, 1, 2, 3, 4, 5, 6) }
    var selectedSkillId by remember { mutableStateOf<String?>(null) }
    var selectedSkillName by remember { mutableStateOf<String?>(null) }
    var isSkillPickerOpen by remember { mutableStateOf(false) }
    var pillsCountStr by remember { mutableStateOf("30") }
    val scrollState = rememberScrollState()

    val dayLabels = listOf("Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat")

    Dialog(onDismissRequest = onDismiss) {
        Card(
            shape = RoundedCornerShape(24.dp),
            colors = CardDefaults.cardColors(containerColor = WarmSurface800),
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 16.dp)
                .heightIn(max = 680.dp)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(20.dp)
                    .verticalScroll(scrollState)
            ) {
                // Header
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(
                            text = "🔔 Smart Reminder",
                            fontWeight = FontWeight.Bold,
                            fontSize = 18.sp,
                            color = TextPrimary
                        )
                        Text(
                            text = "Multi-time schedules & chained follow-ups",
                            fontSize = 12.sp,
                            color = TextSecondary
                        )
                    }
                    IconButton(
                        onClick = onDismiss,
                        modifier = Modifier.size(48.dp)
                    ) {
                        Text("✕", fontSize = 16.sp, color = TextMuted)
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                // Type Selector Chips
                Text(
                    text = "Category",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = WarmAmberLight
                )
                Spacer(modifier = Modifier.height(6.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    listOf(
                        "custom" to "Custom 🔔",
                        "skill" to "Skill ⚡",
                        "medicine" to "Meds 💊",
                        "prayer" to "Prayer 🕌"
                    ).forEach { (catType, label) ->
                        FilterChip(
                            selected = type == catType,
                            onClick = {
                                type = catType
                                if (catType == "skill" && selectedSkillId == null && state.nodes.isNotEmpty()) {
                                    val firstHabit = state.nodes.firstOrNull { it.p == "0" } ?: state.nodes.first()
                                    selectedSkillId = firstHabit.id
                                    selectedSkillName = "${firstHabit.e} ${firstHabit.n}"
                                    if (name.isBlank()) name = firstHabit.n
                                }
                            },
                            label = { Text(label, fontSize = 11.sp, fontWeight = FontWeight.Medium) },
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = ForestSage500,
                                selectedLabelColor = TextPrimary,
                                containerColor = WarmSurface700,
                                labelColor = TextSecondary
                            ),
                            modifier = Modifier.height(36.dp)
                        )
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                // Title Input
                OutlinedTextField(
                    value = name,
                    onValueChange = { name = it },
                    label = { Text("Reminder Title (e.g., Hydrate, Read 10 Pages)") },
                    singleLine = true,
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = WarmAmberGold,
                        unfocusedBorderColor = WarmBorder,
                        focusedLabelColor = WarmAmberLight,
                        unfocusedLabelColor = TextSecondary,
                        focusedTextColor = TextPrimary,
                        unfocusedTextColor = TextPrimary
                    ),
                    modifier = Modifier.fillMaxWidth()
                )

                // Linked Skill Dropdown (If category is skill or user wants to bind habit)
                Spacer(modifier = Modifier.height(12.dp))
                Card(
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = WarmSurface700),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(12.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    text = "🔗 Link to Skill / Technique",
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = WarmAmberLight
                                )
                                Text(
                                    text = if (selectedSkillName != null) "Selected: $selectedSkillName" else "Auto-records habit count & +15 XP",
                                    fontSize = 11.sp,
                                    color = if (selectedSkillName != null) TextPrimary else TextSecondary
                                )
                            }
                            Button(
                                onClick = { isSkillPickerOpen = !isSkillPickerOpen },
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = if (selectedSkillId != null) ForestSage500 else WarmBorder
                                ),
                                contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp),
                                modifier = Modifier.height(38.dp)
                            ) {
                                Text(
                                    text = if (selectedSkillId == null) "Pick Skill" else "Change",
                                    fontSize = 11.sp,
                                    color = TextPrimary
                                )
                            }
                        }

                        if (isSkillPickerOpen) {
                            Spacer(modifier = Modifier.height(8.dp))
                            HorizontalDivider(color = WarmBorder)
                            Spacer(modifier = Modifier.height(8.dp))
                            Text(
                                text = "Select habit or skill to advance on completion:",
                                fontSize = 11.sp,
                                color = TextSecondary
                            )
                            Spacer(modifier = Modifier.height(6.dp))
                            Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                                state.nodes.take(8).forEach { node ->
                                    val isSelected = selectedSkillId == node.id
                                    Surface(
                                        shape = RoundedCornerShape(8.dp),
                                        color = if (isSelected) ForestSage700 else WarmCharcoal900,
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .clickable {
                                                selectedSkillId = node.id
                                                selectedSkillName = "${node.e} ${node.n}"
                                                if (name.isBlank()) name = node.n
                                                isSkillPickerOpen = false
                                            }
                                            .padding(horizontal = 10.dp, vertical = 8.dp)
                                    ) {
                                        Row(
                                            modifier = Modifier.fillMaxWidth(),
                                            horizontalArrangement = Arrangement.SpaceBetween,
                                            verticalAlignment = Alignment.CenterVertically
                                        ) {
                                            Text(
                                                text = "${node.e} ${node.n} (${node.nature})",
                                                fontSize = 12.sp,
                                                color = TextPrimary
                                            )
                                            if (isSelected) {
                                                Text("✓", color = WarmAmberGold, fontWeight = FontWeight.Bold)
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                // Multi-Time Section
                Text(
                    text = "Scheduled Clock Times (Multiple Times Supported)",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = WarmAmberLight
                )
                Spacer(modifier = Modifier.height(6.dp))

                // Existing Times Chips
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    timesList.forEachIndexed { idx, tStr ->
                        Surface(
                            shape = RoundedCornerShape(12.dp),
                            color = ForestSage700,
                            border = androidx.compose.foundation.BorderStroke(1.dp, ForestSage500)
                        ) {
                            Row(
                                modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(6.dp)
                            ) {
                                Text(text = "⏰ $tStr", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = TextPrimary)
                                if (timesList.size > 1) {
                                    Text(
                                        text = "✕",
                                        fontSize = 12.sp,
                                        color = WarmAmberLight,
                                        modifier = Modifier
                                            .clickable { timesList.removeAt(idx) }
                                            .padding(2.dp)
                                    )
                                }
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(8.dp))

                // Add Another Time Row
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    OutlinedTextField(
                        value = newTimeInput,
                        onValueChange = { newTimeInput = it },
                        placeholder = { Text("HH:MM e.g. 01:00 or 15:30", fontSize = 11.sp) },
                        singleLine = true,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = WarmAmberGold,
                            unfocusedBorderColor = WarmBorder,
                            focusedTextColor = TextPrimary,
                            unfocusedTextColor = TextPrimary
                        ),
                        modifier = Modifier.weight(1f)
                    )
                    Button(
                        onClick = {
                            val clean = newTimeInput.trim()
                            if (clean.matches(Regex("^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$")) && !timesList.contains(clean)) {
                                val formatted = if (clean.length == 4) "0$clean" else clean
                                timesList.add(formatted)
                                newTimeInput = ""
                            }
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = WarmAmberGold),
                        modifier = Modifier.height(48.dp)
                    ) {
                        Text("+ Add", color = ForestSage900, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                // Chained Follow-Up Option
                Card(
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = WarmSurface700),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(12.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    text = "⚡ Relative Chained Follow-Up",
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = TextPrimary
                                )
                                Text(
                                    text = "E.g., read 10 PM -> follow-up 3 hours later at 1:00 AM",
                                    fontSize = 11.sp,
                                    color = TextSecondary
                                )
                            }
                            Switch(
                                checked = hasChainedOffset,
                                onCheckedChange = { hasChainedOffset = it },
                                colors = SwitchDefaults.colors(
                                    checkedThumbColor = ForestSage900,
                                    checkedTrackColor = WarmAmberGold
                                )
                            )
                        }

                        if (hasChainedOffset) {
                            Spacer(modifier = Modifier.height(8.dp))
                            Text(
                                text = "Offset Delay After Anchor Time:",
                                fontSize = 11.sp,
                                color = WarmAmberLight
                            )
                            Spacer(modifier = Modifier.height(6.dp))
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(6.dp)
                            ) {
                                listOf(
                                    30 to "+30m",
                                    60 to "+1h",
                                    120 to "+2h",
                                    180 to "+3h",
                                    240 to "+4h"
                                ).forEach { (mins, lbl) ->
                                    FilterChip(
                                        selected = chainedMinutes == mins,
                                        onClick = { chainedMinutes = mins },
                                        label = { Text(lbl, fontSize = 11.sp) },
                                        colors = FilterChipDefaults.filterChipColors(
                                            selectedContainerColor = WarmAmberGold,
                                            selectedLabelColor = ForestSage900,
                                            containerColor = WarmCharcoal900,
                                            labelColor = TextSecondary
                                        ),
                                        modifier = Modifier.height(34.dp)
                                    )
                                }
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                // Repeat Schedule (Explicit "Every Day" option per user request)
                Text(
                    text = "Repeat Schedule",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = WarmAmberLight
                )
                Spacer(modifier = Modifier.height(6.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    listOf(
                        "daily" to "Every Day 🌟",
                        "weekdays" to "Weekdays 💼",
                        "weekends" to "Weekends 🏖️",
                        "custom" to "Custom 📅"
                    ).forEach { (rRule, lbl) ->
                        FilterChip(
                            selected = repeatRule == rRule,
                            onClick = {
                                repeatRule = rRule
                                when (rRule) {
                                    "daily" -> {
                                        customDays.clear()
                                        customDays.addAll(listOf(0, 1, 2, 3, 4, 5, 6))
                                    }
                                    "weekdays" -> {
                                        customDays.clear()
                                        customDays.addAll(listOf(1, 2, 3, 4, 5))
                                    }
                                    "weekends" -> {
                                        customDays.clear()
                                        customDays.addAll(listOf(0, 6))
                                    }
                                }
                            },
                            label = { Text(lbl, fontSize = 11.sp) },
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = ForestSage500,
                                selectedLabelColor = TextPrimary,
                                containerColor = WarmSurface700,
                                labelColor = TextSecondary
                            ),
                            modifier = Modifier.height(36.dp)
                        )
                    }
                }

                // If Custom Days is selected, show 7 day circles
                if (repeatRule == "custom") {
                    Spacer(modifier = Modifier.height(8.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        dayLabels.forEachIndexed { dIndex, dLabel ->
                            val isDaySelected = customDays.contains(dIndex)
                            Box(
                                modifier = Modifier
                                    .size(40.dp)
                                    .clip(CircleShape)
                                    .background(if (isDaySelected) WarmAmberGold else WarmSurface700)
                                    .clickable {
                                        if (isDaySelected) {
                                            if (customDays.size > 1) customDays.remove(dIndex)
                                        } else {
                                            customDays.add(dIndex)
                                        }
                                    },
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    text = dLabel.take(1),
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = if (isDaySelected) ForestSage900 else TextSecondary
                                )
                            }
                        }
                    }
                }

                if (type == "medicine") {
                    Spacer(modifier = Modifier.height(14.dp))
                    OutlinedTextField(
                        value = pillsCountStr,
                        onValueChange = { pillsCountStr = it },
                        label = { Text("Total Pill Supply Count") },
                        singleLine = true,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = WarmAmberGold,
                            unfocusedBorderColor = WarmBorder,
                            focusedTextColor = TextPrimary,
                            unfocusedTextColor = TextPrimary
                        ),
                        modifier = Modifier.fillMaxWidth()
                    )
                }

                Spacer(modifier = Modifier.height(20.dp))

                // Actions Row
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.End,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    TextButton(
                        onClick = onDismiss,
                        modifier = Modifier.height(48.dp)
                    ) {
                        Text("Cancel", color = TextMuted, fontSize = 14.sp)
                    }
                    Spacer(modifier = Modifier.width(12.dp))
                    Button(
                        onClick = {
                            if (name.isNotBlank()) {
                                val primaryTime = timesList.firstOrNull() ?: "09:00"
                                val finalDays = when (repeatRule) {
                                    "daily" -> listOf(0, 1, 2, 3, 4, 5, 6)
                                    "weekdays" -> listOf(1, 2, 3, 4, 5)
                                    "weekends" -> listOf(0, 6)
                                    else -> customDays.toList()
                                }

                                viewModel.saveAlert(
                                    AlertItem(
                                        id = "rm_${System.currentTimeMillis()}",
                                        n = name,
                                        icon = when (type) {
                                            "medicine" -> "💊"
                                            "prayer" -> "🕌"
                                            "skill" -> "⚡"
                                            else -> "🔔"
                                        },
                                        type = type,
                                        active = true,
                                        tm = primaryTime,
                                        times = timesList.toList(),
                                        chainedOffsetMinutes = if (hasChainedOffset) chainedMinutes else null,
                                        skillId = selectedSkillId,
                                        skillName = selectedSkillName,
                                        days = finalDays,
                                        repeatRule = repeatRule,
                                        pillsCount = if (type == "medicine") pillsCountStr.toIntOrNull() else null,
                                        pillsLowThreshold = if (type == "medicine") 5 else null
                                    )
                                )
                            }
                        },
                        enabled = name.isNotBlank(),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = MaterialTheme.colorScheme.primary,
                            contentColor = Color.White,
                            disabledContainerColor = WarmBorder
                        ),
                        shape = SageButtonShape,
                        modifier = Modifier
                            .height(48.dp)
                            .testTag("btn_save_alert")
                    ) {
                        Text("Save Smart Reminder", color = Color.White, fontWeight = FontWeight.SemiBold, fontSize = 13.sp)
                    }
                }
            }
        }
    }
}
