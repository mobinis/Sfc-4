package com.example.selfcarehero.ui.dialogs

import android.speech.tts.TextToSpeech
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Send
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Memory
import androidx.compose.material.icons.filled.VolumeMute
import androidx.compose.material.icons.filled.VolumeUp
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.example.selfcarehero.ai.LocalAiCopilot
import com.example.selfcarehero.ai.OnnxSmolLmEngine
import com.example.selfcarehero.model.AiChatMessage
import com.example.selfcarehero.model.CopilotToolItem
import com.example.selfcarehero.ui.viewmodel.TabType
import com.example.selfcarehero.ui.theme.*
import com.example.selfcarehero.ui.viewmodel.SelfCareViewModel
import kotlinx.coroutines.launch
import java.util.Locale
import java.util.UUID

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun LocalAiDialog(
    viewModel: SelfCareViewModel,
    initialPrompt: String? = null,
    onDismiss: () -> Unit
) {
    val context = LocalContext.current
    val state by viewModel.state.collectAsState()
    val scope = rememberCoroutineScope()
    val listState = rememberLazyListState()

    val onnxEngine = remember { OnnxSmolLmEngine.getInstance(context) }
    val diagnostics by onnxEngine.diagnostics.collectAsState()
    var showHardwareInfo by remember { mutableStateOf(false) }

    // TextToSpeech Engine
    var tts by remember { mutableStateOf<TextToSpeech?>(null) }
    var speakingMsgId by remember { mutableStateOf<String?>(null) }

    DisposableEffect(context) {
        val textToSpeech = TextToSpeech(context) { status ->
            if (status == TextToSpeech.SUCCESS) {
                // Initialize language
                try {
                    tts?.language = Locale.US
                } catch (_: Exception) {}
            }
        }
        tts = textToSpeech
        onDispose {
            try {
                textToSpeech.stop()
                textToSpeech.shutdown()
            } catch (_: Exception) {}
        }
    }

    var messages by remember {
        mutableStateOf(
            listOf(
                AiChatMessage(
                    id = "init",
                    isUser = false,
                    text = "Hello! I am your offline Self-Care Copilot running 100% on-device via ONNX Runtime Mobile (quantized SmolLM-135M). I can guide evening Socratic reflections, reframe cognitive distortions, critique Feynman teach-backs, and optimize your habit stacks.",
                    toolItems = listOf(
                        CopilotToolItem("q0", "ACTION", "Evening Reflection", "evening_reflection", "🌙"),
                        CopilotToolItem("q1", "ACTION", "What to do next?", "suggest_next", "🎯"),
                        CopilotToolItem("q2", "ACTION", "What am I doing wrong?", "audit_patterns", "🔬"),
                        CopilotToolItem("q3", "ACTION", "Teach-Back Critique", "critique_teachback", "🧠"),
                        CopilotToolItem("q4", "ACTION", "Research Sleep Science", "research_sleep", "🌐"),
                        CopilotToolItem("q5", "ACTION", "Research Habit Loops", "research_habits", "🌐")
                    )
                )
            )
        )
    }

    var inputText by remember { mutableStateOf(initialPrompt ?: "") }
    var isThinking by remember { mutableStateOf(false) }

    fun speakText(msgId: String, textToSpeak: String) {
        val currentTts = tts ?: return
        if (speakingMsgId == msgId) {
            currentTts.stop()
            speakingMsgId = null
        } else {
            currentTts.stop()
            // Clean markdown tokens before speaking
            val clean = textToSpeak
                .replace(Regex("[*#_>•`\\[\\]]"), "")
                .trim()
            currentTts.speak(clean, TextToSpeech.QUEUE_FLUSH, null, msgId)
            speakingMsgId = msgId
        }
    }

    fun sendMessage(userText: String) {
        if (userText.isBlank() || isThinking) return
        val userMsg = AiChatMessage(id = UUID.randomUUID().toString(), isUser = true, text = userText.trim())
        messages = messages + userMsg
        inputText = ""
        isThinking = true

        scope.launch {
            val response = LocalAiCopilot.processQuery(userText, state, onnxEngine)

            val badgePrefix = if (response.isRealModelInference) "🤖 [SmolLM Neural Model]\n" else "⚡ [${response.modelBadge}]\n"
            val aiMsg = AiChatMessage(
                id = UUID.randomUUID().toString(),
                isUser = false,
                text = "${badgePrefix}**${response.title}**\n\n${response.analysisText}",
                actionSuggestion = response.suggestedAction,
                actionPayload = response.suggestedActionPayload,
                toolItems = response.interactiveTools
            )
            messages = messages + aiMsg
            isThinking = false
            listState.animateScrollToItem(messages.size - 1)
        }
    }

    fun handleToolExecution(tool: CopilotToolItem) {
        when (tool.type) {
            "SAVE_REFLECTION" -> {
                viewModel.addJournalEntry(3, tool.payload, listOf("AI Coach", "Reflection"))
                viewModel.triggerCelebration("✍️ Reflection Recorded!", "+15 XP awarded. Your insights are safely stored.")
                viewModel.showToast("Reflection saved to your journal! (+15 XP)")
            }
            "LOG_HABIT" -> {
                val node = state.nodes.firstOrNull { it.id == tool.payload }
                if (node != null) {
                    if (node.k == "count") {
                        viewModel.incrementCountHabit(node, 1)
                    } else {
                        viewModel.toggleCheckHabit(node)
                    }
                    viewModel.showToast("✓ Logged '${node.n}' (+15 XP)")
                }
            }
            "OPEN_SCREEN" -> {
                when (tool.payload) {
                    "action_urge_surf" -> {
                        viewModel.openUrgeSurfingScreen()
                        onDismiss()
                    }
                    "action_breath_pacer" -> {
                        viewModel.openBreathPacer()
                        onDismiss()
                    }
                    "action_focus_timer" -> {
                        viewModel.showFocusTimerDialog.value = true
                        onDismiss()
                    }
                }
            }
            "ROUTINE" -> {
                viewModel.launchRoutineById(tool.payload)
                onDismiss()
            }
            "ACTION" -> {
                when (tool.payload) {
                    "evening_reflection" -> {
                        sendMessage("Evening reflection coach")
                    }
                    "critique_teachback" -> {
                        sendMessage("Teach-back critique")
                    }
                    "open_learn" -> {
                        viewModel.selectTab(TabType.LEARN)
                        onDismiss()
                    }
                    "suggest_next" -> {
                        inputText = "What should I do next?"
                    }
                    "audit_patterns" -> {
                        inputText = "What am I doing wrong?"
                    }
                    "search_water" -> {
                        inputText = "Search water"
                    }
                    "action_low_energy" -> {
                        viewModel.toggleLowEnergyMode()
                        viewModel.showToast("⚡ Low-Energy Essentials toggled")
                    }
                    "research_sleep" -> {
                        sendMessage("Research neuroscience of deep slow-wave sleep")
                    }
                    "research_habits" -> {
                        sendMessage("Research the habit loop cue routine reward")
                    }
                }
            }
        }
    }

    // Auto-send if initialPrompt was passed
    LaunchedEffect(Unit) {
        if (!initialPrompt.isNullOrBlank()) {
            sendMessage(initialPrompt)
        }
    }

    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Card(
            shape = RoundedCornerShape(24.dp),
            colors = CardDefaults.cardColors(
                containerColor = MaterialTheme.colorScheme.surface
            ),
            border = CardDefaults.outlinedCardBorder().copy(
                brush = Brush.linearGradient(listOf(PastelBlossomPink, PastelApricotAmber))
            ),
            modifier = Modifier
                .fillMaxWidth(0.95f)
                .fillMaxHeight(0.90f)
                .padding(vertical = 12.dp)
                .testTag("dialog_local_ai")
        ) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(16.dp)
            ) {
                // Header Bar
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .size(38.dp)
                                .clip(CircleShape)
                                .background(PastelBlossomPink.copy(alpha = 0.35f)),
                            contentAlignment = Alignment.Center
                        ) {
                            Text("🤖", fontSize = 20.sp)
                        }
                        Spacer(modifier = Modifier.width(10.dp))
                        Column {
                            Text(
                                text = "Self-Care Copilot",
                                fontWeight = FontWeight.Bold,
                                fontSize = 16.sp,
                                color = MaterialTheme.colorScheme.onSurface
                            )
                            Text(
                                text = "100% Offline • SmolLM-135M",
                                fontSize = 11.sp,
                                color = ForestSage400
                            )
                        }
                    }

                    Row(verticalAlignment = Alignment.CenterVertically) {
                        IconButton(
                            onClick = { showHardwareInfo = !showHardwareInfo },
                            modifier = Modifier
                                .size(40.dp)
                                .testTag("ai_hardware_info_button")
                        ) {
                            Icon(
                                imageVector = Icons.Default.Memory,
                                contentDescription = "Hardware Info",
                                tint = if (showHardwareInfo) PastelApricotAmber else MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }

                        IconButton(
                            onClick = onDismiss,
                            modifier = Modifier
                                .size(40.dp)
                                .testTag("ai_dialog_close_button")
                        ) {
                            Icon(
                                Icons.Default.Close,
                                contentDescription = "Close",
                                tint = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }
                }

                // Privacy Disclosure Pill
                Spacer(modifier = Modifier.height(6.dp))
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(8.dp))
                        .background(MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f))
                        .padding(horizontal = 10.dp, vertical = 4.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text("🔒", fontSize = 11.sp)
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = "100% Private On-Device: Zero personal data leaves your device.",
                        fontSize = 10.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }

                // Web Research Extension Toggle
                Spacer(modifier = Modifier.height(4.dp))
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(8.dp))
                        .background(if (state.aiOnlineSearchEnabled) SageGreenPrimary.copy(alpha = 0.12f) else MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.4f))
                        .padding(horizontal = 10.dp, vertical = 4.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.weight(1f)) {
                        Text(if (state.aiOnlineSearchEnabled) "🌐" else "🔒", fontSize = 12.sp)
                        Spacer(modifier = Modifier.width(6.dp))
                        Column {
                            Text(
                                text = if (state.aiOnlineSearchEnabled) "Web Research: Active" else "Web Research: Disabled",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = if (state.aiOnlineSearchEnabled) SageGreenPrimary else MaterialTheme.colorScheme.onSurfaceVariant
                            )
                            Text(
                                text = if (state.aiOnlineSearchEnabled) "Fetches untrusted facts; answers synthesized locally" else "Offline mode (safe in Airplane Mode)",
                                fontSize = 9.sp,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }
                    Switch(
                        checked = state.aiOnlineSearchEnabled,
                        onCheckedChange = { viewModel.toggleAiOnlineSearch(it) },
                        colors = SwitchDefaults.colors(checkedThumbColor = SageGreenPrimary),
                        modifier = Modifier.height(24.dp).testTag("switch_web_research")
                    )
                }

                // Hardware & Model Diagnostics Hub
                AnimatedVisibility(visible = showHardwareInfo) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 6.dp)
                            .clip(RoundedCornerShape(14.dp))
                            .background(MaterialTheme.colorScheme.surfaceVariant)
                            .padding(12.dp)
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "🧠 AI Engine Diagnostics",
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Black,
                                color = MaterialTheme.colorScheme.onSurface
                            )
                            Surface(
                                shape = RoundedCornerShape(6.dp),
                                color = if (diagnostics.isSessionActive) ForestSage400.copy(alpha = 0.2f) else PastelApricotAmber.copy(alpha = 0.2f)
                            ) {
                                Text(
                                    text = diagnostics.activeInferenceMode,
                                    fontSize = 9.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = if (diagnostics.isSessionActive) ForestSage400 else PastelApricotAmber,
                                    modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(6.dp))

                        Text(
                            text = "Model: ${diagnostics.modelType}",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Medium,
                            color = MaterialTheme.colorScheme.onSurface
                        )

                        val fileSizeLabel = if (diagnostics.modelFileSizeBytes > 0) {
                            "${diagnostics.modelFileSizeBytes / (1024 * 1024)} MB"
                        } else {
                            "Not installed (Using offline heuristics)"
                        }
                        Text(
                            text = "Weights File: $fileSizeLabel",
                            fontSize = 10.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )

                        Spacer(modifier = Modifier.height(4.dp))

                        // Real Measured Telemetry Row
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text(
                                text = "RAM: ${diagnostics.currentHeapMb} MB (Budget: ${diagnostics.memoryBudgetMb}MB)",
                                fontSize = 10.sp,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                            val tpsText = if (diagnostics.tokensPerSecond > 0f) {
                                "${String.format(Locale.US, "%.1f", diagnostics.tokensPerSecond)} tok/s"
                            } else "N/A"
                            Text(
                                text = "Throughput: $tpsText",
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Bold,
                                color = if (diagnostics.tokensPerSecond > 0f) ForestSage400 else MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }

                        if (diagnostics.lastInferenceMs > 0L) {
                            Text(
                                text = "Last Inference: ${diagnostics.lastInferenceMs}ms • Prompt: ${diagnostics.lastPromptTokens} tok • Output: ${diagnostics.lastTokensGenerated} tok",
                                fontSize = 10.sp,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }

                        if (diagnostics.lastErrorMessage != null) {
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = "⚠️ Notice: ${diagnostics.lastErrorMessage}",
                                fontSize = 10.sp,
                                color = Color(0xFFEF4444)
                            )
                        }

                        Spacer(modifier = Modifier.height(8.dp))

                        // Control Buttons
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            if (!diagnostics.isSessionActive) {
                                Button(
                                    onClick = {
                                        scope.launch {
                                            onnxEngine.loadModelSession()
                                        }
                                    },
                                    modifier = Modifier.weight(1f).height(32.dp),
                                    contentPadding = PaddingValues(horizontal = 8.dp, vertical = 2.dp),
                                    colors = ButtonDefaults.buttonColors(containerColor = ForestSage600)
                                ) {
                                    Text("Load Model", fontSize = 10.sp, fontWeight = FontWeight.Bold)
                                }
                            } else {
                                OutlinedButton(
                                    onClick = {
                                        onnxEngine.unloadModelSession()
                                    },
                                    modifier = Modifier.weight(1f).height(32.dp),
                                    contentPadding = PaddingValues(horizontal = 8.dp, vertical = 2.dp)
                                ) {
                                    Text("Unload (Free RAM)", fontSize = 10.sp)
                                }
                            }

                            Button(
                                onClick = {
                                    sendMessage("What is the core principle of habit consistency?")
                                },
                                modifier = Modifier.weight(1f).height(32.dp),
                                contentPadding = PaddingValues(horizontal = 8.dp, vertical = 2.dp),
                                colors = ButtonDefaults.buttonColors(containerColor = PastelApricotAmber)
                            ) {
                                Text("Test Prompt", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = Color(0xFF1D2623))
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(8.dp))

                // Chat Messages List
                LazyColumn(
                    state = listState,
                    modifier = Modifier
                        .weight(1f)
                        .fillMaxWidth(),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    items(messages, key = { it.id }) { msg ->
                        Column(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalAlignment = if (msg.isUser) Alignment.End else Alignment.Start
                        ) {
                            Box(
                                modifier = Modifier
                                    .widthIn(max = 310.dp)
                                    .clip(
                                        RoundedCornerShape(
                                            topStart = 16.dp,
                                            topEnd = 16.dp,
                                            bottomStart = if (msg.isUser) 16.dp else 4.dp,
                                            bottomEnd = if (msg.isUser) 4.dp else 16.dp
                                        )
                                    )
                                    .background(
                                        if (msg.isUser) PastelBlossomPink.copy(alpha = 0.4f)
                                        else MaterialTheme.colorScheme.surfaceVariant
                                    )
                                    .padding(12.dp)
                            ) {
                                Column {
                                    Text(
                                        text = msg.text,
                                        fontSize = 13.sp,
                                        color = MaterialTheme.colorScheme.onSurface,
                                        lineHeight = 18.sp
                                    )

                                    if (!msg.isUser) {
                                        Spacer(modifier = Modifier.height(6.dp))
                                        Row(
                                            modifier = Modifier.fillMaxWidth(),
                                            horizontalArrangement = Arrangement.End
                                        ) {
                                            IconButton(
                                                onClick = { speakText(msg.id, msg.text) },
                                                modifier = Modifier.size(28.dp)
                                            ) {
                                                Icon(
                                                    imageVector = if (speakingMsgId == msg.id) Icons.Default.VolumeMute else Icons.Default.VolumeUp,
                                                    contentDescription = "Read aloud",
                                                    tint = if (speakingMsgId == msg.id) PastelBlossomPink else MaterialTheme.colorScheme.onSurfaceVariant,
                                                    modifier = Modifier.size(16.dp)
                                                )
                                            }
                                        }
                                    }
                                }
                            }

                            // Interactive Tool Action Buttons
                            if (!msg.isUser && msg.toolItems.isNotEmpty()) {
                                Spacer(modifier = Modifier.height(6.dp))
                                FlowRow(
                                    horizontalArrangement = Arrangement.spacedBy(6.dp),
                                    verticalArrangement = Arrangement.spacedBy(6.dp),
                                    modifier = Modifier.fillMaxWidth()
                                ) {
                                    msg.toolItems.forEach { tool ->
                                        Button(
                                            onClick = { handleToolExecution(tool) },
                                            shape = RoundedCornerShape(12.dp),
                                            colors = ButtonDefaults.buttonColors(
                                                containerColor = MaterialTheme.colorScheme.primary,
                                                contentColor = androidx.compose.ui.graphics.Color.White
                                            ),
                                            contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp),
                                            modifier = Modifier.height(34.dp)
                                        ) {
                                            Text(
                                                text = "${tool.emoji} ${tool.label}",
                                                fontSize = 11.sp,
                                                color = androidx.compose.ui.graphics.Color.White,
                                                fontWeight = FontWeight.SemiBold
                                            )
                                        }
                                    }
                                }
                            }
                        }
                    }

                    if (isThinking) {
                        item {
                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(12.dp))
                                    .background(MaterialTheme.colorScheme.surfaceVariant)
                                    .padding(horizontal = 14.dp, vertical = 8.dp)
                            ) {
                                Text(
                                    "Copilot thinking on-device...",
                                    fontSize = 12.sp,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                        }
                    }
                }

                // Quick Prompt Chips
                Spacer(modifier = Modifier.height(8.dp))
                LazyRow(
                    horizontalArrangement = Arrangement.spacedBy(6.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    val promptSuggestions = listOf(
                        "🌙 Evening Reflection",
                        "🔄 Reframe Journal",
                        "🧠 Teach-Back Critique",
                        "🎯 What to do next?",
                        "🔬 What am I doing wrong?",
                        "🌊 Help with an urge",
                        "💧 Log 1 glass water",
                        "🔎 Search past journals"
                    )
                    items(promptSuggestions) { prompt ->
                        SuggestionChip(
                            onClick = { sendMessage(prompt) },
                            label = { Text(prompt, fontSize = 11.sp) },
                            colors = SuggestionChipDefaults.suggestionChipColors(
                                containerColor = PastelSoftBlush.copy(alpha = 0.35f),
                                labelColor = MaterialTheme.colorScheme.onSurface
                            ),
                            border = SuggestionChipDefaults.suggestionChipBorder(
                                enabled = true,
                                borderColor = PastelBlossomPink.copy(alpha = 0.5f)
                            ),
                            modifier = Modifier.height(32.dp)
                        )
                    }
                }

                Spacer(modifier = Modifier.height(8.dp))

                // Input Field
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    OutlinedTextField(
                        value = inputText,
                        onValueChange = { inputText = it },
                        placeholder = {
                            Text(
                                "Ask anything, search, or type 'log water'...",
                                fontSize = 12.sp,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        },
                        shape = RoundedCornerShape(14.dp),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = PastelBlossomPink,
                            unfocusedBorderColor = MaterialTheme.colorScheme.outline,
                            focusedTextColor = MaterialTheme.colorScheme.onSurface,
                            unfocusedTextColor = MaterialTheme.colorScheme.onSurface,
                            focusedContainerColor = MaterialTheme.colorScheme.surfaceVariant,
                            unfocusedContainerColor = MaterialTheme.colorScheme.surfaceVariant
                        ),
                        singleLine = true,
                        modifier = Modifier
                            .weight(1f)
                            .testTag("ai_input_field")
                    )

                    Spacer(modifier = Modifier.width(8.dp))

                    IconButton(
                        onClick = { sendMessage(inputText) },
                        modifier = Modifier
                            .size(48.dp)
                            .clip(CircleShape)
                            .background(PastelBlossomPink)
                            .testTag("ai_send_button")
                    ) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.Send,
                            contentDescription = "Send",
                            tint = LightTextEspresso,
                            modifier = Modifier.size(18.dp)
                        )
                    }
                }
            }
        }
    }
}
