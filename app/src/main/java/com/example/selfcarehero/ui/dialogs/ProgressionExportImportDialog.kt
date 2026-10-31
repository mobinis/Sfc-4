package com.example.selfcarehero.ui.dialogs

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.material3.TabRowDefaults.tabIndicatorOffset
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.example.selfcarehero.model.AiExportPayload
import com.example.selfcarehero.ui.theme.*
import com.example.selfcarehero.ui.viewmodel.SelfCareViewModel
import kotlinx.serialization.json.Json

@Composable
fun ProgressionExportImportDialog(
    viewModel: SelfCareViewModel,
    onDismiss: () -> Unit
) {
    val context = LocalContext.current
    var selectedTab by remember { mutableIntStateOf(0) } // 0: Export, 1: Import
    val exportedJson = remember { viewModel.exportProgressionJson() }

    var importInputText by remember { mutableStateOf("") }
    var parsedPayload by remember { mutableStateOf<AiExportPayload?>(null) }
    var parseError by remember { mutableStateOf<String?>(null) }
    var isImportSuccess by remember { mutableStateOf(false) }

    // Live validation when import input changes
    LaunchedEffect(importInputText) {
        if (importInputText.isNotBlank()) {
            try {
                val json = Json { ignoreUnknownKeys = true }
                parsedPayload = json.decodeFromString<AiExportPayload>(importInputText.trim())
                parseError = null
            } catch (e: Exception) {
                parsedPayload = null
                parseError = "Invalid JSON structure: ${e.localizedMessage ?: "Unknown format"}"
            }
        } else {
            parsedPayload = null
            parseError = null
        }
    }

    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Card(
            modifier = Modifier
                .fillMaxWidth(0.95f)
                .fillMaxHeight(0.88f)
                .testTag("ai_progression_dialog"),
            shape = RoundedCornerShape(22.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(16.dp)
            ) {
                // Header
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .size(38.dp)
                                .clip(RoundedCornerShape(10.dp))
                                .background(PastelApricotAmber.copy(alpha = 0.35f)),
                            contentAlignment = Alignment.Center
                        ) {
                            Text("📚", fontSize = 20.sp)
                        }
                        Spacer(modifier = Modifier.width(10.dp))
                        Column {
                            Text(
                                text = "Special Video & Ebook Sync",
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.onSurface
                            )
                            Text(
                                text = "Videos & Ebooks with Study Notes only",
                                fontSize = 11.sp,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }

                    IconButton(onClick = onDismiss) {
                        Icon(Icons.Default.Close, contentDescription = "Close dialog")
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))

                // Mode Tabs
                TabRow(
                    selectedTabIndex = selectedTab,
                    containerColor = Color.Transparent,
                    indicator = { tabPositions ->
                        TabRowDefaults.SecondaryIndicator(
                            Modifier.tabIndicatorOffset(tabPositions[selectedTab]),
                            color = PastelApricotAmber
                        )
                    }
                ) {
                    Tab(
                        selected = selectedTab == 0,
                        onClick = { selectedTab = 0 },
                        text = { Text("📤 Export Curriculum", fontSize = 12.sp, fontWeight = if (selectedTab == 0) FontWeight.Bold else FontWeight.Normal) }
                    )
                    Tab(
                        selected = selectedTab == 1,
                        onClick = { selectedTab = 1 },
                        text = { Text("📥 Import Curriculum", fontSize = 12.sp, fontWeight = if (selectedTab == 1) FontWeight.Bold else FontWeight.Normal) }
                    )
                }

                Spacer(modifier = Modifier.height(10.dp))

                when (selectedTab) {
                    0 -> ExportTabView(
                        jsonString = exportedJson,
                        onCopy = {
                            val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                            val clip = ClipData.newPlainText("SelfCareHero Curriculum", exportedJson)
                            clipboard.setPrimaryClip(clip)
                            viewModel.showToast("Copied Curriculum JSON to clipboard! 📋")
                        },
                        onShare = {
                            try {
                                val sendIntent = Intent().apply {
                                    action = Intent.ACTION_SEND
                                    putExtra(Intent.EXTRA_TEXT, exportedJson)
                                    type = "text/plain"
                                }
                                context.startActivity(Intent.createChooser(sendIntent, "Share Progression File to AI"))
                            } catch (_: Exception) {}
                        }
                    )
                    1 -> ImportTabView(
                        importText = importInputText,
                        onTextChange = { importInputText = it },
                        parsedPayload = parsedPayload,
                        parseError = parseError,
                        isSuccess = isImportSuccess,
                        onApplyImport = {
                            val res = viewModel.importProgressionJson(importInputText)
                            if (res.isSuccess) {
                                isImportSuccess = true
                            }
                        }
                    )
                }
            }
        }
    }
}

