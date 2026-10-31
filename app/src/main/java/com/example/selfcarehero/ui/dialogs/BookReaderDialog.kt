package com.example.selfcarehero.ui.dialogs

import android.app.Activity
import android.content.Intent
import android.net.Uri
import android.speech.RecognizerIntent
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.example.selfcarehero.data.room.BookNote
import com.example.selfcarehero.model.BookResourceItem
import com.example.selfcarehero.ui.theme.*
import com.example.selfcarehero.ui.viewmodel.SelfCareViewModel
import com.example.selfcarehero.utils.launchVoiceDictation
import com.example.selfcarehero.utils.rememberTextToSpeechSpeaker

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun BookReaderDialog(
    book: BookResourceItem,
    viewModel: SelfCareViewModel,
    onDismiss: () -> Unit
) {
    val context = LocalContext.current
    var selectedTab by remember { mutableIntStateOf(0) } // 0: Chapters, 1: Full Guide, 2: Notes & Exercises
    var userNotes by remember(book.userNotes) { mutableStateOf(book.userNotes) }
    var pagesInput by remember(book.pagesRead) { mutableIntStateOf(book.pagesRead) }

    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Card(
            modifier = Modifier
                .fillMaxWidth(0.96f)
                .fillMaxHeight(0.92f)
                .testTag("book_reader_dialog"),
            shape = RoundedCornerShape(22.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(16.dp)
            ) {
                // Header Row
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.weight(1f)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(44.dp)
                                .clip(RoundedCornerShape(12.dp))
                                .background(PastelApricotAmber.copy(alpha = 0.35f)),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(book.coverEmoji, fontSize = 24.sp)
                        }
                        Spacer(modifier = Modifier.width(10.dp))
                        Column {
                            Text(
                                text = book.title,
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.onSurface,
                                maxLines = 1,
                                overflow = TextOverflow.Ellipsis
                            )
                            Text(
                                text = "By ${book.author} • ${book.category}",
                                fontSize = 11.sp,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }

                    IconButton(onClick = onDismiss) {
                        Icon(Icons.Default.Close, contentDescription = "Close reader")
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))

                // Progress Bar Card
                Surface(
                    shape = RoundedCornerShape(14.dp),
                    color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.6f),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(12.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "Reading Progression",
                                fontSize = 12.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = MaterialTheme.colorScheme.onSurface
                            )
                            Text(
                                text = "${book.calculatedProgress()}% Completed",
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold,
                                color = ForestSage400
                            )
                        }
                        Spacer(modifier = Modifier.height(6.dp))
                        LinearProgressIndicator(
                            progress = { book.calculatedProgress().toFloat() / 100f },
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(8.dp)
                                .clip(RoundedCornerShape(4.dp)),
                            color = PastelApricotAmber,
                            trackColor = MaterialTheme.colorScheme.outline.copy(alpha = 0.2f)
                        )
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))

                // Sub-Tabs: Chapters | Full Guide | Notes & Exercise
                TabRow(
                    selectedTabIndex = selectedTab,
                    containerColor = Color.Transparent,
                    contentColor = MaterialTheme.colorScheme.onSurface,
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
                        text = { Text("📑 Chapters", fontSize = 11.sp, fontWeight = if (selectedTab == 0) FontWeight.Bold else FontWeight.Normal) }
                    )
                    Tab(
                        selected = selectedTab == 1,
                        onClick = { selectedTab = 1 },
                        text = { Text("📖 Full Guide", fontSize = 11.sp, fontWeight = if (selectedTab == 1) FontWeight.Bold else FontWeight.Normal) }
                    )
                    Tab(
                        selected = selectedTab == 2,
                        onClick = { selectedTab = 2 },
                        text = { Text("✍️ Notes & Practice", fontSize = 11.sp, fontWeight = if (selectedTab == 2) FontWeight.Bold else FontWeight.Normal) }
                    )
                }

                Spacer(modifier = Modifier.height(8.dp))

                // Content View based on Tab
                when (selectedTab) {
                    0 -> ChaptersTabView(book = book, onToggleChapter = { chTitle ->
                        viewModel.toggleChapter(book.id, chTitle)
                    })
                    1 -> FullGuideTabView(book = book, onOpenExternal = {
                        if (book.externalUrl.isNotBlank()) {
                            try {
                                val intent = Intent(Intent.ACTION_VIEW, Uri.parse(book.externalUrl))
                                context.startActivity(intent)
                            } catch (_: Exception) {}
                        }
                    })
                    2 -> NotesTabView(
                        book = book,
                        viewModel = viewModel,
                        userNotes = userNotes,
                        onNotesChange = { userNotes = it },
                        pagesInput = pagesInput,
                        onPagesChange = { pagesInput = it },
                        onSave = {
                            viewModel.updateBookProgress(
                                bookId = book.id,
                                pagesRead = pagesInput,
                                notes = userNotes,
                                status = if (book.calculatedProgress() >= 100) "completed" else "reading"
                            )
                        }
                    )
                }
            }
        }
    }
}

