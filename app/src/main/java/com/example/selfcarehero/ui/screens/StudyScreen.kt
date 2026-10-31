package com.example.selfcarehero.ui.screens

import android.content.Intent
import android.net.Uri
import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
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
import com.example.selfcarehero.model.BookResourceItem
import com.example.selfcarehero.model.NodeItem
import com.example.selfcarehero.model.StudyTopic
import com.example.selfcarehero.ui.theme.*
import com.example.selfcarehero.ui.viewmodel.SelfCareViewModel

@Composable
fun StudyScreen(
    viewModel: SelfCareViewModel,
    modifier: Modifier = Modifier
) {
    val state by viewModel.state.collectAsState()
    val dueRememorize = remember(state.nodes) {
        viewModel.getDueRememorizeSkills()
    }
    val activeCategoryFilter by viewModel.bookCategoryFilter.collectAsState()

    var studySubTab by remember { mutableIntStateOf(0) } // 0: 📚 Books & EQ Library, 1: 🎯 Future Roadmap, 2: 🧠 Spaced Recall

    val filteredBooks by remember(state.bookResources, activeCategoryFilter) {
        derivedStateOf {
            if (activeCategoryFilter == "All") {
                state.bookResources
            } else if (activeCategoryFilter == "Favorites") {
                state.bookResources.filter { it.isFavorite }
            } else {
                state.bookResources.filter { it.category == activeCategoryFilter }
            }
        }
    }

    val categories = listOf(
        "All",
        "Favorites",
        "Making Friends",
        "Confident Speaking",
        "Empathetic Listening",
        "Healthy Boundaries",
        "Handling Conflict",
        "High EQ & Emotions"
    )

    Scaffold(
        modifier = modifier.fillMaxSize(),
        containerColor = MaterialTheme.colorScheme.background,
        floatingActionButton = {
            FloatingActionButton(
                onClick = {
                    when (studySubTab) {
                        0 -> viewModel.showAddBookDialog.value = true
                        1 -> viewModel.openCreateRoadmapGoal()
                        else -> viewModel.showAddTopicDialog.value = true
                    }
                },
                containerColor = WarmAmberGold,
                contentColor = androidx.compose.ui.graphics.Color(0xFF121413),
                shape = CircleShape,
                elevation = FloatingActionButtonDefaults.elevation(defaultElevation = 6.dp),
                modifier = Modifier
                    .padding(bottom = 70.dp)
                    .size(56.dp)
                    .testTag(if (studySubTab == 0) "fab_add_book" else if (studySubTab == 1) "fab_add_goal" else "fab_add_topic")
            ) {
                Text(text = "+", fontSize = 24.sp, fontWeight = FontWeight.Bold)
            }
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(horizontal = 16.dp),
            contentPadding = PaddingValues(top = 8.dp, bottom = 120.dp)
        ) {
            // Segmented Top Controller: Books & EQ Library vs Roadmap vs Spaced Recall
            item {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(14.dp))
                        .background(MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.6f))
                        .padding(4.dp),
                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .clip(RoundedCornerShape(10.dp))
                            .background(
                                if (studySubTab == 0) PastelApricotAmber else Color.Transparent
                            )
                            .clickable { studySubTab = 0 }
                            .padding(vertical = 8.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "📚 Books",
                            fontSize = 11.sp,
                            fontWeight = if (studySubTab == 0) FontWeight.Bold else FontWeight.Medium,
                            color = if (studySubTab == 0) LightTextEspresso else MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }

                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .clip(RoundedCornerShape(10.dp))
                            .background(
                                if (studySubTab == 1) WarmAmberGold else Color.Transparent
                            )
                            .clickable { studySubTab = 1 }
                            .padding(vertical = 8.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "🎯 Roadmap",
                            fontSize = 11.sp,
                            fontWeight = if (studySubTab == 1) FontWeight.Bold else FontWeight.Medium,
                            color = if (studySubTab == 1) Color(0xFF121413) else MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }

                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .clip(RoundedCornerShape(10.dp))
                            .background(
                                if (studySubTab == 2) PastelBlossomPink else Color.Transparent
                            )
                            .clickable { studySubTab = 2 }
                            .padding(vertical = 8.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "🧠 Recall",
                            fontSize = 11.sp,
                            fontWeight = if (studySubTab == 2) FontWeight.Bold else FontWeight.Medium,
                            color = if (studySubTab == 2) LightTextEspresso else MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
                Spacer(modifier = Modifier.height(14.dp))
            }

            if (studySubTab == 0) {
                // ==========================================
                // SUB-TAB 0: BOOKS & INTERPERSONAL EQ LIBRARY
                // ==========================================
                item {
                    // Header & Quick AI Action Bar
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = "Interpersonal & EQ Library",
                                fontSize = 18.sp,
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.onBackground
                            )
                            Text(
                                text = "Guides, PDFs & chapter trackers for communication mastery",
                                fontSize = 12.sp,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }

                        // AI Progression Export/Import button
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
                                .testTag("btn_ai_sync_study")
                        ) {
                            Text("🔁 AI Sync", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                        }
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    // Category Filter Pills
                    LazyRow(
                        horizontalArrangement = Arrangement.spacedBy(6.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        items(categories) { cat ->
                            val isSelected = activeCategoryFilter == cat
                            FilterChip(
                                selected = isSelected,
                                onClick = { viewModel.setBookCategoryFilter(cat) },
                                label = {
                                    Text(
                                        text = when (cat) {
                                            "All" -> "All (${state.bookResources.size})"
                                            "Favorites" -> "⭐ Favorites (${state.bookResources.count { it.isFavorite }})"
                                            else -> cat
                                        },
                                        fontSize = 11.sp
                                    )
                                },
                                colors = FilterChipDefaults.filterChipColors(
                                    selectedContainerColor = PastelApricotAmber,
                                    selectedLabelColor = LightTextEspresso
                                ),
                                shape = RoundedCornerShape(8.dp)
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(14.dp))
                }

                if (filteredBooks.isEmpty()) {
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
                                Text("📖", fontSize = 32.sp)
                                Spacer(modifier = Modifier.height(8.dp))
                                Text(
                                    text = "No books found in this category.",
                                    fontSize = 14.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = MaterialTheme.colorScheme.onSurface
                                )
                                Spacer(modifier = Modifier.height(4.dp))
                                Text(
                                    text = "Tap the + button to add your favorite books, ebooks, or PDF guides!",
                                    fontSize = 12.sp,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                                    textAlign = androidx.compose.ui.text.style.TextAlign.Center
                                )
                            }
                        }
                    }
                } else {
                    items(filteredBooks, key = { it.id }) { book ->
                        BookResourceCard(
                            book = book,
                            viewModel = viewModel,
                            onOpenReader = { viewModel.openBookReader(book) }
                        )
                        Spacer(modifier = Modifier.height(10.dp))
                    }
                }

            } else if (studySubTab == 1) {
                // ==========================================
                // SUB-TAB 1: FUTURE LEARNING ROADMAP
                // ==========================================
                item {
                    com.example.selfcarehero.ui.components.FutureLearningRoadmapSection(viewModel = viewModel)
                }
            } else {
                // ==========================================
                // SUB-TAB 2: SPACED RECALL & TOPICS
                // ==========================================
                item {
                    Text(
                        text = "Spaced Recall Mastery",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onBackground
                    )
                    Text(
                        text = "Concepts and topics scheduled for periodic mental refresher",
                        fontSize = 12.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                }

                // Rememorize Concepts Section
                if (dueRememorize.isNotEmpty()) {
                    item {
                        Text(
                            text = "🧠 Concepts Due for Refresher (${dueRememorize.size})",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold,
                            color = PastelApricotAmber
                        )
                        Spacer(modifier = Modifier.height(6.dp))
                    }

                    items(dueRememorize, key = { "rem_${it.id}" }) { node ->
                        RememorizeConceptCard(
                            node = node,
                            onRecall = { viewModel.markRememorized(node.id) }
                        )
                        Spacer(modifier = Modifier.height(6.dp))
                    }

                    item {
                        Spacer(modifier = Modifier.height(10.dp))
                    }
                }

                // Standard Study Topics Section
                item {
                    Text(
                        text = "Mastery Learning Roadmaps",
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                    Spacer(modifier = Modifier.height(6.dp))
                }

                if (state.st.isEmpty()) {
                    item {
                        Card(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(top = 20.dp),
                            shape = RoundedCornerShape(14.dp),
                            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
                        ) {
                            Column(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(24.dp),
                                horizontalAlignment = Alignment.CenterHorizontally
                            ) {
                                Text("📚", fontSize = 28.sp)
                                Spacer(modifier = Modifier.height(8.dp))
                                Text(
                                    text = "No study topics added yet. Tap + to track a learning subject!",
                                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                                    fontSize = 13.sp,
                                    textAlign = androidx.compose.ui.text.style.TextAlign.Center
                                )
                            }
                        }
                    }
                } else {
                    items(state.st, key = { it.id }) { topic ->
                        StudyTopicCard(
                            topic = topic,
                            viewModel = viewModel,
                            modifier = Modifier.padding(vertical = 4.dp)
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun BookResourceCard(
    book: BookResourceItem,
    viewModel: SelfCareViewModel,
    onOpenReader: () -> Unit
) {
    val context = LocalContext.current
    val progress = book.calculatedProgress()
    val completedChapters = book.chapters.count { it.read }

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .testTag("book_card_${book.id}"),
        shape = RoundedCornerShape(18.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        border = CardDefaults.outlinedCardBorder().copy(
            brush = Brush.linearGradient(
                listOf(
                    MaterialTheme.colorScheme.outline.copy(alpha = 0.35f),
                    PastelApricotAmber.copy(alpha = 0.35f)
                )
            )
        )
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(14.dp)
        ) {
            // Header Row: Emoji Cover, Title, Author, Favorite
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.Top,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Row(
                    modifier = Modifier.weight(1f),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = Modifier
                            .size(46.dp)
                            .clip(RoundedCornerShape(12.dp))
                            .background(PastelApricotAmber.copy(alpha = 0.25f)),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(book.coverEmoji, fontSize = 24.sp)
                    }

                    Spacer(modifier = Modifier.width(12.dp))

                    Column {
                        Text(
                            text = book.title,
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onSurface,
                            maxLines = 2,
                            overflow = TextOverflow.Ellipsis
                        )
                        Text(
                            text = "by ${book.author}",
                            fontSize = 12.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis
                        )
                    }
                }

                IconButton(
                    onClick = { viewModel.toggleFavoriteBook(book.id) },
                    modifier = Modifier
                        .size(36.dp)
                        .testTag("fav_book_${book.id}")
                ) {
                    Text(
                        text = if (book.isFavorite) "⭐" else "☆",
                        fontSize = 18.sp
                    )
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            // Subtitle / Tagline
            if (book.subtitle.isNotBlank()) {
                Text(
                    text = book.subtitle,
                    fontSize = 12.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    lineHeight = 16.sp
                )
                Spacer(modifier = Modifier.height(8.dp))
            }

            // Category and Key Concepts Tags
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(6.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Category Pill
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(6.dp))
                        .background(ForestSage700.copy(alpha = 0.15f))
                        .padding(horizontal = 8.dp, vertical = 3.dp)
                ) {
                    Text(
                        text = book.category,
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        color = ForestSage700
                    )
                }

                // First 2 key concept tags
                book.keyConcepts.take(2).forEach { concept ->
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(6.dp))
                            .background(PastelApricotAmber.copy(alpha = 0.2f))
                            .padding(horizontal = 6.dp, vertical = 3.dp)
                    ) {
                        Text(
                            text = concept,
                            fontSize = 10.sp,
                            color = LightTextEspresso
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Progress Bar & Stats
            Column(modifier = Modifier.fillMaxWidth()) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = if (book.chapters.isNotEmpty()) {
                            "$completedChapters / ${book.chapters.size} Chapters Complete"
                        } else {
                            "${book.pagesRead} / ${book.totalPages} pages"
                        },
                        fontSize = 11.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = MaterialTheme.colorScheme.onSurface
                    )

                    Text(
                        text = "$progress%",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        color = PastelApricotAmber
                    )
                }

                Spacer(modifier = Modifier.height(4.dp))

                LinearProgressIndicator(
                    progress = { (progress / 100f).coerceIn(0f, 1f) },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(6.dp)
                        .clip(RoundedCornerShape(3.dp)),
                    color = PastelApricotAmber,
                    trackColor = MaterialTheme.colorScheme.surfaceVariant
                )
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Action Buttons
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Read Guide / Book In-App
                Button(
                    onClick = onOpenReader,
                    modifier = Modifier
                        .weight(1f)
                        .height(38.dp)
                        .testTag("read_guide_${book.id}"),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = MaterialTheme.colorScheme.primary,
                        contentColor = androidx.compose.ui.graphics.Color.White
                    ),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Text(
                        text = if (progress == 0) "📖 Start Reading" else if (progress == 100) "✓ Read Guide Again" else "📖 Continue ($progress%)",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = androidx.compose.ui.graphics.Color.White
                    )
                }

                // External Resource Link (if provided)
                if (book.externalUrl.isNotBlank()) {
                    OutlinedButton(
                        onClick = {
                            val intent = Intent(Intent.ACTION_VIEW, Uri.parse(book.externalUrl))
                            try {
                                context.startActivity(intent)
                            } catch (e: Exception) {
                                // fallback
                            }
                        },
                        modifier = Modifier
                            .height(38.dp)
                            .testTag("external_link_${book.id}"),
                        shape = RoundedCornerShape(10.dp),
                        contentPadding = PaddingValues(horizontal = 10.dp)
                    ) {
                        Text("🔗 Link", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                    }
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            // ==========================================
            // Note-Taking Section Under Book / Ebook
            // ==========================================
            var isNotesExpanded by remember { mutableStateOf(book.userNotes.isNotBlank()) }
            var bookNotesText by remember(book.userNotes) { mutableStateOf(book.userNotes) }

            Surface(
                shape = RoundedCornerShape(12.dp),
                color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.45f),
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("book_notes_${book.id}")
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
                            Text("📝", fontSize = 14.sp)
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = "Book Notes & Study Synthesis",
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.onSurface
                            )
                            if (book.userNotes.isNotBlank()) {
                                Spacer(modifier = Modifier.width(6.dp))
                                Box(
                                    modifier = Modifier
                                        .clip(RoundedCornerShape(4.dp))
                                        .background(ForestSage400.copy(alpha = 0.2f))
                                        .padding(horizontal = 5.dp, vertical = 1.dp)
                                ) {
                                    Text("✓ Saved", fontSize = 9.sp, color = ForestSage400, fontWeight = FontWeight.Bold)
                                }
                            }
                        }

                        Text(
                            text = if (isNotesExpanded) "Collapse ▲" else if (book.userNotes.isNotBlank()) "View / Edit ▼" else "Add Notes ▼",
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
                            listOf("💡 Core Takeaway: ", "📖 Key Quote: ", "🎯 Practical Drill: ", "🧠 Mindset Shift: ").forEach { chipPrompt ->
                                Surface(
                                    onClick = {
                                        bookNotesText = if (bookNotesText.isBlank()) chipPrompt else "$bookNotesText\n$chipPrompt"
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
                            value = bookNotesText,
                            onValueChange = { bookNotesText = it },
                            placeholder = { Text("Jot down takeaways, quotes, or practical exercises from this book...", fontSize = 11.sp) },
                            modifier = Modifier
                                .fillMaxWidth()
                                .heightIn(min = 68.dp, max = 140.dp),
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
                            if (bookNotesText.isNotBlank() && bookNotesText != book.userNotes) {
                                Text("Unsaved changes", fontSize = 10.sp, color = PastelApricotAmber)
                            } else {
                                Spacer(modifier = Modifier.width(1.dp))
                            }

                            Button(
                                onClick = { viewModel.updateBookNotes(book.id, bookNotesText) },
                                shape = RoundedCornerShape(12.dp),
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = MaterialTheme.colorScheme.primary,
                                    contentColor = androidx.compose.ui.graphics.Color.White
                                ),
                                contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp),
                                modifier = Modifier.height(30.dp)
                            ) {
                                Text(
                                    text = if (bookNotesText != book.userNotes) "Save Notes (+10 XP 📝)" else "Saved ✓",
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.SemiBold,
                                    color = androidx.compose.ui.graphics.Color.White
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun RememorizeConceptCard(
    node: NodeItem,
    onRecall: () -> Unit
) {
    Card(
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        border = CardDefaults.outlinedCardBorder().copy(
            brush = Brush.linearGradient(listOf(PastelBlossomPink, PastelApricotAmber))
        ),
        modifier = Modifier.fillMaxWidth()
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.weight(1f)
            ) {
                Text(text = node.e, fontSize = 20.sp)
                Spacer(modifier = Modifier.width(10.dp))
                Column {
                    Text(
                        text = node.n,
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                    Text(
                        text = "Every ${node.rememorize?.intervalDays ?: 3} days • Review #${(node.rememorize?.reviewCount ?: 0) + 1}",
                        fontSize = 11.sp,
                        color = PastelApricotAmber
                    )
                }
            }

            Button(
                onClick = onRecall,
                colors = ButtonDefaults.buttonColors(
                    containerColor = MaterialTheme.colorScheme.primary,
                    contentColor = androidx.compose.ui.graphics.Color.White
                ),
                shape = RoundedCornerShape(12.dp),
                contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp),
                modifier = Modifier
                    .minimumInteractiveComponentSize()
                    .height(36.dp)
            ) {
                Text("Recall ✓", color = androidx.compose.ui.graphics.Color.White, fontSize = 11.sp, fontWeight = FontWeight.SemiBold)
            }
        }
    }
}

@Composable
fun StudyTopicCard(
    topic: StudyTopic,
    viewModel: SelfCareViewModel,
    modifier: Modifier = Modifier
) {
    val phaseLabels = listOf("0: Introduce", "1: Practice", "2: Deep Dive", "3: Mastered")
    val currentPhaseLabel = phaseLabels.getOrElse(topic.ph) { "Mastered" }

    Card(
        modifier = modifier
            .fillMaxWidth()
            .testTag("study_topic_${topic.id}"),
        shape = RoundedCornerShape(14.dp),
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
                .padding(12.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    text = topic.n,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurface,
                    modifier = Modifier.weight(1f)
                )

                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(8.dp))
                        .background(
                            if (topic.ph >= 3) MintSageGreen.copy(alpha = 0.25f)
                            else PastelSoftBlush
                        )
                        .padding(horizontal = 8.dp, vertical = 3.dp)
                ) {
                    Text(
                        text = currentPhaseLabel,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = if (topic.ph >= 3) MintSageGreen else MaterialTheme.colorScheme.onSurface
                    )
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                    repeat(4) { idx ->
                        Box(
                            modifier = Modifier
                                .size(width = 32.dp, height = 6.dp)
                                .clip(RoundedCornerShape(3.dp))
                                .background(
                                    if (idx <= topic.ph) PastelBlossomPink
                                    else MaterialTheme.colorScheme.surfaceVariant
                                )
                        )
                    }
                }

                if (topic.ph < 3) {
                    Button(
                        onClick = { viewModel.advanceStudyTopic(topic.id) },
                        shape = RoundedCornerShape(12.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = MaterialTheme.colorScheme.primary,
                            contentColor = androidx.compose.ui.graphics.Color.White
                        ),
                        contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp),
                        modifier = Modifier
                            .minimumInteractiveComponentSize()
                            .height(34.dp)
                            .testTag("advance_topic_${topic.id}")
                    ) {
                        Text(text = "Advance ✓", color = androidx.compose.ui.graphics.Color.White, fontSize = 11.sp, fontWeight = FontWeight.SemiBold)
                    }
                } else {
                    Text(text = "👑 Mastered", fontSize = 11.sp, color = PastelApricotAmber, fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}