@Composable
private fun ExportTabView(
    jsonString: String,
    onCopy: () -> Unit,
    onShare: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState()),
        verticalArrangement = Arrangement.spacedBy(10.dp)
    ) {
        Card(
            shape = RoundedCornerShape(12.dp),
            colors = CardDefaults.cardColors(containerColor = PastelBlossomPink.copy(alpha = 0.25f)),
            modifier = Modifier.fillMaxWidth()
        ) {
            Row(
                modifier = Modifier.padding(12.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text("🎯", fontSize = 20.sp)
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = "Special Exporting: Exclusively contains your Videos and Ebooks/Books with their full Room Database study notes, in-video timestamps, and voice reflections. Share this JSON with AI (Gemini/Claude/ChatGPT) to get personalized insights, exercises, and recommend new videos & books to import back!",
                    fontSize = 11.sp,
                    color = MaterialTheme.colorScheme.onSurface,
                    lineHeight = 16.sp
                )
            }
        }

        // Action Buttons Row
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Button(
                onClick = onCopy,
                colors = ButtonDefaults.buttonColors(
                    containerColor = MaterialTheme.colorScheme.primary,
                    contentColor = androidx.compose.ui.graphics.Color.White
                ),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier.weight(1f)
            ) {
                Icon(Icons.Default.ContentCopy, contentDescription = null, tint = androidx.compose.ui.graphics.Color.White, modifier = Modifier.size(16.dp))
                Spacer(modifier = Modifier.width(6.dp))
                Text("Copy Curriculum", fontSize = 12.sp, color = androidx.compose.ui.graphics.Color.White, fontWeight = FontWeight.SemiBold)
            }

            OutlinedButton(
                onClick = onShare,
                shape = RoundedCornerShape(10.dp),
                modifier = Modifier.weight(1f)
            ) {
                Icon(Icons.Default.Share, contentDescription = null, modifier = Modifier.size(16.dp))
                Spacer(modifier = Modifier.width(6.dp))
                Text("Share / Save File", fontSize = 12.sp)
            }
        }

        Text(
            text = "JSON Progression Preview (${jsonString.length} bytes):",
            fontSize = 11.sp,
            fontWeight = FontWeight.Bold,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )

        // Monospace Code Preview Box
        Surface(
            shape = RoundedCornerShape(12.dp),
            color = MaterialTheme.colorScheme.surfaceVariant,
            modifier = Modifier
                .fillMaxWidth()
                .height(280.dp)
        ) {
            Box(
                modifier = Modifier
                    .padding(10.dp)
                    .verticalScroll(rememberScrollState())
            ) {
                Text(
                    text = jsonString,
                    fontFamily = FontFamily.Monospace,
                    fontSize = 10.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    lineHeight = 14.sp
                )
            }
        }
    }
}

@Composable
private fun ImportTabView(
    importText: String,
    onTextChange: (String) -> Unit,
    parsedPayload: AiExportPayload?,
    parseError: String?,
    isSuccess: Boolean,
    onApplyImport: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState()),
        verticalArrangement = Arrangement.spacedBy(10.dp)
    ) {
        if (isSuccess) {
            Card(
                shape = RoundedCornerShape(14.dp),
                colors = CardDefaults.cardColors(containerColor = ForestSage400.copy(alpha = 0.2f)),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text("🎉", fontSize = 32.sp)
                    Spacer(modifier = Modifier.height(6.dp))
                    Text("Curriculum Successfully Merged!", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = ForestSage400)
                    Spacer(modifier = Modifier.height(4.dp))
                    Text("Your books, video library, and study resources have been updated in this tab.", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
            }
        } else {
            Text(
                text = "Paste the JSON response from your AI below:",
                fontSize = 12.sp,
                fontWeight = FontWeight.SemiBold,
                color = MaterialTheme.colorScheme.onSurface
            )

            OutlinedTextField(
                value = importText,
                onValueChange = onTextChange,
                placeholder = { Text("Paste JSON here: { \"books\": [...], \"videos\": [...] }", fontSize = 11.sp) },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(180.dp),
                shape = RoundedCornerShape(12.dp),
                textStyle = LocalTextStyle.current.copy(fontFamily = FontFamily.Monospace, fontSize = 11.sp)
            )

            // Validation Status / Preview
            if (parseError != null) {
                Surface(
                    shape = RoundedCornerShape(10.dp),
                    color = MaterialTheme.colorScheme.errorContainer.copy(alpha = 0.5f),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text(
                        text = "⚠️ $parseError",
                        fontSize = 11.sp,
                        color = MaterialTheme.colorScheme.error,
                        modifier = Modifier.padding(10.dp)
                    )
                }
            }

            if (parsedPayload != null) {
                Card(
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = PastelBlossomPink.copy(alpha = 0.25f)),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(12.dp)) {
                        Text("✅ Valid Curriculum Package Detected", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onSurface)
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "${parsedPayload.books.size} Books • ${parsedPayload.videos.size} Videos • ${parsedPayload.studyTopics.size} Study Topics",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                        Spacer(modifier = Modifier.height(3.dp))
                        Text(
                            text = "Smart Merge: Existing books & videos will be updated while new items are safely added to your library.",
                            fontSize = 11.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text("🛡️ Pre-import safety snapshot will be taken automatically before applying.", fontSize = 10.sp, color = ForestSage400)
                    }
                }

                Button(
                    onClick = onApplyImport,
                    colors = ButtonDefaults.buttonColors(
                        containerColor = MaterialTheme.colorScheme.primary,
                        contentColor = androidx.compose.ui.graphics.Color.White
                    ),
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Icon(Icons.Default.CloudDownload, contentDescription = null, tint = androidx.compose.ui.graphics.Color.White)
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("Merge & Update Library", color = androidx.compose.ui.graphics.Color.White, fontWeight = FontWeight.SemiBold)
                }
            }
        }
    }
}