@Composable
private fun ChaptersTabView(
    book: BookResourceItem,
    onToggleChapter: (String) -> Unit
) {
    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        verticalArrangement = Arrangement.spacedBy(8.dp),
        contentPadding = PaddingValues(vertical = 8.dp)
    ) {
        if (book.coreFramework.isNotBlank()) {
            item {
                Card(
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = PastelBlossomPink.copy(alpha = 0.25f)),
                    border = CardDefaults.outlinedCardBorder().copy(
                        brush = Brush.linearGradient(listOf(PastelBlossomPink, PastelApricotAmber))
                    ),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier.padding(12.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text("💡", fontSize = 20.sp)
                        Spacer(modifier = Modifier.width(8.dp))
                        Column {
                            Text("Core Mental Model & Framework", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onSurface)
                            Text(book.coreFramework, fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                    }
                }
            }
        }

        items(book.chapters, key = { it.title }) { chapter ->
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { onToggleChapter(chapter.title) },
                shape = RoundedCornerShape(14.dp),
                colors = CardDefaults.cardColors(
                    containerColor = if (chapter.read) ForestSage400.copy(alpha = 0.15f) else MaterialTheme.colorScheme.surfaceVariant
                ),
                border = CardDefaults.outlinedCardBorder().copy(
                    brush = Brush.linearGradient(
                        if (chapter.read) listOf(ForestSage400, ForestSage400)
                        else listOf(MaterialTheme.colorScheme.outline, MaterialTheme.colorScheme.outline)
                    )
                )
            ) {
                Column(modifier = Modifier.padding(12.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier.weight(1f)
                        ) {
                            Text(
                                text = if (chapter.read) "✅" else "⚪",
                                fontSize = 16.sp
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = chapter.title,
                                fontSize = 13.sp,
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.onSurface
                            )
                        }
                        Surface(
                            shape = RoundedCornerShape(6.dp),
                            color = if (chapter.read) ForestSage400 else MaterialTheme.colorScheme.surface
                        ) {
                            Text(
                                text = if (chapter.read) "Read" else "Tap to Complete",
                                fontSize = 10.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = if (chapter.read) Color.White else MaterialTheme.colorScheme.onSurfaceVariant,
                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                            )
                        }
                    }

                    if (chapter.summary.isNotBlank()) {
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(
                            text = chapter.summary,
                            fontSize = 12.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            lineHeight = 16.sp
                        )
                    }

                    if (chapter.practicalExercise.isNotBlank()) {
                        Spacer(modifier = Modifier.height(6.dp))
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text("🎯 Action: ", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = PastelApricotAmber)
                            Text(chapter.practicalExercise, fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurface)
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun FullGuideTabView(
    book: BookResourceItem,
    onOpenExternal: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(vertical = 8.dp)
    ) {
        if (book.keyConcepts.isNotEmpty()) {
            Text("Core Concepts & Takeaways", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onSurface)
            Spacer(modifier = Modifier.height(6.dp))
            Row(
                horizontalArrangement = Arrangement.spacedBy(6.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                book.keyConcepts.forEach { concept ->
                    Surface(
                        shape = RoundedCornerShape(8.dp),
                        color = PastelBlossomPink.copy(alpha = 0.3f)
                    ) {
                        Text(
                            text = concept,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Medium,
                            color = MaterialTheme.colorScheme.onSurface,
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                        )
                    }
                }
            }
            Spacer(modifier = Modifier.height(14.dp))
        }

        // Full Reading Text Card
        Card(
            shape = RoundedCornerShape(14.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f)),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(14.dp)) {
                Text(
                    text = if (book.fullGuideContent.isNotBlank()) book.fullGuideContent else book.description,
                    fontSize = 13.sp,
                    color = MaterialTheme.colorScheme.onSurface,
                    lineHeight = 20.sp
                )
            }
        }

        if (book.externalUrl.isNotBlank()) {
            Spacer(modifier = Modifier.height(14.dp))
            Button(
                onClick = onOpenExternal,
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = MaterialTheme.colorScheme.primary,
                    contentColor = androidx.compose.ui.graphics.Color.White
                ),
                modifier = Modifier.fillMaxWidth()
            ) {
                Icon(Icons.Default.OpenInNew, contentDescription = null, tint = androidx.compose.ui.graphics.Color.White)
                Spacer(modifier = Modifier.width(6.dp))
                Text("Open PDF / Online Resource", color = androidx.compose.ui.graphics.Color.White, fontWeight = FontWeight.SemiBold)
            }
        }
    }
}

@Composable
private fun NotesTabView(
    book: BookResourceItem,
    viewModel: SelfCareViewModel,
    userNotes: String,
    onNotesChange: (String) -> Unit,
    pagesInput: Int,
    onPagesChange: (Int) -> Unit,
    onSave: () -> Unit
) {
    val roomBookNotes by viewModel.getBookNotes(book.id).collectAsState(initial = emptyList())
    val ttsSpeaker = rememberTextToSpeechSpeaker()
    val speechLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.StartActivityForResult()
    ) { result ->
        if (result.resultCode == Activity.RESULT_OK) {
            val spoken = result.data?.getStringArrayListExtra(RecognizerIntent.EXTRA_RESULTS)?.firstOrNull() ?: ""
            if (spoken.isNotBlank()) {
                val updated = if (userNotes.isBlank()) spoken else "$userNotes $spoken"
                onNotesChange(updated)
            }
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(vertical = 8.dp),
        verticalArrangement = Arrangement.spacedBy(10.dp)
    ) {
        // Pages Stepper
        Card(
            shape = RoundedCornerShape(14.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(12.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text("Pages Read", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onSurface)
                    Text("$pagesInput of ${book.totalPages} pages", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                }

                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    IconButton(
                        onClick = { onPagesChange((pagesInput - 10).coerceAtLeast(0)) },
                        modifier = Modifier.size(36.dp)
                    ) {
                        Text("-10", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    }
                    IconButton(
                        onClick = { onPagesChange((pagesInput + 10).coerceAtMost(book.totalPages)) },
                        modifier = Modifier.size(36.dp)
                    ) {
                        Text("+10", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = PastelApricotAmber)
                    }
                }
            }
        }

        // Section Title with Room Notes Counter
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text("📝", fontSize = 14.sp)
                Spacer(modifier = Modifier.width(6.dp))
                Text(
                    text = "Book Notes & Voice Dictation",
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurface
                )
            }

            if (roomBookNotes.isNotEmpty()) {
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(6.dp))
                        .background(ForestSage400.copy(alpha = 0.2f))
                        .padding(horizontal = 6.dp, vertical = 2.dp)
                ) {
                    Text(
                        text = "${roomBookNotes.size} Room Notes",
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        color = ForestSage400
                    )
                }
            }
        }

        // Quick prompt helper chips
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .horizontalScroll(rememberScrollState()),
            horizontalArrangement = Arrangement.spacedBy(4.dp)
        ) {
            listOf("💡 Key Takeaway: ", "💬 Script Practiced: ", "🎯 Action Rule: ", "❓ Question: ").forEach { chipPrompt ->
                Surface(
                    onClick = {
                        val updated = if (userNotes.isBlank()) chipPrompt else "$userNotes\n$chipPrompt"
                        onNotesChange(updated)
                    },
                    shape = RoundedCornerShape(6.dp),
                    color = MaterialTheme.colorScheme.surfaceVariant
                ) {
                    Text(
                        text = chipPrompt.trim(),
                        fontSize = 10.sp,
                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 3.dp),
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
        }

        // Text area
        OutlinedTextField(
            value = userNotes,
            onValueChange = onNotesChange,
            placeholder = { Text("Write personal reflections, key quotes, or tap 🎙️ to talk notes...", fontSize = 12.sp) },
            modifier = Modifier
                .fillMaxWidth()
                .heightIn(min = 100.dp, max = 160.dp),
            shape = RoundedCornerShape(12.dp)
        )

        // Action Row: Talk, Listen, Save to Room
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                Button(
                    onClick = { launchVoiceDictation(speechLauncher, "Speak notes for ${book.title}...") },
                    shape = RoundedCornerShape(8.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.surfaceVariant),
                    contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp),
                    modifier = Modifier.height(34.dp)
                ) {
                    Icon(Icons.Default.Mic, contentDescription = "Dictate", modifier = Modifier.size(14.dp), tint = PastelApricotAmber)
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("🎙️ Talk Note", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurface, fontWeight = FontWeight.Bold)
                }

                IconButton(
                    onClick = {
                        if (userNotes.isNotBlank()) {
                            ttsSpeaker.speak(userNotes)
                        } else if (roomBookNotes.isNotEmpty()) {
                            ttsSpeaker.speak(roomBookNotes.joinToString(". ") { it.noteText })
                        }
                    },
                    modifier = Modifier.size(34.dp)
                ) {
                    Icon(Icons.Default.VolumeUp, contentDescription = "Listen", modifier = Modifier.size(18.dp), tint = ForestSage400)
                }
            }

            Button(
                onClick = {
                    if (userNotes.isNotBlank()) {
                        viewModel.addBookNote(
                            bookId = book.id,
                            noteText = userNotes,
                            pageNumber = pagesInput,
                            chapterTitle = ""
                        )
                    }
                    onSave()
                },
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = MaterialTheme.colorScheme.primary,
                    contentColor = androidx.compose.ui.graphics.Color.White
                ),
                contentPadding = PaddingValues(horizontal = 12.dp, vertical = 4.dp),
                modifier = Modifier.height(34.dp)
            ) {
                Icon(Icons.Default.Save, contentDescription = null, tint = androidx.compose.ui.graphics.Color.White, modifier = Modifier.size(15.dp))
                Spacer(modifier = Modifier.width(4.dp))
                Text("Save (+10 XP 📝)", color = androidx.compose.ui.graphics.Color.White, fontWeight = FontWeight.SemiBold, fontSize = 11.sp)
            }
        }

        // Room Database Saved Book Notes
        if (roomBookNotes.isNotEmpty()) {
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = "Saved Book Notes in Room Database:",
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )

            Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                roomBookNotes.forEach { note ->
                    Surface(
                        shape = RoundedCornerShape(8.dp),
                        color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.7f),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(8.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column(modifier = Modifier.weight(1f)) {
                                if (note.pageNumber > 0) {
                                    Text("📖 Page ${note.pageNumber}", fontSize = 9.sp, fontWeight = FontWeight.Bold, color = PastelApricotAmber)
                                }
                                Text(note.noteText, fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurface)
                            }

                            Row(verticalAlignment = Alignment.CenterVertically) {
                                IconButton(
                                    onClick = { ttsSpeaker.speak(note.noteText) },
                                    modifier = Modifier.size(26.dp)
                                ) {
                                    Icon(Icons.Default.VolumeUp, contentDescription = "Listen", modifier = Modifier.size(13.dp))
                                }
                                IconButton(
                                    onClick = { viewModel.deleteBookNote(note.id) },
                                    modifier = Modifier.size(26.dp)
                                ) {
                                    Icon(Icons.Default.Delete, contentDescription = "Delete", modifier = Modifier.size(13.dp), tint = MaterialTheme.colorScheme.error)
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
