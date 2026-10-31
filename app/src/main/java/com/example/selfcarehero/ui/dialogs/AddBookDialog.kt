package com.example.selfcarehero.ui.dialogs

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.example.selfcarehero.model.BookChapter
import com.example.selfcarehero.model.BookResourceItem
import com.example.selfcarehero.ui.theme.*
import com.example.selfcarehero.ui.viewmodel.SelfCareViewModel
import java.util.UUID

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AddBookDialog(
    viewModel: SelfCareViewModel,
    onDismiss: () -> Unit
) {
    var title by remember { mutableStateOf("") }
    var author by remember { mutableStateOf("") }
    var subtitle by remember { mutableStateOf("") }
    var selectedCategory by remember { mutableStateOf("Making Friends") }
    var coverEmoji by remember { mutableStateOf("📚") }
    var description by remember { mutableStateOf("") }
    var keyConceptsStr by remember { mutableStateOf("") }
    var externalUrl by remember { mutableStateOf("") }
    var totalPagesStr by remember { mutableStateOf("250") }

    val categories = listOf(
        "Making Friends",
        "Confident Speaking",
        "Empathetic Listening",
        "Healthy Boundaries",
        "Handling Conflict",
        "High EQ & Emotions",
        "Custom"
    )

    val emojiChoices = listOf("📚", "🤝", "🎙️", "👂", "🛡️", "⚖️", "🧠", "💡", "📖", "✨")

    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Card(
            modifier = Modifier
                .fillMaxWidth(0.94f)
                .fillMaxHeight(0.88f)
                .testTag("add_book_dialog"),
            shape = RoundedCornerShape(22.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(20.dp)
            ) {
                // Header
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .size(40.dp)
                                .clip(CircleShape)
                                .background(PastelApricotAmber.copy(alpha = 0.25f)),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(coverEmoji, fontSize = 22.sp)
                        }
                        Spacer(modifier = Modifier.width(10.dp))
                        Column {
                            Text(
                                text = "Add Book or PDF Guide",
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.onSurface
                            )
                            Text(
                                text = "Interpersonal mastery & EQ reading",
                                fontSize = 11.sp,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }

                    IconButton(
                        onClick = onDismiss,
                        modifier = Modifier
                            .size(32.dp)
                            .testTag("close_add_book_dialog")
                    ) {
                        Text("✕", fontSize = 16.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                // Scrollable Form
                Column(
                    modifier = Modifier
                        .weight(1f)
                        .verticalScroll(rememberScrollState()),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    // Emoji Selector
                    Text("Cover Icon", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = MaterialTheme.colorScheme.onSurface)
                    LazyRow(
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        items(emojiChoices) { emoji ->
                            val isSelected = coverEmoji == emoji
                            Box(
                                modifier = Modifier
                                    .size(38.dp)
                                    .clip(RoundedCornerShape(10.dp))
                                    .background(
                                        if (isSelected) PastelApricotAmber else MaterialTheme.colorScheme.surfaceVariant
                                    )
                                    .clickable { coverEmoji = emoji },
                                contentAlignment = Alignment.Center
                            ) {
                                Text(emoji, fontSize = 18.sp)
                            }
                        }
                    }

                    // Title
                    OutlinedTextField(
                        value = title,
                        onValueChange = { title = it },
                        label = { Text("Book or Guide Title *") },
                        placeholder = { Text("e.g. Difficult Conversations") },
                        singleLine = true,
                        modifier = Modifier
                            .fillMaxWidth()
                            .testTag("input_book_title"),
                        shape = RoundedCornerShape(12.dp)
                    )

                    // Author
                    OutlinedTextField(
                        value = author,
                        onValueChange = { author = it },
                        label = { Text("Author / Expert *") },
                        placeholder = { Text("e.g. Douglas Stone & Sheila Heen") },
                        singleLine = true,
                        modifier = Modifier
                            .fillMaxWidth()
                            .testTag("input_book_author"),
                        shape = RoundedCornerShape(12.dp)
                    )

                    // Category Chips
                    Text("Primary Category", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = MaterialTheme.colorScheme.onSurface)
                    LazyRow(
                        horizontalArrangement = Arrangement.spacedBy(6.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        items(categories) { cat ->
                            val isSelected = selectedCategory == cat
                            FilterChip(
                                selected = isSelected,
                                onClick = { selectedCategory = cat },
                                label = { Text(cat, fontSize = 11.sp) },
                                colors = FilterChipDefaults.filterChipColors(
                                    selectedContainerColor = PastelApricotAmber,
                                    selectedLabelColor = LightTextEspresso
                                ),
                                shape = RoundedCornerShape(8.dp)
                            )
                        }
                    }

                    // Subtitle / Tagline
                    OutlinedTextField(
                        value = subtitle,
                        onValueChange = { subtitle = it },
                        label = { Text("Subtitle / Focus Area") },
                        placeholder = { Text("e.g. How to Discuss What Matters Most") },
                        singleLine = true,
                        modifier = Modifier
                            .fillMaxWidth()
                            .testTag("input_book_subtitle"),
                        shape = RoundedCornerShape(12.dp)
                    )

                    // Key Concepts (Tags)
                    OutlinedTextField(
                        value = keyConceptsStr,
                        onValueChange = { keyConceptsStr = it },
                        label = { Text("Key Concepts & Tags (comma-separated)") },
                        placeholder = { Text("e.g. Active Listening, Emotional Regulation, Boundaries") },
                        modifier = Modifier
                            .fillMaxWidth()
                            .testTag("input_book_tags"),
                        shape = RoundedCornerShape(12.dp)
                    )

                    // External URL or PDF link
                    OutlinedTextField(
                        value = externalUrl,
                        onValueChange = { externalUrl = it },
                        label = { Text("External PDF / Ebook / Purchase URL") },
                        placeholder = { Text("https://example.com/guide.pdf") },
                        singleLine = true,
                        modifier = Modifier
                            .fillMaxWidth()
                            .testTag("input_book_url"),
                        shape = RoundedCornerShape(12.dp)
                    )

                    // Total Pages
                    OutlinedTextField(
                        value = totalPagesStr,
                        onValueChange = { totalPagesStr = it.filter { ch -> ch.isDigit() } },
                        label = { Text("Estimated Total Pages") },
                        singleLine = true,
                        modifier = Modifier
                            .fillMaxWidth()
                            .testTag("input_book_pages"),
                        shape = RoundedCornerShape(12.dp)
                    )

                    // In-app Study Summary / Notes
                    OutlinedTextField(
                        value = description,
                        onValueChange = { description = it },
                        label = { Text("Overview & Initial Summary") },
                        placeholder = { Text("Key takeaway notes or framework overview...") },
                        minLines = 3,
                        modifier = Modifier
                            .fillMaxWidth()
                            .testTag("input_book_description"),
                        shape = RoundedCornerShape(12.dp)
                    )
                }

                Spacer(modifier = Modifier.height(14.dp))

                // Actions
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    OutlinedButton(
                        onClick = onDismiss,
                        modifier = Modifier
                            .weight(1f)
                            .height(46.dp),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Text("Cancel")
                    }

                    Button(
                        onClick = {
                            if (title.isNotBlank() && author.isNotBlank()) {
                                val concepts = keyConceptsStr
                                    .split(",")
                                    .map { it.trim() }
                                    .filter { it.isNotEmpty() }

                                val pages = totalPagesStr.toIntOrNull() ?: 200

                                // Generate 3 default chapters for structured study
                                val initialChapters = listOf(
                                    BookChapter(
                                        id = "ch1_${UUID.randomUUID().toString().take(6)}",
                                        title = "Part 1: Core Principles & Mindset",
                                        summary = "Understanding fundamental psychological and interpersonal dynamics in $title.",
                                        keyTakeaways = listOf(
                                            "Acknowledge the emotional undercurrent before responding.",
                                            "Notice internal defensive reactions and pause."
                                        ),
                                        practicalExercise = "Conduct a 5-minute self-audit before your next social interaction.",
                                        read = false
                                    ),
                                    BookChapter(
                                        id = "ch2_${UUID.randomUUID().toString().take(6)}",
                                        title = "Part 2: Real-World Scenarios & Scripts",
                                        summary = "Actionable verbal formulas and non-verbal posture adjustments.",
                                        keyTakeaways = listOf(
                                            "Use curious questions instead of accusatory statements.",
                                            "Clarify mutual intent early."
                                        ),
                                        practicalExercise = "Practice active validation with one person today.",
                                        read = false
                                    ),
                                    BookChapter(
                                        id = "ch3_${UUID.randomUUID().toString().take(6)}",
                                        title = "Part 3: Long-Term Integration & Habit Stacking",
                                        summary = "Cementing interpersonal habits into daily life routines.",
                                        keyTakeaways = listOf(
                                            "Reflect on interactions in your daily journal.",
                                            "Celebrate small conversational wins."
                                        ),
                                        practicalExercise = "Write a 3-bullet reflection on a challenging interaction.",
                                        read = false
                                    )
                                )

                                val newBook = BookResourceItem(
                                    id = "book_${System.currentTimeMillis()}",
                                    title = title.trim(),
                                    author = author.trim(),
                                    category = selectedCategory,
                                    coverEmoji = coverEmoji,
                                    subtitle = subtitle.trim(),
                                    description = description.trim(),
                                    keyConcepts = if (concepts.isNotEmpty()) concepts else listOf(selectedCategory),
                                    coreFramework = "Key insights and actionable principles from $title by $author.",
                                    fullGuideContent = if (description.isNotBlank()) description.trim() else "Study guide and notes for $title.",
                                    chapters = initialChapters,
                                    externalUrl = externalUrl.trim(),
                                    totalPages = pages,
                                    pagesRead = 0,
                                    readingProgressPercent = 0,
                                    status = "reading"
                                )

                                viewModel.addBook(newBook)
                                onDismiss()
                            }
                        },
                        enabled = title.isNotBlank() && author.isNotBlank(),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = MaterialTheme.colorScheme.primary,
                            contentColor = androidx.compose.ui.graphics.Color.White
                        ),
                        modifier = Modifier
                            .weight(1f)
                            .height(46.dp)
                            .testTag("btn_save_book"),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Text("Add to Library", color = androidx.compose.ui.graphics.Color.White, fontWeight = FontWeight.SemiBold)
                    }
                }
            }
        }
    }
}
