package com.example.selfcarehero.ui.screens

import android.app.Activity
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.speech.RecognizerIntent
import android.view.ViewGroup
import android.widget.FrameLayout
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
import androidx.compose.ui.viewinterop.AndroidView
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import androidx.media3.common.MediaItem
import androidx.media3.common.PlaybackException
import androidx.media3.common.Player
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.ui.PlayerView
import com.example.selfcarehero.data.room.VideoNote
import com.example.selfcarehero.model.VideoResourceItem
import com.example.selfcarehero.ui.theme.*
import com.example.selfcarehero.ui.viewmodel.SelfCareViewModel
import com.example.selfcarehero.utils.VideoTimeFormatter
import com.example.selfcarehero.utils.launchVoiceDictation
import com.example.selfcarehero.utils.rememberTextToSpeechSpeaker

@Composable
fun VideoLibraryScreen(
    viewModel: SelfCareViewModel,
    modifier: Modifier = Modifier
) {
    val state by viewModel.state.collectAsState()
    val categoryFilter by viewModel.videoCategoryFilter.collectAsState()
    var searchQuery by remember { mutableStateOf("") }

    val categories = remember {
        listOf(
            "all" to "All Videos",
            "favorites" to "⭐ Favorites",
            "active listening" to "👂 Listening",
            "healthy boundaries" to "🛡️ Boundaries",
            "handling conflict" to "⚖️ Conflict",
            "confident speaking" to "🎙️ Speaking",
            "making friends" to "🤝 Friends",
            "emotional intelligence" to "🧠 High EQ",
            "breathwork" to "🫁 Breathwork",
            "mindfulness" to "🌲 Mindfulness",
            "movement & yoga" to "🧘 Movement",
            "focus & productivity" to "⚡ Focus",
            "sleep & rest" to "🌙 Sleep"
        )
    }

    // High performance memoized filtered list using derivedStateOf
    val filteredVideos by remember(state.videoResources, categoryFilter, searchQuery) {
        derivedStateOf {
            state.videoResources.filter { video ->
                val matchesCategory = when (categoryFilter) {
                    "all" -> true
                    "favorites" -> video.isFavorite
                    else -> video.category.equals(categoryFilter, ignoreCase = true)
                }
                val matchesSearch = if (searchQuery.isBlank()) true else {
                    video.title.contains(searchQuery, ignoreCase = true) ||
                    video.description.contains(searchQuery, ignoreCase = true) ||
                    video.tags.any { it.contains(searchQuery, ignoreCase = true) }
                }
                matchesCategory && matchesSearch
            }
        }
    }

    val selectedVideo by viewModel.selectedVideoForPlayback.collectAsState()
    val showAddDialog by viewModel.showAddVideoDialog.collectAsState()

    Scaffold(
        modifier = modifier.fillMaxSize(),
        containerColor = MaterialTheme.colorScheme.background,
        floatingActionButton = {
            FloatingActionButton(
                onClick = { viewModel.showAddVideoDialog.value = true },
                containerColor = WarmAmberGold,
                contentColor = androidx.compose.ui.graphics.Color(0xFF121413),
                shape = CircleShape,
                elevation = FloatingActionButtonDefaults.elevation(defaultElevation = 6.dp),
                modifier = Modifier
                    .padding(bottom = 76.dp)
                    .size(56.dp)
                    .testTag("fab_add_video")
            ) {
                Icon(Icons.Default.Add, contentDescription = "Add Video Link", tint = androidx.compose.ui.graphics.Color(0xFF121413))
            }
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(horizontal = 16.dp),
            contentPadding = PaddingValues(top = 8.dp, bottom = 120.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = "Video & Guided Library",
                            fontSize = 20.sp,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onBackground
                        )
                        Text(
                            text = "Curated somatic breathwork, communication & EQ lectures",
                            fontSize = 12.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }

                    // Export / Import Curriculum Button
                    Button(
                        onClick = { viewModel.showAiExportImportDialog.value = true },
                        colors = ButtonDefaults.buttonColors(
                            containerColor = ForestSage700,
                            contentColor = Color.White
                        ),
                        shape = RoundedCornerShape(10.dp),
                        contentPadding = PaddingValues(horizontal = 10.dp, vertical = 6.dp),
                        modifier = Modifier
                            .height(36.dp)
                            .testTag("btn_ai_sync_videos")
                    ) {
                        Text("🔁 Sync / Export", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                    }
                }
            }

            // Search Bar
            item {
                OutlinedTextField(
                    value = searchQuery,
                    onValueChange = { searchQuery = it },
                    placeholder = { Text("Search by title, tag, or topic...", fontSize = 13.sp) },
                    leadingIcon = { Icon(Icons.Default.Search, contentDescription = "Search", tint = MaterialTheme.colorScheme.onSurfaceVariant) },
                    trailingIcon = {
                        if (searchQuery.isNotEmpty()) {
                            IconButton(onClick = { searchQuery = "" }) {
                                Icon(Icons.Default.Clear, contentDescription = "Clear search")
                            }
                        }
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 4.dp),
                    shape = RoundedCornerShape(14.dp),
                    singleLine = true,
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedContainerColor = MaterialTheme.colorScheme.surface,
                        unfocusedContainerColor = MaterialTheme.colorScheme.surface
                    )
                )
            }

            // Category Horizontal Filter Pills
            item {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .horizontalScroll(rememberScrollState()),
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    categories.forEach { (catKey, label) ->
                        val isSelected = categoryFilter == catKey
                        Surface(
                            onClick = { viewModel.setVideoCategoryFilter(catKey) },
                            shape = RoundedCornerShape(12.dp),
                            color = if (isSelected) PastelBlossomPink else MaterialTheme.colorScheme.surfaceVariant,
                            border = CardDefaults.outlinedCardBorder().copy(
                                brush = Brush.linearGradient(
                                    if (isSelected) listOf(PastelBlossomPink, PastelApricotAmber)
                                    else listOf(MaterialTheme.colorScheme.outline, MaterialTheme.colorScheme.outline)
                                )
                            ),
                            modifier = Modifier.height(34.dp)
                        ) {
                            Box(
                                modifier = Modifier.padding(horizontal = 12.dp),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    text = label,
                                    fontSize = 11.sp,
                                    fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                                    color = if (isSelected) LightTextEspresso else MaterialTheme.colorScheme.onSurface
                                )
                            }
                        }
                    }
                }
            }

            // Video Cards Count Summary
            item {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 4.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "${filteredVideos.size} Videos Available",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Text(
                        text = "ExoPlayer Powered 🎬",
                        fontSize = 11.sp,
                        color = ForestSage400
                    )
                }
            }

            // Video Cards
            if (filteredVideos.isEmpty()) {
                item {
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 20.dp),
                        shape = RoundedCornerShape(16.dp),
                        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
                    ) {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(32.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Text("🎬", fontSize = 36.sp)
                            Spacer(modifier = Modifier.height(10.dp))
                            Text(
                                text = "No videos match this filter",
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.onSurface
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = "Tap the + button below to add your favorite video links!",
                                fontSize = 12.sp,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }
                }
            } else {
                items(filteredVideos, key = { it.id }) { video ->
                    VideoCardItem(
                        video = video,
                        viewModel = viewModel,
                        onPlay = { viewModel.playVideo(video) },
                        onToggleFavorite = { viewModel.toggleFavoriteVideo(video.id) },
                        onDelete = { viewModel.deleteVideo(video.id) }
                    )
                }
            }
        }
    }

    // Dedicated ExoPlayer Video Dialog
    if (selectedVideo != null) {
        ExoPlayerVideoDialog(
            video = selectedVideo!!,
            viewModel = viewModel,
            onDismiss = { viewModel.closeVideoPlayer() }
        )
    }

    // Add Video Dialog
    if (showAddDialog) {
        AddVideoDialog(
            onDismiss = { viewModel.showAddVideoDialog.value = false },
            onAdd = { title, url, category, duration, description, tags ->
                viewModel.addVideo(title, url, category, duration, description, tags)
                viewModel.showAddVideoDialog.value = false
            }
        )
    }
}

@Composable
fun VideoCardItem(
    video: VideoResourceItem,
    viewModel: SelfCareViewModel,
    onPlay: () -> Unit,
    onToggleFavorite: () -> Unit,
    onDelete: () -> Unit,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val isDirectVideo = remember(video.url) {
        video.url.endsWith(".mp4", ignoreCase = true) ||
        video.url.endsWith(".m3u8", ignoreCase = true) ||
        video.url.endsWith(".webm", ignoreCase = true) ||
        video.url.contains("storage.googleapis.com", ignoreCase = true)
    }

    Card(
        modifier = modifier
            .fillMaxWidth()
            .testTag("video_card_${video.id}"),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        border = CardDefaults.outlinedCardBorder().copy(
            brush = Brush.linearGradient(
                listOf(MaterialTheme.colorScheme.outline, MaterialTheme.colorScheme.outline)
            )
        )
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(14.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.Top,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.weight(1f)
                ) {
                    Box(
                        modifier = Modifier
                            .size(44.dp)
                            .clip(RoundedCornerShape(12.dp))
                            .background(PastelBlossomPink.copy(alpha = 0.3f)),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(video.thumbnailEmoji, fontSize = 22.sp)
                    }

                    Spacer(modifier = Modifier.width(10.dp))

                    Column {
                        Text(
                            text = video.title,
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onSurface,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis
                        )
                        Spacer(modifier = Modifier.height(2.dp))
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            Surface(
                                shape = RoundedCornerShape(6.dp),
                                color = MaterialTheme.colorScheme.surfaceVariant
                            ) {
                                Text(
                                    text = video.category,
                                    fontSize = 10.sp,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                                    modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                )
                            }
                            Text(
                                text = "⏱️ ${video.durationLabel}",
                                fontSize = 10.sp,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }
                }

                Row(verticalAlignment = Alignment.CenterVertically) {
                    IconButton(
                        onClick = onToggleFavorite,
                        modifier = Modifier.size(32.dp)
                    ) {
                        Icon(
                            imageVector = if (video.isFavorite) Icons.Default.Favorite else Icons.Default.FavoriteBorder,
                            contentDescription = "Favorite",
                            tint = if (video.isFavorite) PastelBlossomPink else MaterialTheme.colorScheme.onSurfaceVariant,
                            modifier = Modifier.size(20.dp)
                        )
                    }
                    IconButton(
                        onClick = onDelete,
                        modifier = Modifier.size(32.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.DeleteOutline,
                            contentDescription = "Delete",
                            tint = MaterialTheme.colorScheme.onSurfaceVariant,
                            modifier = Modifier.size(18.dp)
                        )
                    }
                }
            }

            if (video.description.isNotBlank()) {
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = video.description,
                    fontSize = 12.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    lineHeight = 16.sp,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis
                )
            }

            // Tags row
            if (video.tags.isNotEmpty()) {
                Spacer(modifier = Modifier.height(6.dp))
                Row(
                    horizontalArrangement = Arrangement.spacedBy(4.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    video.tags.take(3).forEach { tag ->
                        Text(
                            text = "#$tag",
                            fontSize = 10.sp,
                            color = ForestSage400
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            // Action Buttons
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                // Play Button
                Button(
                    onClick = onPlay,
                    modifier = Modifier
                        .weight(1f)
                        .height(38.dp),
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = MaterialTheme.colorScheme.primary,
                        contentColor = androidx.compose.ui.graphics.Color.White
                    ),
                    contentPadding = PaddingValues(horizontal = 12.dp)
                ) {
                    Icon(Icons.Default.PlayArrow, contentDescription = null, tint = androidx.compose.ui.graphics.Color.White, modifier = Modifier.size(18.dp))
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("Play Video", color = androidx.compose.ui.graphics.Color.White, fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                }

                // External browser/app button (ideal for web/YouTube links)
                OutlinedButton(
                    onClick = {
                        try {
                            val intent = Intent(Intent.ACTION_VIEW, Uri.parse(video.url))
                            context.startActivity(intent)
                        } catch (_: Exception) {}
                    },
                    modifier = Modifier.height(38.dp),
                    shape = RoundedCornerShape(10.dp),
                    colors = ButtonDefaults.outlinedButtonColors(
                        contentColor = MaterialTheme.colorScheme.onSurface
                    ),
                    contentPadding = PaddingValues(horizontal = 12.dp)
                ) {
                    Icon(Icons.Default.OpenInNew, contentDescription = "Open Link", modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Open Link", fontSize = 11.sp)
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            // ==========================================
            // Note-Taking & Note-Talking Section Under Video
            // ==========================================
            val roomNotes by viewModel.getVideoNotes(video.id).collectAsState(initial = emptyList())
            var isNotesExpanded by remember { mutableStateOf(video.userNotes.isNotBlank() || roomNotes.isNotEmpty()) }
            var notesText by remember(video.userNotes) { mutableStateOf(video.userNotes) }

            val ttsSpeaker = rememberTextToSpeechSpeaker()
            val speechLauncher = rememberLauncherForActivityResult(
                contract = ActivityResultContracts.StartActivityForResult()
            ) { result ->
                if (result.resultCode == Activity.RESULT_OK) {
                    val spoken = result.data?.getStringArrayListExtra(RecognizerIntent.EXTRA_RESULTS)?.firstOrNull() ?: ""
                    if (spoken.isNotBlank()) {
                        notesText = if (notesText.isBlank()) spoken else "$notesText $spoken"
                    }
                }
            }

            Surface(
                shape = RoundedCornerShape(12.dp),
                color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.45f),
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("video_notes_${video.id}")
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(10.dp)
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { isNotesExpanded = !isNotesExpanded },
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text("🎙️", fontSize = 14.sp)
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = "Notes & Voice Dictation",
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.onSurface
                            )
                            if (roomNotes.isNotEmpty() || video.userNotes.isNotBlank()) {
                                Spacer(modifier = Modifier.width(6.dp))
                                Box(
                                    modifier = Modifier
                                        .clip(RoundedCornerShape(4.dp))
                                        .background(ForestSage400.copy(alpha = 0.2f))
                                        .padding(horizontal = 5.dp, vertical = 1.dp)
                                ) {
                                    Text(
                                        text = "${roomNotes.size} Room Notes",
                                        fontSize = 9.sp,
                                        color = ForestSage400,
                                        fontWeight = FontWeight.Bold
                                    )
                                }
                            }
                        }

                        Text(
                            text = if (isNotesExpanded) "Collapse ▲" else if (roomNotes.isNotEmpty() || video.userNotes.isNotBlank()) "View / Add Notes ▼" else "Add Notes ▼",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = PastelApricotAmber
                        )
                    }

                    if (isNotesExpanded) {
                        Spacer(modifier = Modifier.height(8.dp))

                        // Quick prompt helper chips
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .horizontalScroll(rememberScrollState()),
                            horizontalArrangement = Arrangement.spacedBy(4.dp)
                        ) {
                            listOf("💡 Takeaway: ", "⏱️ Timestamp: ", "🎯 Action: ", "❓ Question: ").forEach { chipPrompt ->
                                Surface(
                                    onClick = {
                                        notesText = if (notesText.isBlank()) chipPrompt else "$notesText\n$chipPrompt"
                                    },
                                    shape = RoundedCornerShape(6.dp),
                                    color = MaterialTheme.colorScheme.surface
                                ) {
                                    Text(
                                        text = chipPrompt.trim(),
                                        fontSize = 10.sp,
                                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp),
                                        color = MaterialTheme.colorScheme.onSurfaceVariant
                                    )
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(6.dp))

                        OutlinedTextField(
                            value = notesText,
                            onValueChange = { notesText = it },
                            placeholder = { Text("Write personal insights, or tap 🎙️ to talk notes...", fontSize = 11.sp) },
                            modifier = Modifier
                                .fillMaxWidth()
                                .heightIn(min = 68.dp, max = 130.dp),
                            shape = RoundedCornerShape(8.dp),
                            textStyle = LocalTextStyle.current.copy(fontSize = 11.sp),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedContainerColor = MaterialTheme.colorScheme.surface,
                                unfocusedContainerColor = MaterialTheme.colorScheme.surface
                            )
                        )

                        Spacer(modifier = Modifier.height(6.dp))

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                OutlinedButton(
                                    onClick = { launchVoiceDictation(speechLauncher, "Speak your video note...") },
                                    shape = RoundedCornerShape(8.dp),
                                    contentPadding = PaddingValues(horizontal = 8.dp, vertical = 4.dp),
                                    modifier = Modifier.height(30.dp)
                                ) {
                                    Icon(Icons.Default.Mic, contentDescription = "Dictate", modifier = Modifier.size(14.dp), tint = PastelApricotAmber)
                                    Spacer(modifier = Modifier.width(4.dp))
                                    Text("Talk", fontSize = 10.sp, fontWeight = FontWeight.Bold)
                                }

                                OutlinedButton(
                                    onClick = {
                                        val textToSpeak = notesText.ifBlank { video.userNotes }
                                        if (textToSpeak.isNotBlank()) ttsSpeaker.speak(textToSpeak)
                                    },
                                    shape = RoundedCornerShape(8.dp),
                                    contentPadding = PaddingValues(horizontal = 8.dp, vertical = 4.dp),
                                    modifier = Modifier.height(30.dp)
                                ) {
                                    Icon(Icons.Default.VolumeUp, contentDescription = "Listen", modifier = Modifier.size(14.dp), tint = ForestSage400)
                                    Spacer(modifier = Modifier.width(4.dp))
                                    Text("Listen", fontSize = 10.sp)
                                }
                            }

                            Button(
                                onClick = {
                                    if (notesText.isNotBlank()) {
                                        viewModel.addVideoNote(
                                            videoId = video.id,
                                            noteText = notesText,
                                            videoTimestampMs = 0L,
                                            formattedTime = "00:00"
                                        )
                                        viewModel.updateVideoNotes(video.id, notesText)
                                    }
                                },
                                shape = RoundedCornerShape(12.dp),
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = MaterialTheme.colorScheme.primary,
                                    contentColor = androidx.compose.ui.graphics.Color.White
                                ),
                                contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp),
                                modifier = Modifier.height(30.dp)
                            ) {
                                Text(
                                    text = "Save Note (+5 XP 📝)",
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.SemiBold,
                                    color = androidx.compose.ui.graphics.Color.White
                                )
                            }
                        }

                        // Room Database Saved Notes List
                        if (roomNotes.isNotEmpty()) {
                            Spacer(modifier = Modifier.height(8.dp))
                            Text(
                                text = "Saved Notes in Room Database:",
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                                roomNotes.take(5).forEach { note ->
                                    Surface(
                                        shape = RoundedCornerShape(6.dp),
                                        color = MaterialTheme.colorScheme.surface,
                                        modifier = Modifier.fillMaxWidth()
                                    ) {
                                        Row(
                                            modifier = Modifier
                                                .fillMaxWidth()
                                                .padding(6.dp),
                                            horizontalArrangement = Arrangement.SpaceBetween,
                                            verticalAlignment = Alignment.CenterVertically
                                        ) {
                                            Column(modifier = Modifier.weight(1f)) {
                                                if (note.formattedTime != "00:00" && note.formattedTime.isNotBlank()) {
                                                    Text("⏱️ ${note.formattedTime}", fontSize = 9.sp, fontWeight = FontWeight.Bold, color = PastelApricotAmber)
                                                }
                                                Text(note.noteText, fontSize = 10.sp, color = MaterialTheme.colorScheme.onSurface)
                                            }
                                            Row(verticalAlignment = Alignment.CenterVertically) {
                                                IconButton(
                                                    onClick = { ttsSpeaker.speak(note.noteText) },
                                                    modifier = Modifier.size(24.dp)
                                                ) {
                                                    Icon(Icons.Default.VolumeUp, contentDescription = "Play", modifier = Modifier.size(12.dp))
                                                }
                                                IconButton(
                                                    onClick = { viewModel.deleteVideoNote(note.id) },
                                                    modifier = Modifier.size(24.dp)
                                                ) {
                                                    Icon(Icons.Default.Delete, contentDescription = "Delete", modifier = Modifier.size(12.dp), tint = MaterialTheme.colorScheme.error)
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

/**
 * Dedicated Media3 ExoPlayer dialog with memory leak prevention and full playback controls.
 */
@Composable
fun ExoPlayerVideoDialog(
    video: VideoResourceItem,
    viewModel: SelfCareViewModel,
    onDismiss: () -> Unit
) {
    val context = LocalContext.current
    var isPlaying by remember { mutableStateOf(false) }
    var isBuffering by remember { mutableStateOf(true) }
    var errorMessage by remember { mutableStateOf<String?>(null) }
    var playbackSpeed by remember { mutableFloatStateOf(1.0f) }

    val roomVideoNotes by viewModel.getVideoNotes(video.id).collectAsState(initial = emptyList())
    var playerNotes by remember { mutableStateOf("") }

    val ttsSpeaker = rememberTextToSpeechSpeaker()
    val speechLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.StartActivityForResult()
    ) { result ->
        if (result.resultCode == Activity.RESULT_OK) {
            val spoken = result.data?.getStringArrayListExtra(RecognizerIntent.EXTRA_RESULTS)?.firstOrNull() ?: ""
            if (spoken.isNotBlank()) {
                playerNotes = if (playerNotes.isBlank()) spoken else "$playerNotes $spoken"
            }
        }
    }

    // ExoPlayer Instance with safe lifecycle management
    val exoPlayer = remember(video.url) {
        ExoPlayer.Builder(context).build().apply {
            try {
                val mediaItem = MediaItem.fromUri(Uri.parse(video.url))
                setMediaItem(mediaItem)
                prepare()
                playWhenReady = true
            } catch (e: Exception) {
                errorMessage = e.localizedMessage ?: "Failed to prepare video stream"
            }
        }
    }

    // Attach Player Listener for UI updates
    DisposableEffect(exoPlayer) {
        val listener = object : Player.Listener {
            override fun onIsPlayingChanged(playing: Boolean) {
                isPlaying = playing
            }

            override fun onPlaybackStateChanged(playbackState: Int) {
                isBuffering = playbackState == Player.STATE_BUFFERING
            }

            override fun onPlayerError(error: PlaybackException) {
                errorMessage = "Playback notice: Stream may require direct browser view (${error.errorCodeName})"
            }
        }
        exoPlayer.addListener(listener)

        onDispose {
            exoPlayer.removeListener(listener)
            exoPlayer.stop()
            exoPlayer.release()
        }
    }

    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Card(
            modifier = Modifier
                .fillMaxWidth(0.96f)
                .fillMaxHeight(0.92f)
                .testTag("exoplayer_dialog"),
            shape = RoundedCornerShape(20.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(16.dp)
                    .verticalScroll(rememberScrollState())
            ) {
                // Top Header Row
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = video.title,
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onSurface,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis
                        )
                        Text(
                            text = "${video.category} • ${video.durationLabel}",
                            fontSize = 11.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }

                    IconButton(onClick = onDismiss) {
                        Icon(Icons.Default.Close, contentDescription = "Close player")
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))

                // Video Surface using PlayerView
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(210.dp)
                        .clip(RoundedCornerShape(14.dp))
                        .background(Color.Black),
                    contentAlignment = Alignment.Center
                ) {
                    AndroidView(
                        factory = { ctx ->
                            PlayerView(ctx).apply {
                                player = exoPlayer
                                useController = true
                                layoutParams = FrameLayout.LayoutParams(
                                    ViewGroup.LayoutParams.MATCH_PARENT,
                                    ViewGroup.LayoutParams.MATCH_PARENT
                                )
                            }
                        },
                        modifier = Modifier.fillMaxSize()
                    )

                    // Buffering Spinner
                    if (isBuffering && errorMessage == null) {
                        CircularProgressIndicator(
                            color = PastelApricotAmber,
                            strokeWidth = 3.dp,
                            modifier = Modifier.size(36.dp)
                        )
                    }

                    // Fallback / Error message banner
                    if (errorMessage != null) {
                        Surface(
                            color = Color.Black.copy(alpha = 0.85f),
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(16.dp),
                            shape = RoundedCornerShape(10.dp)
                        ) {
                            Column(
                                modifier = Modifier.padding(12.dp),
                                horizontalAlignment = Alignment.CenterHorizontally
                            ) {
                                Text("⚠️", fontSize = 24.sp)
                                Spacer(modifier = Modifier.height(4.dp))
                                Text(
                                    text = errorMessage!!,
                                    fontSize = 11.sp,
                                    color = Color.White,
                                    lineHeight = 15.sp
                                )
                                Spacer(modifier = Modifier.height(8.dp))
                                Button(
                                    onClick = {
                                        try {
                                            val intent = Intent(Intent.ACTION_VIEW, Uri.parse(video.url))
                                            context.startActivity(intent)
                                        } catch (_: Exception) {}
                                    },
                                    colors = ButtonDefaults.buttonColors(containerColor = PastelApricotAmber)
                                ) {
                                    Text("Open in Browser", fontSize = 11.sp, color = LightTextEspresso)
                                }
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))

                // Playback Control & Speed Strip
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    // Quick Rewind & Forward
                    Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        IconButton(
                            onClick = { exoPlayer.seekTo(maxOf(0L, exoPlayer.currentPosition - 10000L)) },
                            modifier = Modifier.size(36.dp)
                        ) {
                            Icon(Icons.Default.Replay10, contentDescription = "Rewind 10s")
                        }
                        IconButton(
                            onClick = {
                                if (isPlaying) exoPlayer.pause() else exoPlayer.play()
                            },
                            modifier = Modifier.size(36.dp)
                        ) {
                            Icon(
                                imageVector = if (isPlaying) Icons.Default.Pause else Icons.Default.PlayArrow,
                                contentDescription = if (isPlaying) "Pause" else "Play",
                                tint = PastelApricotAmber
                            )
                        }
                        IconButton(
                            onClick = { exoPlayer.seekTo(exoPlayer.currentPosition + 10000L) },
                            modifier = Modifier.size(36.dp)
                        ) {
                            Icon(Icons.Default.Forward10, contentDescription = "Forward 10s")
                        }
                    }

                    // Speed Pill Selector
                    val speeds = listOf(0.75f, 1.0f, 1.25f, 1.5f)
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(4.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        speeds.forEach { speed ->
                            val isSelected = playbackSpeed == speed
                            Surface(
                                onClick = {
                                    playbackSpeed = speed
                                    exoPlayer.playbackParameters = androidx.media3.common.PlaybackParameters(speed)
                                },
                                shape = RoundedCornerShape(8.dp),
                                color = if (isSelected) PastelBlossomPink else MaterialTheme.colorScheme.surfaceVariant,
                                modifier = Modifier.height(28.dp)
                            ) {
                                Box(
                                    modifier = Modifier.padding(horizontal = 8.dp),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Text(
                                        text = "${speed}x",
                                        fontSize = 10.sp,
                                        fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                                        color = if (isSelected) LightTextEspresso else MaterialTheme.colorScheme.onSurface
                                    )
                                }
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))

                // ==========================================
                // Media3 In-Player Note-Taking & Note-Talking Section
                // ==========================================
                Surface(
                    shape = RoundedCornerShape(14.dp),
                    color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.55f),
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("media3_in_player_notes")
                ) {
                    Column(modifier = Modifier.padding(12.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text("📝", fontSize = 14.sp)
                                Spacer(modifier = Modifier.width(6.dp))
                                Text(
                                    text = "In-Player Video Notes & Voice Dictation",
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = MaterialTheme.colorScheme.onSurface
                                )
                            }
                            if (roomVideoNotes.isNotEmpty()) {
                                Box(
                                    modifier = Modifier
                                        .clip(RoundedCornerShape(6.dp))
                                        .background(ForestSage400.copy(alpha = 0.2f))
                                        .padding(horizontal = 6.dp, vertical = 2.dp)
                                ) {
                                    Text(
                                        text = "${roomVideoNotes.size} saved",
                                        fontSize = 10.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = ForestSage400
                                    )
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(8.dp))

                        // Text Area for note taking in player
                        OutlinedTextField(
                            value = playerNotes,
                            onValueChange = { playerNotes = it },
                            placeholder = {
                                Text("Jot down notes, or tap ⏱️ Stamp / 🎙️ Talk while watching...", fontSize = 11.sp)
                            },
                            modifier = Modifier
                                .fillMaxWidth()
                                .heightIn(min = 72.dp, max = 130.dp),
                            shape = RoundedCornerShape(10.dp),
                            textStyle = LocalTextStyle.current.copy(fontSize = 12.sp),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedContainerColor = MaterialTheme.colorScheme.surface,
                                unfocusedContainerColor = MaterialTheme.colorScheme.surface
                            )
                        )

                        Spacer(modifier = Modifier.height(8.dp))

                        // Tool Row: Timestamp Stamp, Talk, Listen, Save
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                // Stamp Current Video Timestamp Button
                                Button(
                                    onClick = {
                                        val posMs = exoPlayer.currentPosition
                                        val formatted = VideoTimeFormatter.formatMs(posMs)
                                        val tag = "[$formatted] "
                                        playerNotes = if (playerNotes.isBlank()) tag else "$playerNotes $tag"
                                    },
                                    shape = RoundedCornerShape(8.dp),
                                    colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.surface),
                                    contentPadding = PaddingValues(horizontal = 8.dp, vertical = 4.dp),
                                    modifier = Modifier.height(30.dp)
                                ) {
                                    Icon(Icons.Default.Timer, contentDescription = "Timestamp", modifier = Modifier.size(13.dp), tint = PastelApricotAmber)
                                    Spacer(modifier = Modifier.width(4.dp))
                                    Text("⏱️ Stamp", fontSize = 10.sp, color = MaterialTheme.colorScheme.onSurface, fontWeight = FontWeight.Bold)
                                }

                                // Voice Dictation Button
                                Button(
                                    onClick = {
                                        launchVoiceDictation(speechLauncher, "Speak your note for ${video.title}...")
                                    },
                                    shape = RoundedCornerShape(8.dp),
                                    colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.surface),
                                    contentPadding = PaddingValues(horizontal = 8.dp, vertical = 4.dp),
                                    modifier = Modifier.height(30.dp)
                                ) {
                                    Icon(Icons.Default.Mic, contentDescription = "Dictate", modifier = Modifier.size(13.dp), tint = PastelApricotAmber)
                                    Spacer(modifier = Modifier.width(4.dp))
                                    Text("🎙️ Talk", fontSize = 10.sp, color = MaterialTheme.colorScheme.onSurface, fontWeight = FontWeight.Bold)
                                }

                                // TTS Read Aloud Button
                                IconButton(
                                    onClick = {
                                        if (playerNotes.isNotBlank()) {
                                            ttsSpeaker.speak(playerNotes)
                                        } else if (roomVideoNotes.isNotEmpty()) {
                                            ttsSpeaker.speak(roomVideoNotes.joinToString(". ") { it.noteText })
                                        }
                                    },
                                    modifier = Modifier.size(30.dp)
                                ) {
                                    Icon(Icons.Default.VolumeUp, contentDescription = "Listen Aloud", modifier = Modifier.size(16.dp), tint = ForestSage400)
                                }
                            }

                            // Save Note to Room DB Button
                            Button(
                                onClick = {
                                    if (playerNotes.isNotBlank()) {
                                        val currentPos = exoPlayer.currentPosition
                                        val formatted = VideoTimeFormatter.formatMs(currentPos)
                                        viewModel.addVideoNote(
                                            videoId = video.id,
                                            noteText = playerNotes,
                                            videoTimestampMs = currentPos,
                                            formattedTime = formatted
                                        )
                                        playerNotes = ""
                                    }
                                },
                                enabled = playerNotes.isNotBlank(),
                                shape = RoundedCornerShape(12.dp),
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = MaterialTheme.colorScheme.primary,
                                    contentColor = androidx.compose.ui.graphics.Color.White
                                ),
                                contentPadding = PaddingValues(horizontal = 12.dp, vertical = 4.dp),
                                modifier = Modifier.height(30.dp)
                            ) {
                                Text("Save (+5 XP)", fontSize = 11.sp, fontWeight = FontWeight.SemiBold, color = androidx.compose.ui.graphics.Color.White)
                            }
                        }

                        // Display Saved Video Notes specifically from Room
                        if (roomVideoNotes.isNotEmpty()) {
                            Spacer(modifier = Modifier.height(10.dp))
                            Text(
                                text = "Video Notes Timeline (Tap timestamp to jump video):",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.onSurface
                            )
                            Spacer(modifier = Modifier.height(6.dp))

                            Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                                roomVideoNotes.forEach { note ->
                                    Surface(
                                        shape = RoundedCornerShape(8.dp),
                                        color = MaterialTheme.colorScheme.surface,
                                        modifier = Modifier.fillMaxWidth()
                                    ) {
                                        Row(
                                            modifier = Modifier
                                                .fillMaxWidth()
                                                .padding(8.dp),
                                            horizontalArrangement = Arrangement.SpaceBetween,
                                            verticalAlignment = Alignment.CenterVertically
                                        ) {
                                            Row(
                                                modifier = Modifier.weight(1f),
                                                verticalAlignment = Alignment.CenterVertically
                                            ) {
                                                // Timestamp Jump Button: seeks ExoPlayer directly!
                                                Surface(
                                                    onClick = {
                                                        exoPlayer.seekTo(note.videoTimestampMs)
                                                        exoPlayer.play()
                                                    },
                                                    shape = RoundedCornerShape(6.dp),
                                                    color = PastelApricotAmber.copy(alpha = 0.35f)
                                                ) {
                                                    Row(
                                                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 3.dp),
                                                        verticalAlignment = Alignment.CenterVertically
                                                    ) {
                                                        Icon(Icons.Default.PlayArrow, contentDescription = null, modifier = Modifier.size(10.dp), tint = LightTextEspresso)
                                                        Spacer(modifier = Modifier.width(2.dp))
                                                        Text(
                                                            text = note.formattedTime.ifBlank { "00:00" },
                                                            fontSize = 10.sp,
                                                            fontWeight = FontWeight.Bold,
                                                            color = MaterialTheme.colorScheme.onSurface
                                                        )
                                                    }
                                                }

                                                Spacer(modifier = Modifier.width(8.dp))

                                                Text(
                                                    text = note.noteText,
                                                    fontSize = 11.sp,
                                                    color = MaterialTheme.colorScheme.onSurface,
                                                    lineHeight = 14.sp
                                                )
                                            }

                                            Row(verticalAlignment = Alignment.CenterVertically) {
                                                IconButton(
                                                    onClick = { ttsSpeaker.speak(note.noteText) },
                                                    modifier = Modifier.size(24.dp)
                                                ) {
                                                    Icon(Icons.Default.VolumeUp, contentDescription = "Play note", modifier = Modifier.size(14.dp))
                                                }
                                                IconButton(
                                                    onClick = { viewModel.deleteVideoNote(note.id) },
                                                    modifier = Modifier.size(24.dp)
                                                ) {
                                                    Icon(Icons.Default.Delete, contentDescription = "Delete note", modifier = Modifier.size(14.dp), tint = MaterialTheme.colorScheme.error)
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

/**
 * Dialog to add custom video link
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AddVideoDialog(
    onDismiss: () -> Unit,
    onAdd: (title: String, url: String, category: String, duration: String, description: String, tags: List<String>) -> Unit
) {
    var title by remember { mutableStateOf("") }
    var url by remember { mutableStateOf("") }
    var selectedCategory by remember { mutableStateOf("Mindfulness") }
    var duration by remember { mutableStateOf("10 min") }
    var description by remember { mutableStateOf("") }
    var tagInput by remember { mutableStateOf("") }

    val categories = listOf("Mindfulness", "Breathwork", "Movement & Yoga", "Focus & Productivity", "Sleep & Rest", "Custom")

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Add Video to Library 🎬", fontSize = 18.sp, fontWeight = FontWeight.Bold) },
        text = {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 4.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                OutlinedTextField(
                    value = title,
                    onValueChange = { title = it },
                    label = { Text("Video Title") },
                    placeholder = { Text("e.g. 5-Minute Morning Vagus Reset") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )

                OutlinedTextField(
                    value = url,
                    onValueChange = { url = it },
                    label = { Text("Video Link / Stream URL") },
                    placeholder = { Text("https://... (mp4, m3u8, or web link)") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    OutlinedTextField(
                        value = duration,
                        onValueChange = { duration = it },
                        label = { Text("Duration") },
                        placeholder = { Text("e.g. 10 min") },
                        singleLine = true,
                        modifier = Modifier.weight(1f)
                    )

                    OutlinedTextField(
                        value = tagInput,
                        onValueChange = { tagInput = it },
                        label = { Text("Tags") },
                        placeholder = { Text("calm, yoga") },
                        singleLine = true,
                        modifier = Modifier.weight(1f)
                    )
                }

                Text("Category", fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .horizontalScroll(rememberScrollState()),
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    categories.forEach { cat ->
                        FilterChip(
                            selected = selectedCategory == cat,
                            onClick = { selectedCategory = cat },
                            label = { Text(cat, fontSize = 11.sp) }
                        )
                    }
                }

                OutlinedTextField(
                    value = description,
                    onValueChange = { description = it },
                    label = { Text("Notes / Protocol guidance (optional)") },
                    maxLines = 2,
                    modifier = Modifier.fillMaxWidth()
                )
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    if (title.isNotBlank() && url.isNotBlank()) {
                        val tags = tagInput.split(",").map { it.trim() }.filter { it.isNotBlank() }
                        onAdd(title, url, selectedCategory, duration, description, tags)
                    }
                },
                enabled = title.isNotBlank() && url.isNotBlank(),
                colors = ButtonDefaults.buttonColors(
                    containerColor = MaterialTheme.colorScheme.primary,
                    contentColor = androidx.compose.ui.graphics.Color.White
                ),
                shape = RoundedCornerShape(12.dp)
            ) {
                Text("Add Video", color = androidx.compose.ui.graphics.Color.White, fontWeight = FontWeight.SemiBold)
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel")
            }
        }
    )
}
